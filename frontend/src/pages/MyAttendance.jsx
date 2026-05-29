{/* Records Table */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
  <table className="w-full min-w-[700px] text-sm">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {['Date', 'Day', 'Status', 'Check In', 'Check Out'].map(h => (
          <th
            key={h}
            className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {loading ? (
        <tr>
          <td colSpan={5} className="text-center py-10 text-gray-400">
            Loading...
          </td>
        </tr>
      ) : records.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-10 text-gray-400">
            No attendance records for this month
          </td>
        </tr>
      ) : (
        records.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-5 py-4 text-gray-800 whitespace-nowrap">
              {new Date(r.date).toLocaleDateString('en-IN')}
            </td>

            <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
              {new Date(r.date).toLocaleDateString('en-IN', {
                weekday: 'long',
              })}
            </td>

            <td className="px-5 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[r.status]}`}
              >
                {r.status}
              </span>
            </td>

            <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
              {r.checkIn || '—'}
            </td>

            <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
              {r.checkOut || '—'}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>