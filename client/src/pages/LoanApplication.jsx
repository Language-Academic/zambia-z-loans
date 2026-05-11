import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Phone, FileText, 
  CheckCircle, ShieldCheck, Zap, Info 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    description: '',
  });
  const [eligibility, setEligibility] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { checkEligibility, applyLoan } = useLoan();
  const navigate = useNavigate();

  // Memoized calculations for accuracy and performance
  const calculations = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    const fee = Math.round(amount * 0.1);
    const disbursement = amount - fee;
    return { fee, disbursement, amount };
  }, [formData.amount]);

  useEffect(() => {
    const loadEligibility = async () => {
      setIsLoading(true);
      const result = await checkEligibility();
      if (result.success) {
        setEligibility(result.data);
      }
      setIsLoading(false);
    };
    loadEligibility();
  }, [checkEligibility]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { amount } = calculations;

    if (!formData.amount || amount < 1000 || amount > (eligibility?.maxAmount || 500000)) {
      newErrors.amount = `Please enter between KSh 1,000 and KSh ${eligibility?.maxAmount?.toLocaleString()}`;
    }

    if (!formData.phoneNumber || !/^254\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid Safaricom number (e.g., 254712345678)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await applyLoan({
      ...formData,
      amount: calculations.amount,
    });

    if (result.success) {
      navigate('/dashboard', { state: { message: 'Application sent successfully!' } });
    } else {
      setErrors({ general: result.message });
    }
    setIsSubmitting(false);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold tracking-tight">Verifying Eligibility...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Navigation Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <span className="font-black text-gray-900 uppercase tracking-widest text-sm">New Loan Application</span>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Eligibility Overview Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-emerald-400 h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Verified Credit Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Max Limit</p>
                <p className="text-3xl font-black">KSh {eligibility?.maxAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Credit Score</p>
                <p className="text-3xl font-black text-emerald-400">{eligibility?.creditScore}</p>
              </div>
            </div>
          </div>
          <Zap className="absolute top-[-20px] right-[-20px] h-40 w-40 text-white opacity-5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Loan Details</h3>
                
                <div className="space-y-5">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Required Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">KSh</span>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`w-full pl-14 pr-4 py-4 bg-gray-50 border-2 ${errors.amount ? 'border-rose-500' : 'border-transparent'} focus:border-primary-600 rounded-2xl outline-none transition-all font-bold text-lg`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && <p className="mt-2 text-xs font-bold text-rose-500">{errors.amount}</p>}
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">M-PESA Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${errors.phoneNumber ? 'border-rose-500' : 'border-transparent'} focus:border-primary-600 rounded-2xl outline-none transition-all font-bold`}
                        placeholder="2547..."
                      />
                    </div>
                    {errors.phoneNumber && <p className="mt-2 text-xs font-bold text-rose-500">{errors.phoneNumber}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Purpose (Optional)</label>
                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-primary-600 rounded-2xl outline-none transition-all font-medium"
                      placeholder="What is this loan for?"
                    />
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3 text-rose-600">
                  <Info className="h-5 w-5" />
                  <p className="text-sm font-bold">{errors.general}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-primary-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'SUBMIT APPLICATION'}
              </button>
            </form>
          </div>

          {/* Breakdown Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Loan Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Requested</span>
                  <span className="font-bold text-gray-900">KSh {calculations.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Processing Fee (10%)</span>
                  <span className="font-bold text-rose-500">- KSh {calculations.fee.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-dashed flex justify-between items-center">
                  <span className="text-gray-900 font-black">Net Disbursement</span>
                  <span className="text-xl font-black text-primary-600">KSh {calculations.disbursement.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-blue-600 shrink-0" />
                  <p className="text-xs font-bold text-blue-700 leading-relaxed">
                    Funds will be sent to the M-PESA number provided once the admin approves your request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
