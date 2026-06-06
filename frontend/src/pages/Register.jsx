import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import useAuthStore from '../store/authStore'

const Register = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    companyType: 'company',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const companyTypes = [
    { value: 'school', label: '🏫 School / College', desc: 'For educational institutions' },
    { value: 'company', label: '🏢 Company / Startup', desc: 'For businesses of all sizes' },
    { value: 'hospital', label: '🏥 Hospital / Clinic', desc: 'For healthcare organizations' },
    { value: 'ngo', label: '🤝 NGO / Non-profit', desc: 'For non-profit organizations' },
  ]

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleNext = () => {
    if (step === 1) {
      if (!form.companyName) return setError('Company name is required')
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')

    try {
      setLoading(true)
      const { data } = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        companyType: form.companyType,
      })
      setAuth(data.user, data.accessToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start your 14-day free trial. No credit card required.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`w-16 h-1 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Step 1 — Company Info */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Tell us about your organization</h2>
              <p className="text-gray-500 text-sm mb-6">We'll set up everything based on your needs</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 block mb-1">Organization Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Delhi Public School, TechCorp India"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-3">Organization Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {companyTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, companyType: type.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all
                        ${form.companyType === type.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'}`}
                    >
                      <div className="text-sm font-medium text-gray-800">{type.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Personal Info */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="p-8">
              <button type="button" onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
                ← Back
              </button>

              <h2 className="text-lg font-bold text-gray-800 mb-1">Create your admin account</h2>
              <p className="text-gray-500 text-sm mb-6">You'll be the super admin of <span className="font-medium text-indigo-600">{form.companyName}</span></p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Work Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
                  {loading ? 'Creating account...' : '🚀 Create Account'}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                By signing up you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register