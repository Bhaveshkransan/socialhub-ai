import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    text:{type:String, required:true},
    author:{type:mongoose.Schema.ObjectId, ref:"User", required:true},
    post: {type:mongoose.Schema.ObjectId, ref:"Post", required:true}
})

export const  Comment = mongoose.model('Comment' , commentSchema )