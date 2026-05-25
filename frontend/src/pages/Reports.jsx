import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  if (value === 0) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${name}: ${value}`}
    </text>
  )
}

const statusColor = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  'on-leave': 'bg-blue-100 text-blue-700',
  'half-day': 'bg-orange-100 text-orange-700',
}

const Reports = () => {
  const [employeeStats, setEmployeeStats] = useState([])
  const [financeStats, setFinanceStats] = useState({})
  const [inventoryStats, setInventoryStats] = useState([])
  const [attendanceStats, setAttendanceStats] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [allAttendance, setAllAttendance] = useState([])
  const [allInventory, setAllInventory] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modal, setModal] = useState({ open: false, title: '', data: [], type: '' })

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [emp, fin, inv, att] = await Promise.all([
        API.get('/employees'),
        API.get('/finance/summary'),
        API.get('/inventory'),
        API.get('/attendance'),
      ])

      setAllEmployees(emp.data.employees)
      setAllAttendance(att.data.result)
      setAllInventory(inv.data.items)

      const deptMap = {}
      emp.data.employees.forEach(e => {
        deptMap[e.department] = (deptMap[e.department] || 0) + 1
      })
      setEmployeeStats(Object.entries(deptMap).map(([name, value]) => ({ name, value })))

      setFinanceStats(fin.data)

      const invMap = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0 }
      inv.data.items.forEach(i => {
        if (i.status === 'in-stock') invMap['In Stock']++
        else if (i.status === 'low-stock') invMap['Low Stock']++
        else invMap['Out of Stock']++
      })
      setInventoryStats(Object.entries(invMap).map(([name, value]) => ({ name, value })))

      setAttendanceStats([
        { name: 'Present', value: att.data.summary.present || 0 },
        { name: 'Absent', value: att.data.summary.absent || 0 },
        { name: 'Late', value: att.data.summary.late || 0 },
        { name: 'On Leave', value: att.data.summary.onLeave || 0 },
      ].filter(a => a.value > 0))

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Click handlers
  const handleAttendanceClick = (data) => {
    if (!data) return
    const status = data.name.toLowerCase().replace(' ', '-')
    const filtered = allAttendance.filter(r => r.attendance?.status === status)
    setModal({
      open: true,
      title: `${data.name} Employees (${data.value})`,
      type: 'attendance',
      data: filtered,
    })
  }

  const handleDeptClick = (data) => {
    if (!data) return
    const filtered = allEmployees.filter(e => e.department === data.name)
    setModal({
      open: true,
      title: `${data.name} Department (${filtered.length} employees)`,
      type: 'employees',
      data: filtered,
    })
  }

  const handleInventoryClick = (data) => {
    if (!data) return
    const statusMap = { 'In Stock': 'in-stock', 'Low Stock': 'low-stock', 'Out of Stock': 'out-of-stock' }
    const filtered = allInventory.filter(i => i.status === statusMap[data.name])
    setModal({
      open: true,
      title: `${data.name} Items (${filtered.length})`,
      type: 'inventory',
      data: filtered,
    })
  }

  const financeData = [
    { name: 'Revenue', value: financeStats.totalRevenue || 0 },
    { name: 'Expenses', value: financeStats.totalExpenses || 0 },
    { name: 'Pending', value: financeStats.totalPending || 0 },
    { name: 'Net Profit', value: financeStats.netProfit || 0 },
  ]

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading reports...</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Click on any chart segment to see details</p>
      </div>

      {/* Finance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `₹${(financeStats.totalRevenue || 0).toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Expenses', value: `₹${(financeStats.totalExpenses || 0).toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Net Profit', value: `₹${(financeStats.netProfit || 0).toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: `₹${(financeStats.totalPending || 0).toLocaleString()}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Finance Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-1">Financial Overview</h2>
          <p className="text-xs text-gray-400 mb-4">Click bars for details</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={financeData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee by Department Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-1">Employees by Department</h2>
          <p className="text-xs text-gray-400 mb-4">Click a segment to see employees</p>
          {employeeStats.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No employee data</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={employeeStats}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={renderCustomLabel}
                  onClick={(data) => handleDeptClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {employeeStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Attendance Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-1">Today's Attendance</h2>
          <p className="text-xs text-gray-400 mb-4">Click a segment to see employees</p>
          {attendanceStats.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No attendance marked today</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceStats}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={renderCustomLabel}
                  onClick={(data) => handleAttendanceClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {attendanceStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inventory Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-1">Inventory Status</h2>
          <p className="text-xs text-gray-400 mb-4">Click a bar to see items</p>
          {inventoryStats.every(i => i.value === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No inventory data</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={inventoryStats}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                onClick={(data) => { if (data?.activePayload) handleInventoryClick(data.activePayload[0].payload) }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {inventoryStats.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.name === 'In Stock' ? '#10B981' :
                      entry.name === 'Low Stock' ? '#F59E0B' : '#EF4444'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{modal.title}</h2>
              <button onClick={() => setModal({ ...modal, open: false })}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-5">
              {/* Attendance detail */}
              {modal.type === 'attendance' && (
                modal.data.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No employees found</p>
                ) : (
                  <div className="space-y-3">
                    {modal.data.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                            {r.employee.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{r.employee.name}</p>
                            <p className="text-xs text-gray-400">{r.employee.department} · {r.employee.employeeId}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[r.attendance?.status]}`}>
                          {r.attendance?.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Employee dept detail */}
              {modal.type === 'employees' && (
                modal.data.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No employees found</p>
                ) : (
                  <div className="space-y-3">
                    {modal.data.map((emp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.designation} · {emp.employeeId}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">₹{emp.salary.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Inventory detail */}
              {modal.type === 'inventory' && (
                modal.data.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No items found</p>
                ) : (
                  <div className="space-y-3">
                    {modal.data.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.category} · {item.supplier || 'No supplier'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">{item.quantity} {item.unit}</p>
                          <p className="text-xs text-gray-400">₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Reports