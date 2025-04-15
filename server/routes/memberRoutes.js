const express = require('express');
const {
  getMemberProfile,
  updateMemberProfile,
  changePassword,
  getMembers,
  getMemberDetails,
  updateMemberStatus
} = require('../controllers/memberController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all members)
router.use(protect);

router.get('/profile', getMemberProfile);
router.put('/profile', updateMemberProfile);
router.put('/password', changePassword);

// Protected routes (staff only)
router.use(restrictTo('Staff'));

router.get('/', getMembers);
router.get('/:memberId', getMemberDetails);
router.put('/:memberId/status', updateMemberStatus);

module.exports = router;