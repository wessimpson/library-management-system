import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import EventCard from '../components/events/EventCard';
import { getUpcomingEvents } from '../utils/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getUpcomingEvents();
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Filter events based on search term and past events toggle
  const filteredEvents = events.filter(event => {
    // Check if event is past and if we should show it
    const eventDate = new Date(event.EventDate);
    const isPastEvent = eventDate < new Date();
    
    if (isPastEvent && !showPastEvents) {
      return false;
    }
    
    // Check search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.EventName.toLowerCase().includes(searchLower) ||
        event.EventDescription?.toLowerCase().includes(searchLower) ||
        event.Location.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
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
      <div className="text-center mb-5">
        <h1 className="mb-3">Library Events</h1>
        <p className="lead">
          Join us for exciting events, workshops, and community gatherings.
        </p>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Events</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6} className="mt-3 mt-md-0">
              <Form.Check
                type="switch"
                id="show-past-events"
                label="Show past events"
                checked={showPastEvents}
                onChange={(e) => setShowPastEvents(e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center my-5">
          <FaCalendarAlt size={50} className="text-muted mb-3" />
          <h3>No events found</h3>
          <p className="text-muted">
            {searchTerm 
              ? "No events match your search criteria." 
              : (showPastEvents 
                ? "There are no events to display." 
                : "There are no upcoming events. Try enabling 'Show past events' to see previous events.")}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3>
              {showPastEvents 
                ? "All Events" 
                : "Upcoming Events"}
              <span className="ms-2 text-muted fs-6">({filteredEvents.length})</span>
            </h3>
          </div>
          
          <Row>
            {filteredEvents.map(event => (
              <Col md={6} lg={4} key={event.EventID} className="mb-4">
                <EventCard event={event} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default Events;