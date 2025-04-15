const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get member from database
    const [member] = await pool.query(
      'SELECT MemberID, FirstName, LastName, Email, MembershipStatus, MembershipType FROM Members WHERE MemberID = ?',
      [decoded.id]
    );

    // Check if member exists
    if (!member || member.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Check if membership is active
    if (member[0].MembershipStatus !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your membership is not active'
      });
    }

    // Add member to request
    req.member = member[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Middleware to restrict access to specific membership types
exports.restrictTo = (...membershipTypes) => {
  return (req, res, next) => {
    if (!membershipTypes.includes(req.member.MembershipType)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};