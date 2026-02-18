import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { UserContext } from '../../../App';
import { useToast } from '../../common/ToastContainer';
import { 
  Home, 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';

const RenterDashboard = () => {
  const user = useContext(UserContext);
  const { showSuccess, showError } = useToast();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    recentBookings: []
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`http://localhost:8001/api/user/getallbookings?userId=${user.userData._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.data.success) {
        const bookingsData = response.data.data;
        setBookings(bookingsData);
        
        // Calculate stats based on actual booking statuses:
        // 'pending' = waiting for owner approval
        // 'booked' = owner accepted
        // 'cancelled' = user cancelled
        const totalBookings = bookingsData.length;
        const activeBookings = bookingsData.filter(b => b.bookingStatus === 'pending' || b.bookingStatus === 'booked').length;
        const completedBookings = bookingsData.filter(b => b.bookingStatus === 'booked').length;
        const cancelledBookings = bookingsData.filter(b => b.bookingStatus === 'cancelled').length;
        
        setDashboardData({
          totalBookings,
          activeBookings,
          completedBookings,
          cancelledBookings,
          recentBookings: bookingsData.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        fetchDashboardData(); // Refresh data
      } else {
        showError(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showError('Failed to cancel booking');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`rounded-circle p-3 me-3 bg-${color} bg-opacity-10`}>
            <Icon size={24} className={`text-${color}`} />
          </div>
          <div className="flex-grow-1">
            <h6 className="text-muted mb-0 small">{title}</h6>
            <h4 className="mb-0 fw-bold">{value}</h4>
            {description && (
              <small className="text-muted">{description}</small>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', icon: Clock },
      'booked': { bg: 'success', icon: CheckCircle },
      'cancelled': { bg: 'danger', icon: XCircle }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge bg={config.bg} className="d-flex align-items-center gap-1">
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <User className="text-primary mb-3" size={48} />
          <h5>Loading Dashboard...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">🏠 Welcome back, {user?.userData?.name}!</h2>
          <p className="text-muted">Here's your rental activity overview</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatCard
            title="Total Bookings"
            value={dashboardData.totalBookings}
            icon={Calendar}
            color="primary"
            description="All time bookings"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Active Bookings"
            value={dashboardData.activeBookings}
            icon={CheckCircle}
            color="success"
            description="Currently active"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Completed"
            value={dashboardData.completedBookings}
            icon={Home}
            color="info"
            description="Successfully completed"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Cancelled"
            value={dashboardData.cancelledBookings}
            icon={XCircle}
            color="danger"
            description="Cancelled bookings"
          />
        </Col>
      </Row>

      {/* Recent Bookings */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0 fw-semibold">Recent Bookings</h5>
                <Badge bg="primary">{dashboardData.recentBookings.length} items</Badge>
              </div>
              
              {dashboardData.recentBookings.length > 0 ? (
                <div className="row g-3">
                  {dashboardData.recentBookings.map((booking) => (
                    <div key={booking._id} className="col-12">
                      <Card className="border-start border-primary border-4 shadow-sm">
                        <Card.Body>
                          <Row>
                            <Col md={8}>
                              <div className="d-flex align-items-start justify-content-between mb-2">
                                <div>
                                  <h6 className="mb-1 fw-semibold">Booking #{booking._id?.slice(-6)}</h6>
                                  <div className="d-flex align-items-center text-muted small mb-2">
                                    <MapPin size={14} className="me-1" />
                                    Property ID: {booking.propertyId}
                                  </div>
                                </div>
                                {getStatusBadge(booking.bookingStatus)}
                              </div>
                              
                              <div className="d-flex flex-wrap gap-3 text-muted small">
                                <span className="d-flex align-items-center">
                                  <User size={14} className="me-1" />
                                  {booking.userName}
                                </span>
                                <span className="d-flex align-items-center">
                                  <Phone size={14} className="me-1" />
                                  {booking.phone}
                                </span>
                                <span className="d-flex align-items-center">
                                  <Calendar size={14} className="me-1" />
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </Col>
                            
                            <Col md={4} className="text-md-end">
                              {booking.bookingStatus === 'pending' || booking.bookingStatus === 'booked' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                  className="d-flex align-items-center gap-1"
                                >
                                  <XCircle size={14} />
                                  Cancel Booking
                                </Button>
                              ) : (
                                <div className="text-muted small">
                                  {booking.bookingStatus === 'cancelled' && 'Cancelled'}
                                </div>
                              )}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Calendar size={48} className="mb-3" />
                  <h6>No Bookings Yet</h6>
                  <p>Browse properties to make your first booking</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RenterDashboard;