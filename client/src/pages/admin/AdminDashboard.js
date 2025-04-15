import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { getBooks, getMembers, getUpcomingEvents, getOverdueBooks } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    upcomingEvents: 0,
    overdueBooks: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          booksResponse, 
          membersResponse, 
          eventsResponse,
          overdueResponse
        ] = await Promise.all([
          getBooks(),
          getMembers(),
          getUpcomingEvents(),
          getOverdueBooks()
        ]);
        
        setStats({
          totalBooks: booksResponse.data.length,
          totalMembers: membersResponse.data.length,
          upcomingEvents: eventsResponse.data.length,
          overdueBooks: overdueResponse.data.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <Row>
        <Col md={6} xl={3} className="mb-4">
          <Card as={Link} to="/admin/books" className="h-100 text-decoration-none dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaBook size={40} className="text-primary" />
              </div>
              <h2 className="display-4 fw-bold">{stats.totalBooks}</h2>
              <Card.Title>Books</Card.Title>
              <Card.Text className="text-muted">
                Manage library inventory
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3} className="mb-4">
          <Card as={Link} to="/admin/members" className="h-100 text-decoration-none dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaUsers size={40} className="text-success" />
              </div>
              <h2 className="display-4 fw-bold">{stats.totalMembers}</h2>
              <Card.Title>Members</Card.Title>
              <Card.Text className="text-muted">
                Manage library members
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3} className="mb-4">
          <Card as={Link} to="/admin/events" className="h-100 text-decoration-none dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaCalendarAlt size={40} className="text-info" />
              </div>
              <h2 className="display-4 fw-bold">{stats.upcomingEvents}</h2>
              <Card.Title>Events</Card.Title>
              <Card.Text className="text-muted">
                Manage upcoming events
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3} className="mb-4">
          <Card as={Link} to="/admin/reports" className="h-100 text-decoration-none dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaExclamationTriangle size={40} className="text-danger" />
              </div>
              <h2 className="display-4 fw-bold">{stats.overdueBooks}</h2>
              <Card.Title>Overdue Books</Card.Title>
              <Card.Text className="text-muted">
                View overdue checkouts
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h5">Quick Links</Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/admin/books" className="text-decoration-none">Manage Books</Link>
                </li>
                <li className="mb-2">
                  <Link to="/admin/members" className="text-decoration-none">Manage Members</Link>
                </li>
                <li className="mb-2">
                  <Link to="/admin/events" className="text-decoration-none">Manage Events</Link>
                </li>
                <li className="mb-2">
                  <Link to="/admin/reports" className="text-decoration-none">View Reports</Link>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h5">System Information</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-5">Current Date</dt>
                <dd className="col-sm-7">{new Date().toLocaleDateString()}</dd>
                
                <dt className="col-sm-5">Library System</dt>
                <dd className="col-sm-7">Version 1.0.0</dd>
                
                <dt className="col-sm-5">Admin Access</dt>
                <dd className="col-sm-7">Full Access</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;