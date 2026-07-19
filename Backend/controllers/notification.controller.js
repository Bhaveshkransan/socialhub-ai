import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePicture");
      
    return res.status(200).json({
      notifications,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.id;
    await Notification.updateMany(
      { recipient: userId, read: false, type: { $ne: "message" } },
      { read: true }
    );
    return res.status(200).json({
      message: "Notifications marked as read",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.id;
    const senderId = req.params.id;
    await Notification.updateMany(
      { recipient: userId, sender: senderId, type: "message", read: false },
      { read: true }
    );
    return res.status(200).json({
      message: "Messages from user marked as read",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
