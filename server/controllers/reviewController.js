const { pool } = require('../config/db');

// Get reviews for a book
exports.getBookReviews = async (req, res) => {
  const { bookId } = req.params;

  try {
    // Check if the book exists
    const [book] = await pool.query(
      'SELECT * FROM Books WHERE BookID = ?',
      [bookId]
    );

    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get the reviews
    const [reviews] = await pool.query(
      `SELECT r.ReviewID, r.MemberID, m.FirstName, m.LastName,
              r.Rating, r.ReviewText, r.ReviewDate
       FROM Reviews r
       JOIN Members m ON r.MemberID = m.MemberID
       WHERE r.BookID = ?
       ORDER BY r.ReviewDate DESC`,
      [bookId]
    );

    // Get average rating and review count
    const [ratingInfo] = await pool.query(
      `SELECT AVG(Rating) AS AverageRating, COUNT(*) AS NumberOfReviews
       FROM Reviews
       WHERE BookID = ?`,
      [bookId]
    );

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: ratingInfo[0].AverageRating || 0,
        numberOfReviews: ratingInfo[0].NumberOfReviews || 0
      }
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reviews',
      error: error.message
    });
  }
};

// Add a review
exports.addReview = async (req, res) => {
  const { bookId, rating, reviewText } = req.body;
  const memberId = req.member.MemberID;

  try {
    // Check if the book exists
    const [book] = await pool.query(
      'SELECT * FROM Books WHERE BookID = ?',
      [bookId]
    );

    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if the rating is valid
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if the member has already reviewed this book
    const [existingReview] = await pool.query(
      'SELECT * FROM Reviews WHERE BookID = ? AND MemberID = ?',
      [bookId, memberId]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    // Create the review
    const [result] = await pool.query(
      'INSERT INTO Reviews (MemberID, BookID, Rating, ReviewText, ReviewDate) VALUES (?, ?, ?, ?, NOW())',
      [memberId, bookId, rating, reviewText]
    );

    // Get member details
    const [member] = await pool.query(
      'SELECT FirstName, LastName FROM Members WHERE MemberID = ?',
      [memberId]
    );

    res.status(201).json({
      success: true,
      data: {
        reviewId: result.insertId,
        memberId,
        memberName: `${member[0].FirstName} ${member[0].LastName}`,
        bookId,
        rating,
        reviewText,
        reviewDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, reviewText } = req.body;
  const memberId = req.member.MemberID;

  try {
    // Check if the review exists and belongs to the member
    const [review] = await pool.query(
      'SELECT * FROM Reviews WHERE ReviewID = ? AND MemberID = ?',
      [reviewId, memberId]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if the rating is valid
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update the review
    await pool.query(
      'UPDATE Reviews SET Rating = ?, ReviewText = ?, ReviewDate = NOW() WHERE ReviewID = ?',
      [rating, reviewText, reviewId]
    );

    res.status(200).json({
      success: true,
      data: {
        reviewId,
        memberId,
        bookId: review[0].BookID,
        rating,
        reviewText,
        reviewDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const memberId = req.member.MemberID;

  try {
    // Check if the review exists and belongs to the member
    const [review] = await pool.query(
      'SELECT * FROM Reviews WHERE ReviewID = ? AND MemberID = ?',
      [reviewId, memberId]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Delete the review
    await pool.query(
      'DELETE FROM Reviews WHERE ReviewID = ?',
      [reviewId]
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Get reviews by a member
exports.getMemberReviews = async (req, res) => {
  const memberId = req.member.MemberID;

  try {
    const [reviews] = await pool.query(
      `SELECT r.ReviewID, r.BookID, b.Title, 
              r.Rating, r.ReviewText, r.ReviewDate
       FROM Reviews r
       JOIN Books b ON r.BookID = b.BookID
       WHERE r.MemberID = ?
       ORDER BY r.ReviewDate DESC`,
      [memberId]
    );

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get member reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reviews',
      error: error.message
    });
  }
};