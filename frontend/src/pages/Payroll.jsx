import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [workingDays, setWorkingDays] = useState(26)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [editPayroll, setEditPayroll] = useState(null)

  const fetchPayrolls = async () => {
    try {
      setLoading(true)
      const { data } = await API.get(`/payroll?month=${selectedMonth}&year=${selectedYear}`)
      setPayrolls(data.payrolls)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayrolls() }, [selectedMonth, selectedYear])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const { data } = await API.post('/payroll/generate', {
        month: selectedMonth,
        year: selectedYear,
        workingDays,
      })
      alert(`✅ ${data.message}`)
      setShowGenerateModal(false)
      fetchPayrolls()
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating payroll')
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkAllPaid = async () => {
    if (!confirm('Mark all payrolls as paid?')) return
    await API.put('/payroll/mark-all-paid', { month: selectedMonth, year: selectedYear })
    fetchPayrolls()
  }

  const downloadSlip = async (id, name) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/payroll/${id}/slip`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Salary-Slip-${name}-${months[selectedMonth - 1]}-${selectedYear}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Error downloading slip')
    }
  }

  const totalNetSalary = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalGross = payrolls.reduce((s, p) => s + p.grossSalary, 0)
  const paidCount = payrolls.filter(p => p.status === 'paid').length

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and manage employee salaries</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
          </select>
          {payrolls.length > 0 && paidCount < payrolls.length && (
            <button onClick={handleMarkAllPaid}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
              ✅ Mark All Paid
            </button>
          )}
          <button onClick={() => setShowGenerateModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
            ⚡ Generate Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Employees', value: payrolls.length, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'Gross Salary', value: `₹${totalGross.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Net Payable', value: `₹${totalNetSalary.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Paid', value: `${paidCount}/${payrolls.length}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Employee', 'Department', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <div className="text-4xl mb-3">💰</div>
                  <p className="text-gray-500 font-medium">No payroll generated yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click "Generate Payroll" to create salary records</p>
                </td>
              </tr>
            ) : payrolls.map(p => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                      {p.employeeName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{p.employeeName}</p>
                      <p className="text-xs text-gray-400">{p.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-600">{p.department}</td>
                <td className="px-4 py-4 text-gray-700">₹{p.basicSalary.toLocaleString()}</td>
                <td className="px-4 py-4 text-green-600">+₹{p.totalAllowances.toLocaleString()}</td>
                <td className="px-4 py-4 text-red-500">-₹{p.totalDeductions.toLocaleString()}</td>
                <td className="px-4 py-4 font-bold text-gray-800">₹{p.netSalary.toLocaleString()}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => downloadSlip(p._id, p.employeeName)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      📄 Slip
                    </button>
                    <button onClick={() => setEditPayroll(p)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                      Edit
                    </button>
                    <button onClick={async () => {
                      if (!confirm('Delete?')) return
                      await API.delete(`/payroll/${p._id}`)
                      fetchPayrolls()
                    }} className="text-red-500 hover:text-red-700 text-xs font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Generate Payroll</h2>
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
                Generating payroll for <strong>{months[selectedMonth - 1]} {selectedYear}</strong>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Working Days</label>
                <input type="number" value={workingDays} min="1" max="31"
                  onChange={e => setWorkingDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-gray-400 mt-1">Standard working days this month</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                <p>✅ Auto calculates HRA (40% of basic)</p>
                <p>✅ Transport allowance: ₹1,600</p>
                <p>✅ Medical allowance: ₹1,250</p>
                <p>✅ PF deduction (12% of basic)</p>
                <p>✅ Absence deduction based on attendance</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGenerateModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={generating}
                className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-60">
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {editPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Edit — {editPayroll.employeeName}</h2>
              <button onClick={() => setEditPayroll(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-green-600 mb-3">Allowances (₹)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(editPayroll.allowances).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-500 block mb-1 capitalize">{key}</label>
                      <input type="number" value={val}
                        onChange={e => setEditPayroll({
                          ...editPayroll,
                          allowances: { ...editPayroll.allowances, [key]: Number(e.target.value) }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-500 mb-3">Deductions (₹)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(editPayroll.deductions).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-500 block mb-1 capitalize">{key}</label>
                      <input type="number" value={val}
                        onChange={e => setEditPayroll({
                          ...editPayroll,
                          deductions: { ...editPayroll.deductions, [key]: Number(e.target.value) }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                <select value={editPayroll.status}
                  onChange={e => setEditPayroll({ ...editPayroll, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="draft">Draft</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <textarea value={editPayroll.notes || ''} rows={2}
                  onChange={e => setEditPayroll({ ...editPayroll, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditPayroll(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={async () => {
                  await API.put(`/payroll/${editPayroll._id}`, {
                    allowances: editPayroll.allowances,
                    deductions: editPayroll.deductions,
                    notes: editPayroll.notes,
                    status: editPayroll.status,
                  })
                  setEditPayroll(null)
                  fetchPayrolls()
                }} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Payroll