import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import NotificationBell from '../components/NotificationBell'

const allMenuItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard', roles: ['superadmin', 'admin', 'staff'] },
  { path: '/employees', icon: '👥', label: 'Employees', roles: ['superadmin', 'admin'] },
  { path: '/attendance', icon: '📅', label: 'Attendance', roles: ['superadmin', 'admin'] },
  { path: '/finance', icon: '💰', label: 'Finance', roles: ['superadmin', 'admin'] },
  { path: '/inventory', icon: '📦', label: 'Inventory', roles: ['superadmin', 'admin'] },
  { path: '/reports', icon: '📊', label: 'Reports', roles: ['superadmin', 'admin'] },
  { path: '/leave-management', icon: '📋', label: 'Leave Requests', roles: ['superadmin', 'admin'] },
  { path: '/my-profile', icon: '👤', label: 'My Profile', roles: ['staff'] },
  { path: '/my-attendance', icon: '📅', label: 'My Attendance', roles: ['staff'] },
  { path: '/apply-leave', icon: '🏖️', label: 'Apply Leave', roles: ['staff'] },
  { path: '/settings', icon: '⚙️', label: 'Settings', roles: ['superadmin', 'admin', 'staff'] },
]

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span
            onClick={() => navigate('/dashboard')}
            className="ml-3 font-bold text-gray-800 text-lg cursor-pointer hover:text-indigo-600 transition truncate"
          >
            Zubron ERP
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition text-left px-2"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ☰
          </button>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            <span className="hidden sm:block text-sm text-gray-500">
              Welcome, <span className="font-semibold text-gray-800">{user?.name}</span>
            </span>

            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout