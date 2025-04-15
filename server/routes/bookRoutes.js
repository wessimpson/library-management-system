const express = require('express');
const {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  getGenres,
  getAuthors,
  getPublishers
} = require('../controllers/bookController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/authors', getAuthors);
router.get('/publishers', getPublishers);
router.get('/:id', getBook);

// Protected routes (staff only)
router.use(protect);
router.use(restrictTo('Staff'));

router.post('/', addBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;