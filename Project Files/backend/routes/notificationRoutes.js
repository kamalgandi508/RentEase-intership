const express = require("express");
const authMiddleware = require("../middlewares/authMiddlware");

const {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authMiddleware, getNotificationsController);
router.patch("/read/:id", authMiddleware, markAsReadController);
router.patch("/readall", authMiddleware, markAllAsReadController);
router.delete("/:id", authMiddleware, deleteNotificationController);

module.exports = router;
