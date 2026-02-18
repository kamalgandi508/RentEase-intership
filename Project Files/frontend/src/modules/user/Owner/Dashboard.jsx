import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { UserContext } from '../../../App';
import { 
  TrendingUp, 
  Home, 
  Users, 
  DollarSign, 
  Eye, 
  Calendar,
  MapPin,
  Star,
  Phone,
  CreditCard
} from 'lucide-react';

const Dashboard = ({ onNavigateToAddProperty, onNavigateToBookings, onNavigateToAnalytics, onNavigateToReviews }) => {
  const user = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState({
    totalProperties: 0,
    activeBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    recentBookings: [],
    propertyViews: 0,
    monthlyStats: []
  });
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch properties
      const propertiesRes = await axios.get('http://localhost:8001/api/owner/getallproperties', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      
      // Fetch bookings
      const bookingsRes = await axios.get('http://localhost:8001/api/owner/getallbookings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });

      const propertiesData = propertiesRes.data.success ? propertiesRes.data.data : [];
      const bookingsData = bookingsRes.data.success ? bookingsRes.data.data : [];
      
      // Fetch payment history
      try {
        const paymentsRes = await axios.get('http://localhost:8001/api/payment/history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        });
        if (paymentsRes.data.success) {
          setPayments(paymentsRes.data.data);
        }
      } catch (e) { /* ignore */ }

      setProperties(propertiesData);
      setBookings(bookingsData);
      
      // Calculate real dashboard metrics
      const totalProperties = propertiesData.length;
      const activeBookings = bookingsData.filter(booking => booking.bookingStatus === 'pending' || booking.bookingStatus === 'booked').length;
      
      // Revenue = sum of propertyAmt for booked properties
      const bookedBookings = bookingsData.filter(b => b.bookingStatus === 'booked');
      let totalRevenue = 0;
      for (const booking of bookedBookings) {
        const property = propertiesData.find(p => p._id === (booking.propertyId || booking.propertId));
        if (property) {
          totalRevenue += property.propertyAmt || 0;
        }
      }
      
      // Real property views from DB
      const propertyViews = propertiesData.reduce((sum, prop) => sum + (prop.views || 0), 0);
      
      const recentBookings = bookingsData.slice(-5).reverse();
      
      setDashboardData({
        totalProperties,
        activeBookings,
        totalRevenue,
        averageRating: 4.5,
        recentBookings,
        propertyViews,
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div className={`p-3 rounded-circle me-3 bg-${color} bg-opacity-10`}>
          <Icon size={24} className={`text-${color}`} />
        </div>
        <div className="flex-grow-1">
          <h3 className="h4 mb-0 fw-bold">{value}</h3>
          <p className="text-muted mb-0 small">{title}</p>
          {subtitle && (
            <p className="text-success small mb-0">
              <TrendingUp size={12} className="me-1" />
              {subtitle}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const RecentBookingCard = ({ booking }) => (
    <Card className="mb-2 border-0 shadow-sm">
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-1 fw-semibold">{booking.userName}</h6>
            <p className="mb-0 small text-muted">
              <Phone size={12} className="me-1" />
              {booking.phone}
            </p>
          </div>
          <div className="text-end">
            <Badge 
              bg={booking.bookingStatus === 'booked' ? 'success' : 
                  booking.bookingStatus === 'pending' ? 'warning' : 'danger'}
            >
              {booking.bookingStatus}
            </Badge>
            <p className="mb-0 small text-muted mt-1">
              <Calendar size={12} className="me-1" />
              Just now
            </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Welcome Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Welcome back, {user?.userData?.name}! 👋</h2>
          <p className="text-muted mb-0">Here's what's happening with your properties today.</p>
        </div>
        <div className="text-end">
          <p className="mb-0 small text-muted">Last updated</p>
          <p className="mb-0 fw-semibold">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <StatCard
            title="Total Properties"
            value={dashboardData.totalProperties}
            subtitle={`${dashboardData.totalProperties} listed`}
            icon={Home}
            color="primary"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Active Bookings"
            value={dashboardData.activeBookings}
            subtitle={`${dashboardData.activeBookings} pending/booked`}
            icon={Users}
            color="success"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
            subtitle={`From ${bookings.filter(b => b.bookingStatus === 'booked').length} bookings`}
            icon={DollarSign}
            color="info"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Property Views"
            value={dashboardData.propertyViews}
            subtitle={`${dashboardData.propertyViews} total views`}
            icon={Eye}
            color="warning"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Recent Activity */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">Property Performance</h5>
              <p className="text-muted small mb-0">Your top performing properties</p>
            </Card.Header>
            <Card.Body>
              {properties.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr className="text-muted small">
                        <th className="border-0">Property</th>
                        <th className="border-0">Type</th>
                        <th className="border-0">Status</th>
                        <th className="border-0">Price</th>
                        <th className="border-0">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 5).map((property, index) => (
                        <tr key={property._id}>
                          <td className="border-0">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3">
                                <Home size={16} className="text-muted" />
                              </div>
                              <div>
                                <p className="mb-0 fw-semibold">{property.propertyType}</p>
                                <p className="mb-0 small text-muted">
                                  <MapPin size={12} className="me-1" />
                                  {property.propertyAddress?.substring(0, 30)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="border-0">
                            <Badge bg="outline-secondary">
                              {property.propertyAdType}
                            </Badge>
                          </td>
                          <td className="border-0">
                            <Badge bg={property.isAvailable === 'Available' ? 'success' : 'danger'}>
                              {property.isAvailable}
                            </Badge>
                          </td>
                          <td className="border-0 fw-semibold">
                            ₹{property.propertyAmt?.toLocaleString()}
                          </td>
                          <td className="border-0">
                            <div className="d-flex align-items-center">
                              <Eye size={14} className="text-muted me-1" />
                              {property.views || 0}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Home size={48} className="text-muted mb-3" />
                  <h6>No properties yet</h6>
                  <p className="text-muted">Add your first property to see analytics</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Bookings */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">Recent Bookings</h5>
              <p className="text-muted small mb-0">Latest booking inquiries</p>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentBookings.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {dashboardData.recentBookings.map((booking) => (
                    <RecentBookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users size={48} className="text-muted mb-3" />
                  <h6>No bookings yet</h6>
                  <p className="text-muted">Bookings will appear here when users show interest</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment History */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold"><CreditCard size={20} className="me-2" />Payment History</h5>
              <p className="text-muted small mb-0">Rent payments received from tenants</p>
            </Card.Header>
            <Card.Body>
              {payments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr className="text-muted small">
                        <th className="border-0">Transaction ID</th>
                        <th className="border-0">Tenant</th>
                        <th className="border-0">Property</th>
                        <th className="border-0">Amount</th>
                        <th className="border-0">Date</th>
                        <th className="border-0">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="border-0 font-monospace small">
                            #{payment.razorpayPaymentId?.slice(-8) || payment._id.slice(-8)}
                          </td>
                          <td className="border-0 fw-semibold">{payment.payerName}</td>
                          <td className="border-0 small text-muted">
                            <MapPin size={12} className="me-1" />
                            {payment.propertyAddress?.substring(0, 30) || `#${payment.propertyId?.slice(-6)}`}
                          </td>
                          <td className="border-0 fw-bold text-success">₹{payment.amount?.toLocaleString()}</td>
                          <td className="border-0 small">
                            <Calendar size={12} className="me-1" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="border-0">
                            <Badge bg="success">Paid</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CreditCard size={48} className="text-muted mb-3" />
                  <h6>No payments received yet</h6>
                  <p className="text-muted">Payments will appear here when tenants pay their rent</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">Quick Actions</h5>
              <Row className="g-3">
                <Col md={3}>
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-primary py-3"
                      onClick={onNavigateToAddProperty}
                    >
                      <Home className="mb-2" size={24} />
                      <br />Add Property
                    </button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-success py-3"
                      onClick={onNavigateToBookings}
                    >
                      <Users className="mb-2" size={24} />
                      <br />View Bookings
                    </button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-info py-3"
                      onClick={onNavigateToAnalytics}
                    >
                      <TrendingUp className="mb-2" size={24} />
                      <br />Analytics
                    </button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-warning py-3"
                      onClick={onNavigateToReviews}
                    >
                      <Star className="mb-2" size={24} />
                      <br />Reviews
                    </button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;