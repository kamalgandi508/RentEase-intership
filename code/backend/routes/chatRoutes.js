const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlware");
const {
  sendMessageController,
  getConversationsController,
  getMessagesController,
  getUnreadCountController,
} = require("../controllers/chatController");

// All routes require authentication
router.post("/send", authMiddleware, sendMessageController);
router.get("/conversations", authMiddleware, getConversationsController);
router.get("/messages/:otherUserId", authMiddleware, getMessagesController);
router.get("/unread-count", authMiddleware, getUnreadCountController);

module.exports = router;
