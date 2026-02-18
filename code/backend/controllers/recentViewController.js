const RecentView = require("../schemas/recentViewModel");

// Track a property view for a user (upsert — updates viewedAt if already exists)
const trackViewController = async (req, res) => {
  try {
    const userId = req.body.userId; // set by auth middleware
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required" });
    }

    await RecentView.findOneAndUpdate(
      { userId, propertyId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "View tracked", success: true });
  } catch (error) {
    console.error("Track view error:", error);
    res.status(500).json({ message: "Failed to track view", error: error.message });
  }
};

// Get recently viewed properties for the current user (last 10)
const getRecentlyViewedController = async (req, res) => {
  try {
    const userId = req.body.userId;

    const recentViews = await RecentView.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(10)
      .populate("propertyId", "propertyType propertyAdType propertyAddress propertyAmt propertyImage bedrooms bathrooms area views ownerId ownerName");

    // Filter out any where the property was deleted
    const validViews = recentViews.filter((v) => v.propertyId !== null);

    res.status(200).json({
      success: true,
      data: validViews.map((v) => ({
        _id: v._id,
        viewedAt: v.viewedAt,
        property: v.propertyId,
      })),
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);
    res.status(500).json({ message: "Failed to get recently viewed", error: error.message });
  }
};

module.exports = {
  trackViewController,
  getRecentlyViewedController,
};
