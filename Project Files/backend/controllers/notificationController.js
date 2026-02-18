const notificationSchema = require("../schemas/notificationModel");
const mongoose = require("mongoose");

// Helper: create a notification
const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    if (mongoose.connection.readyState !== 1) return null;
    const notification = new notificationSchema({
      userId,
      type,
      title,
      message,
      relatedId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// GET /api/notifications - get all notifications for logged-in user
const getNotificationsController = async (req, res) => {
  const { userId } = req.body;
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).send({ success: true, data: [] });
    }
    const notifications = await notificationSchema
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await notificationSchema.countDocuments({ userId, isRead: false });

    return res.status(200).send({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(200).send({ success: true, data: [], unreadCount: 0 });
  }
};

// PATCH /api/notifications/read/:id - mark one notification as read
const markAsReadController = async (req, res) => {
  const { id } = req.params;
  try {
    await notificationSchema.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).send({ success: false });
  }
};

// PATCH /api/notifications/readall - mark all notifications as read for user
const markAllAsReadController = async (req, res) => {
  const { userId } = req.body;
  try {
    await notificationSchema.updateMany({ userId, isRead: false }, { isRead: true });
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).send({ success: false });
  }
};

// DELETE /api/notifications/:id - delete a notification
const deleteNotificationController = async (req, res) => {
  const { id } = req.params;
  try {
    await notificationSchema.findByIdAndDelete(id);
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).send({ success: false });
  }
};

module.exports = {
  createNotification,
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
};
