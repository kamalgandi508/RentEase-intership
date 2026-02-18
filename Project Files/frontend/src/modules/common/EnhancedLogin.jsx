import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import { Nav } from 'react-bootstrap';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { message } from 'antd';
import { User, Home, Users, Shield } from 'lucide-react';

const EnhancedLogin = () => {
  const navigate = useNavigate()
  const [selectedUserType, setSelectedUserType] = useState('');
  const [data, setData] = useState({
    email: "",
    password: "",
    type: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
    setData({ ...data, type: userType });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data?.email || !data?.password || !data?.type) {
      return message.error("Please fill all fields and select user type");
    }

    axios.post('http://localhost:8001/api/user/login', data)
      .then((res) => {
        if (res.data.success) {
          message.success(res.data.message);

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          const isLoggedIn = JSON.parse(localStorage.getItem("user"));

          switch (isLoggedIn.type) {
            case "Admin":
              navigate("/adminhome");
              break;
            case "Renter":
              navigate("/renterhome");
              break;
            case "Owner":
              if (isLoggedIn.granted === 'ungranted') {
                message.error('Your account is not yet confirmed by the admin');
              } else {
                navigate("/ownerhome");
              }
              break;
            default:
              navigate("/login");
              break;
          }
          setTimeout(()=>{
            window.location.reload()
          },1000)
        } else {
          message.error(res.data.message);
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          message.error("Invalid credentials");
        }
        console.error(err);
      });
  };

  const userTypes = [
    {
      type: 'Renter',
      title: 'I\'m a Tenant',
      description: 'Looking for properties to rent',
      icon: User,
      color: 'primary',
      features: ['Browse Properties', 'Book Rentals', 'Manage Bookings']
    },
    {
      type: 'Owner',
      title: 'I\'m a Property Owner',
      description: 'I want to rent out my properties',
      icon: Home,
      color: 'success',
      features: ['List Properties', 'Manage Rentals', 'View Analytics']
    },
    {
      type: 'Admin',
      title: 'Administrator',
      description: 'System administrator access',
      icon: Shield,
      color: 'warning',
      features: ['Manage Users', 'Oversee Properties', 'System Control']
    }
  ];

  return (
    <>
      <Navbar expand="lg" className="navbar-transparent">
        <Container fluid>
          <Navbar.Brand>
            <h2 className="mb-0 text-primary">🏠 RentEase</h2>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll />
            <Nav className="d-flex gap-2 align-items-center">
              <Link to="/" className="nav-link-btn">Home</Link>
              <Link to="/register" className="nav-link-btn nav-link-register">Register</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            
            {/* Header */}
            <div className="text-center mb-5">
              <Avatar sx={{ m: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <LockOutlinedIcon fontSize="large" />
              </Avatar>
              <Typography component="h1" variant="h4" className="fw-bold mb-2">
                Welcome Back!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your RentEase account
              </Typography>
            </div>

            {/* User Type Selection */}
            {!selectedUserType && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <h5 className="text-center mb-4">Choose Your Account Type</h5>
                  <Row className="g-3">
                    {userTypes.map((userType) => {
                      const IconComponent = userType.icon;
                      return (
                        <Col md={4} key={userType.type}>
                          <Card 
                            className="h-100 border-2 cursor-pointer transition-all hover:shadow-lg"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleUserTypeSelect(userType.type)}
                          >
                            <Card.Body className="text-center p-4">
                              <div className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-${userType.color} bg-opacity-10`}
                                   style={{ width: '60px', height: '60px' }}>
                                <IconComponent size={28} className={`text-${userType.color}`} />
                              </div>
                              <h6 className="fw-bold mb-2">{userType.title}</h6>
                              <p className="text-muted small mb-3">{userType.description}</p>
                              <div className="d-flex flex-column gap-1">
                                {userType.features.map((feature, idx) => (
                                  <small key={idx} className="text-muted">✓ {feature}</small>
                                ))}
                              </div>
                              <Button 
                                variant={`outline-${userType.color}`}
                                size="sm"
                                className="mt-3"
                              >
                                Select
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Login Form */}
            {selectedUserType && (
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-5">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      {(() => {
                        const selectedType = userTypes.find(ut => ut.type === selectedUserType);
                        const IconComponent = selectedType.icon;
                        return (
                          <>
                            <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center bg-${selectedType.color} bg-opacity-10`}
                                 style={{ width: '40px', height: '40px' }}>
                              <IconComponent size={20} className={`text-${selectedType.color}`} />
                            </div>
                            <div>
                              <h5 className="mb-0">{selectedType.title}</h5>
                              <small className="text-muted">{selectedType.description}</small>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedUserType('');
                        setData({ ...data, type: '' });
                      }}
                    >
                      Change Type
                    </Button>
                  </div>

                  <Box component="form" noValidate onSubmit={handleSubmit}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={data.email}
                      onChange={handleChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={data.password}
                      onChange={handleChange}
                      sx={{ mb: 3 }}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="primary"
                      size="lg"
                      className="py-3 fw-bold"
                    >
                      Sign In as {selectedUserType}
                    </Button>

                    <Box className="text-center mt-4">
                      <Link to="/forgotpassword" className="text-decoration-none">
                        Forgot password?
                      </Link>
                    </Box>
                  </Box>
                </Card.Body>
              </Card>
            )}

            {/* Register Link */}
            <div className="text-center mt-4">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" className="fw-bold text-decoration-none">
                  Sign up here
                </Link>
              </Typography>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EnhancedLogin;