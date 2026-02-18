import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { UserContext } from '../../../App';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Home, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const Analytics = () => {
  const user = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalProperties: 0,
    monthlyBookings: [],
    topProperties: [],
    revenueByMonth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings for analytics
      const bookingsRes = await axios.get('http://localhost:8001/api/owner/getallbookings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      
      // Fetch properties
      const propertiesRes = await axios.get('http://localhost:8001/api/owner/getallproperties', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });

      const bookingsData = bookingsRes.data.success ? bookingsRes.data.data : [];
      const propertiesData = propertiesRes.data.success ? propertiesRes.data.data : [];

      // Calculate analytics
      const totalBookings = bookingsData.length;
      const totalProperties = propertiesData.length;
      
      // Calculate total revenue from properties
      const totalRevenue = propertiesData.reduce((sum, property) => {
        return sum + (property.propertyAmt || 0);
      }, 0);

      // Monthly bookings analysis
      const monthlyBookings = calculateMonthlyBookings(bookingsData);
      
      // Top performing properties (by booking count)
      const topProperties = calculateTopProperties(bookingsData, propertiesData);

      setAnalyticsData({
        totalRevenue,
        totalBookings,
        totalProperties,
        monthlyBookings,
        topProperties,
        revenueByMonth: calculateRevenueByMonth(propertiesData)
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyBookings = (bookings) => {
    const monthlyData = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt || Date.now());
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-6); // Last 6 months
  };

  const calculateTopProperties = (bookings, properties) => {
    const propertyBookings = {};
    
    bookings.forEach(booking => {
      const propId = booking.propertyId;
      propertyBookings[propId] = (propertyBookings[propId] || 0) + 1;
    });

    return properties
      .map(property => ({
        ...property,
        bookingCount: propertyBookings[property._id] || 0
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);
  };

  const calculateRevenueByMonth = (properties) => {
    // Simulate monthly revenue based on property amounts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 20000
    }));
  };

  const StatCard = ({ title, value, icon: Icon, color, growth }) => (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`rounded-circle p-3 me-3 bg-${color} bg-opacity-10`}>
            <Icon size={24} className={`text-${color}`} />
          </div>
          <div className="flex-grow-1">
            <h6 className="text-muted mb-0 small">{title}</h6>
            <h4 className="mb-0 fw-bold">{value}</h4>
            {growth && (
              <small className={`text-${growth > 0 ? 'success' : 'danger'}`}>
                <TrendingUp size={12} className="me-1" />
                {growth > 0 ? '+' : ''}{growth}% from last month
              </small>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <Activity className="text-primary mb-3" size={48} />
          <h5>Loading Analytics...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">📊 Sales & Booking Analytics</h2>
          <p className="text-muted">Get insights into your property performance and revenue</p>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="success"
            growth={12}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Total Bookings"
            value={analyticsData.totalBookings}
            icon={Calendar}
            color="primary"
            growth={8}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Active Properties"
            value={analyticsData.totalProperties}
            icon={Home}
            color="info"
            growth={5}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Avg. Booking Value"
            value={`₹${analyticsData.totalProperties > 0 ? 
              Math.floor(analyticsData.totalRevenue / analyticsData.totalProperties).toLocaleString() : 0}`}
            icon={TrendingUp}
            color="warning"
            growth={15}
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Monthly Bookings Chart */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <BarChart3 className="text-primary me-2" size={20} />
                <h5 className="mb-0 fw-semibold">Monthly Booking Trends</h5>
              </div>
              <div className="border rounded p-3" style={{ minHeight: '300px' }}>
                {analyticsData.monthlyBookings.length > 0 ? (
                  <div>
                    {analyticsData.monthlyBookings.map(([month, count], index) => (
                      <div key={month} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">{month}</span>
                          <span className="text-primary fw-bold">{count} bookings</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${(count / Math.max(...analyticsData.monthlyBookings.map(m => m[1]))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <BarChart3 size={48} className="mb-3" />
                    <p>No booking data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Revenue Summary */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <PieChart className="text-success me-2" size={20} />
                <h5 className="mb-0 fw-semibold">Revenue Breakdown</h5>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Property Sales</span>
                  <span className="fw-bold">₹{(analyticsData.totalRevenue * 0.7).toLocaleString()}</span>
                </div>
                <div className="progress mb-3" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Rental Income</span>
                  <span className="fw-bold">₹{(analyticsData.totalRevenue * 0.3).toLocaleString()}</span>
                </div>
                <div className="progress mb-3" style={{ height: '6px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '30%' }}></div>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">Total Revenue</span>
                <span className="fw-bold text-success">₹{analyticsData.totalRevenue.toLocaleString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Performing Properties */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <TrendingUp className="text-warning me-2" size={20} />
                <h5 className="mb-0 fw-semibold">Top Performing Properties</h5>
              </div>
              {analyticsData.topProperties.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topProperties.map((property, index) => (
                      <tr key={property._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center
                              ${index === 0 ? 'bg-warning text-dark' : index === 1 ? 'bg-secondary text-white' : 'bg-success text-white'}`}
                              style={{ width: '24px', height: '24px', fontSize: '12px', fontWeight: 'bold' }}>
                              {index + 1}
                            </div>
                            <span className="fw-medium">{property.propertyType}</span>
                          </div>
                        </td>
                        <td>{property.propertyAdType}</td>
                        <td>{property.propertyAddress?.substring(0, 30)}...</td>
                        <td>
                          <span className="badge bg-primary">{property.bookingCount}</span>
                        </td>
                        <td className="fw-bold text-success">₹{property.propertyAmt?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted">
                  <Home size={48} className="mb-3" />
                  <p>No properties available for analysis</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;