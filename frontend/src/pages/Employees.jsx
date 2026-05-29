import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const departments = ['All', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations']

const statusColor = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  'on-leave': 'bg-yellow-100 text-yellow-700',
}

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: 'Engineering',
    designation: '', salary: '', joinDate: '', status: 'active',
    address: '', password: ''
  })

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (department !== 'All') params.department = department
      const { data } = await API.get('/employees', { params })
      setEmployees(data.employees)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmployees() }, [search, department])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editEmployee) {
        await API.put(`/employees/${editEmployee._id}`, form)
      } else {
        await API.post('/employees', form)
        const pwd = form.password || 'Welcome@123'
        alert(`✅ Employee created successfully!\n\nLogin Credentials:\nEmail: ${form.email}\nPassword: ${pwd}\n\nPlease share these credentials with the employee.`)
      }
      setShowModal(false)
      setEditEmployee(null)
      setForm({
        name: '', email: '', phone: '', department: 'Engineering',
        designation: '', salary: '', joinDate: '', status: 'active',
        address: '', password: ''
      })
      fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving employee')
    }
  }

  const handleEdit = (emp) => {
    setEditEmployee(emp)
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone,
      department: emp.department, designation: emp.designation,
      salary: emp.salary, joinDate: emp.joinDate?.split('T')[0],
      status: emp.status, address: emp.address, password: ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee? Their login account will also be deleted.')) return
    await API.delete(`/employees/${id}`)
    fetchEmployees()
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your team members</p>
        </div>
        <button
          onClick={() => { setEditEmployee(null); setShowModal(true) }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition"
        >
          + Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Employee', 'Department', 'Designation', 'Salary', 'Join Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No employees found. Add your first employee!</td></tr>
            ) : employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{emp.department}</td>
                <td className="px-5 py-4 text-gray-600">{emp.designation}</td>
                <td className="px-5 py-4 text-gray-600">₹{Number(emp.salary).toLocaleString()}</td>
                <td className="px-5 py-4 text-gray-600">{new Date(emp.joinDate).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[emp.status]}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(emp)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                    <button onClick={() => handleDelete(emp._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{editEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {!editEmployee && (
              <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
                ℹ️ A login account will be automatically created with the password you set below.
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'text' },
                { label: 'Designation', key: 'designation', type: 'text' },
                { label: 'Salary (₹)', key: 'salary', type: 'number' },
                { label: 'Join Date', key: 'joinDate', type: 'date' },
                { label: 'Address', key: 'address', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key !== 'address'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}

              {/* Password — only in add mode */}
              {!editEmployee && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Login Password</label>
                  <input
                    type="text"
                    placeholder="Leave empty for default: Welcome@123"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1">Min 6 characters. Default is Welcome@123 if left empty.</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {departments.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
                  {editEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Employees