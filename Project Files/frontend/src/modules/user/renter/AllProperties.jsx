import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Badge, Modal, Form } from 'react-bootstrap';
import { useToast } from '../../common/ToastContainer';
import { UserContext } from '../../../App';
import { useContext } from 'react';
import { XCircle, CheckCircle, Clock, Calendar, Star, MessageSquare, CreditCard } from 'lucide-react';

const AllProperty = ({ onStartChat }) => {
   const { showError, showSuccess } = useToast();
   const user = useContext(UserContext);
   const [allProperties, setAllProperties] = useState([]);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [reviewBooking, setReviewBooking] = useState(null);
   const [reviewRating, setReviewRating] = useState(0);
   const [hoverRating, setHoverRating] = useState(0);
   const [reviewText, setReviewText] = useState('');
   const [submittingReview, setSubmittingReview] = useState(false);
   const [reviewedBookings, setReviewedBookings] = useState(new Set());
   const [paidBookings, setPaidBookings] = useState(new Set());
   const [payingBooking, setPayingBooking] = useState(null);
   const [showPaymentModal, setShowPaymentModal] = useState(false);
   const [paymentDetails, setPaymentDetails] = useState(null);

   const getAllProperty = async () => {
      if (!user || !user.userData || !user.userData._id) {
         console.log('User data not available:', user);
         showError('Please log in to view booking history');
         return;
      }

      console.log('Fetching bookings for user ID:', user.userData._id);
      
      try {
         const response = await axios.get(`http://localhost:8001/api/user/getallbookings?userId=${user.userData._id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         console.log('Booking response:', response.data);

         if (response.data.success) {
            setAllProperties(response.data.data);
            
            // Check payment status for booked properties
            const bookedItems = response.data.data.filter(b => b.bookingStatus === 'booked');
            const paidSet = new Set();
            for (const b of bookedItems) {
               try {
                  const payRes = await axios.get(`http://localhost:8001/api/payment/check/${b._id}`, {
                     headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
                  });
                  if (payRes.data.paid) paidSet.add(b._id);
               } catch (e) { /* ignore */ }
            }
            setPaidBookings(paidSet);
         } else {
            showError(response.data.message);
         }
      } catch (error) {
         console.log('Error fetching bookings:', error);
         showError('Failed to fetch booking history');
      }
   };

   const handleCancelBooking = async (bookingId) => {
      if (!window.confirm('Are you sure you want to cancel this booking?')) {
         return;
      }

      try {
         const response = await axios.patch(`http://localhost:8001/api/user/cancelbooking/${bookingId}`, {
            bookingStatus: 'cancelled'
         }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (response.data.success) {
            showSuccess('Booking cancelled successfully');
            getAllProperty(); // Refresh the list
         } else {
            showError(response.data.message || 'Failed to cancel booking');
         }
      } catch (error) {
         console.error('Error cancelling booking:', error);
         showError('Failed to cancel booking');
      }
   };

   const getStatusBadge = (status) => {
      const statusConfig = {
         'pending': { className: 'badge-pending', icon: '⏳', text: 'Pending' },
         'booked': { className: 'badge-booked', icon: '✅', text: 'Booked' },
         'cancelled': { className: 'badge-cancelled', icon: '❌', text: 'Cancelled' }
      };
      
      const config = statusConfig[status] || { className: 'badge-unavailable', icon: '❓', text: 'Unknown' };
      
      return (
         <span className={`badge-modern ${config.className}`}>
            {config.icon} {config.text}
         </span>
      );
   };

   const handleChatWithOwner = async (booking) => {
      try {
         // Send an initial message to start the conversation
         await axios.post('http://localhost:8001/api/chat/send', {
            receiverId: booking.ownerID,
            propertyId: booking.propertyID,
            message: `Hi! I'd like to chat about the property at ${booking.propertyAddress || 'your property'}.`,
         }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });
         showSuccess('Chat started! Switching to Chat tab...');
         if (onStartChat) onStartChat();
      } catch (err) {
         // If there's already a conversation, just navigate
         if (onStartChat) onStartChat();
      }
   };

   const handlePayRent = async (booking) => {
      setPayingBooking(booking._id);
      try {
         // Create order on backend
         const orderRes = await axios.post('http://localhost:8001/api/payment/create-order', {
            bookingId: booking._id,
         }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (!orderRes.data.success) {
            showError(orderRes.data.message || 'Failed to create payment order');
            setPayingBooking(null);
            return;
         }

         // Show payment confirmation modal
         setPaymentDetails({
            booking,
            order: orderRes.data.order,
            payment: orderRes.data.payment,
         });
         setShowPaymentModal(true);
      } catch (error) {
         console.error('Error initiating payment:', error);
         showError(error.response?.data?.message || 'Failed to initiate payment');
         setPayingBooking(null);
      }
   };

   const confirmPayment = async () => {
      if (!paymentDetails) return;
      try {
         const verifyRes = await axios.post('http://localhost:8001/api/payment/verify', {
            orderId: paymentDetails.order.id,
            bookingId: paymentDetails.booking._id,
         }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (verifyRes.data.success) {
            showSuccess('Payment successful! Rent has been paid.');
            setPaidBookings(prev => new Set([...prev, paymentDetails.booking._id]));
         } else {
            showError('Payment failed. Please try again.');
         }
      } catch (err) {
         console.error('Payment error:', err);
         showError('Payment failed. Please try again.');
      }
      setShowPaymentModal(false);
      setPaymentDetails(null);
      setPayingBooking(null);
   };

   const openReviewModal = (booking) => {
      setReviewBooking(booking);
      setReviewRating(0);
      setHoverRating(0);
      setReviewText('');
      setShowReviewModal(true);
   };

   const handleSubmitReview = async () => {
      if (reviewRating === 0) {
         showError('Please select a rating');
         return;
      }
      if (!reviewText.trim()) {
         showError('Please write a review');
         return;
      }

      try {
         setSubmittingReview(true);
         const response = await axios.post('http://localhost:8001/api/user/submitreview', {
            propertyId: reviewBooking.propertyId,
            ownerId: reviewBooking.ownerID,
            rating: reviewRating,
            review: reviewText,
            bookingId: reviewBooking._id,
         }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (response.data.success) {
            showSuccess('Review submitted successfully!');
            setReviewedBookings(prev => new Set([...prev, reviewBooking._id]));
            setShowReviewModal(false);
         } else {
            showError(response.data.message || 'Failed to submit review');
         }
      } catch (error) {
         console.error('Error submitting review:', error);
         showError('Error submitting review');
      } finally {
         setSubmittingReview(false);
      }
   };

   const StarRating = ({ rating, hover, onRate, onHover, onLeave }) => (
      <div className="d-flex gap-1" style={{ cursor: 'pointer' }}>
         {[1, 2, 3, 4, 5].map(star => (
            <Star
               key={star}
               size={32}
               fill={(hover || rating) >= star ? '#ffc107' : 'none'}
               stroke={(hover || rating) >= star ? '#ffc107' : '#ccc'}
               onClick={() => onRate(star)}
               onMouseEnter={() => onHover(star)}
               onMouseLeave={onLeave}
               style={{ transition: 'all 0.15s' }}
            />
         ))}
      </div>
   );

   useEffect(() => {
      getAllProperty();
   }, []);

   return (
      <div className="p-3">
         <h4 className="section-title-modern">📋 Your Booking History</h4>
         <TableContainer component={Paper} className="modern-table-container">
            <Table sx={{ minWidth: 650 }} aria-label="booking history table">
               <TableHead className="modern-table-head">
                  <TableRow>
                     <TableCell>Booking ID</TableCell>
                     <TableCell>Property ID</TableCell>
                     <TableCell align="center">Tenant Name</TableCell>
                     <TableCell align="center">Phone</TableCell>
                     <TableCell align="center">Status</TableCell>
                     <TableCell align="center">Date</TableCell>
                     <TableCell align="center">Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allProperties.length > 0 ? (
                     allProperties.map((booking) => (
                        <TableRow
                           key={booking._id}
                           className="modern-table-row"
                        >
                           <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                              #{booking._id.slice(-6)}
                           </TableCell>
                           <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                              #{booking.propertyId.slice(-6)}
                           </TableCell>
                           <TableCell align="center" sx={{ fontWeight: '500' }}>
                              {booking.userName}
                           </TableCell>
                           <TableCell align="center">
                              <span style={{ color: '#666' }}>{booking.phone}</span>
                           </TableCell>
                           <TableCell align="center">
                              {getStatusBadge(booking.bookingStatus)}
                           </TableCell>
                           <TableCell align="center" sx={{ fontSize: '0.85em', color: '#666' }}>
                              <Calendar size={14} style={{ marginRight: '4px' }} />
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                           </TableCell>
                           <TableCell align="center">
                              {(booking.bookingStatus === 'pending' || booking.bookingStatus === 'approved') ? (
                                 <Button
                                    className="btn-modern btn-modern-danger"
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking._id)}
                                 >
                                    <XCircle size={14} />
                                    Cancel
                                 </Button>
                              ) : booking.bookingStatus === 'booked' ? (
                                 <div className="d-flex gap-2 justify-content-center flex-wrap">
                                    {!paidBookings.has(booking._id) ? (
                                       <Button
                                          className="btn-modern btn-modern-success"
                                          size="sm"
                                          onClick={() => handlePayRent(booking)}
                                          disabled={payingBooking === booking._id}
                                       >
                                          <CreditCard size={14} />
                                          {payingBooking === booking._id ? 'Processing...' : 'Pay Rent'}
                                       </Button>
                                    ) : (
                                       <Badge bg="success" className="d-flex align-items-center gap-1 py-2 px-2">
                                          <CheckCircle size={12} />
                                          Paid
                                       </Badge>
                                    )}
                                    <Button
                                       className="btn-modern btn-modern-danger"
                                       size="sm"
                                       onClick={() => handleCancelBooking(booking._id)}
                                    >
                                       <XCircle size={14} />
                                       Cancel
                                    </Button>
                                    {!reviewedBookings.has(booking._id) && (
                                       <Button
                                          className="btn-modern btn-modern-warning"
                                          size="sm"
                                          onClick={() => openReviewModal(booking)}
                                       >
                                          <Star size={14} />
                                          Review
                                       </Button>
                                    )}
                                    {reviewedBookings.has(booking._id) && (
                                       <Badge bg="success" className="d-flex align-items-center gap-1 py-2 px-2">
                                          <CheckCircle size={12} />
                                          Reviewed
                                       </Badge>
                                    )}
                                    <Button
                                       className="btn-modern btn-modern-primary"
                                       size="sm"
                                       onClick={() => handleChatWithOwner(booking)}
                                    >
                                       <MessageSquare size={14} />
                                       Chat
                                    </Button>
                                 </div>
                              ) : (
                                 <span className="text-muted small">
                                    {booking.bookingStatus === 'completed' ? 'Completed' : 'Cancelled'}
                                 </span>
                              )}
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                           <div style={{ textAlign: 'center', color: '#666' }}>
                              <div style={{ fontSize: '3em', marginBottom: '16px' }}>📋</div>
                              <div style={{ fontSize: '1.2em', fontWeight: '500', marginBottom: '8px' }}>
                                 No Booking History Available
                              </div>
                              <div style={{ fontSize: '0.9em', color: '#999' }}>
                                 Book some properties to see your bookings here!
                              </div>
                           </div>
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </TableContainer>

         {/* Review Modal */}
         <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
               <Modal.Title className="text-white d-flex align-items-center gap-2">
                  <MessageSquare size={22} />
                  Write a Review
               </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
               {reviewBooking && (
                  <>
                     <div className="mb-3 p-3 bg-light rounded">
                        <small className="text-muted">Property</small>
                        <p className="mb-0 fw-semibold">#{reviewBooking.propertyId?.slice(-6)}</p>
                     </div>

                     <Form.Group className="mb-4 text-center">
                        <Form.Label className="fw-semibold d-block mb-2">How was your experience?</Form.Label>
                        <StarRating
                           rating={reviewRating}
                           hover={hoverRating}
                           onRate={setReviewRating}
                           onHover={setHoverRating}
                           onLeave={() => setHoverRating(0)}
                        />
                        <small className="text-muted mt-1 d-block">
                           {reviewRating === 0 ? 'Click to rate' :
                            reviewRating === 1 ? 'Poor' :
                            reviewRating === 2 ? 'Fair' :
                            reviewRating === 3 ? 'Good' :
                            reviewRating === 4 ? 'Very Good' : 'Excellent!'}
                        </small>
                     </Form.Group>

                     <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Your Review</Form.Label>
                        <Form.Control
                           as="textarea"
                           rows={4}
                           placeholder="Share your experience about this property..."
                           value={reviewText}
                           onChange={(e) => setReviewText(e.target.value)}
                           style={{ resize: 'none' }}
                        />
                        <small className="text-muted">{reviewText.length}/500 characters</small>
                     </Form.Group>
                  </>
               )}
            </Modal.Body>
            <Modal.Footer>
               <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                  Cancel
               </Button>
               <Button
                  variant="warning"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewRating === 0 || !reviewText.trim()}
                  className="d-flex align-items-center gap-2"
               >
                  <Star size={16} />
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
               </Button>
            </Modal.Footer>
         </Modal>

         {/* Payment Confirmation Modal */}
         <Modal show={showPaymentModal} onHide={() => { setShowPaymentModal(false); setPaymentDetails(null); setPayingBooking(null); }} centered>
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
               <Modal.Title className="d-flex align-items-center gap-2">
                  <CreditCard size={20} />
                  Confirm Payment
               </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
               {paymentDetails && (
                  <>
                     <div className="text-center mb-4">
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>
                           ₹{paymentDetails.order.amount / 100}
                        </div>
                        <small className="text-muted">Rent Amount</small>
                     </div>
                     <div className="p-3 bg-light rounded mb-3">
                        <div className="d-flex justify-content-between mb-2">
                           <span className="text-muted">Booking ID</span>
                           <span className="fw-semibold">#{paymentDetails.booking._id.slice(-6)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                           <span className="text-muted">Property</span>
                           <span className="fw-semibold">{paymentDetails.payment?.propertyAddress?.substring(0, 25) || `#${paymentDetails.booking.propertyId?.slice(-6)}`}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                           <span className="text-muted">Tenant</span>
                           <span className="fw-semibold">{paymentDetails.booking.userName}</span>
                        </div>
                     </div>
                     <div className="p-3 border rounded" style={{ borderColor: '#667eea', background: '#f8f9ff' }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                           <CheckCircle size={16} style={{ color: '#28a745' }} />
                           <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Secure Payment</span>
                        </div>
                        <small className="text-muted">Your payment will be processed securely and the owner will be notified.</small>
                     </div>
                  </>
               )}
            </Modal.Body>
            <Modal.Footer>
               <Button variant="secondary" onClick={() => { setShowPaymentModal(false); setPaymentDetails(null); setPayingBooking(null); }}>
                  Cancel
               </Button>
               <Button
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                  onClick={confirmPayment}
                  className="d-flex align-items-center gap-2"
               >
                  <CreditCard size={16} />
                  Pay ₹{paymentDetails ? paymentDetails.order.amount / 100 : 0}
               </Button>
            </Modal.Footer>
         </Modal>
      </div>
   );
};

export default AllProperty;

