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
import Dashboard from './Dashboard';
import AddProperty from './AddProperty';
import AllProperties from './AllProperties';
import AllBookings from './AllBookings';
import BookedHouses from './BookedHouses';
import Analytics from './Analytics';
import OwnerReviews from './OwnerReviews';
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
          {children}
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
const OwnerHome = () => {
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
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Add Property" {...a11yProps(1)} />
            <Tab label="All Properties" {...a11yProps(2)} />
            <Tab label="All Bookings" {...a11yProps(3)} />
            <Tab label="Booked Houses" {...a11yProps(4)} />
            <Tab label="Reviews" {...a11yProps(5)} />
            <Tab label="Analytics" {...a11yProps(6)} />
            <Tab label="Chat" {...a11yProps(7)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Dashboard 
            onNavigateToAddProperty={() => setValue(1)}
            onNavigateToBookings={() => setValue(3)}
            onNavigateToAnalytics={() => setValue(6)}
            onNavigateToReviews={() => setValue(5)}
          />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <AddProperty />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <AllProperties />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <AllBookings />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={4}>
          <BookedHouses />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={5}>
          <OwnerReviews />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={6}>
          <Analytics />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={7}>
          <ChatWindow />
        </CustomTabPanel>
      </Box>
    </div>
  )
}

export default OwnerHome

