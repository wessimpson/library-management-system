import axios from 'axios';

// Configure the logger
const config = {
  // Set to true to enable sending logs to server
  sendToServer: true,
  // Set minimum level for logs to be sent to server
  minLevelToSend: 'warn' 
};

// Log levels and their priorities
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Send log to server endpoint
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
const sendLogToServer = async (level, message, data) => {
  try {
    if (!config.sendToServer) return;
    if (LOG_LEVELS[level] < LOG_LEVELS[config.minLevelToSend]) return;
    
    await axios.post('/log', {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Don't log this to prevent infinite loops
    console.error('Failed to send log to server:', error.message);
  }
};

// Logger object with methods for each log level
const logger = {
  debug: (message, data) => {
    console.debug(message, data || '');
    sendLogToServer('debug', message, data);
  },
  
  info: (message, data) => {
    console.info(message, data || '');
    sendLogToServer('info', message, data);
  },
  
  warn: (message, data) => {
    console.warn(message, data || '');
    sendLogToServer('warn', message, data);
  },
  
  error: (message, data) => {
    console.error(message, data || '');
    sendLogToServer('error', message, data);
  }
};

export default logger;