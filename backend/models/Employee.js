const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  salary: { type: Number, required: true },
  joinDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  avatar: { type: String, default: '' },
  address: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);