const express = require('express');
const { register, login, getCurrentMember } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register a new member
router.post('/register', register);

// Login
router.post('/login', login);

// Get current member
router.get('/me', protect, getCurrentMember);

module.exports = router;