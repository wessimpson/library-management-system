import React, { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { addReview, updateReview } from '../../utils/api';

const ReviewForm = ({ bookId, existingReview = null, onReviewSubmitted }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.Rating : 0);
  const [reviewText, setReviewText] = useState(existingReview ? existingReview.ReviewText : '');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.trim() === '') {
      setError('Please enter a review');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (existingReview) {
        await updateReview(existingReview.ReviewID, { rating, reviewText });
      } else {
        await addReview({ bookId, rating, reviewText });
      }
      
      // Clear form for new review or notify parent component
      if (!existingReview) {
        setRating(0);
        setReviewText('');
      }
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="review-form-card mb-4">
      <Card.Body>
        <Card.Title className="review-form-title">{existingReview ? 'Edit Your Review' : 'Share Your Reading Experience'}</Card.Title>
        
        {error && <div className="alert alert-danger review-error">{error}</div>}
        
        <Form onSubmit={handleSubmit} className="review-form">
          <Form.Group className="mb-4">
            <Form.Label className="rating-label">Your Rating</Form.Label>
            <div className="rating-stars-container d-flex">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                  <div
                    key={i}
                    className="rating-star-wrapper me-2"
                    onClick={() => setRating(ratingValue)}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <FaStar 
                      size={28} 
                      className="rating-star"
                      color={ratingValue <= (hover || rating) ? '#F9A602' : '#e4e5e9'} 
                    />
                  </div>
                );
              })}
              
              <div className="rating-text ms-2">
                {rating > 0 && (
                  <span>
                    {rating === 1 && "Not recommended"}
                    {rating === 2 && "It was okay"}
                    {rating === 3 && "Good read"}
                    {rating === 4 && "Great book"}
                    {rating === 5 && "Absolutely loved it!"}
                  </span>
                )}
              </div>
            </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="review-label">Your Thoughts</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              className="review-textarea"
              placeholder="What did you think about this book? What did you enjoy most? Would you recommend it to others?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <Form.Text className="review-help-text">
              Your honest opinion helps other readers discover their next favorite book.
            </Form.Text>
          </Form.Group>
          
          <Button 
            type="submit" 
            variant="primary" 
            className="submit-review-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReviewForm;