const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getMyProfile, getMyAttendance } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-profile', getMyProfile);
router.get('/my-attendance', getMyAttendance);
router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/all', authorize('superadmin', 'admin'), getAllLeaves);
router.put('/:id/status', authorize('superadmin', 'admin'), updateLeaveStatus);
router.get('/test', (req, res) => {
  res.json({ message: 'leave route working' });
});

module.exports = router;