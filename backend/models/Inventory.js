const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'pcs' },
  price: { type: Number, required: true },
  supplier: { type: String, default: '' },
  minStock: { type: Number, default: 10 },
  description: { type: String, default: '' },
  status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);