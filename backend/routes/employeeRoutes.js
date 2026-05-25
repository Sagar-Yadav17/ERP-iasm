const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorize('superadmin', 'admin'), createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(authorize('superadmin', 'admin'), updateEmployee)
  .delete(authorize('superadmin'), deleteEmployee);

module.exports = router;