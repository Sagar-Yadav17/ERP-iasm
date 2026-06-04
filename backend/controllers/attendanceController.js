const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const employees = await Employee.find({
      tenantId: req.user.tenantId,
      status: { $in: ['active', 'on-leave'] }
    });

    const records = await Attendance.find({
      tenantId: req.user.tenantId,
      date: { $gte: start, $lte: end }
    }).populate('employeeId', 'name employeeId department');

    const result = employees.map(emp => {
      const record = records.find(r => r.employeeId?._id?.toString() === emp._id.toString());
      return {
        employee: { _id: emp._id, name: emp.name, employeeId: emp.employeeId, department: emp.department },
        attendance: record || null,
      };
    });

    const activeEmpIds = employees.map(e => e._id.toString());
    const activeRecords = records.filter(r =>
      activeEmpIds.includes(r.employeeId?._id?.toString())
    );

    const summary = {
      total: employees.length,
      present: activeRecords.filter(r => r.status === 'present').length,
      absent: activeRecords.filter(r => r.status === 'absent').length,
      late: activeRecords.filter(r => r.status === 'late').length,
      onLeave: activeRecords.filter(r => r.status === 'on-leave').length,
    };

    res.json({ result, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark single attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    const targetDate = new Date(date);
    const start = new Date(targetDate.setHours(0, 0, 0, 0));

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: start, tenantId: req.user.tenantId },
      { status, checkIn, checkOut, notes, tenantId: req.user.tenantId },
      { upsert: true, new: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk mark attendance
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const targetDate = new Date(date);
    const start = new Date(targetDate.setHours(0, 0, 0, 0));

    const ops = records.map(r => ({
      updateOne: {
        filter: {
          employeeId: r.employeeId,
          date: start,
          tenantId: req.user.tenantId
        },
        update: {
          $set: {
            status: r.status,
            checkIn: r.checkIn || '',
            checkOut: r.checkOut || '',
            tenantId: req.user.tenantId,
            employeeId: r.employeeId,
            date: start,
          }
        },
        upsert: true,
      }
    }));

    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance saved successfully' });
  } catch (err) {
    console.error('Attendance error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get monthly attendance
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const records = await Attendance.find({
      tenantId: req.user.tenantId,
      employeeId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};