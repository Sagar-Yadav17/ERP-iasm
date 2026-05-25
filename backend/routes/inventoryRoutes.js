const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getItems)
  .post(authorize('superadmin', 'admin'), createItem);

router.route('/:id')
  .put(authorize('superadmin', 'admin'), updateItem)
  .delete(authorize('superadmin'), deleteItem);

module.exports = router;