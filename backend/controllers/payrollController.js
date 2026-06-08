const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const PDFDocument = require('pdfkit');

// Get all payrolls
exports.getPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { tenantId: req.user.tenantId };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payrolls = await Payroll.find(query).sort({ createdAt: -1 });
    res.json({ payrolls, total: payrolls.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate payroll for all employees
exports.generatePayroll = async (req, res) => {
  try {
    const { month, year, workingDays = 26 } = req.body;
    const tenantId = req.user.tenantId;

    const employees = await Employee.find({ tenantId, status: 'active' });
    if (employees.length === 0) return res.status(400).json({ message: 'No active employees found' });

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const results = [];

    for (const emp of employees) {
      // Check if payroll already exists
      const existing = await Payroll.findOne({ employeeId: emp._id, month, year, tenantId });
      if (existing) continue;

      // Get attendance for the month
      const presentDays = await Attendance.countDocuments({
        employeeId: emp._id,
        tenantId,
        date: { $gte: monthStart, $lte: monthEnd },
        status: 'present'
      });

      const basicSalary = emp.salary;
      const perDaySalary = basicSalary / workingDays;
      const absentDays = workingDays - presentDays;

      // Auto calculate allowances
      const hra = Math.round(basicSalary * 0.4)
      const transport = 1600;
      const medical = 1250;

      // Auto calculate deductions
      const pf = Math.round(basicSalary * 0.12);
      const tax = basicSalary > 50000 ? Math.round(basicSalary * 0.1) : 0;
      const absenceDeduction = Math.round(perDaySalary * absentDays);

      const totalAllowances = hra + transport + medical;
      const totalDeductions = pf + tax + absenceDeduction;
      const grossSalary = basicSalary + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      const payroll = await Payroll.create({
        tenantId,
        employeeId: emp._id,
        employeeName: emp.name,
        employeeCode: emp.employeeId,
        department: emp.department,
        designation: emp.designation,
        month: parseInt(month),
        year: parseInt(year),
        basicSalary,
        allowances: { hra, transport, medical, other: 0 },
        deductions: { pf, tax, absence: absenceDeduction, other: 0 },
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        workingDays,
        presentDays,
        status: 'draft',
      });

      results.push(payroll);
    }

    // Notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        tenantId,
        title: 'Payroll Generated',
        message: `Payroll for ${getMonthName(month)} ${year} generated for ${results.length} employees`,
        type: 'finance',
        icon: '💰',
        link: '/payroll',
      });
    } catch (e) {}

    res.json({ message: `Payroll generated for ${results.length} employees`, payrolls: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update payroll
exports.updatePayroll = async (req, res) => {
  try {
    const { allowances, deductions, notes, status, paidDate } = req.body;

    const payroll = await Payroll.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    const totalAllowances = Object.values(allowances || payroll.allowances).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions || payroll.deductions).reduce((a, b) => a + b, 0);
    const grossSalary = payroll.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const updated = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        allowances: allowances || payroll.allowances,
        deductions: deductions || payroll.deductions,
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        notes,
        status: status || payroll.status,
        paidDate: status === 'paid' ? new Date() : payroll.paidDate,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all as paid
exports.markAllPaid = async (req, res) => {
  try {
    const { month, year } = req.body;
    await Payroll.updateMany(
      { tenantId: req.user.tenantId, month, year, status: 'draft' },
      { status: 'paid', paidDate: new Date() }
    );
    res.json({ message: 'All payrolls marked as paid' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete payroll
exports.deletePayroll = async (req, res) => {
  try {
    await Payroll.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'Payroll deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download salary slip PDF
exports.downloadSalarySlip = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Salary-Slip-${payroll.employeeCode}-${getMonthName(payroll.month)}-${payroll.year}.pdf`);
    doc.pipe(res);

    // Header
    doc.fillColor('#4F46E5').fontSize(22).text('SALARY SLIP', 50, 50);
    doc.fillColor('#333').fontSize(10).text(`${getMonthName(payroll.month)} ${payroll.year}`, 400, 55, { align: 'right' });

    doc.moveTo(50, 80).lineTo(550, 80).stroke('#4F46E5');

    // Employee Info
    doc.fillColor('#4F46E5').fontSize(11).text('Employee Details', 50, 95);
    doc.moveTo(50, 110).lineTo(550, 110).stroke('#eee');

    const details = [
      ['Employee Name', payroll.employeeName],
      ['Employee Code', payroll.employeeCode],
      ['Department', payroll.department],
      ['Designation', payroll.designation],
      ['Month/Year', `${getMonthName(payroll.month)} ${payroll.year}`],
      ['Working Days', `${payroll.presentDays} / ${payroll.workingDays}`],
    ];

    let y = 120;
    details.forEach(([label, value], i) => {
      const x = i % 2 === 0 ? 50 : 310;
      if (i % 2 === 0 && i > 0) y += 22;
      doc.fillColor('#666').fontSize(9).text(label + ':', x, y);
      doc.fillColor('#333').fontSize(10).text(value, x + 110, y);
    });

    y += 40;
    doc.moveTo(50, y).lineTo(550, y).stroke('#eee');
    y += 15;

    // Two column layout
    const col1X = 50;
    const col2X = 310;

    // Earnings
    doc.fillColor('#10B981').fontSize(11).text('Earnings', col1X, y);
    doc.fillColor('#EF4444').fontSize(11).text('Deductions', col2X, y);
    y += 20;
    doc.moveTo(50, y).lineTo(260, y).stroke('#eee');
    doc.moveTo(310, y).lineTo(550, y).stroke('#eee');
    y += 10;

    const earnings = [
      ['Basic Salary', payroll.basicSalary],
      ['HRA', payroll.allowances.hra],
      ['Transport', payroll.allowances.transport],
      ['Medical', payroll.allowances.medical],
      ['Other Allowance', payroll.allowances.other],
    ];

    const deductionsList = [
      ['Provident Fund', payroll.deductions.pf],
      ['Income Tax', payroll.deductions.tax],
      ['Absence', payroll.deductions.absence],
      ['Other', payroll.deductions.other],
    ];

    const maxRows = Math.max(earnings.length, deductionsList.length);
    for (let i = 0; i < maxRows; i++) {
      if (earnings[i]) {
        doc.fillColor('#444').fontSize(9).text(earnings[i][0], col1X, y);
        doc.fillColor('#333').fontSize(9).text(`₹${earnings[i][1].toLocaleString()}`, col1X + 130, y, { align: 'right', width: 80 });
      }
      if (deductionsList[i]) {
        doc.fillColor('#444').fontSize(9).text(deductionsList[i][0], col2X, y);
        doc.fillColor('#333').fontSize(9).text(`₹${deductionsList[i][1].toLocaleString()}`, col2X + 130, y, { align: 'right', width: 80 });
      }
      y += 20;
    }

    y += 5;
    doc.moveTo(50, y).lineTo(260, y).stroke('#eee');
    doc.moveTo(310, y).lineTo(550, y).stroke('#eee');
    y += 8;

    doc.fillColor('#10B981').fontSize(10).text('Gross Salary', col1X, y);
    doc.fontSize(10).text(`₹${payroll.grossSalary.toLocaleString()}`, col1X + 130, y, { align: 'right', width: 80 });
    doc.fillColor('#EF4444').fontSize(10).text('Total Deductions', col2X, y);
    doc.fontSize(10).text(`₹${payroll.totalDeductions.toLocaleString()}`, col2X + 130, y, { align: 'right', width: 80 });

    y += 30;
    doc.fillColor('#4F46E5').rect(50, y, 500, 40).fill();
    doc.fillColor('#fff').fontSize(12).text('NET SALARY', 70, y + 13);
    doc.fontSize(16).text(`₹${payroll.netSalary.toLocaleString()}`, 70, y + 10, { align: 'right', width: 460 });

    y += 60;
    doc.fillColor('#666').fontSize(9).text(`Status: ${payroll.status.toUpperCase()}`, 50, y);
    if (payroll.paidDate) {
      doc.text(`Paid on: ${new Date(payroll.paidDate).toLocaleDateString('en-IN')}`, 200, y);
    }

    y += 30;
    doc.moveTo(50, y).lineTo(550, y).stroke('#4F46E5');
    doc.fillColor('#999').fontSize(8).text('This is a computer generated salary slip and does not require a signature.', 50, y + 10, { align: 'center', width: 500 });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};