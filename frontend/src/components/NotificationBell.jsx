import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id) => {
    await API.put(`/notifications/${id}/read`)
    fetchNotifications()
  }

  const markAllAsRead = async () => {
    await API.put('/notifications/read-all')
    fetchNotifications()
  }

  const deleteNotif = async (e, id) => {
    e.stopPropagation()
    await API.delete(`/notifications/${id}`)
    fetchNotifications()
  }

  const handleClick = (notif) => {
    markAsRead(notif._id)
    if (notif.link) navigate(notif.link)
    setOpen(false)
  }

  const formatTime = (time) => {
    const diff = Math.floor((new Date() - new Date(time)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const typeColor = {
    leave: 'bg-blue-50 border-blue-200',
    attendance: 'bg-green-50 border-green-200',
    inventory: 'bg-yellow-50 border-yellow-200',
    finance: 'bg-purple-50 border-purple-200',
    general: 'bg-gray-50 border-gray-200',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => handleClick(notif)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition relative
                  ${!notif.read ? 'bg-indigo-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{notif.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => deleteNotif(e, notif._id)}
                      className="text-gray-300 hover:text-red-400 transition p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <button onClick={() => setOpen(false)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell