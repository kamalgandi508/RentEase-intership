const express = require("express");
const authMiddleware = require("../middlewares/authMiddlware");

const {
  createOrderController,
  verifyPaymentController,
  getPaymentHistoryController,
  checkPaymentStatusController,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", authMiddleware, createOrderController);
router.post("/verify", authMiddleware, verifyPaymentController);
router.get("/history", authMiddleware, getPaymentHistoryController);
router.get("/check/:bookingId", authMiddleware, checkPaymentStatusController);

module.exports = router;
