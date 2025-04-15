import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBook, FaCalendarAlt, FaUser, FaInfoCircle, FaClock } from 'react-icons/fa';
import AuthContext from '../utils/AuthContext';
import { getMemberProfile, getMemberBorrowings, getMemberReservations, getMemberEvents, returnBook } from '../utils/api';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [activeReservations, setActiveReservations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          profileRes,
          borrowingsRes,
          reservationsRes,
          eventsRes
        ] = await Promise.all([
          getMemberProfile(),
          getMemberBorrowings('Active'),
          getMemberReservations('Active'),
          getMemberEvents()
        ]);
        
        setProfile(profileRes.data);
        setActiveBorrowings(borrowingsRes.data);
        setActiveReservations(reservationsRes.data);
        
        // Filter to only include upcoming events
        const today = new Date();
        const upcoming = eventsRes.data.filter(event => 
          new Date(event.EventDate) > today
        );
        setUpcomingEvents(upcoming);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleReturnBook = async (borrowId) => {
    try {
      await returnBook(borrowId);
      
      // Update borrowings list
      setActiveBorrowings(activeBorrowings.filter(item => item.BorrowID !== borrowId));
      
      setActionStatus({
        message: 'Book returned successfully!',
        type: 'success'
      });
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 5000);
    } catch (error) {
      console.error('Error returning book:', error);
      setActionStatus({
        message: error.response?.data?.message || 'Failed to return book. Please try again.',
        type: 'danger'
      });
    }
  };

  // Function to check if a book is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="my-4">
      <h1 className="mb-4">
        Welcome, {currentUser?.firstName} {currentUser?.lastName}!
      </h1>
      
      {actionStatus.message && (
        <Alert variant={actionStatus.type} className="mb-4">
          {actionStatus.message}
        </Alert>
      )}
      
      {/* Member Summary */}
      <Row className="mb-4">
        <Col md={6} xl={3} className="mb-4 mb-xl-0">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="text-primary mb-3">
                <FaBook size={30} />
              </div>
              <h4>{activeBorrowings.length}</h4>
              <Card.Title>Books Borrowed</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className="mb-4 mb-xl-0">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="text-warning mb-3">
                <FaClock size={30} />
              </div>
              <h4>{activeReservations.length}</h4>
              <Card.Title>Active Reservations</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className="mb-4 mb-md-0">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="text-success mb-3">
                <FaCalendarAlt size={30} />
              </div>
              <h4>{upcomingEvents.length}</h4>
              <Card.Title>Upcoming Events</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center p-4">
              <div className="text-info mb-3">
                <FaUser size={30} />
              </div>
              <h4>{profile?.MembershipType}</h4>
              <Card.Title>Membership</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Current Borrowings */}
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Current Borrowings</h4>
        </Card.Header>
        <Card.Body>
          {activeBorrowings.length === 0 ? (
            <div className="text-center text-muted py-3">
              <FaInfoCircle className="me-2" />
              You don't have any active borrowings. <Link to="/books">Browse books</Link> to find something to read!
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Borrowed On</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBorrowings.map(item => (
                    <tr key={item.BorrowID}>
                      <td>
                        <Link to={`/books/${item.BookID}`} className="text-decoration-none">
                          {item.Title}
                        </Link>
                      </td>
                      <td>
                        {new Date(item.BorrowDate).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(item.DueDate).toLocaleDateString()}
                      </td>
                      <td>
                        {isOverdue(item.DueDate) ? (
                          <Badge bg="danger">Overdue</Badge>
                        ) : (
                          <Badge bg="success">Active</Badge>
                        )}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleReturnBook(item.BorrowID)}
                        >
                          Return
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          
          <div className="text-end mt-3">
            <Button as={Link} to="/borrowing-history" variant="outline-secondary">
              View Borrowing History
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Active Reservations */}
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Active Reservations</h4>
        </Card.Header>
        <Card.Body>
          {activeReservations.length === 0 ? (
            <div className="text-center text-muted py-3">
              <FaInfoCircle className="me-2" />
              You don't have any active reservations.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Author</th>
                    <th>Reserved On</th>
                    <th>Expires On</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReservations.map(item => (
                    <tr key={item.ReservationID}>
                      <td>
                        <Link to={`/books/${item.BookID}`} className="text-decoration-none">
                          {item.Title}
                        </Link>
                      </td>
                      <td>
                        {item.AuthorFirstName} {item.AuthorLastName}
                      </td>
                      <td>
                        {new Date(item.ReservationDate).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(item.ExpiryDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Upcoming Events */}
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Your Upcoming Events</h4>
        </Card.Header>
        <Card.Body>
          {upcomingEvents.length === 0 ? (
            <div className="text-center text-muted py-3">
              <FaInfoCircle className="me-2" />
              You're not registered for any upcoming events. <Link to="/events">Browse events</Link> to find something interesting!
            </div>
          ) : (
            <Row>
              {upcomingEvents.map(event => (
                <Col md={6} lg={4} key={event.EventID} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title as={Link} to={`/events/${event.EventID}`} className="text-decoration-none text-dark">
                        {event.EventName}
                      </Card.Title>
                      <Card.Text className="mb-1">
                        <FaCalendarAlt className="me-2" />
                        {new Date(event.EventDate).toLocaleString()}
                      </Card.Text>
                      <Card.Text className="mb-2">
                        <FaInfoCircle className="me-2" />
                        {event.Location}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={`/events/${event.EventID}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          <div className="text-end mt-3">
            <Button as={Link} to="/events" variant="outline-secondary">
              View All Events
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;