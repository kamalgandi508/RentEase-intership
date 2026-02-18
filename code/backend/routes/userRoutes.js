const express = require("express");
const authMiddleware = require("../middlewares/authMiddlware");

const {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  bookingHandleController,
  getAllBookingsController,
  cancelBookingController,
  submitReviewController,
  getPropertyReviewsController,
} = require("../controllers/userController");

const router = express.Router();


router.post("/register", registerController);

router.post("/login", loginController);

router.post("/forgotpassword", forgotPasswordController);

router.get('/getAllProperties', getAllPropertiesController)

router.post("/getuserdata", authMiddleware, authController);

router.post("/bookinghandle/:propertyid", authMiddleware, bookingHandleController);

router.get('/getallbookings', authMiddleware, getAllBookingsController)

router.patch('/cancelbooking/:bookingId', authMiddleware, cancelBookingController)

router.post('/submitreview', authMiddleware, submitReviewController)

router.get('/getreviews/:propertyId', getPropertyReviewsController)

module.exports = router;
