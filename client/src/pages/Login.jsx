import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineTruck, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    const accounts = {
      admin: { email: 'admin@courier.com', password: 'admin123' },
      business: { email: 'user@business.com', password: 'user123' },
      staff: { email: 'staff@courier.com', password: 'staff123' }
    };
    setFormData(accounts[type]);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900/50 via-dark-900 to-dark-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <HiOutlineTruck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">CourierHub</h1>
              <p className="text-sm text-dark-400">Unified Logistics Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-dark-100 mb-4">
            Simplify Your<br />
            <span className="gradient-text">Shipping Operations</span>
          </h2>
          <p className="text-dark-300 text-lg mb-8 max-w-md">
            Compare rates, track shipments, and manage your logistics with one powerful dashboard.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {['Compare Multiple Couriers', 'Real-time Tracking', 'Analytics & Reports'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-dark-200">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-dark-500 text-sm">
          © 2024 CourierHub. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <HiOutlineTruck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">CourierHub</h1>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-dark-100">Welcome Back</h2>
              <p className="text-dark-400 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-12 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-dark-300">
                  <input type="checkbox" className="rounded bg-dark-700 border-dark-600" />
                  Remember me
                </label>
                <a href="#" className="text-primary-400 hover:text-primary-300">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                  Create one
                </Link>
              </p>
            </div>

            {/* Demo accounts */}
            <div className="mt-8 pt-6 border-t border-dark-700">
              <p className="text-sm text-dark-400 text-center mb-3">Quick Demo Login</p>
              <div className="flex gap-2">
                <button onClick={() => fillDemo('admin')} className="btn-ghost flex-1 text-xs py-2">Admin</button>
                <button onClick={() => fillDemo('business')} className="btn-ghost flex-1 text-xs py-2">Business</button>
                <button onClick={() => fillDemo('staff')} className="btn-ghost flex-1 text-xs py-2">Staff</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
