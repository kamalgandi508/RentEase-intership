const mongoose = require('mongoose')

const propertyModel = mongoose.Schema({
   ownerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
   },
   propertyType:{
      type:String,
      required:[true,'Please provide a Property Type']
   },
   propertyAdType:{
      type: String,
      required:[true,'Please provide a Property Ad Type']
   },
   propertyAddress:{
      type: String,
      required:[true,"Please Provide an Address"]
   },
   ownerContact:{
      type: Number,
      required: [true, 'Please provide owner contact']
   },
   propertyAmt:{
      type :Number ,
      default: 0,
   },
   propertyImage: {
      type: Object
   },
   additionalInfo:{
      type: String,
   },
   ownerName: {
      type: String,
   },
   // New enhanced fields
   bedrooms: {
      type: Number,
      default: 1
   },
   bathrooms: {
      type: Number,
      default: 1
   },
   area: {
      type: String,
   },
   parking: {
      type: Boolean,
      default: false
   },
   furnished: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'unfurnished'
   },
   amenities: {
      type: String, // JSON string array
      default: '[]'
   },
   views: {
      type: Number,
      default: 0
   },
   rating: {
      type: Number,
      default: 0
   },
   isFeatured: {
      type: Boolean,
      default: false
   },
   virtualTourUrl: {
      type: String,
      default: ''
   },
   propertyVideo: {
      type: Object,
      default: null
   }
},{
   strict: false,
})

const propertySchema = mongoose.model('propertyschema', propertyModel)

module.exports = propertySchema