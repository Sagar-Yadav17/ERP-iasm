const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateProfile, changePassword } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('superadmin', 'admin'), updateSettings);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

module.exports = router;