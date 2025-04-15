import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import moment from 'moment';

const EventCard = ({ event }) => {
  const eventDate = moment(event.EventDate);
  const isPastEvent = eventDate.isBefore(moment());

  return (
    <Card className="event-card mb-4">
      <Card.Body>
        <Card.Title as={Link} to={`/events/${event.EventID}`} className="text-decoration-none text-dark">
          {event.EventName}
        </Card.Title>
        
        <Card.Text className="text-muted mb-3">
          {event.EventDescription && event.EventDescription.length > 100
            ? `${event.EventDescription.substring(0, 100)}...`
            : event.EventDescription}
        </Card.Text>
        
        <div className="mb-2">
          <FaCalendarAlt className="me-2" />
          {eventDate.format('MMMM Do YYYY, h:mm a')}
          {isPastEvent && <Badge bg="secondary" className="ms-2">Past Event</Badge>}
        </div>
        
        <div className="mb-2">
          <FaMapMarkerAlt className="me-2" />
          {event.Location}
        </div>
        
        {event.attendeeCount !== undefined && (
          <div className="mb-3">
            <FaUsers className="me-2" />
            {event.attendeeCount} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
          </div>
        )}
        
        <Button 
          as={Link} 
          to={`/events/${event.EventID}`} 
          variant="outline-primary"
          className="mt-2"
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default EventCard;