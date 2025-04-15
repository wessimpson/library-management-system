const express = require('express');
const {
  borrowBook,
  returnBook,
  getMemberBorrowings,
  getOverdueBooks
} = require('../controllers/borrowingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all members)
router.use(protect);

router.post('/', borrowBook);
router.get('/me', getMemberBorrowings);
router.put('/:borrowId/return', returnBook);

// Protected routes (staff only)
router.use(restrictTo('Staff'));

router.get('/overdue', getOverdueBooks);

module.exports = router;