const mongoose = require("mongoose");

const recentViewModel = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertyschema",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one record per user-property pair
recentViewModel.index({ userId: 1, propertyId: 1 }, { unique: true });

const RecentView = mongoose.model("recentview", recentViewModel);

module.exports = RecentView;
