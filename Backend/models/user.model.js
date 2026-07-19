import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  bookmarks: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  closeFriends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  walletBalance: {
    type: Number,
    default: 0,
  },
  withdrawalHistory: [
    {
      amount: Number,
      payoutId: String,
      status: String,
      date: { type: Date, default: Date.now }
    }
  ]
}, {timestamps:true});

export const User = mongoose.model('User',userSchema)
