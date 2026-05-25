import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import useAuthStore from '../store/authStore'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await API.post('/auth/login', { email, password })
      setAuth(data.user, data.accessToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE */}
        <div className="bg-[#3f3f46] text-white flex items-center justify-center px-8 md:px-20">
          <div className="w-full max-w-md">

            <div className="mb-14">
              <h1 className="text-5xl font-bold mb-3 tracking-wide">
                Login
              </h1>

              <p className="text-gray-200 text-lg">
                Welcome back to ERP System
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-300 text-red-100 px-4 py-3 rounded mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              <div>
                <label className="block text-sm mb-2 text-gray-200">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                  className="w-full bg-transparent border-b border-gray-300 py-3 outline-none text-lg placeholder-gray-300 focus:border-white transition"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-200">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-transparent border-b border-gray-300 py-3 outline-none text-lg placeholder-gray-300 focus:border-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/20 transition-all duration-300 py-4 text-lg font-semibold tracking-wide rounded-sm shadow-lg disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'LOGIN'}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex relative h-screen">

          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="office"
            className="w-full h-full object-cover brightness-90 opacity-70"
          />

          <div className="absolute inset-0 bg-white/10 flex flex-col justify-center px-16">

            <h2 className="text-6xl font-bold text-gray-900 leading-tight">
              Speed up <br /> data entry
            </h2>

            <p className="text-gray-700 mt-6 text-lg max-w-md leading-relaxed">
              Use ERP to efficiently manage employees,
              attendance, payroll and workflow in one place.
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Login