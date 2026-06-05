const Employee = require('../models/Employee');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = { tenantId: req.user.tenantId };

    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json({ employees, total: employees.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create employee + auto create user account
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joinDate, status, address, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Smart employeeId generation
    const lastEmployee = await Employee.findOne({ tenantId: req.user.tenantId })
      .sort({ createdAt: -1 });

    let nextNum = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const lastNum = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      nextNum = lastNum + 1;
    }
    const employeeId = `EMP${String(nextNum).padStart(4, '0')}`;

    const employee = await Employee.create({
      name, email, phone, department, designation,
      salary, joinDate, status, address,
      employeeId,
      tenantId: req.user.tenantId,
    });

    // User account create karo
    try {
      const bcrypt = require('bcryptjs');
      const userPassword = password || 'Welcome@123';
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      await User.collection.insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'staff',
        tenantId: req.user.tenantId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('User created successfully:', email);
    } catch (userErr) {
      console.error('USER CREATE ERROR:', userErr.message);
    }

    // Activity log save karo
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        tenantId: req.user.tenantId,
        text: `New employee ${name} (${employeeId}) added`,
        icon: '👤',
        type: 'employee_added',
        performedBy: req.user.name || req.user.email,
      });
    } catch (logErr) {
      console.error('Activity log error:', logErr.message);
    }

    const userPassword = password || 'Welcome@123';
    res.status(201).json({
      employee,
      message: `Employee created! Email: ${email} | Password: ${userPassword}`
    });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const existing = await Employee.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!existing) return res.status(404).json({ message: 'Employee not found' });

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );

    await User.findOneAndUpdate(
      { email: existing.email },
      {
        name: req.body.name || existing.name,
        email: req.body.email || existing.email,
      }
    );

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');

    const employee = await Employee.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Activity log save karo pehle
    await ActivityLog.create({
      tenantId: req.user.tenantId,
      text: `Employee ${employee.name} (${employee.employeeId}) was removed`,
      icon: '🗑️',
      type: 'employee_deleted',
      performedBy: req.user.name,
    });

    // Attendance delete karo
    await Attendance.deleteMany({ employeeId: employee._id });

    // Leave requests delete karo
    try {
      const LeaveRequest = require('../models/LeaveRequest');
      await LeaveRequest.deleteMany({ employeeId: employee._id });
    } catch (e) {}

    // User account delete karo
    await User.findOneAndDelete({ email: employee.email });

    // Employee delete karo
    await Employee.findOneAndDelete({ _id: req.params.id });

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: err.message });
  }
};