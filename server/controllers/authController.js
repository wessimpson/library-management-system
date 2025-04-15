const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register a new member
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, password, membershipType } = req.body;

    // Check if member already exists
    const [existingMember] = await pool.query('SELECT * FROM Members WHERE Email = ?', [email]);

    if (existingMember.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new member
    const [result] = await pool.query(
      `INSERT INTO Members (FirstName, LastName, Email, Phone, Address, MembershipDate, MembershipStatus, MembershipType, Password) 
       VALUES (?, ?, ?, ?, ?, CURDATE(), 'Active', ?, ?)`,
      [firstName, lastName, email, phone, address, membershipType || 'Standard', hashedPassword]
    );

    // Generate JWT
    const token = generateToken(result.insertId);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: result.insertId,
        firstName,
        lastName,
        email,
        membershipType: membershipType || 'Standard',
        membershipStatus: 'Active'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login member
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if member exists
    const [member] = await pool.query(
      'SELECT MemberID, FirstName, LastName, Email, MembershipStatus, MembershipType, Password FROM Members WHERE Email = ?',
      [email]
    );

    if (member.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, member[0].Password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if membership is active
    if (member[0].MembershipStatus !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your membership is not active'
      });
    }

    // Generate JWT
    const token = generateToken(member[0].MemberID);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: member[0].MemberID,
        firstName: member[0].FirstName,
        lastName: member[0].LastName,
        email: member[0].Email,
        membershipType: member[0].MembershipType,
        membershipStatus: member[0].MembershipStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current member
exports.getCurrentMember = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.member
    });
  } catch (error) {
    console.error('Get current member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting current member',
      error: error.message
    });
  }
};