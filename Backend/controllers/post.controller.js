import sharp from "sharp";
import { Post } from "../models/post.model.js";
import cloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js"; // Fix: duplicate User,User import removed
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

// Fix: removed invalid `import { use } from "react"` — this is a backend file

export const AddNewPost = async (req, res) => {
  try {
    const { caption, visibility } = req.body;
    const image = req.file; // Fix: was `const { image } = req.file` (wrong destructure)
    const authorId = req.id;
    if (!image)
      return res
        .status(400)
        .json({ message: "Image required", success: false });

    const isVideo = image.mimetype.startsWith("video/");
    let cloudResponse;

    if (isVideo) {
      const fileUri = `data:${image.mimetype};base64,${image.buffer.toString("base64")}`;
      cloudResponse = await cloudinary.uploader.upload(fileUri, {
        resource_type: "video"
      });
    } else {
      const optimizedImageBuffer = await sharp(image.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      mediaType: isVideo ? "video" : "image",
      author: authorId,
      visibility: visibility || "public"
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id); // Fix: post_id → post._id
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: "New Post Created",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const currentUserId = req.id;

    // Find all users who have me in their closeFriends list
    const usersWhoAddedMe = await User.find({ closeFriends: currentUserId }).select("_id");
    const friendsIds = usersWhoAddedMe.map(u => u._id);

    const posts = await Post.find({
      $or: [
        { visibility: "public" },
        { author: currentUserId },
        { visibility: "close_friends", author: { $in: friendsIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const usersPosts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts: usersPosts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKarneWaleUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(400)
        .json({ message: "Post Not Found", success: false });
    await post.updateOne({ $addToSet: { likes: likeKarneWaleUserKiId } });
    await post.save();

    const user = await User.findById(likeKarneWaleUserKiId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();
    if (postOwnerId !== likeKarneWaleUserKiId) {
      // save notification in database
      const newNotification = await Notification.create({
        recipient: postOwnerId,
        sender: likeKarneWaleUserKiId,
        type: "like",
        post: postId,
      });

      // emit a notification
      const notification = {
        _id: newNotification._id,
        type: "like",
        userId: likeKarneWaleUserKiId,
        userDetails: user,
        postId,
        message: "Your post was liked",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      if (postOwnerSocketId) {
        io.to(postOwnerSocketId).emit("notification", notification);
      }
    }

    return res.status(200).json({ message: "Post liked", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: `Server error: ${error.message}`, success: false }); 
  }
};

export const disLikePost = async (req, res) => {
  try {
    const likeKarneWaleUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return (
        res
          .status(400)
          //push cannot be used bcoz we need unique
          .json({ message: "Post Not Found", success: false })
      );
    await post.updateOne({ $pull: { likes: likeKarneWaleUserKiId } });
    return res.status(200).json({ message: "Post disliked", success: true });
    await post.save();

    const user = await User.findById(likeKarneWaleUserKiId).select(
      "username",
      "profilePicture",
    );
    const postOwnerId = post.author.toString();
    if (postOwnerId !== likeKarneWaleUserKiId) {
      // delete notification from database
      await Notification.findOneAndDelete({
        recipient: postOwnerId,
        sender: likeKarneWaleUserKiId,
        type: "like",
        post: postId,
      });

      // emit a notification
      const notification = {
        type: "dislike",
        userId: likeKarneWaleUserKiId,
        userDetails: user,
        postId,
        message: "Your post was disliked",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const CommentKarneWaleKiId = req.id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    // Fix: Comment.create().populate() doesn't work — populate must be called separately
    const comment = await Comment.create({
      text,
      author: CommentKarneWaleKiId,
      post: postId,
    });
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();
    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username profilePicture", // Fix: profilePitcure → profilePicture (typo), removed comma
    );
    if (!comments || comments.length === 0)
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });
    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "No post found", success: false });

    if (post.author.toString() !== authorId)
      return res
        .status(403)
        .json({ message: "Unauthorized User", success: false });

    //ye ek inbuilt function hai findByIdAndDelete
    await Post.findByIdAndDelete(postId);

    // delete it from users post
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    // delete assosciated comments
    await Comment.deleteMany({ post: postId });

    // Emit real-time delete event to all connected clients
    io.emit("deletePost", postId);

    return res.status(200).json({
      message: "Post deleted",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const bookMarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "No post found", success: false });

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    } else {
      //bookmar karna pdega
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false }); // Fix: was empty catch {}
  }
};

export const recordView = async (req, res) => {
  try {
    const postId = req.params.id;
    const viewerId = req.id; // from isAuthenticated middleware

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    // Don't count author's own views
    if (post.author.toString() === viewerId) {
      return res.status(200).json({ message: "Viewed by author", success: true });
    }

    // Check if user has already viewed
    if (post.viewedBy.includes(viewerId)) {
      return res.status(200).json({ message: "Already viewed", success: true });
    }

    // Add viewer to post
    post.viewedBy.push(viewerId);
    await post.save();

    // Add money to author's wallet (0.01 per unique view = 100 per 10k)
    const author = await User.findById(post.author);
    if (author) {
      author.walletBalance = (author.walletBalance || 0) + 0.01;
      await author.save();
    }

    return res.status(200).json({ message: "View recorded", success: true });

  } catch (error) {
    console.log("Error recording view:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
