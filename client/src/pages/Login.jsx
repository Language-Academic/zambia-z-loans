import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Security password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(formData);

    if (result.success) {
      const redirectTo = result.data.role === 'SUPER_ADMIN' ? '/admin' : from;
      navigate(redirectTo, { replace: true });
    } else {
      setErrors({ general: result.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-md w-full">
        {/* Branding Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100 mb-6 rotate-3">
            <span className="text-white text-3xl font-black italic">Z</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-slate-500 font-medium italic">Secure access to Zambia Z Portal</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Authorized Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-blue-500'}`} />
                </div>
                <input
                  name="email"
                  type="email"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 ${errors.email ? 'border-rose-100 focus:border-rose-500' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-[11px] font-bold text-rose-500 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Secure Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-blue-500'}`} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 ${errors.password ? 'border-rose-100 focus:border-rose-500' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-blue-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-[11px] font-bold text-rose-500 ml-1">{errors.password}</p>
              )}
            </div>

            {/* General Error Notification */}
            {errors.general && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                <p className="text-[11px] font-bold text-rose-600 leading-tight uppercase tracking-tight">{errors.general}</p>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {isLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              New to Zambia Z?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-slate-900 transition-colors ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">256-bit Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
