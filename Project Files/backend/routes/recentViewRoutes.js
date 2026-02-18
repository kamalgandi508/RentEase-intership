const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlware");
const {
  trackViewController,
  getRecentlyViewedController,
} = require("../controllers/recentViewController");

router.post("/track/:propertyId", authMiddleware, trackViewController);
router.get("/list", authMiddleware, getRecentlyViewedController);

module.exports = router;
