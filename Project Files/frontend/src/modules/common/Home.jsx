import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar';
import { Container, Nav, Button } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import p1 from '../../images/p1.jpg'
import p2 from '../../images/p2.jpg'
import p3 from '../../images/p3.jpg'
import p4 from '../../images/p4.jpg'
import EnhancedPropertyCards from '../user/EnhancedPropertyCards';
import Footer from './Footer';

const Home = () => {
   const [index, setIndex] = useState(0);

   const handleSelect = (selectedIndex) => {
      setIndex(selectedIndex);
   };
   return (
      <>
         <Navbar expand="lg" className="navbar-transparent">
            <Container fluid>
               <Navbar.Brand as={Link} to="/" style={{ textDecoration: 'none' }}><h2>RentEase</h2></Navbar.Brand>
               <Navbar.Toggle aria-controls="navbarScroll" />
               <Navbar.Collapse id="navbarScroll">
                  <Nav
                     className="me-auto my-2 my-lg-0"
                     style={{ maxHeight: '100px' }}
                     navbarScroll
                  >
                  </Nav>
                  <Nav className="d-flex gap-2 align-items-center">
                     <Link to={'/'} className="nav-link-btn">Home</Link>
                     <Link to={'/login'} className="nav-link-btn nav-link-login">Login</Link>
                     <Link to={'/register'} className="nav-link-btn nav-link-register">Register</Link>
                  </Nav>

               </Navbar.Collapse>
            </Container>
         </Navbar>


         <div className='home-body'>
            <Carousel activeIndex={index} onSelect={handleSelect}>
               <Carousel.Item>
                  <img
                     src={p1}
                     alt="First slide"
                  />
               </Carousel.Item>
               <Carousel.Item>
                  <img
                     src={p2}
                     alt="Second slide"
                  />
               </Carousel.Item>
               <Carousel.Item>
                  <img
                     src={p3}
                     alt="Third slide"
                  />
               </Carousel.Item>
               <Carousel.Item>
                  <img
                     src={p4}
                     alt="Fourth slide"
                  />
               </Carousel.Item>
            </Carousel>
         </div>


         <div className='property-content'>
            <div className='text-center'>
               <h1 className='m-1 p-5'>All Properties that may you look for</h1>
               <p style={{fontSize: 15, fontWeight: 800}}>Want to post your Property? <Link to={'/register'}><Button variant='outline-info'>Register as Owner</Button></Link></p>
            </div>

            <Container>
               <EnhancedPropertyCards />
            </Container>
         </div>

         <Footer />
      </>
   )
}

export default Home
