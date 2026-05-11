import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, Fingerprint, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nationalId: '',
    password: '',
    isCitizen: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Pro-level password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return strength;
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.fullName.trim().length < 3) newErrors.fullName = 'Please enter your full legal name';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Valid institutional email required';
    if (!/^\d{6,10}$/.test(formData.nationalId)) newErrors.nationalId = 'Enter a valid National ID number';
    if (passwordStrength < 75) newErrors.password = 'Security level insufficient (Add numbers/symbols)';
    if (!formData.isCitizen) newErrors.isCitizen = 'Citizenship verification is mandatory';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.message || 'Verification service unreachable' });
      }
    } catch (err) {
      setErrors({ general: 'A technical error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200 mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ZAMBIA Z</h2>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Secure Capital Access</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Legal Name</label>
              <div className="relative">
                <input
                  name="fullName"
                  type="text"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold transition-all focus:ring-4 focus:ring-blue-50 outline-none ${errors.fullName ? 'border-rose-300' : 'border-slate-100 focus:border-blue-400'}`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              </div>
              {errors.fullName && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold transition-all focus:ring-4 focus:ring-blue-50 outline-none ${errors.email ? 'border-rose-300' : 'border-slate-100 focus:border-blue-400'}`}
                  placeholder="name@provider.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.email}</p>}
            </div>

            {/* National ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">National ID Number</label>
              <input
                name="nationalId"
                type="text"
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold tracking-widest transition-all focus:ring-4 focus:ring-blue-50 outline-none ${errors.nationalId ? 'border-rose-300' : 'border-slate-100 focus:border-blue-400'}`}
                placeholder="00000000"
                value={formData.nationalId}
                onChange={handleChange}
              />
              {errors.nationalId && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.nationalId}</p>}
            </div>

            {/* Password with Strength Meter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Security Key</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold transition-all focus:ring-4 focus:ring-blue-50 outline-none ${errors.password ? 'border-rose-300' : 'border-slate-100 focus:border-blue-400'}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Strength Meter */}
              <div className="flex gap-1 mt-2 px-1">
                {[25, 50, 75, 100].map((step) => (
                  <div 
                    key={step} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${passwordStrength >= step ? (passwordStrength <= 50 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-100'}`} 
                  />
                ))}
              </div>
              {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.password}</p>}
            </div>

            {/* Verification Checkbox */}
            <div className="relative flex items-start py-2">
              <div className="flex items-center h-5">
                <input
                  id="isCitizen"
                  name="isCitizen"
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-slate-200 rounded-lg focus:ring-blue-500"
                  checked={formData.isCitizen}
                  onChange={handleChange}
                />
              </div>
              <label htmlFor="isCitizen" className="ml-3 text-xs font-bold text-slate-600 leading-tight">
                I hereby declare my citizenship status for legal compliance.
              </label>
            </div>

            {/* General Error Alert */}
            {errors.general && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-rose-600">{errors.general}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Establish Account
                  <UserPlus className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs font-bold text-slate-400">
              Authorized Member?{' '}
              <Link to="/login" className="text-blue-600 hover:underline ml-1">
                Secure Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
