const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userModel");
const propertySchema = require("../schemas/propertyModel");
const bookingSchema = require("../schemas/bookingModel");
const reviewSchema = require("../schemas/reviewModel");

// Fallback mock data when MongoDB is not available
const mockData = require("../mockData");

// Helper to check if MongoDB is connected
const isMongoConnected = () => {
  try {
    return userSchema.db && userSchema.db.readyState === 1;
  } catch {
    return false;
  }
};

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    let granted = "";
    let existsUser;
    
    if (isMongoConnected()) {
      // Use MongoDB
      existsUser = await userSchema.findOne({ email: req.body.email });
    } else {
      // Use mock data
      existsUser = mockData.findUser(req.body.email);
    }
    
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    if (req.body.type === "Owner") {
      granted = "granted"; // Auto-grant for development
    }
    
    if (isMongoConnected()) {
      // Use MongoDB
      const newUser = new userSchema({ ...req.body, granted });
      await newUser.save();
    } else {
      // Use mock data
      mockData.addUser({ ...req.body, granted });
    }

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    let user;
    
    if (isMongoConnected()) {
      // Use MongoDB
      user = await userSchema.findOne({ email: req.body.email });
    } else {
      // Use mock data
      user = mockData.findUser(req.body.email);
    }
    
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user.password = undefined;
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

