const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  invoiceNumber: { type: String, required: true},

  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },

  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },

    // Finance.jsx price bhej raha hai
    price: { type: Number, required: true },

    // Optional rakho compatibility ke liye
    rate: { type: Number },
    amount: { type: Number },
  }],

  subtotal: { type: Number },
  tax: { type: Number, default: 0 },

  // Finance.jsx totalAmount bhej raha hai
  totalAmount: { type: Number, required: true },

  total: { type: Number },

  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'pending'],
    default: 'draft',
  },

  dueDate: { type: Date, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);