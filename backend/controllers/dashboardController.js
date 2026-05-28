const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');

exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Today ki dates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

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

    const revenue = monthlyRevenue[0]?.total || 0;

    // Recent activity combine karo
    const recentActivity = [
      ...recentEmployees.map(e => ({
        text: `New employee ${e.name} added`,
        time: e.createdAt,
        icon: '👤',
        type: 'employee'
      })),
      ...recentInvoices.map(i => ({
        text: `Invoice ${i.invoiceNumber} created for ${i.clientName}`,
        time: i.createdAt,
        icon: '💳',
        type: 'invoice'
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};