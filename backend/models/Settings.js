const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  companyName: { type: String, default: 'My Company' },
  companyEmail: { type: String, default: '' },
  companyPhone: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  currency: { type: String, default: '₹' },
  timezone: { type: String, default: 'Asia/Kolkata' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);