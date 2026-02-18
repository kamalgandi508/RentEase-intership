const mongoose = require("mongoose");

const reviewModel = mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertyschema",
      required: [true, "Property ID is required"],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Owner ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookingschema",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, "Review text is required"],
    },
    propertyAddress: {
      type: String,
    },
    propertyType: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const reviewSchema = mongoose.model("reviewschema", reviewModel);

module.exports = reviewSchema;
