const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['Salary', 'Rent', 'Utilities', 'Marketing', 'Travel', 'Equipment', 'Other'], default: 'Other' },
  date: { type: Date, required: true },
  description: { type: String, default: '' },
  paidBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);