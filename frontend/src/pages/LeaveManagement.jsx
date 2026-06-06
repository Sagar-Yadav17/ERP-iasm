import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [commentModal, setCommentModal] = useState({ open: false, leaveId: null, status: '' })
  const [comment, setComment] = useState('')

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/leave/all')
      setLeaves(data.leaves)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeaves() }, [])

  const handleAction = (leaveId, status) => {
    setCommentModal({ open: true, leaveId, status })
    setComment('')
  }

  const handleSubmit = async () => {
    try {
      await API.put(`/leave/${commentModal.leaveId}/status`, {
        status: commentModal.status,
        adminComment: comment,
      })
      setCommentModal({ open: false, leaveId: null, status: '' })
      fetchLeaves()
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating leave')
    }
  }

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter)

  const summary = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage employee leave requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Requests', value: summary.total, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'Pending', value: summary.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved', value: summary.approved, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: summary.rejected, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
      </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition
              ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Employee', 'Leave Type', 'Duration', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No leave requests found</td></tr>
              ) : filtered.map(leave => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                        {leave.employeeName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 whitespace-nowrap">{leave.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 capitalize text-gray-600">{leave.leaveType} Leave</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">
                    {new Date(leave.fromDate).toLocaleDateString('en-IN')} →<br />
                    {new Date(leave.toDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{leave.days} days</td>
                  <td className="px-5 py-4 text-gray-600 max-w-[250px]">{leave.reason}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[leave.status]}`}>
                      {leave.status}
                    </span>
                    {leave.adminComment && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{leave.adminComment}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {leave.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(leave._id, 'approved')}
                          className="text-green-600 hover:text-green-800 text-xs font-medium bg-green-50 px-2 py-1 rounded-lg">
                          ✅ Approve
                        </button>
                        <button onClick={() => handleAction(leave._id, 'rejected')}
                          className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 px-2 py-1 rounded-lg">
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAction(leave._id, leave.status === 'approved' ? 'rejected' : 'approved')}
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium">
                        Change
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comment Modal */}
        {commentModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {commentModal.status === 'approved' ? '✅ Approve Leave' : '❌ Reject Leave'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">Add a comment (optional)</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Add reason or note for employee..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setCommentModal({ open: false, leaveId: null, status: '' })}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className={`flex-1 text-white py-2 rounded-lg text-sm font-medium transition
                  ${commentModal.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                  {commentModal.status === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  )
}

export default LeaveManagement