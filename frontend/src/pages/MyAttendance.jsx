import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const statusColor = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  'half-day': 'bg-orange-100 text-orange-700',
  'on-leave': 'bg-blue-100 text-blue-700',
}

const MyAttendance = () => {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const { data } = await API.get(
        `/leave/my-attendance?month=${month}&year=${year}`
      )
      setRecords(data.records)
      setSummary(data.summary)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [month, year])

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Your monthly attendance record
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Present',
            value: summary.present || 0,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Absent',
            value: summary.absent || 0,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
          {
            label: 'Late',
            value: summary.late || 0,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
          },
          {
            label: 'On Leave',
            value: summary.onLeave || 0,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}
          >
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Date', 'Day', 'Status', 'Check In', 'Check Out'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-400"
                >
                  No attendance records for this month
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-800 whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString('en-IN')}
                  </td>

                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                    })}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {r.checkIn || '—'}
                  </td>

                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {r.checkOut || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

export default MyAttendance