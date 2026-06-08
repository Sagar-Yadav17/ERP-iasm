const express = require('express');
const router = express.Router();
const { getPayrolls, generatePayroll, updatePayroll, markAllPaid, deletePayroll, downloadSalarySlip } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPayrolls);
router.post('/generate', authorize('superadmin', 'admin'), generatePayroll);
router.put('/mark-all-paid', authorize('superadmin', 'admin'), markAllPaid);
router.get('/:id/slip', downloadSalarySlip);
router.put('/:id', authorize('superadmin', 'admin'), updatePayroll);
router.delete('/:id', authorize('superadmin'), deletePayroll);

module.exports = router;