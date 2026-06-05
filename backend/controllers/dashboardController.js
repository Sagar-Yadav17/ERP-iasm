const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');

exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    if (isAdmin) {
      const [
        totalEmployees,
        presentToday,
        monthlyRevenue,
        pendingInvoices,
        lowStockItems,
        recentEmployees,
        recentInvoices,
      ] = await Promise.all([
        Employee.countDocuments({ tenantId, status: 'active' }),
        Attendance.countDocuments({ tenantId, date: { $gte: todayStart, $lte: todayEnd }, status: 'present' }),
        Invoice.aggregate([
          { $match: { tenantId, status: 'paid', createdAt: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Invoice.countDocuments({ tenantId, status: 'pending' }),
        Inventory.countDocuments({ tenantId, status: 'low-stock' }),
        Employee.find({ tenantId }).sort({ createdAt: -1 }).limit(3),
        Invoice.find({ tenantId }).sort({ createdAt: -1 }).limit(3),
      ]);

      // Leave requests safely load karo
      let recentLeaves = [];
      try {
        const LeaveRequest = require('../models/LeaveRequest');
        recentLeaves = await LeaveRequest.find({ tenantId }).sort({ updatedAt: -1 }).limit(5);
      } catch (e) {
        console.log('LeaveRequest not available');
      }

      // Attendance safely load karo
      let recentAttendance = [];
      try {
        recentAttendance = await Attendance.find({
          tenantId,
          date: { $gte: todayStart, $lte: todayEnd }
        }).populate('employeeId', 'name').sort({ updatedAt: -1 }).limit(5);
      } catch (e) {
        console.log('Attendance populate error');
      }

      const revenue = monthlyRevenue[0]?.total || 0;

      const recentActivity = [
        ...recentEmployees.map(e => ({
          text: `New employee ${e.name} added`,
          time: e.createdAt,
          icon: '👤',
          type: 'employee'
        })),
        ...recentInvoices.map(i => ({
          text: `Invoice ${i.invoiceNumber} — ₹${(i.totalAmount || 0).toLocaleString()} for ${i.clientName}`,
          time: i.createdAt,
          icon: '💳',
          type: 'invoice'
        })),
        ...recentLeaves.map(l => ({
          text: `${l.employeeName} applied for ${l.leaveType} leave (${l.days} days) — ${l.status}`,
          time: l.updatedAt,
          icon: l.status === 'approved' ? '✅' : l.status === 'rejected' ? '❌' : '🏖️',
          type: 'leave'
        })),
        ...recentAttendance
          .filter(a => a.employeeId)
          .map(a => ({
            text: `${a.employeeId?.name} marked ${a.status} today`,
            time: a.updatedAt,
            icon: a.status === 'present' ? '✅' : a.status === 'absent' ? '❌' : '⏰',
            type: 'attendance'
          })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

      res.json({
        stats: {
          totalEmployees,
          presentToday,
          monthlyRevenue: revenue,
          pendingInvoices,
          lowStockItems,
        },
        recentActivity,
      });

    } else {
      // Staff dashboard
      let staffEmployee = null;
      try {
        staffEmployee = await Employee.findOne({ email: req.user.email, tenantId });
      } catch (e) {
        console.log('Staff employee error:', e.message);
      }

      if (!staffEmployee) {
        return res.json({
          stats: { totalEmployees: 0, presentToday: 0, monthlyRevenue: 0, pendingInvoices: 0, lowStockItems: 0 },
          recentActivity: [],
          isStaff: true,
        });
      }

      const myAttendanceThisMonth = await Attendance.countDocuments({
        employeeId: staffEmployee._id,
        date: { $gte: monthStart, $lte: monthEnd }
      });

      const myPresentCount = await Attendance.countDocuments({
        employeeId: staffEmployee._id,
        date: { $gte: monthStart, $lte: monthEnd },
        status: 'present'
      });

      const myTodayAttendance = await Attendance.findOne({
        employeeId: staffEmployee._id,
        date: { $gte: todayStart, $lte: todayEnd }
      });

      let myLeaves = [];
      let pendingLeaves = 0;
      try {
        const LeaveRequest = require('../models/LeaveRequest');
        myLeaves = await LeaveRequest.find({ employeeId: staffEmployee._id }).sort({ updatedAt: -1 }).limit(5);
        pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;
      } catch (e) {
        console.log('LeaveRequest error:', e.message);
      }

      const recentActivity = [
        myTodayAttendance ? {
          text: `Your attendance marked as ${myTodayAttendance.status} today`,
          time: myTodayAttendance.updatedAt,
          icon: myTodayAttendance.status === 'present' ? '✅' : '❌',
          type: 'attendance'
        } : null,
        ...myLeaves.map(l => ({
          text: `Your ${l.leaveType} leave (${l.days} days) is ${l.status}${l.adminComment ? ` — Admin: "${l.adminComment}"` : ''}`,
          time: l.updatedAt,
          icon: l.status === 'approved' ? '✅' : l.status === 'rejected' ? '❌' : '🏖️',
          type: 'leave'
        })),
      ].filter(Boolean).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

      res.json({
        stats: {
          totalEmployees: myAttendanceThisMonth,
          presentToday: myPresentCount,
          monthlyRevenue: 0,
          pendingInvoices: pendingLeaves,
          lowStockItems: 0,
        },
        recentActivity,
        isStaff: true,
        employeeName: staffEmployee.name,
      });
    }
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: err.message });
  }
};