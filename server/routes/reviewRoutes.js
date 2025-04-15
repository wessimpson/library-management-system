const express = require('express');
const {
  getBookReviews,
  addReview,
  updateReview,
  deleteReview,
  getMemberReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/book/:bookId', getBookReviews);

// Protected routes (all members)
router.use(protect);

router.post('/', addReview);
router.get('/me', getMemberReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;