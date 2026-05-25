const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');

// ── INVOICES ──
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.json({ invoices, total: invoices.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createInvoice = async (req, res) => {
  try {
    const count = await Invoice.countDocuments({ tenantId: req.user.tenantId });
    const invoiceNumber = `INV${String(count + 1).padStart(4, '0')}`;
    const invoice = await Invoice.create({ ...req.body, invoiceNumber, tenantId: req.user.tenantId });
    res.status(201).json(invoice);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body, { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'Invoice deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── EXPENSES ──
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ tenantId: req.user.tenantId }).sort({ date: -1 });
    res.json({ expenses, total: expenses.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SUMMARY ──
exports.getSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.user.tenantId });
    const expenses = await Expense.find({ tenantId: req.user.tenantId });

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const pending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);

    res.json({ totalRevenue, totalExpenses, profit: totalRevenue - totalExpenses, pending });
  } catch (err) { res.status(500).json({ message: err.message }); }
};