/////forgotting password
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userSchema.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    await updatedUser.save();
    return res.status(200).send({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////auth controller
const authController = async (req, res) => {
  console.log(req.body);
  try {
    let user;
    
    if (isMongoConnected()) {
      // Use MongoDB
      user = await userSchema.findOne({ _id: req.body.userId });
    } else {
      // Use mock data
      user = mockData.findUserById(req.body.userId);
    }
    
    console.log(user);
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};
/////////get all properties in home
const getAllPropertiesController = async (req, res) => {
  try {
    let allProperties;
    
    if (isMongoConnected()) {
      // Use MongoDB
      allProperties = await propertySchema.find({}).lean();
    } else {
      // Use mock data
      allProperties = mockData.getAllProperties();
    }
    
    if (!allProperties || allProperties.length === 0) {
      return res.status(200).send({ 
        success: true, 
        data: [],
        message: "No properties available" 
      });
    }
    
    // Ensure all properties have properly formatted amenities
    const formattedProperties = allProperties.map(property => {
      let formattedAmenities = '[]';
      if (property.amenities) {
        try {
          // Validate JSON string
          JSON.parse(property.amenities);
          formattedAmenities = property.amenities;
        } catch (error) {
          console.warn(`Invalid amenities JSON for property ${property._id}:`, property.amenities);
          formattedAmenities = '[]';
        }
      }
      
      return {
        ...property,
        amenities: formattedAmenities
      };
    });
    
    res.status(200).send({ success: true, data: formattedProperties });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error fetching properties", success: false, error });
  }
};

const { createNotification } = require("./notificationController");

///////////booking handle///////////////
const bookingHandleController = async (req, res) => {
  const { propertyid } = req.params;
  const { userDetails, status, userId, ownerId } = req.body;

  try {
    const property = await propertySchema.findById(propertyid);
    const booking = new bookingSchema({
      propertyId: propertyid,
      userID: userId,
      ownerID: ownerId, 
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: status,
    });

    await booking.save();

    // Notify owner about new booking
    await createNotification(
      ownerId,
      'booking',
      'New Booking Request',
      `${userDetails.fullName} has requested to book your ${property?.propertyType || ''} property at ${property?.propertyAddress?.substring(0, 40) || 'your listing'}`,
      booking._id
    );

    // Notify renter about booking confirmation
    await createNotification(
      userId,
      'booking',
      'Booking Submitted',
      `Your booking request for ${property?.propertyType || ''} property at ${property?.propertyAddress?.substring(0, 40) || ''} has been submitted and is pending owner approval`,
      booking._id
    );

    return res
      .status(200)
      .send({ success: true, message: "Booking status updated" });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error handling booking" });
  }
};

/////get all bookings for sing tenents//////
const getAllBookingsController = async (req, res) => {
  const { userId } = req.query;
  console.log('Fetching bookings for userId:', userId);
  
  try {
    let getAllBookings;
    const usingMongoDB = isMongoConnected();
    console.log('Using MongoDB:', usingMongoDB);
    
    if (usingMongoDB) {
      // Use MongoDB
      getAllBookings = await bookingSchema.find();
      console.log('MongoDB bookings found:', getAllBookings.length);
    } else {
      // Use mock data
      getAllBookings = mockData.getAllBookings();
      console.log('Mock bookings found:', getAllBookings.length);
    }
    
    console.log('All bookings:', getAllBookings);
    
    const updatedBookings = getAllBookings.filter(
      (booking) => booking.userID && booking.userID.toString() === userId
    );
    
    console.log('Filtered bookings for user:', updatedBookings);
    
    return res.status(200).send({
      success: true,
      data: updatedBookings,
    });
  } catch (error) {
    console.error('Error in getAllBookingsController:', error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

/////cancel booking for tenants//////
const cancelBookingController = async (req, res) => {
  const { bookingId } = req.params;
  const { bookingStatus } = req.body;
  
  console.log('Cancelling booking:', bookingId, 'with status:', bookingStatus);
  
  try {
    let updatedBooking;
    
    if (isMongoConnected()) {
      // Use MongoDB
      updatedBooking = await bookingSchema.findByIdAndUpdate(
        bookingId,
        { bookingStatus: bookingStatus },
        { new: true }
      );
      
      if (!updatedBooking) {
        return res.status(404).send({
          success: false,
          message: "Booking not found"
        });
      }
    } else {
      // Use mock data (for development)
      updatedBooking = mockData.updateBookingStatus(bookingId, bookingStatus);
      
      if (!updatedBooking) {
        return res.status(404).send({
          success: false,
          message: "Booking not found"
        });
      }
    }
    
    console.log('Booking cancelled successfully:', updatedBooking);
    
    // Notify owner about cancellation
    if (updatedBooking && updatedBooking.ownerID) {
      const property = await propertySchema.findById(updatedBooking.propertyId || updatedBooking.propertId);
      await createNotification(
        updatedBooking.ownerID,
        'booking_status',
        'Booking Cancelled',
        `${updatedBooking.userName} has cancelled their booking for your ${property?.propertyType || ''} property at ${property?.propertyAddress?.substring(0, 40) || ''}`,
        updatedBooking._id
      );
    }

    return res.status(200).send({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).send({
      success: false,
      message: "Error cancelling booking"
    });
  }
};

/////submit review for a property//////
const submitReviewController = async (req, res) => {
  const { propertyId, ownerId, rating, review, bookingId } = req.body;
  const userId = req.body.userId;

  try {
    // Check if user already reviewed this property
    const existingReview = await reviewSchema.findOne({ propertyId, userId });
    if (existingReview) {
      return res.status(200).send({
        success: false,
        message: "You have already reviewed this property"
      });
    }

    const user = await userSchema.findById(userId);
    const property = await propertySchema.findById(propertyId);

    const newReview = new reviewSchema({
      propertyId,
      ownerId,
      userId,
      userName: user?.name || 'Anonymous',
      bookingId,
      rating: Number(rating),
      review,
      propertyAddress: property?.propertyAddress || 'N/A',
      propertyType: property?.propertyType || 'N/A',
    });

    await newReview.save();

    // Notify owner about the new review
    await createNotification(
      ownerId,
      'review',
      'New Review Received',
      `${user?.name || 'A tenant'} left a ${rating}-star review on your ${property?.propertyType || ''} property at ${property?.propertyAddress?.substring(0, 40) || ''}`,
      newReview._id
    );

    // Update property average rating
    const allReviews = await reviewSchema.find({ propertyId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await propertySchema.findByIdAndUpdate(propertyId, { rating: Math.round(avgRating * 10) / 10 });

    return res.status(200).send({
      success: true,
      message: "Review submitted successfully"
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).send({
      success: false,
      message: "Error submitting review"
    });
  }
};

/////get reviews for a property//////
const getPropertyReviewsController = async (req, res) => {
  const { propertyId } = req.params;
  try {
    const reviews = await reviewSchema.find({ propertyId }).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).send({
      success: false,
      message: "Error fetching reviews"
    });
  }
};

module.exports = {
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
};
