import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const categories = ['All', 'Electronics', 'Furniture', 'Stationery', 'Equipment', 'Other']

const statusColor = {
  'in-stock': 'bg-green-100 text-green-700',
  'low-stock': 'bg-yellow-100 text-yellow-700',
  'out-of-stock': 'bg-red-100 text-red-700',
}

const Inventory = () => {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({
    name: '', category: 'Electronics', quantity: '', unit: 'pcs',
    price: '', supplier: '', minStock: 10, description: ''
  })

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      const { data } = await API.get('/inventory', { params })
      setItems(data.items)
      setStats({ total: data.total, lowStock: data.lowStock, outOfStock: data.outOfStock })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [search, category])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editItem) {
        await API.put(`/inventory/${editItem._id}`, form)
      } else {
        await API.post('/inventory', form)
      }
      setShowModal(false)
      setEditItem(null)
      setForm({ name: '', category: 'Electronics', quantity: '', unit: 'pcs', price: '', supplier: '', minStock: 10, description: '' })
      fetchItems()
    } catch (err) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setForm({
      name: item.name, category: item.category, quantity: item.quantity,
      unit: item.unit, price: item.price, supplier: item.supplier,
      minStock: item.minStock, description: item.description
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    await API.delete(`/inventory/${id}`)
    fetchItems()
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage stock and assets</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true) }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
          + Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Items', value: stats.total || 0, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'Low Stock', value: stats.lowStock || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Out of Stock', value: stats.outOfStock || 0, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-col md:flex-row gap-4">
        <input type="text" placeholder="Search items..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Item', 'Category', 'Quantity', 'Price', 'Supplier', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No items found. Add your first item!</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{item.category}</td>
                <td className="px-5 py-4">
                  <span className={`font-semibold ${item.quantity === 0 ? 'text-red-600' : item.quantity <= item.minStock ? 'text-yellow-600' : 'text-gray-800'}`}>
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-600">₹{Number(item.price).toLocaleString()}</td>
                <td className="px-5 py-4 text-gray-600">{item.supplier || '-'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Edit Item' : 'Add Item'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Item Name', key: 'name', type: 'text' },
                { label: 'Quantity', key: 'quantity', type: 'number' },
                { label: 'Unit (pcs/kg/ltr)', key: 'unit', type: 'text' },
                { label: 'Price (₹)', key: 'price', type: 'number' },
                { label: 'Min Stock Alert', key: 'minStock', type: 'number' },
                { label: 'Supplier', key: 'supplier', type: 'text' },
                { label: 'Description', key: 'description', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input type={type} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={['name', 'quantity', 'price'].includes(key)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
                  {editItem ? 'Update' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Inventory