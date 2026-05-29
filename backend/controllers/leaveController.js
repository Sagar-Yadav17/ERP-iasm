const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

exports.applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email, tenantId: req.user.tenantId });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const { leaveType, fromDate, toDate, reason } = req.body;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await LeaveRequest.create({
      tenantId: req.user.tenantId,
      employeeId: employee._id,
      employeeName: employee.name,
      leaveType,
      fromDate: from,
      toDate: to,
      days,
      reason,
    });

    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email, tenantId: req.user.tenantId });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const leaves = await LeaveRequest.find({ employeeId: employee._id }).sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { status, adminComment },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email, tenantId: req.user.tenantId });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    
    // Email se employee dhundo
    const employee = await Employee.findOne({ 
      email: req.user.email, 
      tenantId: req.user.tenantId 
    });
    
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const records = await Attendance.find({
      employeeId: employee._id,
      tenantId: req.user.tenantId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const summary = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      onLeave: records.filter(r => r.status === 'on-leave').length,
      total: records.length,
    };

    res.json({ records, summary, employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};