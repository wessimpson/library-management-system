import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaUsers, FaArrowLeft } from 'react-icons/fa';
import AuthContext from '../utils/AuthContext';
import { getEvent, registerForEvent, cancelEventRegistration } from '../utils/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(id);
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await registerForEvent(id);
      setActionStatus({
        message: 'You have successfully registered for this event!',
        type: 'success'
      });
      
      // Update isRegistered status
      setEvent({
        ...event,
        isRegistered: true
      });
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 5000);
    } catch (error) {
      console.error('Error registering for event:', error);
      setActionStatus({
        message: error.response?.data?.message || 'Failed to register for event. Please try again.',
        type: 'danger'
      });
    }
  };
  
  const handleCancelRegistration = async () => {
    try {
      await cancelEventRegistration(id);
      setActionStatus({
        message: 'Your registration has been canceled.',
        type: 'success'
      });
      
      // Update isRegistered status
      setEvent({
        ...event,
        isRegistered: false
      });
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 5000);
    } catch (error) {
      console.error('Error canceling event registration:', error);
      setActionStatus({
        message: error.response?.data?.message || 'Failed to cancel registration. Please try again.',
        type: 'danger'
      });
    }
  };
  
  // Check if event is in the past
  const isEventPast = event?.EventDate ? new Date(event.EventDate) < new Date() : false;
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error || !event) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Event not found.'}
          <div className="mt-3">
            <Button as={Link} to="/events" variant="primary">
              <FaArrowLeft className="me-2" /> Back to Events
            </Button>
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <Button as={Link} to="/events" variant="outline-primary" className="mb-4">
        <FaArrowLeft className="me-2" /> Back to Events
      </Button>
      
      {actionStatus.message && (
        <Alert variant={actionStatus.type} className="mb-4">
          {actionStatus.message}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col lg={8}>
              <h1 className="mb-3">{event.EventName}</h1>
              
              {isEventPast && (
                <Badge bg="secondary" className="mb-3">Past Event</Badge>
              )}
              
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="me-2 text-primary" />
                  <span>{new Date(event.EventDate).toLocaleString()}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaMapMarkerAlt className="me-2 text-primary" />
                  <span>{event.Location}</span>
                </div>
                {event.OrganizerFirstName && (
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2 text-primary" />
                    <span>Organized by: {event.OrganizerFirstName} {event.OrganizerLastName}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h4>About This Event</h4>
                <p>{event.EventDescription || 'No description available for this event.'}</p>
              </div>
            </Col>
            
            <Col lg={4}>
              <Card>
                <Card.Body>
                  <h5>Registration</h5>
                  
                  <div className="d-flex align-items-center mb-3">
                    <FaUsers className="me-2 text-primary" />
                    <span>{event.attendeeCount || 0} people registered</span>
                  </div>
                  
                  {isEventPast ? (
                    <div className="alert alert-secondary">
                      This event has already taken place.
                    </div>
                  ) : (
                    <>
                      {isAuthenticated ? (
                        <>
                          {event.isRegistered ? (
                            <>
                              <div className="alert alert-success mb-3">
                                You are registered for this event!
                              </div>
                              <Button 
                                variant="outline-danger" 
                                onClick={handleCancelRegistration}
                                className="w-100"
                              >
                                Cancel Registration
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="primary" 
                              onClick={handleRegister}
                              className="w-100"
                            >
                              Register for Event
                            </Button>
                          )}
                        </>
                      ) : (
                        <div>
                          <Button 
                            as={Link} 
                            to="/login" 
                            variant="primary"
                            className="w-100"
                          >
                            Login to Register
                          </Button>
                          <div className="text-center mt-2">
                            <small className="text-muted">
                              Don't have an account? <Link to="/register">Sign up</Link>
                            </small>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EventDetails;