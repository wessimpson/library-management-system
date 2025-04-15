import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Library Management System</h5>
            <p className="text-light">
              Your ultimate destination for knowledge and entertainment.
              Discover books, participate in events, and be part of our growing community.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light">Home</Link></li>
              <li><Link to="/books" className="text-light">Books</Link></li>
              <li><Link to="/events" className="text-light">Events</Link></li>
              <li><Link to="/login" className="text-light">Member Login</Link></li>
              <li><Link to="/register" className="text-light">Register</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li><FaMapMarkerAlt className="me-2" /> 123 Library Avenue, Booktown</li>
              <li><FaPhone className="me-2" /> (555) 123-4567</li>
              <li><FaEnvelope className="me-2" /> info@library.com</li>
            </ul>
            <div className="mt-3">
              <a href="https://facebook.com" className="text-light me-3">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" className="text-light me-3">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" className="text-light">
                <FaInstagram size={24} />
              </a>
            </div>
          </Col>
        </Row>
        <hr className="bg-light" />
        <Row>
          <Col className="text-center py-3">
            <p className="mb-0">&copy; {currentYear} Library Management System. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;