const mongoose = require("mongoose");

const paymentModel = mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookingschema",
      required: true,
    },
    propertyId: {
      type: String,
      required: true,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    payerName: {
      type: String,
    },
    propertyAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const paymentSchema = mongoose.model("paymentschema", paymentModel);

module.exports = paymentSchema;
