const bookingSchema = require("../schemas/bookingModel");
const propertySchema = require("../schemas/propertyModel");
const userSchema = require("../schemas/userModel");
const reviewSchema = require("../schemas/reviewModel");
const mongoose = require("mongoose");

const { createNotification } = require("./notificationController");

//////////adding property by owner////////
const addPropertyController = async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.propertyImages) {
      images = req.files.propertyImages.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));
    }

    let video = null;
    if (req.files && req.files.propertyVideo && req.files.propertyVideo.length > 0) {
      const vFile = req.files.propertyVideo[0];
      video = {
        filename: vFile.filename,
        path: `/uploads/${vFile.filename}`,
        originalName: vFile.originalname,
        size: vFile.size,
        mimetype: vFile.mimetype,
      };
    }

    const user = await userSchema.findById({ _id: req.body.userId });

    // Ensure amenities is properly formatted as JSON string
    let amenitiesString = '[]';
    if (req.body.amenities) {
      try {
        // If it's already a string, parse and stringify to validate
        if (typeof req.body.amenities === 'string') {
          JSON.parse(req.body.amenities);
          amenitiesString = req.body.amenities;
        } else {
          // If it's an array, stringify it
          amenitiesString = JSON.stringify(req.body.amenities);
        }
      } catch (error) {
        console.warn('Invalid amenities format, using empty array:', req.body.amenities);
        amenitiesString = '[]';
      }
    }

    const newPropertyData = new propertySchema({
      ...req.body,
      amenities: amenitiesString,
      propertyImage: images,
      propertyVideo: video,
      ownerId: user._id,
      ownerName: user.name,
      isAvailable: "Available",
    });

    await newPropertyData.save();

    // Notify owner that property was listed
    await createNotification(
      user._id,
      'property',
      'Property Listed Successfully',
      `Your ${req.body.propertyType || ''} property at ${req.body.propertyAddress?.substring(0, 40) || 'your address'} has been successfully listed and is now visible to renters`,
      newPropertyData._id
    );

    return res.status(200).send({
      success: true,
      message: "New Property has been stored",
    });
  } catch (error) {
    console.log("Error in get All Users Controller ", error);
  }
};

///////////all properties of owner/////////
const getAllOwnerPropertiesController = async (req, res) => {
  const { userId } = req.body;
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "MongoDB not connected - returning empty properties list"
      });
    }
    
    const getAllProperties = await propertySchema.find();
    const updatedProperties = getAllProperties.filter(
      (property) => property.ownerId.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedProperties,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).send({
      success: true,
      data: [],
      message: "Database error - returning empty properties list"
    });
  }
};

//////delete the property by owner/////
const deletePropertyController = async (req, res) => {
  const propertyId = req.params.propertyid;
  try {
    await propertySchema.findByIdAndDelete(propertyId);

    return res.status(200).send({
      success: true,
      message: "The property is deleted",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

//////updating the property/////////////
const updatePropertyController = async (req, res) => {
  const { propertyid } = req.params;
  console.log(req.body);
  try {
    const property = await propertySchema.findByIdAndUpdate(
      { _id: propertyid },
      {
        ...req.body,
        ownerId: req.body.userId,
      },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Property updated successfully.",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update property.",
    });
  }
};

const getAllBookingsController = async (req, res) => {
  const { userId } = req.body;
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "MongoDB not connected - returning empty bookings list"
      });
    }
    
    const getAllBookings = await bookingSchema.find();
    const updatedBookings = getAllBookings.filter(
      (booking) => booking.ownerID.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedBookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).send({
      success: true,
      data: [],
      message: "Database error - returning empty bookings list"
    });
  }
};

//////////handle bookings status//////////////
const handleAllBookingstatusController = async (req, res) => {
  const { bookingId, propertyId, status } = req.body;
  try {
    const booking = await bookingSchema.findByIdAndUpdate(
      { _id: bookingId },
      {
        bookingStatus: status,
      },
      {
        new: true,
      }
    );

    const property = await propertySchema.findByIdAndUpdate(
      { _id: propertyId },
      {
        isAvailable: status === 'booked' ? 'Unavailable' : 'Available', 
      },
      { new: true }
    );

    // Notify renter about booking status change
    if (booking && booking.userID) {
      const statusText = status === 'booked' ? 'accepted' : 'revoked';
      await createNotification(
        booking.userID,
        'booking_status',
        `Booking ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        `Your booking for ${property?.propertyType || ''} property at ${property?.propertyAddress?.substring(0, 40) || ''} has been ${statusText} by the owner`,
        booking._id
      );
    }

    return res.status(200).send({
      success: true,
      message: `changed the status of property to ${status}`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};
//////get all booked properties with tenant details/////
const getBookedPropertiesController = async (req, res) => {
  const { userId } = req.body;
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "MongoDB not connected"
      });
    }

    // Get all bookings for this owner that are 'booked'
    const allBookings = await bookingSchema.find({ ownerID: userId, bookingStatus: 'booked' });

    // Enrich with property details
    const bookedProperties = [];
    for (const booking of allBookings) {
      const property = await propertySchema.findById(booking.propertyId || booking.propertId);
      bookedProperties.push({
        bookingId: booking._id,
        tenantName: booking.userName,
        tenantPhone: booking.phone,
        bookingStatus: booking.bookingStatus,
        propertyType: property?.propertyType || 'N/A',
        propertyAddress: property?.propertyAddress || 'N/A',
        propertyAmt: property?.propertyAmt || 0,
        bedrooms: property?.bedrooms || 0,
        bathrooms: property?.bathrooms || 0,
        furnished: property?.furnished || 'N/A',
        propertyAdType: property?.propertyAdType || 'N/A',
        ownerName: property?.ownerName || 'N/A',
        bookedDate: booking.createdAt || booking._id.getTimestamp(),
      });
    }

    return res.status(200).send({
      success: true,
      data: bookedProperties,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).send({
      success: true,
      data: [],
      message: "Error fetching booked properties"
    });
  }
};

//////get all reviews for owner's properties/////
const getOwnerReviewsController = async (req, res) => {
  const { userId } = req.body;
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).send({ success: true, data: [] });
    }

    const allReviews = await reviewSchema.find({ ownerId: userId }).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      data: allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).send({
      success: true,
      data: [],
      message: "Error fetching reviews"
    });
  }
};

//////increment property view count/////
const incrementPropertyViewController = async (req, res) => {
  const { propertyId } = req.params;
  try {
    await propertySchema.findByIdAndUpdate(propertyId, { $inc: { views: 1 } });
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return res.status(500).send({ success: false });
  }
};

module.exports = {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
  getBookedPropertiesController,
  getOwnerReviewsController,
  incrementPropertyViewController,
};
