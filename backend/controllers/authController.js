const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, companyName, companyType } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Unique tenantId generate karo
    const tenantId = `${companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin',
      tenantId,
      isActive: true,
    });

    // Company settings create karo
    try {
      const Settings = require('../models/Settings');
      await Settings.create({
        tenantId,
        companyName,
        companyEmail: email,
      });
    } catch (e) {}

    // Activity log
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        tenantId,
        text: `${companyName} joined Zubron ERP`,
        icon: '🎉',
        type: 'company_registered',
        performedBy: name,
      });
    } catch (e) {}

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};