import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const statusColor = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  paid: 'bg-green-100 text-green-600',
  overdue: 'bg-red-100 text-red-600',
}

const Finance = () => {
  const [tab, setTab] = useState('invoices')
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '', clientEmail: '', dueDate: '', status: 'draft', notes: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    tax: 0,
  })

  const [expenseForm, setExpenseForm] = useState({
    title: '', amount: '', category: 'Other', date: '', description: '', paidBy: ''
  })

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [inv, exp, sum] = await Promise.all([
        API.get('/finance/invoices'),
        API.get('/finance/expenses'),
        API.get('/finance/summary'),
      ])
      setInvoices(inv.data.invoices)
      setExpenses(exp.data.expenses)
      setSummary(sum.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const updateItem = (i, field, value) => {
    const items = [...invoiceForm.items]
    items[i][field] = value
    items[i].amount = items[i].quantity * items[i].rate
    const subtotal = items.reduce((s, it) => s + it.amount, 0)
    setInvoiceForm({ ...invoiceForm, items, subtotal })
  }

  const addItem = () => setInvoiceForm({
    ...invoiceForm,
    items: [...invoiceForm.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
  })

  const subtotal = invoiceForm.items.reduce((s, i) => s + i.amount, 0)
  const total = subtotal + (subtotal * invoiceForm.tax / 100)

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/finance/invoices', { ...invoiceForm, subtotal, total })
      setShowModal(false)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating invoice')
    }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/finance/expenses', expenseForm)
      setShowModal(false)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding expense')
    }
  }

  const handleStatusChange = async (id, status) => {
    await API.put(`/finance/invoices/${id}`, { status })
    fetchAll()
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Finance</h1>
          <p className="text-gray-500 text-sm mt-1">Invoices, expenses and financial overview</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
          + {tab === 'invoices' ? 'New Invoice' : 'Add Expense'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Expenses', value: `₹${(summary.totalExpenses || 0).toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Net Profit', value: `₹${(summary.profit || 0).toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Amount', value: `₹${(summary.pending || 0).toLocaleString()}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-xs font-medium ${s.color} ${s.bg} px-2 py-1 rounded-md inline-block mb-2`}>{s.label}</div>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['invoices', 'expenses'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition
              ${tab === t ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Invoice #', 'Client', 'Total', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No invoices yet</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-primary">{inv.invoiceNumber}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{inv.clientName}</p>
                    <p className="text-xs text-gray-400">{inv.clientEmail}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-800">₹{inv.total.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-600">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <select value={inv.status} onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColor[inv.status]}`}>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => API.delete(`/finance/invoices/${inv._id}`).then(fetchAll)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses Table */}
      {tab === 'expenses' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Category', 'Amount', 'Date', 'Paid By', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No expenses yet</td></tr>
              ) : expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-800">{exp.title}</td>
                  <td className="px-5 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{exp.category}</span></td>
                  <td className="px-5 py-4 font-semibold text-red-600">₹{Number(exp.amount).toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-600">{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4 text-gray-600">{exp.paidBy}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => API.delete(`/finance/expenses/${exp._id}`).then(fetchAll)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      {showModal && tab === 'invoices' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">New Invoice</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleInvoiceSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Client Name</label>
                  <input type="text" required value={invoiceForm.clientName}
                    onChange={e => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Client Email</label>
                  <input type="email" required value={invoiceForm.clientEmail}
                    onChange={e => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Due Date</label>
                  <input type="date" required value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tax (%)</label>
                  <input type="number" value={invoiceForm.tax}
                    onChange={e => setInvoiceForm({ ...invoiceForm, tax: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Items</label>
                {invoiceForm.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <input placeholder="Description" value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" placeholder="Qty" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" placeholder="Rate" value={item.rate}
                      onChange={e => updateItem(i, 'rate', Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                ))}
                <button type="button" onClick={addItem}
                  className="text-primary text-sm font-medium hover:underline">+ Add Item</button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>Tax ({invoiceForm.tax}%)</span><span>₹{(subtotal * invoiceForm.tax / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showModal && tab === 'expenses' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Add Expense</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              {[
                { label: 'Title', key: 'title', type: 'text' },
                { label: 'Amount (₹)', key: 'amount', type: 'number' },
                { label: 'Date', key: 'date', type: 'date' },
                { label: 'Paid By', key: 'paidBy', type: 'text' },
                { label: 'Description', key: 'description', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input type={type} value={expenseForm[key]} required={key !== 'description'}
                    onChange={e => setExpenseForm({ ...expenseForm, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {['Salary', 'Rent', 'Utilities', 'Marketing', 'Travel', 'Equipment', 'Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Finance