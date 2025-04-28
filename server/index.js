const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./config/db');
const path = require('path');
require('dotenv').config();

// Import routes
const memberRoutes = require('./routes/memberRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');

// Create Express app
const app = express();

// Test database connection
testConnection();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Handle browser extension requests - silently accept to avoid console errors
app.post('/api/events', (req, res, next) => {
  // Check if this is a browser extension request (has no auth and comes from content.js)
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const isExtensionRequest = 
    !req.headers.authorization && 
    (req.headers['x-requested-with']?.includes('extension') || 
     referer.includes('chrome-extension:'));

  if (isExtensionRequest) {
    // Silently accept the request to avoid console errors
    console.log('[INFO] Intercepted browser extension request to /api/events');
    return res.status(200).json({ success: false, message: 'Request ignored' });
  }
  
  // Not an extension request, continue to actual event routes
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/events', eventRoutes);

// Client-side logging endpoint
app.post('/log', (req, res) => {
  const logData = req.body || {};
  
  // Format the log message nicely
  if (logData.level && logData.message) {
    console.log(`[CLIENT ${logData.level.toUpperCase()}] ${logData.message}`);
    
    // Log additional data if present
    if (logData.data) {
      console.log('Log data:', logData.data);
    }
  } else {
    console.log('Client log:', logData);
  }
  
  res.status(200).json({ success: true });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit process
  process.exit(1);
});