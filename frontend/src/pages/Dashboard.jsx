import DashboardLayout from '../layouts/DashboardLayout'

const stats = [
  { label: 'Total Employees', value: '124', icon: '👥', color: 'bg-blue-50 text-blue-600' },
  { label: 'Present Today', value: '98', icon: '✅', color: 'bg-green-50 text-green-600' },
  { label: 'Monthly Revenue', value: '₹4.2L', icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Pending Invoices', value: '12', icon: '📄', color: 'bg-red-50 text-red-600' },
]

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { text: 'New employee Rahul Sharma added', time: '2 mins ago', icon: '👤' },
            { text: 'Invoice #1042 marked as paid', time: '1 hour ago', icon: '💳' },
            { text: 'Attendance report generated', time: '3 hours ago', icon: '📊' },
            { text: 'Low stock alert: Printer Paper', time: '5 hours ago', icon: '⚠️' },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard