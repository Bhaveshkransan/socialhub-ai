import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { Notification } from "../models/notification.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
// import { use } from "react";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Something is missing, please check", success: false });
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(401).json({
        message: "Email is already registered. Try a different email.",
        success: false,
      });
    }
    const usernameExist = await User.findOne({ username });
    if (usernameExist) {
      return res.status(401).json({
        message: "Username is already taken. Try a different username.",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Something is missing, please check", success: false });
    }
    let user = await User.findOne({ email }).populate("connections", "username profilePicture");
    if (!user) {
      return res.status(401).json({
        message: "Incorrect Email or Password",
        success: false,
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect Email or Password",
        success: false,
      });
    }

     const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });

    const populatedPosts = await Promise.all(
      user.posts.map( async (postId) =>{
        const post = await Post.findById(postId);
        if(post.author.equals(user._id)){
          return post
        }
        return null
      })
    )

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
      bookmarks: user.bookmarks,
      closeFriends: user.closeFriends,
      connections: user.connections,
      walletBalance: user.walletBalance,
    };

    // yaha pe token geenerate kar rahe hai using the secret key it is just for backend to rememeber the particulaur user

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none", secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
        token
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 }).json({
      message: "Logged Out sucessfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getProfile = async (req, res) => {
  try {
    //basically frotend mein jaaake user ki id laao and then find karo user ko
    const userId = req.params.id;
    let user = await User.findById(userId)
      .select("-password")
      .populate({ path: "posts", options: { sort: { createdAt: -1 } } })
      .populate({ path: "bookmarks", options: { sort: { createdAt: -1 } } })
      .populate("closeFriends", "username profilePicture")
      .populate("connections", "username profilePicture");
    let mutualConnections = [];
    let isConnection = false;
    if (req.id && req.id !== userId) {
      const loggedInUser = await User.findById(req.id).populate("following", "username");
      if (loggedInUser && user.followers) {
        const mutualUsers = loggedInUser.following.filter(f => 
          user.followers.some(id => id.toString() === f._id.toString())
        );
        mutualConnections = mutualUsers.map(m => m.username);
      }
      isConnection = user.connections && user.connections.includes(req.id);
    } else if (req.id === userId) {
      isConnection = true; // User viewing their own profile
    }

    // Filter posts based on visibility
    let filteredPosts = user.posts;
    let filteredBookmarks = user.bookmarks;

    const isCloseFriend = req.id && user.closeFriends && user.closeFriends.includes(req.id);

    filteredPosts = filteredPosts.filter(p => {
      if (req.id === userId) return true; // Own profile
      if (p.visibility === "close_friends" && !isCloseFriend) return false;
      if (p.visibility === "connections" && !isConnection) return false;
      return true;
    });

    filteredBookmarks = filteredBookmarks.filter(p => {
      if (req.id === userId) return true;
      if (p.visibility === "close_friends" && !isCloseFriend) return false;
      if (p.visibility === "connections" && !isConnection) return false;
      return true;
    });

    let userObject = user.toObject();
    userObject.posts = filteredPosts;
    userObject.bookmarks = filteredBookmarks;

    return res.status(200).json({
      user: {
        ...userObject,
        mutualConnections,
        isConnection
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender, username } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;
    
    if (username && username !== user.username) {
      const usernameExist = await User.findOne({ username });
      if (usernameExist) {
        return res.status(400).json({
          message: "Username is already taken. Try a different username.",
          success: false,
        });
      }
      user.username = username;
    }

    await user.save();
    return res.status(200).json({
      message: "Profile Updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const SuggestedUsers = async (req, res) => {
  try {
    //basically khudki id dhundo and khudke alawa baaki (NOT EQUAL ($ne))sabko as sugggested me show kardo
    // for right now
    // because we cant log contacts and find suggested users it need complex algo
    const loggedInUser = await User.findById(req.id).populate("following", "username");
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).sort({ createdAt: -1 }).select(
      "-password",
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently dont have any users",
        success: false,
      });
    }

    const usersWithMutuals = suggestedUsers.map(user => {
      // Users that loggedInUser follows, who also follow this suggested user
      const mutualUsers = loggedInUser.following.filter(f => 
        user.followers.some(id => id.toString() === f._id.toString())
      );
      
      return {
        ...user.toObject(),
        mutualConnections: mutualUsers.map(m => m.username)
      };
    });

    return res.status(200).json({
      success: true,
      users: usersWithMutuals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKarneWala = req.id; //bhavesh
    const jiskoFollowKaroge = req.params.id; //targeted person
    if (followKarneWala === jiskoFollowKaroge) {
      return res.status(400).json({
        message: "Sorry you cannot follow/unfollow yourself",
        success: false,
      });
    }
    const user = await User.findById(followKarneWala);
    const targetedUser = await User.findById(jiskoFollowKaroge);
    if (!user || !targetedUser) {
      return res.status(400).json({
        message: "Sorry you cannot follow/unfollow yourself",
        success: false,
      });
    }
    // mai check karunga is ye mera following mein hai ya nahi?
    const isFollowing = user.following.includes(jiskoFollowKaroge);
    if (isFollowing) {
      // unfollow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKarneWala },
          { $pull: { following: jiskoFollowKaroge } },
        ),
        User.updateOne(
          { _id: jiskoFollowKaroge },
          { $pull: { followers: followKarneWala } },
        ),
      ]);
      return res.status(200).json({
        message: "Unfollowed Sucessfully",
        success: true,
      });
    } else {
      //follow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKarneWala },
          { $push: { following: jiskoFollowKaroge } },
        ),
        User.updateOne(
          { _id: jiskoFollowKaroge },
          { $push: { followers: followKarneWala } },
        ),
      ]);
      return res.status(200).json({
        message: "followed Sucessfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, users: [] });
    }
    // Case-insensitive regex search for username
    const users = await User.find({ username: { $regex: query, $options: "i" } })
      .limit(20)
      .select("-password");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const toggleCloseFriend = async (req, res) => {
  try {
    const currentUserId = req.id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot add yourself to close friends", success: false });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isCloseFriend = user.closeFriends.includes(targetUserId);

    if (isCloseFriend) {
      // Remove from close friends
      await User.updateOne(
        { _id: currentUserId },
        { $pull: { closeFriends: targetUserId } }
      );
      return res.status(200).json({ message: "Removed from Close Friends", success: true });
    } else {
      // Add to close friends
      await User.updateOne(
        { _id: currentUserId },
        { $push: { closeFriends: targetUserId } }
      );
      return res.status(200).json({ message: "Added to Close Friends", success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    if (senderId === receiverId) return res.status(400).json({ message: "Cannot send request to yourself", success: false });

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) return res.status(404).json({ message: "User not found", success: false });

    if (sender.connections.some(id => id.toString() === receiverId)) return res.status(400).json({ message: "Already connected", success: false });
    if (sender.sentConnectionRequests.some(id => id.toString() === receiverId)) return res.status(400).json({ message: "Request already sent", success: false });

    if (!sender.sentConnectionRequests.some(id => id.toString() === receiverId)) sender.sentConnectionRequests.push(receiverId);
    if (!receiver.receivedConnectionRequests.some(id => id.toString() === senderId)) receiver.receivedConnectionRequests.push(senderId);

    await Promise.all([sender.save(), receiver.save()]);

    // Create Notification
    const newNotification = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "connection_request"
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notification", {
        _id: newNotification._id,
        type: "connection_request",
        userId: senderId,
        userDetails: { username: sender.username, profilePicture: sender.profilePicture },
        message: "Sent you a connection request"
      });
    }

    return res.status(200).json({ message: "Connection request sent", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.id;
    const senderId = req.params.id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) return res.status(404).json({ message: "User not found", success: false });

    if (!user.receivedConnectionRequests.includes(senderId)) {
      return res.status(400).json({ message: "No pending request", success: false });
    }

    // Remove requests
    user.receivedConnectionRequests = user.receivedConnectionRequests.filter(id => id.toString() !== senderId);
    sender.sentConnectionRequests = sender.sentConnectionRequests.filter(id => id.toString() !== userId);

    // Add to connections
    if (!user.connections.some(id => id.toString() === senderId)) user.connections.push(senderId);
    if (!sender.connections.some(id => id.toString() === userId)) sender.connections.push(userId);

    await Promise.all([user.save(), sender.save()]);

    return res.status(200).json({ message: "Connection accepted", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const userId = req.id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) return res.status(404).json({ message: "User not found", success: false });

    // Can be used to reject OR cancel a sent request
    user.receivedConnectionRequests = user.receivedConnectionRequests.filter(id => id.toString() !== targetId);
    target.sentConnectionRequests = target.sentConnectionRequests.filter(id => id.toString() !== userId);
    
    user.sentConnectionRequests = user.sentConnectionRequests.filter(id => id.toString() !== targetId);
    target.receivedConnectionRequests = target.receivedConnectionRequests.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), target.save()]);

    return res.status(200).json({ message: "Request cancelled/rejected", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const userId = req.id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) return res.status(404).json({ message: "User not found", success: false });

    user.connections = user.connections.filter(id => id.toString() !== targetId);
    target.connections = target.connections.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), target.save()]);

    return res.status(200).json({ message: "Connection removed", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
