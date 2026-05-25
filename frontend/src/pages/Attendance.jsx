import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const statusOptions = ['present', 'absent', 'late', 'half-day', 'on-leave']

const statusColor = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  'half-day': 'bg-orange-100 text-orange-700',
  'on-leave': 'bg-blue-100 text-blue-700',
}

const today = new Date().toISOString().split('T')[0]

const Attendance = () => {
  const [date, setDate] = useState(today)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [localStatus, setLocalStatus] = useState({})

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const { data: res } = await API.get(`/attendance?date=${date}`)
      setData(res.result)
      setSummary(res.summary)
      const statusMap = {}
      res.result.forEach(r => {
        statusMap[r.employee._id] = r.attendance?.status || 'present'
      })
      setLocalStatus(statusMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAttendance() }, [date])

  const handleStatusChange = (empId, status) => {
    setLocalStatus(prev => ({ ...prev, [empId]: status }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const records = data.map(r => ({
        employeeId: r.employee._id,
        status: localStatus[r.employee._id] || 'present',
      }))
      await API.post('/attendance/bulk', { date, records })
      fetchAttendance()
      alert('Attendance saved!')
    } catch (err) {
      alert('Error saving attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Mark and manage daily attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSave}
            disabled={saving || data.length === 0}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: summary.total || 0, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'Present', value: summary.present || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Absent', value: summary.absent || 0, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Late', value: summary.late || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Employee', 'Department', 'Status', 'Current'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No active employees found</td></tr>
            ) : data.map(({ employee, attendance }) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{employee.name}</p>
                      <p className="text-xs text-gray-400">{employee.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{employee.department}</td>
                <td className="px-5 py-4">
                  <select
                    value={localStatus[employee._id] || 'present'}
                    onChange={(e) => handleStatusChange(employee._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4">
                  {attendance ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[attendance.status]}`}>
                      {attendance.status}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not marked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

export default Attendance