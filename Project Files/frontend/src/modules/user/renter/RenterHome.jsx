import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import { Container, Nav } from 'react-bootstrap';
import { UserContext } from '../../../App';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AllPropertiesCards from '../AllPropertiesCards';
import EnhancedPropertyCards from '../EnhancedPropertyCards';
import AllProperty from './AllProperties';
import RenterDashboard from './RenterDashboard';
import NotificationCenter from '../../common/NotificationCenter';
import ChatWindow from '../../common/ChatWindow';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
const RenterHome = () => {
  const user = useContext(UserContext)
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (!user) {
    return null
  }

  const handleLogOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handleBookingSuccess = () => {
    setValue(2); // Switch to My Bookings tab (index 2)
  }

  return (
    <div>
      <Navbar expand="lg" className="navbar-transparent">
        <Container fluid>
          <Navbar.Brand style={{ cursor: 'pointer' }} onClick={() => setValue(0)}><h2>RentEase</h2></Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
            </Nav>
            <Nav className="d-flex gap-2 align-items-center">
              <NotificationCenter />
              <h5 className='mx-3 mb-0'>Hi {user.userData.name}</h5>
              <Link onClick={handleLogOut} to={'/'} className="nav-link-btn nav-link-logout">Log Out</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="renter tabs">
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Browse Properties" {...a11yProps(1)} />
            <Tab label="My Bookings" {...a11yProps(2)} />
            <Tab label="Chat" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <RenterDashboard />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Container>
            <EnhancedPropertyCards loggedIn={user.userLoggedIn} onBookingSuccess={handleBookingSuccess} />
          </Container>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <AllProperty onStartChat={() => setValue(3)} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <ChatWindow />
        </CustomTabPanel>
      </Box>
    </div>
  )
}

export default RenterHome

