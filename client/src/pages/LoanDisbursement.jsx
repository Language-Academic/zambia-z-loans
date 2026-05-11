import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, DollarSign, CheckCircle, XCircle, 
  Clock, AlertTriangle, Search, Filter, RefreshCw,
  UserCheck, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const LoanDisbursement = () => {
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { user } = useAuth();
  const { getAllLoans, initiateLoanDisbursement } = useLoan();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  const fetchApprovedLoans = async () => {
    setLoading(true);
    const result = await getAllLoans({ status: 'approved' });
    if (result.success) {
      const disbursableLoans = result.data.filter(loan =>
        loan.status === 'approved' &&
        !['completed', 'processing'].includes(loan.disbursementStatus)
      );
      setApprovedLoans(disbursableLoans);
    }
    setLoading(false);
  };

  // Professional Search & Filtering
  const filteredLoans = useMemo(() => {
    return approvedLoans.filter(loan => 
      loan.userId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.userId?.nationalId.includes(searchTerm)
    );
  }, [approvedLoans, searchTerm]);

  // Financial Stats for Header
  const totalPendingAmount = useMemo(() => {
    return filteredLoans.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredLoans]);

  const handleDisburse = async (loanId) => {
    if (!window.confirm("Confirm disbursement? This will send real funds via M-PESA.")) return;
    
    setActionLoading(loanId);
    const result = await initiateLoanDisbursement(loanId);
    if (result.success) {
      fetchApprovedLoans();
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const getStatusUI = (status) => {
    const config = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock className="h-3 w-3" /> },
      processing: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle className="h-3 w-3" /> },
      failed: { bg: 'bg-rose-50', text: 'text-rose-700', icon: <XCircle className="h-3 w-3" /> },
    };

    const style = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text}`}>
        {style.icon}
        {status}
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Top Professional Admin Bar */}
      <nav className="bg-slate-900 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-6 w-[1px] bg-slate-700" />
            <h1 className="font-bold tracking-tight text-lg">Disbursement Control</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold opacity-60 uppercase">System Admin</p>
              <p className="text-sm font-medium">{user?.fullName}</p>
            </div>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Queue Total</p>
            <p className="text-3xl font-black text-slate-900">KSh {totalPendingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase mb-1">Pending Batch</p>
            <p className="text-3xl font-black text-slate-900">{filteredLoans.length} Loans</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
             <div>
                <p className="text-xs font-black text-slate-400 uppercase mb-1">Gateway</p>
                <p className="text-xl font-bold text-emerald-600">M-PESA B2C Live</p>
             </div>
             <Wallet className="h-8 w-8 text-slate-200" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or National ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
            />
          </div>
          <button 
            onClick={fetchApprovedLoans}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Queue
          </button>
        </div>

        {/* High-Density Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Borrower Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (KSh)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved On</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{loan.userId?.fullName}</p>
                            <p className="text-[11px] font-medium text-slate-500">ID: {loan.userId?.nationalId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">{loan.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusUI(loan.disbursementStatus)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDisburse(loan._id)}
                          disabled={actionLoading === loan._id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-black shadow-md shadow-primary-100 transition-all"
                        >
                          {actionLoading === loan._id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                          {actionLoading === loan._id ? 'PROCESSING' : 'DISBURSE'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-bold">No loans found</p>
                        <p className="text-slate-500 text-xs mt-1">Adjust your search or check back later for new approvals.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanDisbursement;
