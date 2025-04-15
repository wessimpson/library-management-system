const express = require('express');
const {
  getUpcomingEvents,
  getEventsByBranch,
  getEvent,
  registerForEvent,
  cancelEventRegistration,
  getMemberEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getUpcomingEvents);
router.get('/branch/:branchId', getEventsByBranch);
router.get('/:eventId', getEvent);

// Protected routes (all members)
router.use(protect);

router.get('/me/registered', getMemberEvents);
router.post('/:eventId/register', registerForEvent);
router.delete('/:eventId/register', cancelEventRegistration);

// Protected routes (staff only)
router.use(restrictTo('Staff'));

router.post('/', createEvent);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);

module.exports = router;