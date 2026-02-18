import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="text-center text-lg-start mt-5" style={{ background: '#fff', color: '#000' }}>
      <Container className="p-4">
        <Row className="mt-4">
          {/* RentEase Section */}
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">RentEase</h5>
            <p>
              Your trusted partner in finding the perfect rental home.
            </p>
          </Col>

          {/* Quick Links Section */}
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-dark text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/properties" className="text-dark text-decoration-none">Properties</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-dark text-decoration-none">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-dark text-decoration-none">Contact</Link>
              </li>
            </ul>
          </Col>

          {/* Contact Info Section */}
          <Col lg={4} md={12} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i>
                <a href="tel:+919100851747" className="text-dark text-decoration-none">
                  +91 9100851747
                </a>
              </li>
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                <a href="mailto:Kamal@RentEase.com" className="text-dark text-decoration-none">
                  Kamal@RentEase.com
                </a>
              </li>
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                <span>Tanuku, Andhra Pradesh, India</span>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      {/* Copyright Section */}
      <div className="text-center p-3" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <span className="text-dark">
          © {currentYear} Copyright: RentEase. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
