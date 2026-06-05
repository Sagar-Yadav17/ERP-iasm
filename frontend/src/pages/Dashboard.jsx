import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'
import useAuthStore from '../store/authStore'

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [isStaff, setIsStaff] = useState(false)
  const { user } = useAuthStore()

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/dashboard')
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
      setIsStaff(data.isStaff || false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const formatTime = (time) => {
    const diff = Math.floor((new Date() - new Date(time)) / 1000)
    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const formatRevenue = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  // Admin stat cards
  const adminCards = [
    { label: 'Total Employees', value: loading ? '...' : stats.totalEmployees || 0, icon: '👥', color: 'bg-blue-50 text-blue-600', sub: 'Active employees' },
    { label: 'Present Today', value: loading ? '...' : stats.presentToday || 0, icon: '✅', color: 'bg-green-50 text-green-600', sub: 'Marked present' },
    { label: 'Monthly Revenue', value: loading ? '...' : formatRevenue(stats.monthlyRevenue || 0), icon: '💰', color: 'bg-yellow-50 text-yellow-600', sub: 'This month' },
    { label: 'Pending Invoices', value: loading ? '...' : stats.pendingInvoices || 0, icon: '📄', color: 'bg-red-50 text-red-600', sub: 'Awaiting payment' },
  ]

  // Staff stat cards
  const staffCards = [
    { label: 'Days Attended', value: loading ? '...' : stats.totalEmployees || 0, icon: '📅', color: 'bg-blue-50 text-blue-600', sub: 'This month' },
    { label: 'Days Present', value: loading ? '...' : stats.presentToday || 0, icon: '✅', color: 'bg-green-50 text-green-600', sub: 'This month' },
    { label: 'Pending Leaves', value: loading ? '...' : stats.pendingInvoices || 0, icon: '🏖️', color: 'bg-yellow-50 text-yellow-600', sub: 'Awaiting approval' },
    { label: 'My Department', value: loading ? '...' : user?.role || 'Staff', icon: '👤', color: 'bg-purple-50 text-purple-600', sub: 'Your role' },
  ]

  const statCards = isStaff ? staffCards : adminCards

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isStaff ? `Welcome, ${user?.name}! 👋` : 'Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isStaff ? 'Here is your personal activity overview' : "Welcome back! Here's what's happening today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-700 mt-1 font-medium">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert — admin only */}
      {!isStaff && stats.lowStockItems > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">{stats.lowStockItems} item(s) running low on stock!</p>
            <p className="text-sm text-yellow-600">Check inventory to reorder before stock runs out.</p>
          </div>
          <a href="/inventory" className="ml-auto text-sm font-medium text-yellow-700 hover:underline">View Inventory →</a>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            {isStaff ? 'My Recent Activity' : 'Recent Activity'}
          </h2>
          <button onClick={fetchDashboard} className="text-xs text-primary hover:underline">Refresh</button>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-6 py-10 text-center text-gray-400">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400">
              {isStaff ? 'No recent activity. Your attendance and leave updates will appear here.' : 'No recent activity'}
            </div>
          ) : recentActivity.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-start gap-4">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatTime(item.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard