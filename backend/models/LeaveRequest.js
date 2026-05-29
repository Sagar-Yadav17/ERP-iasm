const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'earned', 'other'], default: 'casual' },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);