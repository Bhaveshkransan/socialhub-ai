import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
  caption: { type: String, default: "" },
  image: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  visibility: { type: String, enum: ["public", "close_friends", "connections"], default: "public" },
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);
