const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], default: 'present' },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);