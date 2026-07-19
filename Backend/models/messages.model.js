import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  receieverID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
