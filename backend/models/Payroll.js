const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  employeeCode: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: {
    hra: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  deductions: {
    pf: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    absence: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  totalAllowances: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  workingDays: { type: Number, default: 26 },
  presentDays: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'paid'], default: 'draft' },
  paidDate: { type: Date },
  notes: { type: String, default: '' },
}, { timestamps: true });

payrollSchema.index({ employeeId: 1, month: 1, year: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);