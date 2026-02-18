import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Carousel } from 'react-bootstrap';
import { Search, MapPin, DollarSign, Home, Users, Car, Wifi, Star, Heart, Eye, Filter } from 'lucide-react';
import { useToast } from '../common/ToastContainer';

const EnhancedPropertyCards = ({ loggedIn, onBookingSuccess }) => {
   const { showSuccess, showError } = useToast();
   const [allProperties, setAllProperties] = useState([]);
   const [filteredProperties, setFilteredProperties] = useState([]);
   const [loading, setLoading] = useState(true);
   
   // Filters
   const [filters, setFilters] = useState({
      search: '',
      propertyType: '',
      propertyAdType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      furnished: '',
      amenities: []
   });

   // Modal states
   const [showModal, setShowModal] = useState(false);
   const [selectedProperty, setSelectedProperty] = useState(null);
   const [carouselIndex, setCarouselIndex] = useState(0);
   
   // Booking form
   const [userDetails, setUserDetails] = useState({
      fullName: '',
      phone: '',
   });

   // Favorites (stored in localStorage)
   const [favorites, setFavorites] = useState(() => {
      const stored = localStorage.getItem('propertyFavorites');
      return stored ? JSON.parse(stored) : [];
   });

   const amenitiesList = ['WiFi', 'AC', 'Gym', 'Swimming Pool', 'Garden', 'Security', 'Lift', 'Power Backup'];

   useEffect(() => {
      fetchProperties();
   }, []);

   useEffect(() => {
      applyFilters();
   }, [allProperties, filters]);

   const fetchProperties = async () => {
      try {
         setLoading(true);
         const response = await axios.get('http://localhost:8001/api/user/getAllProperties');
         
         if (response.data.success) {
            const properties = response.data.data.map(property => ({
               ...property,
               views: property.views || 0,
               rating: property.rating || 0,
               isFeatured: property.isFeatured || false
            }));
            setAllProperties(properties);
         }
      } catch (error) {
         console.error('Error fetching properties:', error);
         showError('Failed to load properties');
      } finally {
         setLoading(false);
      }
   };

   const applyFilters = () => {
      let filtered = [...allProperties];

      // Search filter
      if (filters.search) {
         filtered = filtered.filter(property =>
            property.propertyAddress?.toLowerCase().includes(filters.search.toLowerCase()) ||
            property.propertyType?.toLowerCase().includes(filters.search.toLowerCase()) ||
            property.additionalInfo?.toLowerCase().includes(filters.search.toLowerCase())
         );
      }

      // Property type filter
      if (filters.propertyType) {
         filtered = filtered.filter(property => property.propertyType === filters.propertyType);
      }

      // Ad type filter
      if (filters.propertyAdType) {
         filtered = filtered.filter(property => property.propertyAdType === filters.propertyAdType);
      }

      // Price range filter
      if (filters.minPrice) {
         filtered = filtered.filter(property => property.propertyAmt >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
         filtered = filtered.filter(property => property.propertyAmt <= parseInt(filters.maxPrice));
      }

      // Bedrooms filter
      if (filters.bedrooms) {
         filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms));
      }

      // Furnished filter
      if (filters.furnished) {
         filtered = filtered.filter(property => property.furnished === filters.furnished);
      }

      setFilteredProperties(filtered);
   };

   const handleFilterChange = (field, value) => {
      setFilters(prev => ({ ...prev, [field]: value }));
   };

   const toggleFavorite = (propertyId) => {
      const newFavorites = favorites.includes(propertyId)
         ? favorites.filter(id => id !== propertyId)
         : [...favorites, propertyId];
      
      setFavorites(newFavorites);
      localStorage.setItem('propertyFavorites', JSON.stringify(newFavorites));
   };

   const handlePropertyClick = (property) => {
      setSelectedProperty(property);
      setCarouselIndex(0);
      setShowModal(true);
      // Track property view count
      axios.patch(`http://localhost:8001/api/owner/incrementview/${property._id}`).catch(() => {});
      // Track recently viewed for logged-in users
      if (loggedIn) {
         axios.post(`http://localhost:8001/api/recent-views/track/${property._id}`, {}, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
         }).catch(() => {});
      }
   };

   const handleBooking = async (status, propertyId, ownerId) => {
      if (!userDetails.fullName || !userDetails.phone) {
         showError('Please fill in all booking details');
         return;
      }

      try {
         const response = await axios.post(`http://localhost:8001/api/user/bookinghandle/${propertyId}`, 
            { userDetails, status, ownerId }, 
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
         );

         if (response.data.success) {
            showSuccess('Booking successful! Redirecting to your booking history...');
            setShowModal(false);
            setUserDetails({ fullName: '', phone: '' });
            if (onBookingSuccess) onBookingSuccess();
         } else {
            showError(response.data.message);
         }
      } catch (error) {
         console.error('Booking error:', error);
         showError('Booking failed. Please try again.');
      }
   };

   const clearFilters = () => {
      setFilters({
         search: '',
         propertyType: '',
         propertyAdType: '',
         minPrice: '',
         maxPrice: '',
         bedrooms: '',
         furnished: '',
         amenities: []
      });
   };

   const parseAmenities = (amenitiesString) => {
      try {
         if (!amenitiesString || amenitiesString.trim() === '') {
            return [];
         }
         return JSON.parse(amenitiesString);
      } catch (error) {
         console.warn('Failed to parse amenities:', amenitiesString, error);
         return [];
      }
   };

   // Safely display area field (handles both string and object formats)
   const displayArea = (area) => {
      if (!area) return '';
      if (typeof area === 'string') return area;
      if (typeof area === 'object' && area.value) {
         return area.unit ? `${area.value} ${area.unit}` : area.value;
      }
      return String(area);
   };

   const PropertyCard = ({ property }) => (
      <Card className="h-100 property-card shadow-sm border-0">
         {property.isFeatured && (
            <Badge bg="warning" className="position-absolute top-0 start-0 m-2" style={{ zIndex: 10 }}>
               ⭐ Featured
            </Badge>
         )}
         
         <div className="position-relative">
            <Card.Img
               variant="top"
               src={property.propertyImage?.[0]?.path ? `http://localhost:8001${property.propertyImage[0].path}` : '/api/placeholder/300/200'}
               style={{ height: '200px', objectFit: 'cover' }}
               onClick={() => handlePropertyClick(property)}
               className="cursor-pointer"
            />
            <Button
               variant="light"
               size="sm"
               className="position-absolute top-0 end-0 m-2 rounded-circle"
               onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(property._id);
               }}
            >
               <Heart 
                  size={16} 
                  fill={favorites.includes(property._id) ? 'red' : 'none'}
                  color={favorites.includes(property._id) ? 'red' : 'currentColor'}
               />
            </Button>
            
            <div className="position-absolute bottom-0 start-0 m-2 d-flex gap-1">
               <Badge bg="dark" className="d-flex align-items-center">
                  <Eye size={12} className="me-1" />
                  {property.views}
               </Badge>
               <Badge bg="warning" className="d-flex align-items-center">
                  <Star size={12} className="me-1" />
                  {property.rating}
               </Badge>
            </div>
         </div>

         <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
               <h5 className="card-title mb-0">
                  ₹{property.propertyAmt?.toLocaleString()}
                  <small className="text-muted">/{property.propertyAdType === 'rent' ? 'month' : 'total'}</small>
               </h5>
               <Badge 
                  bg={property.propertyAdType === 'rent' ? 'primary' : 'success'}
                  className="text-uppercase"
               >
                  {property.propertyAdType}
               </Badge>
            </div>

            <p className="text-muted small mb-2 d-flex align-items-center">
               <MapPin size={14} className="me-1" />
               {property.propertyAddress?.substring(0, 40)}...
            </p>

            <div className="d-flex justify-content-between text-muted small mb-2">
               <span className="d-flex align-items-center">
                  <Home size={14} className="me-1" />
                  {property.propertyType}
               </span>
               {property.bedrooms && (
                  <span className="d-flex align-items-center">
                     <Users size={14} className="me-1" />
                     {property.bedrooms} BHK
                  </span>
               )}
               {property.area && (
                  <span>{displayArea(property.area)}</span>
               )}
            </div>

            {(() => {
               const amenities = parseAmenities(property.amenities);
               return amenities.length > 0 && (
                  <div className="mb-2">
                     <div className="d-flex flex-wrap gap-1">
                        {amenities.slice(0, 3).map(amenity => (
                           <Badge key={amenity} bg="light" text="dark" className="small">
                              {amenity}
                           </Badge>
                        ))}
                        {amenities.length > 3 && (
                           <Badge bg="light" text="dark" className="small">
                              +{amenities.length - 3} more
                           </Badge>
                        )}
                     </div>
                  </div>
               );
            })()}

            <div className="d-grid mt-3">
               {!loggedIn ? (
                  <Button variant="outline-primary" href="/login">
                     View Details
                  </Button>
               ) : property.isAvailable === "Available" ? (
                  <Button 
                     variant="primary"
                     onClick={() => handlePropertyClick(property)}
                  >
                     View Details & Book
                  </Button>
               ) : (
                  <Button variant="secondary" disabled>
                     Not Available
                  </Button>
               )}
            </div>
         </Card.Body>
      </Card>
   );

   if (loading) {
      return (
         <Container className="py-5 text-center">
            <div className="spinner-border text-primary" role="status">
               <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading properties...</p>
         </Container>
      );
   }

   return (
      <Container className="py-4">
         {/* Advanced Filters */}
         <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-light border-0">
               <h5 className="mb-0 d-flex align-items-center">
                  <Filter size={20} className="me-2" />
                  Advanced Filters
               </h5>
            </Card.Header>
            <Card.Body>
               <Row className="g-3">
                  <Col md={4}>
                     <InputGroup>
                        <InputGroup.Text><Search size={16} /></InputGroup.Text>
                        <Form.Control
                           placeholder="Search by location, type..."
                           value={filters.search}
                           onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                     </InputGroup>
                  </Col>
                  
                  <Col md={2}>
                     <Form.Select
                        value={filters.propertyType}
                        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                     >
                        <option value="">All Types</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="land/plot">Land/Plot</option>
                     </Form.Select>
                  </Col>

                  <Col md={2}>
                     <Form.Select
                        value={filters.propertyAdType}
                        onChange={(e) => handleFilterChange('propertyAdType', e.target.value)}
                     >
                        <option value="">Rent/Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="sale">For Sale</option>
                     </Form.Select>
                  </Col>

                  <Col md={2}>
                     <Form.Control
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                     />
                  </Col>

                  <Col md={2}>
                     <Form.Control
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                     />
                  </Col>
               </Row>

               <Row className="g-3 mt-2">
                  <Col md={2}>
                     <Form.Select
                        value={filters.bedrooms}
                        onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                     >
                        <option value="">Any BHK</option>
                        <option value="1">1+ BHK</option>
                        <option value="2">2+ BHK</option>
                        <option value="3">3+ BHK</option>
                        <option value="4">4+ BHK</option>
                     </Form.Select>
                  </Col>

                  <Col md={2}>
                     <Form.Select
                        value={filters.furnished}
                        onChange={(e) => handleFilterChange('furnished', e.target.value)}
                     >
                        <option value="">Any Furnishing</option>
                        <option value="unfurnished">Unfurnished</option>
                        <option value="semi-furnished">Semi Furnished</option>
                        <option value="fully-furnished">Fully Furnished</option>
                     </Form.Select>
                  </Col>

                  <Col md={6}>
                     <div className="d-flex align-items-center">
                        <span className="me-2 small text-muted">Results: {filteredProperties.length}</span>
                        <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                           Clear All
                        </Button>
                     </div>
                  </Col>
               </Row>
            </Card.Body>
         </Card>

         {/* Properties Grid */}
         {filteredProperties.length > 0 ? (
            <Row className="g-4">
               {filteredProperties.map((property) => (
                  <Col key={property._id} lg={4} md={6}>
                     <PropertyCard property={property} />
                  </Col>
               ))}
            </Row>
         ) : (
            <div className="text-center py-5">
               <Home size={64} className="text-muted mb-3" />
               <h4>No Properties Found</h4>
               <p className="text-muted">Try adjusting your filters to see more results</p>
               <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
               </Button>
            </div>
         )}

         {/* Property Details Modal */}
         {selectedProperty && (
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
               <Modal.Header closeButton>
                  <Modal.Title>Property Details</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  {/* Image Carousel */}
                  {selectedProperty.propertyImage && selectedProperty.propertyImage.length > 0 && (
                     <Carousel activeIndex={carouselIndex} onSelect={setCarouselIndex} className="mb-4">
                        {selectedProperty.propertyImage.map((image, idx) => (
                           <Carousel.Item key={idx}>
                              <img
                                 src={`http://localhost:8001${image.path}`}
                                 alt={`Property ${idx + 1}`}
                                 className="d-block w-100 rounded"
                                 style={{ height: '300px', objectFit: 'cover' }}
                              />
                           </Carousel.Item>
                        ))}
                     </Carousel>
                  )}

                  {/* Property Info */}
                  <Row className="mb-4">
                     <Col md={6}>
                        <h5>₹{selectedProperty.propertyAmt?.toLocaleString()}</h5>
                        <p className="text-muted mb-2">
                           <MapPin size={16} className="me-1" />
                           {selectedProperty.propertyAddress}
                        </p>
                        <p><strong>Type:</strong> {selectedProperty.propertyType}</p>
                        <p><strong>Listing:</strong> {selectedProperty.propertyAdType}</p>
                        {selectedProperty.area && <p><strong>Area:</strong> {displayArea(selectedProperty.area)}</p>}
                     </Col>
                     <Col md={6}>
                        <p><strong>Contact:</strong> {selectedProperty.ownerContact}</p>
                        {selectedProperty.bedrooms && <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</p>}
                        {selectedProperty.bathrooms && <p><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</p>}
                        <p><strong>Furnished:</strong> {selectedProperty.furnished || 'Not specified'}</p>
                        <p><strong>Parking:</strong> {selectedProperty.parking ? 'Available' : 'Not Available'}</p>
                     </Col>
                  </Row>

                  {selectedProperty.additionalInfo && (
                     <div className="mb-4">
                        <h6>Description</h6>
                        <p>{selectedProperty.additionalInfo}</p>
                     </div>
                  )}

                  {/* Virtual Tour */}
                  {selectedProperty.virtualTourUrl && (
                     <div className="mb-4">
                        <h6><Eye size={16} className="me-1" />Virtual Tour</h6>
                        {selectedProperty.virtualTourUrl.includes('youtube.com') || selectedProperty.virtualTourUrl.includes('youtu.be') ? (
                           <div className="ratio ratio-16x9 rounded overflow-hidden">
                              <iframe
                                 src={selectedProperty.virtualTourUrl
                                    .replace('watch?v=', 'embed/')
                                    .replace('youtu.be/', 'www.youtube.com/embed/')
                                    .replace(/&.*$/, '')}
                                 title="Virtual Tour"
                                 allowFullScreen
                                 style={{ border: 'none' }}
                              />
                           </div>
                        ) : (
                           <a
                              href={selectedProperty.virtualTourUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary d-flex align-items-center gap-2 justify-content-center"
                           >
                              <Eye size={16} />
                              Open Virtual Tour
                           </a>
                        )}
                     </div>
                  )}

                  {/* Property Video */}
                  {selectedProperty.propertyVideo && selectedProperty.propertyVideo.path && (
                     <div className="mb-4">
                        <h6><Eye size={16} className="me-1" />Property Video</h6>
                        <div className="rounded overflow-hidden" style={{ maxWidth: '100%' }}>
                           <video
                              src={`http://localhost:8001${selectedProperty.propertyVideo.path}`}
                              controls
                              className="w-100 rounded"
                              style={{ maxHeight: '400px', backgroundColor: '#000' }}
                              preload="metadata"
                           >
                              Your browser does not support the video tag.
                           </video>
                           {selectedProperty.propertyVideo.originalName && (
                              <small className="text-muted d-block mt-1">
                                 {selectedProperty.propertyVideo.originalName}
                              </small>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Amenities */}
                  {(() => {
                     const amenities = parseAmenities(selectedProperty.amenities);
                     return amenities.length > 0 && (
                        <div className="mb-4">
                           <h6>Amenities</h6>
                           <div className="d-flex flex-wrap gap-1">
                              {amenities.map(amenity => (
                                 <Badge key={amenity} bg="light" text="dark">
                                    {amenity}
                                 </Badge>
                              ))}
                           </div>
                        </div>
                     );
                  })()}

                  {/* Booking Form */}
                  {loggedIn && selectedProperty.isAvailable === "Available" && (
                     <div className="border-top pt-4">
                        <h6>Book this Property</h6>
                        <Row className="g-3">
                           <Col md={6}>
                              <Form.Control
                                 placeholder="Your Full Name"
                                 value={userDetails.fullName}
                                 onChange={(e) => setUserDetails(prev => ({ ...prev, fullName: e.target.value }))}
                              />
                           </Col>
                           <Col md={6}>
                              <Form.Control
                                 placeholder="Your Phone Number"
                                 value={userDetails.phone}
                                 onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                              />
                           </Col>
                           <Col md={12}>
                              <div className="d-grid">
                                 <Button
                                    variant="primary"
                                    onClick={() => handleBooking('pending', selectedProperty._id, selectedProperty.ownerId)}
                                 >
                                    Book Property
                                 </Button>
                              </div>
                           </Col>
                        </Row>
                     </div>
                  )}
               </Modal.Body>
            </Modal>
         )}
      </Container>
   );
};

export default EnhancedPropertyCards;