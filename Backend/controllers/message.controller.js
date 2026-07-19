import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import Message from "../models/messages.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const recieverId = req.params.id;
    const { textMessage: message } = req.body;

    if (!message)
      return res
        .status(400)
        .json({ message: "Message text required", success: false });

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recieverId],
        message: [],
      });
    }

    const newMessage = await Message.create({
      senderID: senderId,
      receieverID: recieverId,
      message,
    });

    conversation.message.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    // implementing the real time socket io 
    const receiverSocketId = getReceiverSocketId(recieverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit('newMessage',newMessage)
    }

    // save message notification in database for persistence
    await Notification.create({
      recipient: recieverId,
      sender: senderId,
      type: "message",
    });

    return res.status(201).json({
      message: "Message sent",
      newMessage,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.id;
    const recieverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    }).populate("message");

    if (!conversation)
      return res.status(200).json({ messages: [], success: true });

    return res.status(200).json({
      messages: conversation.message,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
