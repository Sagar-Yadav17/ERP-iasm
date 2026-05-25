const express = require('express');
const router = express.Router();
const { getAttendanceByDate, markAttendance, bulkMarkAttendance, getMonthlyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAttendanceByDate);
router.post('/mark', authorize('superadmin', 'admin'), markAttendance);
router.post('/bulk', authorize('superadmin', 'admin'), bulkMarkAttendance);
router.get('/monthly', getMonthlyAttendance);

module.exports = router;