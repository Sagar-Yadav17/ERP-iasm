import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const ApplyLeave = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: '',
  })

  const fetchLeaves = async () => {
    try {
      const { data } = await API.get('/leave/my-leaves')
      setLeaves(data.leaves)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeaves() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await API.post('/leave/apply', form)
      setSuccess('Leave request submitted successfully!')
      setForm({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' })
      fetchLeaves()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting leave')
    } finally {
      setSubmitting(false)
    }
  }

  const getDays = () => {
    if (!form.fromDate || !form.toDate) return 0
    const diff = new Date(form.toDate) - new Date(form.fromDate)
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Apply for Leave</h1>
        <p className="text-gray-500 text-sm mt-1">Submit and track your leave requests</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Apply Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Leave Request</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Leave Type</label>
              <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned Leave</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">From Date</label>
                <input type="date" value={form.fromDate} required
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">To Date</label>
                <input type="date" value={form.toDate} required
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            {getDays() > 0 && (
              <div className="bg-indigo-50 text-primary px-4 py-2 rounded-lg text-sm font-medium">
                📅 Total Days: {getDays()}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Reason</label>
              <textarea value={form.reason} required rows={3}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Briefly explain the reason for leave..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">My Leave History</h2>
          {loading ? (
            <p className="text-gray-400 text-center py-8">Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No leave requests yet</p>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div key={leave._id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 capitalize">{leave.leaveType} Leave</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[leave.status]}`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(leave.fromDate).toLocaleDateString('en-IN')} → {new Date(leave.toDate).toLocaleDateString('en-IN')} ({leave.days} days)
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                  {leave.adminComment && (
                    <p className="text-xs text-indigo-600 mt-1 bg-indigo-50 px-2 py-1 rounded">
                      Admin: {leave.adminComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ApplyLeave