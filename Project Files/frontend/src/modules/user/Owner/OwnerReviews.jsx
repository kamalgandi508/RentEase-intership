import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { Container, Row, Col, Card, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Star, Search, MessageSquare, TrendingUp, User, MapPin, Calendar } from 'lucide-react';

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(0); // 0 = all

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8001/api/owner/getreviews', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error('Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  const filteredReviews = reviews.filter(r => {
    const matchSearch = r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.review?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRating = filterRating === 0 || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  const StarDisplay = ({ rating, size = 16 }) => (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? '#ffc107' : 'none'}
          stroke={star <= rating ? '#ffc107' : '#ddd'}
        />
      ))}
    </div>
  );

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading reviews...</span>
      </div>
    );
  }

  return (
    <Container fluid>
      {/* Overview Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Average Rating</h6>
                  <h1 className="mb-1 fw-bold">{avgRating}</h1>
                  <StarDisplay rating={Math.round(avgRating)} size={20} />
                </div>
                <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                  <Star size={36} fill="#ffc107" stroke="#ffc107" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
            <Card.Body className="text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Total Reviews</h6>
                  <h1 className="mb-0 fw-bold">{totalReviews}</h1>
                  <p className="mb-0 small mt-1">from tenants</p>
                </div>
                <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <MessageSquare size={36} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Rating Distribution</h6>
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="d-flex align-items-center mb-1 gap-2">
                  <span className="small fw-semibold" style={{ minWidth: '20px' }}>{star}</span>
                  <Star size={12} fill="#ffc107" stroke="#ffc107" />
                  <ProgressBar
                    now={percentage}
                    variant={star >= 4 ? 'success' : star >= 3 ? 'warning' : 'danger'}
                    style={{ flex: 1, height: '8px' }}
                  />
                  <span className="small text-muted" style={{ minWidth: '24px' }}>{count}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3 g-2">
        <Col md={8}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search reviews by tenant name, content, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Col>
        <Col md={4}>
          <div className="d-flex gap-1 flex-wrap">
            <Badge
              bg={filterRating === 0 ? 'primary' : 'light'}
              text={filterRating === 0 ? 'white' : 'dark'}
              className="px-3 py-2"
              role="button"
              onClick={() => setFilterRating(0)}
              style={{ cursor: 'pointer' }}
            >
              All
            </Badge>
            {[5, 4, 3, 2, 1].map(star => (
              <Badge
                key={star}
                bg={filterRating === star ? 'primary' : 'light'}
                text={filterRating === star ? 'white' : 'dark'}
                className="px-3 py-2 d-flex align-items-center gap-1"
                role="button"
                onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                style={{ cursor: 'pointer' }}
              >
                {star} <Star size={10} fill="#ffc107" stroke="#ffc107" />
              </Badge>
            ))}
          </div>
        </Col>
      </Row>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5">
          <Card.Body>
            <MessageSquare size={60} className="text-muted mb-3" />
            <h4 className="text-muted">No Reviews Yet</h4>
            <p className="text-muted">
              {searchTerm || filterRating > 0
                ? 'No reviews match your filters.'
                : 'When tenants review your properties, they will appear here.'}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filteredReviews.map((review) => (
            <Col md={6} lg={4} key={review._id}>
              <Card className="border-0 shadow-sm h-100 hover-shadow" style={{ transition: 'box-shadow 0.2s' }}>
                <Card.Body>
                  {/* Header: User + Rating */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                        style={{ 
                          width: 42, height: 42, 
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          fontSize: '16px'
                        }}
                      >
                        {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-semibold">{review.userName}</h6>
                        <div className="d-flex align-items-center gap-1 text-muted small">
                          <Calendar size={11} />
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge bg={getRatingColor(review.rating)} className="d-flex align-items-center gap-1 px-2 py-1">
                      <Star size={12} fill="white" stroke="white" />
                      {review.rating}
                    </Badge>
                  </div>

                  {/* Stars */}
                  <div className="mb-2">
                    <StarDisplay rating={review.rating} />
                  </div>

                  {/* Review Text */}
                  <p className="mb-3 text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    "{review.review}"
                  </p>

                  {/* Property Info Footer */}
                  <div className="border-top pt-2">
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <MapPin size={12} />
                      <span className="text-truncate">{review.propertyAddress || 'N/A'}</span>
                    </div>
                    <Badge bg="outline-secondary" className="mt-1 text-muted border" style={{ fontSize: '0.7rem' }}>
                      {review.propertyType || 'Property'}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Footer */}
      {filteredReviews.length > 0 && (
        <div className="mt-3 text-muted text-center">
          <span>Showing {filteredReviews.length} of {totalReviews} reviews</span>
        </div>
      )}
    </Container>
  );
};

export default OwnerReviews;
