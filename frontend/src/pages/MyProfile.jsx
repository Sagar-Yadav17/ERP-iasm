import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import API from '../api/axios'

const MyProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/leave/my-profile')
        setProfile(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const statusColor = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    'on-leave': 'bg-yellow-100 text-yellow-700',
  }

  if (loading) return <DashboardLayout><div className="text-center py-20 text-gray-400">Loading...</div></DashboardLayout>

  if (!profile) return <DashboardLayout><div className="text-center py-20 text-gray-400">Profile not found. Contact your admin.</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your employee information</p>
      </div>

      <div className="max-w-2xl">
        {/* Avatar Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5 flex items-center gap-5">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-3xl">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-500">{profile.designation}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-indigo-100 text-primary px-2 py-1 rounded-full">{profile.employeeId}</span>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[profile.status]}`}>{profile.status}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: profile.name },
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone },
              { label: 'Department', value: profile.department },
              { label: 'Designation', value: profile.designation },
              { label: 'Join Date', value: new Date(profile.joinDate).toLocaleDateString('en-IN') },
              { label: 'Salary', value: `₹${Number(profile.salary).toLocaleString()}` },
              { label: 'Address', value: profile.address || 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyProfile