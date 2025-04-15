import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="display-1 mb-3">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div>
            <Button as={Link} to="/" variant="primary" className="me-3">
              <FaHome className="me-2" /> Go Home
            </Button>
            <Button as={Link} to="/books" variant="outline-primary">
              <FaSearch className="me-2" /> Browse Books
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;