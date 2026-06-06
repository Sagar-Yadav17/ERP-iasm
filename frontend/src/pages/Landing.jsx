import { useNavigate } from 'react-router-dom'

const Landing = () => {
    const navigate = useNavigate()

    const features = [
        { icon: '👥', title: 'Employee Management', desc: 'Add, manage and track all employees with role-based access control.' },
        { icon: '📅', title: 'Attendance Tracking', desc: 'Mark daily attendance, view monthly reports and manage leaves easily.' },
        { icon: '💰', title: 'Finance & Invoicing', desc: 'Create invoices, track expenses and download PDF reports instantly.' },
        { icon: '📦', title: 'Inventory Control', desc: 'Manage stock levels, get low stock alerts and track suppliers.' },
        { icon: '📊', title: 'Analytics & Reports', desc: 'Interactive charts and real-time data for smarter decisions.' },
        { icon: '🏖️', title: 'Leave Management', desc: 'Employees apply for leave, admin approves or rejects with comments.' },
    ]

    const plans = [
        {
            name: 'Starter',
            price: '₹999',
            period: '/month',
            color: 'border-gray-200',
            btnColor: 'bg-gray-800 hover:bg-gray-900',
            features: ['Up to 10 employees', 'Basic attendance', 'Invoice generation', 'Email support'],
            popular: false,
        },
        {
            name: 'Professional',
            price: '₹2,499',
            period: '/month',
            color: 'border-indigo-500',
            btnColor: 'bg-indigo-600 hover:bg-indigo-700',
            features: ['Up to 50 employees', 'Full attendance + leaves', 'Finance + PDF export', 'Inventory management', 'Analytics dashboard', 'Priority support'],
            popular: true,
        },
        {
            name: 'Enterprise',
            price: '₹4,999',
            period: '/month',
            color: 'border-gray-200',
            btnColor: 'bg-gray-800 hover:bg-gray-900',
            features: ['Unlimited employees', 'All Pro features', 'Multi-branch support', 'Custom branding', 'Dedicated support', 'API access'],
            popular: false,
        },
    ]

    const testimonials = [
        { name: 'Ramesh Gupta', role: 'Principal, DPS School', text: 'This ERP transformed how we manage staff attendance and payroll. Saved us hours every week!', avatar: 'R' },
        { name: 'Priya Sharma', role: 'HR Manager, TechCorp', text: 'Leave management and invoicing in one place is a game changer. Our team loves the clean interface.', avatar: 'P' },
        { name: 'Arjun Mehta', role: 'CEO, StartupXYZ', text: 'Best investment for our 30-person company. Setup was easy and support is excellent.', avatar: 'A' },
    ]

    return (
        <div className="min-h-screen bg-white">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Z</span>
                        </div>
                        <span className="font-bold text-gray-800 text-lg">Zubron ERP</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-gray-600 hover:text-indigo-600 transition">Features</a>
                        <a href="#pricing" className="text-sm text-gray-600 hover:text-indigo-600 transition">Pricing</a>
                        <a href="#testimonials" className="text-sm text-gray-600 hover:text-indigo-600 transition">Reviews</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition">
                            Login
                        </button>
                        <button onClick={() => navigate('/login')}
                            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                        🚀 Trusted by 500+ businesses across India
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                        Manage Your Business
                        <span className="text-indigo-600"> Smarter</span>
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Complete ERP solution for schools and companies. HR, Finance, Inventory, Attendance — all in one powerful platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/register')}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                            Start Free Trial →
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition">
                            Watch Demo 🎥
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">No credit card required • 14-day free trial</p>
                </div>

                {/* Hero Image / Dashboard Preview */}
                <div className="max-w-5xl mx-auto mt-16">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 ml-2">app.zubron.com/dashboard</div>
                        </div>
                        <div className="p-6 bg-gray-50">
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: 'Total Employees', value: '124', icon: '👥', color: 'bg-blue-50' },
                                    { label: 'Present Today', value: '98', icon: '✅', color: 'bg-green-50' },
                                    { label: 'Monthly Revenue', value: '₹4.2L', icon: '💰', color: 'bg-yellow-50' },
                                    { label: 'Pending Invoices', value: '12', icon: '📄', color: 'bg-red-50' },
                                ].map(s => (
                                    <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                                        <div className="text-2xl mb-2">{s.icon}</div>
                                        <div className="text-xl font-bold text-gray-800">{s.value}</div>
                                        <div className="text-xs text-gray-500">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</div>
                                {[
                                    { text: 'New employee Rahul Sharma added', icon: '👤', time: '2 mins ago' },
                                    { text: 'Invoice INV0042 marked as paid', icon: '💳', time: '1 hour ago' },
                                    { text: 'Priya Kumar applied for sick leave', icon: '🏖️', time: '3 hours ago' },
                                ].map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-lg">{a.icon}</span>
                                        <span className="text-sm text-gray-600 flex-1">{a.text}</span>
                                        <span className="text-xs text-gray-400">{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to run your business</h2>
                        <p className="text-gray-500 text-lg">Powerful features designed for schools and companies of all sizes</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-indigo-600">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: '500+', label: 'Businesses' },
                        { value: '10,000+', label: 'Employees Managed' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '4.9★', label: 'Rating' },
                    ].map(s => (
                        <div key={s.label}>
                            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                            <div className="text-indigo-200 text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
                        <p className="text-gray-500 text-lg">No hidden fees. Cancel anytime.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.name}
                                className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative ${plan.popular ? 'shadow-xl scale-105' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-gray-500 text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="text-green-500 font-bold">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/register')}
                                    className={`w-full ${plan.btnColor} text-white py-3 rounded-xl font-semibold transition`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by businesses across India</h2>
                        <p className="text-gray-500 text-lg">See what our customers are saying</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                                        <p className="text-gray-400 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your business?</h2>
                    <p className="text-indigo-200 text-lg mb-8">Join 500+ businesses already using Zubron ERP</p>
                    <button onClick={() => navigate('/register')}
                        className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-lg">
                        Start Free Trial Today →
                    </button>
                    <p className="text-indigo-300 text-sm mt-4">No credit card • Setup in 5 minutes • Cancel anytime</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-6 bg-gray-900">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">Z</span>
                        </div>
                        <span className="font-bold text-white">Zubron ERP</span>
                    </div>
                    <p className="text-gray-400 text-sm">© 2026 Zubron ERP. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing