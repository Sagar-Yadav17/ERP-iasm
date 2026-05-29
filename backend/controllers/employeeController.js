const Employee = require('../models/Employee');
const User = require('../models/User');

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

    const count = await Employee.countDocuments({ tenantId: req.user.tenantId });
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      name, email, phone, department, designation,
      salary, joinDate, status, address,
      employeeId,
      tenantId: req.user.tenantId,
    });

    // User create karo
    try {
      const bcrypt = require('bcryptjs');
      const userPassword = password || 'Welcome@123';
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'staff',
        tenantId: req.user.tenantId,
        isActive: true,
      });

      await newUser.save({ validateBeforeSave: false });
      console.log('User created successfully:', email);

    } catch (userErr) {
      console.error('USER CREATE ERROR:', userErr.message);
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
// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    // Pehle purana record lo
    const existing = await Employee.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!existing) return res.status(404).json({ message: 'Employee not found' });

    // Phir update karo
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );

    // Purane email se user update karo
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
    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Delete user account bhi
    await User.findOneAndDelete({ email: employee.email });

    res.json({ message: 'Employee and user account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};