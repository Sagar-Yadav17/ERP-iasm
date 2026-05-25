import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Finance from './pages/Finance'
import Attendance from './pages/Attendance'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute roles={['superadmin', 'admin']}><Employees /></ProtectedRoute>
        } />
        <Route path="/finance" element={
          <ProtectedRoute roles={['superadmin', 'admin']}><Finance /></ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute roles={['superadmin', 'admin']}><Attendance /></ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute roles={['superadmin', 'admin']}><Inventory /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App