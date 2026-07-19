import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
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
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(200).json({
      message: "Account Created Successfully",
      success: true,
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
    let user = await User.findOne({ email });
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
      .populate("closeFriends", "username profilePicture");
    let mutualConnections = [];
    if (req.id && req.id !== userId) {
      const loggedInUser = await User.findById(req.id).populate("following", "username");
      if (loggedInUser && user.followers) {
        const mutualUsers = loggedInUser.following.filter(f => 
          user.followers.some(id => id.toString() === f._id.toString())
        );
        mutualConnections = mutualUsers.map(m => m.username);
      }
    }

    return res.status(200).json({
      user: {
        ...user.toObject(),
        mutualConnections
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

