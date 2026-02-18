import React, { useState, useEffect } from 'react';
import { Container, Button, Col, Form, InputGroup, Row, FloatingLabel, Card, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { message } from 'antd';
import { Upload, MapPin, DollarSign, Home, FileText, Camera, X, Video } from 'lucide-react';

function AddProperty() {
   const [image, setImage] = useState(null);
   const [imagePreviews, setImagePreviews] = useState([]);
   const [video, setVideo] = useState(null);
   const [videoPreview, setVideoPreview] = useState(null);
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState({});
   const [showSuccess, setShowSuccess] = useState(false);
   const [propertyDetails, setPropertyDetails] = useState({
      propertyType: 'residential',
      propertyAdType: 'rent',
      propertyAddress: '',
      ownerContact: '',
      propertyAmt: 0,
      additionalInfo: '',
      virtualTourUrl: '',
      bedrooms: 1,
      bathrooms: 1,
      area: '',
      parking: false,
      furnished: 'unfurnished',
      amenities: []
   });

   const amenitiesList = [
      'WiFi', 'AC', 'Gym', 'Swimming Pool', 'Garden', 'Security', 
      'Lift', 'Power Backup', 'Water Supply', 'Maintenance'
   ];

   const validateForm = () => {
      const newErrors = {};
      
      if (!propertyDetails.propertyAddress.trim()) {
         newErrors.propertyAddress = 'Address is required';
      }
      if (!propertyDetails.ownerContact.trim() || propertyDetails.ownerContact.length < 10) {
         newErrors.ownerContact = 'Valid 10-digit phone number is required';
      }
      if (!propertyDetails.propertyAmt || propertyDetails.propertyAmt <= 0) {
         newErrors.propertyAmt = 'Valid amount is required';
      }
      if (!propertyDetails.area.trim()) {
         newErrors.area = 'Area is required';
      }
      if (!image || image.length === 0) {
         newErrors.images = 'At least one image is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 10) {
         message.error('Maximum 10 images allowed');
         return;
      }

      setImage(files);
      
      // Generate previews
      const previews = [];
      files.forEach(file => {
         const reader = new FileReader();
         reader.onload = (e) => {
            previews.push({
               file: file,
               url: e.target.result,
               name: file.name
            });
            if (previews.length === files.length) {
               setImagePreviews([...previews]);
            }
         };
         reader.readAsDataURL(file);
      });
   };

   const removeImage = (index) => {
      const newFiles = Array.from(image).filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      
      setImage(newFiles.length > 0 ? newFiles : null);
      setImagePreviews(newPreviews);
   };

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setPropertyDetails((prevDetails) => ({
         ...prevDetails,
         [name]: type === 'checkbox' ? checked : value,
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
         setErrors(prev => ({ ...prev, [name]: '' }));
      }
   };

   const handleAmenityChange = (amenity) => {
      const updatedAmenities = propertyDetails.amenities.includes(amenity)
         ? propertyDetails.amenities.filter(item => item !== amenity)
         : [...propertyDetails.amenities, amenity];
      
      setPropertyDetails(prev => ({ ...prev, amenities: updatedAmenities }));
   };

   useEffect(() => {
      setPropertyDetails((prevDetails) => ({
         ...prevDetails,
         propertyImages: image,
      }));
   }, [image]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
         message.error('Please fix all errors before submitting');
         return;
      }

      setLoading(true);
      
      try {
         const formData = new FormData();
         formData.append('propertyType', propertyDetails.propertyType);
         formData.append('propertyAdType', propertyDetails.propertyAdType);
         formData.append('propertyAddress', propertyDetails.propertyAddress);
         formData.append('ownerContact', propertyDetails.ownerContact);
         formData.append('propertyAmt', propertyDetails.propertyAmt);
         formData.append('additionalInfo', propertyDetails.additionalInfo);
         formData.append('virtualTourUrl', propertyDetails.virtualTourUrl);
         formData.append('bedrooms', propertyDetails.bedrooms);
         formData.append('bathrooms', propertyDetails.bathrooms);
         formData.append('area', propertyDetails.area);
         formData.append('parking', propertyDetails.parking);
         formData.append('furnished', propertyDetails.furnished);
         formData.append('amenities', JSON.stringify(propertyDetails.amenities));

         if (image) {
            for (let i = 0; i < image.length; i++) {
               formData.append('propertyImages', image[i]);
            }
         }

         if (video) {
            formData.append('propertyVideo', video);
         }

         const response = await axios.post('http://localhost:8001/api/owner/postproperty', formData, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               'Content-Type': 'multipart/form-data',
            }
         });

         if (response.data.success) {
            message.success(response.data.message);
            setShowSuccess(true);
            
            // Reset form
            setPropertyDetails({
               propertyType: 'residential',
               propertyAdType: 'rent',
               propertyAddress: '',
               ownerContact: '',
               propertyAmt: 0,
               additionalInfo: '',
               virtualTourUrl: '',
               bedrooms: 1,
               bathrooms: 1,
               area: '',
               parking: false,
               furnished: 'unfurnished',
               amenities: []
            });
            setImage(null);
            setImagePreviews([]);
            setVideo(null);
            setVideoPreview(null);
            
            setTimeout(() => setShowSuccess(false), 5000);
         } else {
            message.error(response.data.message);
         }
      } catch (error) {
         console.error('Error adding property:', error);
         message.error('Failed to add property. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Container className="py-4">
         {showSuccess && (
            <Alert variant="success" className="mb-4">
               <strong>Success!</strong> Your property has been added successfully. You can view it in the "All Properties" tab.
            </Alert>
         )}

         <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
               <div className="d-flex align-items-center">
                  <Home className="me-2" size={20} />
                  <h4 className="mb-0">Add New Property</h4>
               </div>
               <small>Fill in all the details to list your property</small>
            </Card.Header>
            
            <Card.Body className="p-4">
               <Form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <h5 className="mb-3 text-primary">
                     <FileText size={20} className="me-2" />
                     Basic Information
                  </h5>
                  
                  <Row className="mb-3">
                     <Form.Group as={Col} md="4">
                        <Form.Label className="fw-semibold">Property Type *</Form.Label>
                        <div className="position-relative">
                           <Form.Select 
                              name='propertyType' 
                              value={propertyDetails.propertyType} 
                              onChange={handleChange}
                              className="form-select-lg"
                              style={{ paddingLeft: '45px' }}
                           >
                              <option value="residential">Residential</option>
                              <option value="commercial">Commercial</option>
                              <option value="land/plot">Land/Plot</option>
                           </Form.Select>
                           <div className="position-absolute top-50 translate-middle-y" style={{ left: '12px', pointerEvents: 'none' }}>
                              {propertyDetails.propertyType === 'residential' && (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H4a1 1 0 01-1-1v-8.5l-1 .5L1 10l11-6 11 6-1 2-1-.5V20a1 1 0 01-1 1h-5v-7H9v7z" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                 </svg>
                              )}
                              {propertyDetails.propertyType === 'commercial' && (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 2h16a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v16h14V4H5zm2 2h2v2H7V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 14h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/>
                                 </svg>
                              )}
                              {propertyDetails.propertyType === 'land/plot' && (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="currentColor"/>
                                 </svg>
                              )}
                           </div>
                        </div>
                     </Form.Group>
                     
                     <Form.Group as={Col} md="4">
                        <Form.Label className="fw-semibold">Listing Type *</Form.Label>
                        <div className="position-relative">
                           <Form.Select 
                              name='propertyAdType' 
                              value={propertyDetails.propertyAdType} 
                              onChange={handleChange}
                              className="form-select-lg"
                              style={{ paddingLeft: '45px' }}
                           >
                              <option value="rent">For Rent</option>
                              <option value="sale">For Sale</option>
                           </Form.Select>
                           <div className="position-absolute top-50 translate-middle-y" style={{ left: '12px', pointerEvents: 'none' }}>
                              {propertyDetails.propertyAdType === 'rent' && (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 14C7 11.2386 9.23858 9 12 9C14.7614 9 17 11.2386 17 14V16H18C18.5523 16 19 16.4477 19 17V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V17C5 16.4477 5.44772 16 6 16H7V14ZM9 16H15V14C15 12.3431 13.6569 11 12 11C10.3431 11 9 12.3431 9 14V16Z" fill="currentColor"/>
                                 </svg>
                              )}
                              {propertyDetails.propertyAdType === 'sale' && (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                 </svg>
                              )}
                           </div>
                        </div>
                     </Form.Group>
                     
                     <Form.Group as={Col} md="4">
                        <Form.Label className="fw-semibold">Furnished Status</Form.Label>
                        <Form.Select 
                           name='furnished' 
                           value={propertyDetails.furnished} 
                           onChange={handleChange}
                           className="form-select-lg"
                        >
                           <option value="unfurnished">Unfurnished</option>
                           <option value="semi-furnished">Semi Furnished</option>
                           <option value="fully-furnished">Fully Furnished</option>
                        </Form.Select>
                     </Form.Group>
                  </Row>

                  <Row className="mb-3">
                     <Form.Group as={Col} md="8">
                        <Form.Label className="fw-semibold">Property Address *</Form.Label>
                        <InputGroup>
                           <InputGroup.Text><MapPin size={16} /></InputGroup.Text>
                           <Form.Control
                              type="text"
                              placeholder="Enter complete address with locality, city, state"
                              name='propertyAddress'
                              value={propertyDetails.propertyAddress}
                              onChange={handleChange}
                              isInvalid={errors.propertyAddress}
                              className="form-control-lg"
                           />
                        </InputGroup>
                        {errors.propertyAddress && (
                           <Form.Control.Feedback type="invalid">
                              {errors.propertyAddress}
                           </Form.Control.Feedback>
                        )}
                     </Form.Group>
                     
                     <Form.Group as={Col} md="4">
                        <Form.Label className="fw-semibold">Area/Size *</Form.Label>
                        <InputGroup>
                           <Form.Control
                              type="text"
                              placeholder="e.g., 1200 sq ft"
                              name='area'
                              value={propertyDetails.area}
                              onChange={handleChange}
                              isInvalid={errors.area}
                              className="form-control-lg"
                           />
                           <InputGroup.Text>sq ft</InputGroup.Text>
                        </InputGroup>
                        {errors.area && (
                           <Form.Control.Feedback type="invalid">
                              {errors.area}
                           </Form.Control.Feedback>
                        )}
                     </Form.Group>
                  </Row>

                  {/* Property Details */}
                  <h5 className="mb-3 mt-4 text-primary">
                     <Home size={20} className="me-2" />
                     Property Details
                  </h5>
                  
                  <Row className="mb-3">
                     <Form.Group as={Col} md="3">
                        <Form.Label className="fw-semibold">Bedrooms</Form.Label>
                        <Form.Control
                           type="number"
                           min="1"
                           max="10"
                           name='bedrooms'
                           value={propertyDetails.bedrooms}
                           onChange={handleChange}
                           className="form-control-lg"
                        />
                     </Form.Group>
                     
                     <Form.Group as={Col} md="3">
                        <Form.Label className="fw-semibold">Bathrooms</Form.Label>
                        <Form.Control
                           type="number"
                           min="1"
                           max="10"
                           name='bathrooms'
                           value={propertyDetails.bathrooms}
                           onChange={handleChange}
                           className="form-control-lg"
                        />
                     </Form.Group>
                     
                     <Form.Group as={Col} md="3">
                        <Form.Label className="fw-semibold">Owner Contact *</Form.Label>
                        <Form.Control
                           type="tel"
                           placeholder="10-digit phone number"
                           name='ownerContact'
                           value={propertyDetails.ownerContact}
                           onChange={handleChange}
                           isInvalid={errors.ownerContact}
                           className="form-control-lg"
                        />
                        {errors.ownerContact && (
                           <Form.Control.Feedback type="invalid">
                              {errors.ownerContact}
                           </Form.Control.Feedback>
                        )}
                     </Form.Group>
                     
                     <Form.Group as={Col} md="3">
                        <Form.Label className="fw-semibold">
                           {propertyDetails.propertyAdType === 'rent' ? 'Monthly Rent' : 'Sale Price'} *
                        </Form.Label>
                        <InputGroup>
                           <InputGroup.Text><DollarSign size={16} /></InputGroup.Text>
                           <Form.Control
                              type="number"
                              placeholder={propertyDetails.propertyAdType === 'rent' ? 'Monthly amount' : 'Total price'}
                              name='propertyAmt'
                              value={propertyDetails.propertyAmt}
                              onChange={handleChange}
                              isInvalid={errors.propertyAmt}
                              className="form-control-lg"
                           />
                        </InputGroup>
                        {errors.propertyAmt && (
                           <Form.Control.Feedback type="invalid">
                              {errors.propertyAmt}
                           </Form.Control.Feedback>
                        )}
                     </Form.Group>
                  </Row>

                  {/* Parking */}
                  <Row className="mb-3">
                     <Col>
                        <Form.Check
                           type="checkbox"
                           label="Parking Available"
                           name="parking"
                           checked={propertyDetails.parking}
                           onChange={handleChange}
                           className="mb-2"
                        />
                     </Col>
                  </Row>

                  {/* Amenities */}
                  <h5 className="mb-3 mt-4 text-primary">Amenities</h5>
                  <Row className="mb-3">
                     <Col>
                        <div className="d-flex flex-wrap gap-2">
                           {amenitiesList.map(amenity => (
                              <Badge
                                 key={amenity}
                                 bg={propertyDetails.amenities.includes(amenity) ? 'primary' : 'outline-secondary'}
                                 className="p-2 cursor-pointer"
                                 style={{ cursor: 'pointer' }}
                                 onClick={() => handleAmenityChange(amenity)}
                              >
                                 {amenity}
                              </Badge>
                           ))}
                        </div>
                        <small className="text-muted">Click to select/deselect amenities</small>
                     </Col>
                  </Row>

                  {/* Images */}
                  <h5 className="mb-3 mt-4 text-primary">
                     <Camera size={20} className="me-2" />
                     Property Images *
                  </h5>
                  
                  <Row className="mb-3">
                     <Form.Group as={Col}>
                        <Form.Label className="fw-semibold">Upload Images (Max 10)</Form.Label>
                        <Form.Control
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={handleImageChange}
                           isInvalid={errors.images}
                           className="form-control-lg"
                        />
                        {errors.images && (
                           <Form.Control.Feedback type="invalid">
                              {errors.images}
                           </Form.Control.Feedback>
                        )}
                        <Form.Text className="text-muted">
                           Upload high-quality images. First image will be used as cover photo.
                        </Form.Text>
                     </Form.Group>
                  </Row>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                     <Row className="mb-3">
                        <Col>
                           <h6>Image Previews:</h6>
                           <div className="d-flex flex-wrap gap-2">
                              {imagePreviews.map((preview, index) => (
                                 <div key={index} className="position-relative">
                                    <img
                                       src={preview.url}
                                       alt={`Preview ${index + 1}`}
                                       className="rounded"
                                       style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                    <button
                                       type="button"
                                       className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                       style={{ transform: 'translate(50%, -50%)', borderRadius: '50%', width: '25px', height: '25px', padding: '0' }}
                                       onClick={() => removeImage(index)}
                                    >
                                       <X size={12} />
                                    </button>
                                    {index === 0 && (
                                       <Badge bg="success" className="position-absolute bottom-0 start-0 m-1">
                                          Cover
                                       </Badge>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </Col>
                     </Row>
                  )}

                  {/* Additional Information */}
                  {/* Property Video Upload */}
                  <h5 className="mb-3 mt-4 text-primary">
                     <Video size={20} className="me-2" />
                     Property Video
                  </h5>
                  
                  <Row className="mb-3">
                     <Form.Group as={Col}>
                        <Form.Label className="fw-semibold">Upload Video (Max 100MB)</Form.Label>
                        <Form.Control
                           type="file"
                           accept="video/mp4,video/mov,video/webm,video/avi,video/quicktime"
                           capture="environment"
                           onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              if (file.size > 100 * 1024 * 1024) {
                                 message.error('Video must be under 100MB');
                                 e.target.value = '';
                                 return;
                              }
                              setVideo(file);
                              setVideoPreview(URL.createObjectURL(file));
                           }}
                           className="form-control-lg"
                        />
                        <Form.Text className="text-muted">
                           Record directly from your phone camera or upload an existing video (MP4, MOV, WebM). Max 100MB.
                        </Form.Text>
                     </Form.Group>
                  </Row>

                  {/* Video Preview */}
                  {videoPreview && (
                     <Row className="mb-3">
                        <Col>
                           <h6>Video Preview:</h6>
                           <div className="position-relative" style={{ maxWidth: '400px' }}>
                              <video
                                 src={videoPreview}
                                 controls
                                 className="rounded w-100"
                                 style={{ maxHeight: '250px' }}
                              />
                              <button
                                 type="button"
                                 className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                 style={{ borderRadius: '50%', width: '30px', height: '30px', padding: '0' }}
                                 onClick={() => {
                                    setVideo(null);
                                    URL.revokeObjectURL(videoPreview);
                                    setVideoPreview(null);
                                 }}
                              >
                                 <X size={14} />
                              </button>
                              <Badge bg="info" className="position-absolute bottom-0 start-0 m-2">
                                 {(video.size / (1024 * 1024)).toFixed(1)} MB
                              </Badge>
                           </div>
                        </Col>
                     </Row>
                  )}

                  <Row className="mb-4">
                     <Form.Group as={Col}>
                        <FloatingLabel label="Additional Details & Description">
                           <Form.Control
                              as="textarea"
                              name='additionalInfo'
                              value={propertyDetails.additionalInfo}
                              onChange={handleChange}
                              placeholder="Describe your property, nearby facilities, unique features..."
                              style={{ height: '120px' }}
                           />
                        </FloatingLabel>
                     </Form.Group>
                  </Row>

                  {/* Virtual Tour URL */}
                  <Row className="mb-4">
                     <Form.Group as={Col}>
                        <FloatingLabel label="Virtual Tour URL (YouTube, Matterport, etc.)">
                           <Form.Control
                              type="url"
                              name='virtualTourUrl'
                              value={propertyDetails.virtualTourUrl}
                              onChange={handleChange}
                              placeholder="https://www.youtube.com/watch?v=..."
                           />
                        </FloatingLabel>
                        <Form.Text className="text-muted">
                           Paste a YouTube video link or any virtual tour URL to help renters explore your property remotely.
                        </Form.Text>
                     </Form.Group>
                  </Row>

                  {/* Submit Button */}
                  <div className="d-grid">
                     <Button 
                        variant="primary" 
                        size="lg" 
                        type="submit"
                        disabled={loading}
                        className="py-3"
                     >
                        {loading ? (
                           <>
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                 <span className="visually-hidden">Loading...</span>
                              </div>
                              Adding Property...
                           </>
                        ) : (
                           <>
                              <Upload className="me-2" size={20} />
                              Add Property
                           </>
                        )}
                     </Button>
                  </div>
               </Form>
            </Card.Body>
         </Card>
      </Container>
   );
}


export default AddProperty;
