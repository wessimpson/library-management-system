import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBook, FaCalendarAlt, FaUserAlt, FaQuoteLeft, FaLeaf, FaCoffee, FaBookOpen } from 'react-icons/fa';
import BookCard from '../components/books/BookCard';
import EventCard from '../components/events/EventCard';
import { getBooks, getUpcomingEvents } from '../utils/api';

const Home = () => {
  const [recentBooks, setRecentBooks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inspirational quote about reading
  const quotes = [
    { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
    { text: "Reading is a conversation. All books talk. But a good book listens as well.", author: "Mark Haddon" },
    { text: "Books are a uniquely portable magic.", author: "Stephen King" },
    { text: "Reading is an exercise in empathy; an exercise in walking in someone else's shoes for a while.", author: "Malorie Blackman" }
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [booksResponse, eventsResponse] = await Promise.all([
          getBooks(),
          getUpcomingEvents()
        ]);
        
        // Get recent books (limit to 4)
        setRecentBooks(booksResponse.data.slice(0, 4));
        
        // Get upcoming events (limit to 3)
        setUpcomingEvents(eventsResponse.data.slice(0, 3));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setError('Failed to load content. Please try again later.');
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" style={{ color: "var(--primary-color)" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center my-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div className="banner text-center">
        <h1 className="mb-4">Welcome to Library Haven</h1>
        <p className="mb-4">Your digital sanctuary for literary exploration and community connections.</p>
        <div>
          <Button as={Link} to="/books" variant="light" className="me-3">
            <FaBookOpen className="me-2" /> Explore Books
          </Button>
          <Button as={Link} to="/register" variant="outline-light">
            <FaUserAlt className="me-2" /> Join Our Community
          </Button>
        </div>
      </div>

      {/* Quote Section */}
      <Container className="my-5">
        <div className="card border-0 bg-transparent">
          <div className="card-body text-center py-5">
            <FaQuoteLeft size={30} style={{ color: "var(--primary-color)", opacity: 0.6 }} className="mb-3" />
            <h3 className="font-italic mb-3" style={{ fontStyle: "italic", fontFamily: "'Libre Baskerville', serif" }}>
              "{randomQuote.text}"
            </h3>
            <p className="text-muted">— {randomQuote.author}</p>
          </div>
        </div>
      </Container>

      {/* Services Section */}
      <Container className="my-5 py-4">
        <h2 className="text-center mb-4">Reading Sanctuary Services</h2>
        <Row className="g-4">
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center dashboard-card border-0">
              <Card.Body className="p-4">
                <div className="mb-4 rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                     style={{ width: "80px", height: "80px", backgroundColor: "var(--primary-light)", opacity: 0.8 }}>
                  <FaBook size={40} style={{ color: "var(--primary-dark)" }} />
                </div>
                <Card.Title className="mb-3">Curated Collection</Card.Title>
                <Card.Text>
                  Immerse yourself in our thoughtfully curated collection of literary treasures spanning diverse genres and perspectives.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center dashboard-card border-0">
              <Card.Body className="p-4">
                <div className="mb-4 rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                     style={{ width: "80px", height: "80px", backgroundColor: "var(--secondary-light)", opacity: 0.8 }}>
                  <FaCoffee size={40} style={{ color: "var(--secondary-color)" }} />
                </div>
                <Card.Title className="mb-3">Literary Gatherings</Card.Title>
                <Card.Text>
                  Connect with fellow readers through engaging book clubs, author discussions, and writing workshops.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center dashboard-card border-0">
              <Card.Body className="p-4">
                <div className="mb-4 rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                     style={{ width: "80px", height: "80px", backgroundColor: "var(--accent-light)", opacity: 0.8 }}>
                  <FaLeaf size={40} style={{ color: "var(--accent-color)" }} />
                </div>
                <Card.Title className="mb-3">Reading Sanctuary</Card.Title>
                <Card.Text>
                  Enjoy extended borrowing periods, personalized recommendations, and priority access to new releases.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Recent Books Section */}
      <div style={{ backgroundColor: "#F5EFE5", padding: "60px 0", marginTop: "60px" }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Fresh From The Shelves</h2>
            <Button as={Link} to="/books" variant="outline-primary">
              View Full Collection
            </Button>
          </div>
          <Row className="g-4">
            {recentBooks.length > 0 ? (
              recentBooks.map(book => (
                <Col md={6} lg={3} className="mb-4" key={book.BookID}>
                  <BookCard book={book} />
                </Col>
              ))
            ) : (
              <Col>
                <Card className="text-center p-4 border-0">
                  <p className="mb-0">Our librarians are currently selecting new titles. Check back soon!</p>
                </Card>
              </Col>
            )}
          </Row>
        </Container>
      </div>

      {/* Upcoming Events Section */}
      <Container className="my-5 pt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Upcoming Literary Gatherings</h2>
          <Button as={Link} to="/events" variant="outline-primary">
            Browse All Events
          </Button>
        </div>
        <Row className="g-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <Col md={6} lg={4} key={event.EventID}>
                <EventCard event={event} />
              </Col>
            ))
          ) : (
            <Col>
              <Card className="text-center p-4 border-0">
                <p className="mb-0">We're planning exciting new events. Stay tuned for updates!</p>
              </Card>
            </Col>
          )}
        </Row>
      </Container>

      {/* Join CTA */}
      <div className="banner text-center" style={{ padding: "4rem", marginTop: "60px" }}>
        <h2 className="mb-3">Begin Your Reading Journey Today</h2>
        <p className="mb-4">Join our community of book lovers and discover your next favorite read.</p>
        <Button as={Link} to="/register" variant="light" size="lg">
          Become a Member
        </Button>
      </div>
    </div>
  );
};

export default Home;