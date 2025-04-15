import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import { getUpcomingEvents, createEvent, updateEvent, deleteEvent } from '../../utils/api';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    location: '',
    organizerId: 11  // Default to first staff member
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');
  
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
  
  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDescription: '',
      eventDate: '',
      location: '',
      organizerId: 11
    });
    setFormErrors({});
    setEditingEvent(null);
  };
  
  const handleOpenModal = (event = null) => {
    resetForm();
    
    if (event) {
      setEditingEvent(event);
      
      // Format date for datetime-local input
      const eventDate = new Date(event.EventDate);
      const formattedDate = eventDate.toISOString().slice(0, 16);
      
      setFormData({
        eventName: event.EventName,
        eventDescription: event.EventDescription || '',
        eventDate: formattedDate,
        location: event.Location,
        organizerId: event.OrganizerID || 11
      });
    }
    
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.eventName.trim()) errors.eventName = 'Event name is required';
    if (!formData.eventDate) errors.eventDate = 'Event date is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Convert to expected format
      const eventData = {
        ...formData,
        organizerId: parseInt(formData.organizerId)
      };
      
      if (editingEvent) {
        // Update existing event
        await updateEvent(editingEvent.EventID, eventData);
        setActionSuccess('Event updated successfully!');
      } else {
        // Add new event
        await createEvent(eventData);
        setActionSuccess('Event created successfully!');
      }
      
      // Refresh event list
      const eventsResponse = await getUpcomingEvents();
      setEvents(eventsResponse.data);
      
      handleCloseModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.response?.data?.message || 'Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteEvent(eventId);
      
      // Remove event from state
      setEvents(events.filter(event => event.EventID !== eventId));
      
      setActionSuccess('Event deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.message || 'Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to check if an event is in the past
  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };
  
  if (loading && events.length === 0) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Events</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> Create New Event
        </Button>
      </div>
      
      {actionSuccess && (
        <Alert variant="success" className="mb-4">
          {actionSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {events.length === 0 ? (
        <Alert variant="info">
          No events found. Create your first event!
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.EventID}>
                  <td>{event.EventName}</td>
                  <td>
                    <FaCalendarAlt className="me-2 text-muted" />
                    {new Date(event.EventDate).toLocaleString()}
                  </td>
                  <td>{event.Location}</td>
                  <td>
                    <FaUserFriends className="me-2 text-muted" />
                    {event.attendeeCount || 0}
                  </td>
                  <td>
                    {isEventPast(event.EventDate) ? (
                      <span className="badge bg-secondary">Past</span>
                    ) : (
                      <span className="badge bg-success">Upcoming</span>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(event)}
                      disabled={isEventPast(event.EventDate)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.EventID)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      {/* Add/Edit Event Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingEvent ? 'Edit Event' : 'Create New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                isInvalid={!!formErrors.eventName}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.eventName}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Event Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    isInvalid={!!formErrors.eventDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.eventDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    isInvalid={!!formErrors.location}
                    placeholder="e.g., Main Branch - Meeting Room"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.location}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Organizer ID</Form.Label>
              <Form.Control
                type="number"
                name="organizerId"
                value={formData.organizerId}
                onChange={handleChange}
                min="1"
              />
              <Form.Text className="text-muted">
                Enter the ID of the staff member organizing this event
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageEvents;