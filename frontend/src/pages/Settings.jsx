import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'
import useAuthStore from '../store/authStore'

const Settings = () => {
  const { user, setAuth, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    currency: '₹',
    timezone: 'Asia/Kolkata',
  })

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings')
      setCompanyForm({
        companyName: data.companyName || '',
        companyEmail: data.companyEmail || '',
        companyPhone: data.companyPhone || '',
        companyAddress: data.companyAddress || '',
        currency: data.currency || '₹',
        timezone: data.timezone || 'Asia/Kolkata',
      })
    } catch (err) {
      console.error(err)
    }
  }

  const showSuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 3000)
  }

  const showError = (msg) => {
    setError(msg)
    setSuccess('')
    setTimeout(() => setError(''), 3000)
  }

  const handleCompanySubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await API.put('/settings', companyForm)
      showSuccess('Company settings updated successfully!')
    } catch (err) {
      showError(err.response?.data?.message || 'Error updating settings')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await API.put('/settings/profile', profileForm)
      setAuth(data, token)
      showSuccess('Profile updated successfully!')
    } catch (err) {
      showError(err.response?.data?.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showError('New passwords do not match!')
    }
    if (passwordForm.newPassword.length < 6) {
      return showError('Password must be at least 6 characters!')
    }
    try {
      setLoading(true)
      await API.put('/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showSuccess('Password changed successfully!')
    } catch (err) {
      showError(err.response?.data?.message || 'Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'company', label: '🏢 Company', },
    { id: 'profile', label: '👤 Profile', },
    { id: 'password', label: '🔒 Password', },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your company and account settings</p>
      </div>

      {/* Alert Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          ❌ {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition border-b border-gray-100 last:border-0
                  ${activeTab === tab.id ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* Company Settings */}
          {activeTab === 'company' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Company Information</h2>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                {[
                  { label: 'Company Name', key: 'companyName', type: 'text', placeholder: 'Zubron Systems' },
                  { label: 'Company Email', key: 'companyEmail', type: 'email', placeholder: 'info@zubron.com' },
                  { label: 'Company Phone', key: 'companyPhone', type: 'text', placeholder: '+91 9876543210' },
                  { label: 'Company Address', key: 'companyAddress', type: 'text', placeholder: '123 Business Park, Mumbai' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={companyForm[key]}
                      onChange={(e) => setCompanyForm({ ...companyForm, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Currency</label>
                    <select value={companyForm.currency}
                      onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="₹">₹ Indian Rupee</option>
                      <option value="$">$ US Dollar</option>
                      <option value="€">€ Euro</option>
                      <option value="£">£ British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Timezone</label>
                    <select value={companyForm.timezone}
                      onChange={(e) => setCompanyForm({ ...companyForm, timezone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-60">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="text-xs bg-indigo-100 text-primary px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                    {user?.role}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                  <input type="text" value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input type="email" value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                  <input type="text" value={user?.role} disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 capitalize" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tenant ID</label>
                  <input type="text" value={user?.tenantId} disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
                </div>
                <button type="submit" disabled={loading}
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-60">
                  {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Password Settings */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                {[
                  { label: 'Current Password', key: 'currentPassword' },
                  { label: 'New Password', key: 'newPassword' },
                  { label: 'Confirm New Password', key: 'confirmPassword' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                    <input type="password" value={passwordForm[key]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-60">
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings