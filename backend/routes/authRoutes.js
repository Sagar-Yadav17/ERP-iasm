const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
// Protected test route
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// Admin only test
router.get('/admin-only', protect, authorize('superadmin', 'admin'), (req, res) => {
  res.json({ message: 'Welcome admin!' });
});

module.exports = router;