import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaStar, FaBookOpen } from 'react-icons/fa';

const BookCard = ({ book }) => {
  // Default book cover image
  const defaultCover = 'https://via.placeholder.com/150x200?text=No+Cover';

  return (
    <Card className="book-card h-100">
      <div className="book-img-container">
        <Card.Img variant="top" src={book.coverImage || defaultCover} alt={book.Title} className="book-img" />
        {book.AvailableCopies > 0 && (
          <div className="book-ribbon">
            <span>Available</span>
          </div>
        )}
      </div>
      <Card.Body className="book-details">
        <Card.Title as={Link} to={`/books/${book.BookID}`} className="book-title">
          {book.Title}
        </Card.Title>
        <Card.Text className="book-author">
          by {book.AuthorFirstName} {book.AuthorLastName}
        </Card.Text>
        <Card.Text className="book-genre">
          <Badge bg="secondary" className="genre-badge">{book.Genre}</Badge>
        </Card.Text>
        {book.averageRating ? (
          <div className="book-rating">
            <FaStar className="rating-star" /> 
            <span className="rating-score">{book.averageRating.toFixed(1)}</span>
            <span className="rating-count">({book.numberOfReviews})</span>
          </div>
        ) : (
          <div className="book-no-rating">No ratings yet</div>
        )}
        <Card.Text className="book-availability">
          {book.AvailableCopies > 0 ? (
            <span className="availability-status available">
              <FaBookOpen className="me-1" /> Available now
            </span>
          ) : (
            <span className="availability-status unavailable">Currently unavailable</span>
          )}
          <div className="availability-count">
            {book.AvailableCopies} of {book.TotalCopies} copies in library
          </div>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default BookCard;