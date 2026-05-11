import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Clock, XCircle, AlertTriangle, 
  Eye, RefreshCw, ArrowLeft, ChevronRight,
  TrendingUp, Calendar, Wallet, Info, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const LoanStatusTracker = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuth();
  const { fetchLoanHistory } = useLoan();
  const navigate = useNavigate();

  const loadLoans = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    const result = await fetchLoanHistory();
    if (result.success) {
      setLoans(result.data);
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // Zambia Z Financial Summary
  const stats = useMemo(() => {
    const activeLoans = loans.filter(l => l.status === 'approved' || l.status === 'defaulted');
    return {
      activeCount: activeLoans.length,
      outstandingLimit: activeLoans.reduce((acc, curr) => acc + (curr.amount + (curr.feeAmount || 0)), 0),
      totalPaid: loans.filter(l => l.status === 'paid').length
    };
  }, [loans]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'In Review' },
      approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Active' },
      rejected: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Declined' },
      paid: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Settled' },
      defaulted: { color: 'text-slate-900', bg: 'bg-rose-100', border: 'border-rose-300', label: 'Overdue' },
    };
    return configs[status] || configs.pending;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Zambia Z Secure Sync...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Zambia Z Branding Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Zambia Z</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Loan Management</p>
            </div>
          </div>
          <button 
            onClick={() => loadLoans(true)}
            className={`p-3 rounded-2xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Quick Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <TrendingUp className="h-5 w-5 text-blue-600 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Loans</p>
            <p className="text-2xl font-black text-slate-900">{stats.activeCount}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <Wallet className="h-5 w-5 text-emerald-600 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
            <p className="text-2xl font-black text-slate-900">ZK {stats.outstandingLimit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hidden md:block">
            <CheckCircle className="h-5 w-5 text-blue-600 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Settled</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalPaid}</p>
          </div>
        </div>

        {loans.length > 0 ? (
          <div className="space-y-4">
            {loans.map((loan) => {
              const config = getStatusConfig(loan.status);
              const isExpanded = selectedLoan === loan._id;
              const totalToRepay = loan.amount + (loan.feeAmount || 0);

              return (
                <div 
                  key={loan._id} 
                  className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-2xl shadow-blue-50' : 'border-slate-100 shadow-sm'}`}
                >
                  {/* Card Header */}
                  <div 
                    className="p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => setSelectedLoan(isExpanded ? null : loan._id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color}`}>
                        <CreditCard className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900">ZK {loan.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-bold text-slate-400">{new Date(loan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-6 w-6 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-blue-600' : ''}`} />
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2">
                      <div className="h-[1px] bg-slate-100 w-full mb-8" />
                      
                      {/* Repayment Progress (Only for Active/Defaulted) */}
                      {(loan.status === 'approved' || loan.status === 'defaulted' || loan.status === 'paid') && (
                        <div className="mb-8">
                          <div className="flex justify-between items-end mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repayment Progress</p>
                            <p className="text-sm font-black text-slate-900">
                              {loan.status === 'paid' ? '100%' : '0%'}
                            </p>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${loan.status === 'paid' ? 'bg-blue-600 w-full' : 'bg-emerald-500 w-[5%]'}`} 
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                        <div className="space-y-4">
                           <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Principal</span>
                            <span className="text-xs font-black text-slate-900">ZK {loan.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Service Fee</span>
                            <span className="text-xs font-black text-slate-900">ZK {loan.feeAmount?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-200 flex justify-between">
                            <span className="text-xs font-black text-blue-600 uppercase">Total Payable</span>
                            <span className="text-sm font-black text-blue-600">ZK {totalToRepay.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center gap-4">
                           <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                             <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                             <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                               {loan.status === 'rejected' ? loan.rejectionReason : "Ensure your linked wallet has sufficient balance for automatic deductions."}
                             </p>
                           </div>
                        </div>
                      </div>

                      {/* Repayment Action Hub */}
                      {loan.status === 'approved' && (
                        <div className="mt-6 grid grid-cols-1 gap-3">
                          <button 
                            onClick={() => navigate(`/repay/${loan._id}`)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                          >
                            <Wallet className="h-4 w-4" />
                            Repay Loan Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-blue-200" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Clear Records</h2>
            <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto font-medium">
              You haven't initiated any requests on the Zambia Z platform yet.
            </p>
            <button 
              onClick={() => navigate('/apply')}
              className="mt-10 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanStatusTracker;
