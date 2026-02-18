const express = require("express");
const multer = require("multer");

const authMiddlware = require("../middlewares/authMiddlware");

const {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
  getBookedPropertiesController,
  getOwnerReviewsController,
  incrementPropertyViewController,
} = require("../controllers/ownerController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, uniqueSuffix + '.' + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|mov|webm|avi|mkv/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  
  if (file.fieldname === 'propertyVideo') {
    if (videoTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (mp4, mov, webm, avi, mkv) are allowed'), false);
    }
  } else {
    if (imageTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
    }
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

router.post(
  "/postproperty",
  upload.fields([
    { name: 'propertyImages', maxCount: 10 },
    { name: 'propertyVideo', maxCount: 1 }
  ]),
  authMiddlware,
  addPropertyController
);

router.get("/getallproperties", authMiddlware, getAllOwnerPropertiesController);

router.get("/getallbookings", authMiddlware, getAllBookingsController);

router.post("/handlebookingstatus", authMiddlware, handleAllBookingstatusController);

router.get("/getbookedproperties", authMiddlware, getBookedPropertiesController);

router.get("/getreviews", authMiddlware, getOwnerReviewsController);

router.patch("/incrementview/:propertyId", incrementPropertyViewController);

router.delete(
  "/deleteproperty/:propertyid",
  authMiddlware,
  deletePropertyController
);

router.patch(
  "/updateproperty/:propertyid",
  upload.single("propertyImage"),
  authMiddlware,
  updatePropertyController
);

module.exports = router;
