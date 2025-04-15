const express = require('express');
const {
  createReservation,
  cancelReservation,
  getMemberReservations,
  getAllReservations
} = require('../controllers/reservationController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all members)
router.use(protect);

router.post('/', createReservation);
router.get('/me', getMemberReservations);
router.put('/:reservationId/cancel', cancelReservation);

// Protected routes (staff only)
router.use(restrictTo('Staff'));

router.get('/', getAllReservations);

module.exports = router;