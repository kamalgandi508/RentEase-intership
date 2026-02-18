const Chat = require("../schemas/chatModel");
const User = require("../schemas/userModel");
const { createNotification } = require("./notificationController");

// Send a message
const sendMessageController = async (req, res) => {
  try {
    const senderId = req.body.userId; // set by auth middleware
    const { receiverId, propertyId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: "receiverId and message are required" });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const chat = new Chat({
      senderId,
      receiverId,
      propertyId: propertyId || null,
      message,
    });

    await chat.save();

    // Send notification to the receiver
    const sender = await User.findById(senderId).select("name");
    const senderName = sender?.name || "Someone";
    await createNotification(
      receiverId,
      "booking",
      `New message from ${senderName}`,
      message.length > 50 ? message.substring(0, 50) + "..." : message,
      chat._id
    );

    res.status(201).json({ message: "Message sent", data: chat });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// Get list of conversations (unique users the current user has chatted with)
const getConversationsController = async (req, res) => {
  try {
    const userId = req.body.userId;

    // Find all unique users this user has exchanged messages with
    const sentMessages = await Chat.find({ senderId: userId }).distinct("receiverId");
    const receivedMessages = await Chat.find({ receiverId: userId }).distinct("senderId");

    // Merge and deduplicate
    const allUserIds = [...new Set([...sentMessages.map(String), ...receivedMessages.map(String)])];

    // Get user details and last message for each conversation
    const conversations = [];
    for (const otherUserId of allUserIds) {
      const user = await User.findById(otherUserId).select("name email type");
      if (!user) continue;

      // Get last message between these two users
      const lastMessage = await Chat.findOne({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(1);

      // Count unread messages from this user
      const unreadCount = await Chat.countDocuments({
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      });

      conversations.push({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
        },
        lastMessage: lastMessage
          ? {
              message: lastMessage.message,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        unreadCount,
      });
    }

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.status(200).json({ data: conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Failed to get conversations", error: error.message });
  }
};

// Get messages between current user and another user
const getMessagesController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { otherUserId } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("propertyId", "propertyName propertyAddress");

    // Mark messages from other user as read
    await Chat.updateMany(
      { senderId: otherUserId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to get messages", error: error.message });
  }
};

// Get total unread count for the current user
const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const count = await Chat.countDocuments({ receiverId: userId, isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count", error: error.message });
  }
};

module.exports = {
  sendMessageController,
  getConversationsController,
  getMessagesController,
  getUnreadCountController,
};
