const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['leave', 'attendance', 'inventory', 'finance', 'general'], default: 'general' },
  icon: { type: String, default: '🔔' },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);