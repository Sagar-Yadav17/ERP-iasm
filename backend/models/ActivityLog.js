const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  text: { type: String, required: true },
  icon: { type: String, default: '📝' },
  type: { type: String, default: 'general' },
  performedBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);