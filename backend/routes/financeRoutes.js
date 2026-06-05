const express = require('express');
const router = express.Router();
const f = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getInvoices, createInvoice, updateInvoice, deleteInvoice, getExpenses, createExpense, deleteExpense, getSummary, downloadInvoicePDF } = require('../controllers/financeController');



router.use(protect);

router.get('/summary', f.getSummary);
router.route('/invoices').get(f.getInvoices).post(authorize('superadmin', 'admin'), f.createInvoice);
router.route('/invoices/:id').put(authorize('superadmin', 'admin'), f.updateInvoice).delete(authorize('superadmin'), f.deleteInvoice);
router.route('/expenses').get(f.getExpenses).post(authorize('superadmin', 'admin'), f.createExpense);
router.route('/expenses/:id').delete(authorize('superadmin'), f.deleteExpense);
router.get('/invoices/:id/pdf', downloadInvoicePDF);

module.exports = router;