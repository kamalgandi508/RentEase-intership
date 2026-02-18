const crypto = require("crypto");
const paymentSchema = require("../schemas/paymentModel");
const bookingSchema = require("../schemas/bookingModel");
const propertySchema = require("../schemas/propertyModel");
const { createNotification } = require("./notificationController");

// Helper to generate unique IDs
const generateId = (prefix) => `${prefix}_${crypto.randomBytes(12).toString("hex")}`;

// POST /api/payment/create-order
const createOrderController = async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.body.userId; // set by auth middleware

  try {
    // Verify booking exists and belongs to this user
    const booking = await bookingSchema.findById(bookingId);
    if (!booking) {
      return res.status(404).send({ success: false, message: "Booking not found" });
    }
    if (booking.userID.toString() !== userId) {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }

    // Check if already paid
    const existingPayment = await paymentSchema.findOne({
      bookingId,
      status: "paid",
    });
    if (existingPayment) {
      return res.status(400).send({ success: false, message: "Rent already paid for this booking" });
    }

    // Get property details
    const property = await propertySchema.findById(booking.propertyId || booking.propertId);
    const rentAmount = property?.propertyAmt || 5000; // fallback to 5000 if property deleted

    const orderId = generateId("order");
    const receipt = `rent_${bookingId}_${Date.now()}`;

    // Save payment record
    const payment = new paymentSchema({
      bookingId,
      propertyId: booking.propertyId || booking.propertId,
      payerId: userId,
      ownerId: booking.ownerID,
      amount: rentAmount,
      razorpayOrderId: orderId,
      status: "created",
      payerName: booking.userName,
      propertyAddress: property?.propertyAddress || "",
    });
    await payment.save();

    return res.status(200).send({
      success: true,
      order: {
        id: orderId,
        amount: Math.round(rentAmount * 100),
        currency: "INR",
        receipt,
      },
      payment: payment,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).send({ success: false, message: "Error creating payment order" });
  }
};

// POST /api/payment/verify
const verifyPaymentController = async (req, res) => {
  const { orderId, bookingId } = req.body;
  const userId = req.body.userId;

  try {
    const paymentId = generateId("pay");

    // Update payment as successful
    const payment = await paymentSchema.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        razorpayPaymentId: paymentId,
        status: "paid",
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).send({ success: false, message: "Payment record not found" });
    }

    // Notify owner about payment received
    await createNotification(
      payment.ownerId,
      "booking",
      "Payment Received",
      `${payment.payerName} has paid ₹${payment.amount} rent for property at ${payment.propertyAddress?.substring(0, 40) || "your listing"}`,
      payment.bookingId
    );

    // Notify renter about successful payment
    await createNotification(
      userId,
      "booking",
      "Payment Successful",
      `Your rent payment of ₹${payment.amount} was successful. Transaction ID: ${paymentId.slice(-8)}`,
      payment.bookingId
    );

    return res.status(200).send({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).send({ success: false, message: "Error verifying payment" });
  }
};

// GET /api/payment/history
const getPaymentHistoryController = async (req, res) => {
  const { userId } = req.body;

  try {
    // Get payments where user is payer OR owner
    const payments = await paymentSchema
      .find({
        $or: [{ payerId: userId }, { ownerId: userId }],
        status: "paid",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).send({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return res.status(200).send({ success: true, data: [] });
  }
};

// GET /api/payment/check/:bookingId
const checkPaymentStatusController = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const payment = await paymentSchema.findOne({
      bookingId,
      status: "paid",
    });

    return res.status(200).send({
      success: true,
      paid: !!payment,
      payment: payment || null,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(200).send({ success: true, paid: false });
  }
};

module.exports = {
  createOrderController,
  verifyPaymentController,
  getPaymentHistoryController,
  checkPaymentStatusController,
};
