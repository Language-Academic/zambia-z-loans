import { useState, useEffect } from 'react';
import { LogOut, Users, CheckCircle, XCircle, Eye, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const {
    getAllLoans,
    approveLoanAdmin,
    rejectLoanAdmin,
    getLoanQueue,
    getAdminStats,
    loading
  } = useLoan();

  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [loanQueue, setLoanQueue] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Refresh data when filter or tab changes
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(() => {
      if (activeTab === 'queue') fetchLoanQueue();
      fetchAdminStats();
      setLastUpdate(new Date());
    }, 30000); // 30-second polling for stats

    return () => clearInterval(interval);
  }, [statusFilter, activeTab]);

  // Clear rejection reason when switching loans
  useEffect(() => {
    setRejectionReason('');
  }, [expandedLoan]);

  const refreshData = () => {
    fetchLoans();
    fetchAdminStats();
    fetchLoanQueue();
    setLastUpdate(new Date());
  };

  const fetchLoans = async (page = 1) => {
    const params = { page };
    if (statusFilter) params.status = statusFilter;
    const result = await getAllLoans(params);
    if (result.success) {
      setLoans(result.data);
      setPagination(result.pagination);
    }
  };

  const fetchAdminStats = async () => {
    const result = await getAdminStats();
    if (result.success) setAdminStats(result.data);
  };

  const fetchLoanQueue = async () => {
    const result = await getLoanQueue();
    if (result.success) setLoanQueue(result.data);
  };

  const handleApprove = async (loanId) => {
    if (!window.confirm('Are you sure you want to approve this loan?')) return;
    setActionLoading(loanId);
    const result = await approveLoanAdmin(loanId);
    if (result.success) {
      alert('Loan approved successfully!');
      refreshData();
      setExpandedLoan(null);
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (loanId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(loanId);
    const result = await rejectLoanAdmin(loanId, rejectionReason);
    if (result.success) {
      alert('Loan rejected successfully!');
      setExpandedLoan(null);
      refreshData();
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status) => (
    <span className={`status-badge status-${status || 'pending'}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );

  const getFeeStatusBadge = (feePaid) => (
    <span className={`status-badge ${feePaid ? 'status-approved' : 'status-pending'}`}>
      {feePaid ? 'Fee Paid' : 'Fee Pending'}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">ZAMBIA Z LOAN Admin</h1>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{user?.fullName}</span>
            </div>
            <button onClick={logout} className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            {['overview', 'queue', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                  activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={refreshData} className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {['', 'pending', 'approved', 'rejected', 'paid'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                    statusFilter === status ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {status === '' ? 'All Loans' : status.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{loan.userId?.fullName}</div>
                        <div className="text-xs text-gray-500">{loan.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold">KSh {loan.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Fee: {loan.feeAmount}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {getStatusBadge(loan.status)}
                          {getFeeStatusBadge(loan.feePaid)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setExpandedLoan(expandedLoan === loan._id ? null : loan._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expanded View (Modal-like section) */}
        {expandedLoan && (
          <div className="mt-8 bg-white rounded-xl border-2 border-blue-100 shadow-lg p-6 animate-in fade-in slide-in-from-top-4">
            {(() => {
              const loan = loans.find(l => l._id === expandedLoan) || loanQueue.find(l => l._id === expandedLoan);
              if (!loan) return null;
              return (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900">Reviewing: {loan.userId?.fullName}</h2>
                    <button onClick={() => setExpandedLoan(null)} className="text-gray-400 hover:text-gray-600">✕ Close</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">National ID</p>
                      <p className="text-sm font-medium">{loan.userId?.nationalId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Applied Date</p>
                      <p className="text-sm font-medium">{new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                      {getStatusBadge(loan.status)}
                    </div>
                  </div>

                  {loan.status === 'pending' && (
                    <div className="pt-4 border-t space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <button
                          onClick={() => handleApprove(loan._id)}
                          disabled={!loan.feePaid || actionLoading === loan._id}
                          className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === loan._id ? 'Processing...' : 'Approve & Disburse'}
                        </button>
                        <div className="flex-[2] space-y-2">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection (required to reject)..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                            rows="2"
                          />
                          <button
                            onClick={() => handleReject(loan._id)}
                            disabled={actionLoading === loan._id || !rejectionReason.trim()}
                            className="w-full bg-red-50 text-red-600 font-bold py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 border border-red-200"
                          >
                            Reject Loan
                          </button>
                        </div>
                      </div>
                      {!loan.feePaid && <p className="text-xs text-amber-600 text-center font-medium">⚠️ Registration fee must be paid before approval.</p>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && adminStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<DollarSign className="text-green-600" />} label="Total Loans" value={adminStats.totalLoans} color="green" />
            <StatCard icon={<CheckCircle className="text-blue-600" />} label="Approved" value={adminStats.approvedLoans} color="blue" />
            <StatCard icon={<XCircle className="text-red-600" />} label="Rejected" value={adminStats.rejectedLoans} color="red" />
            <StatCard icon={<TrendingUp className="text-purple-600" />} label="Total Volume" value={`KSh ${adminStats.totalAmount?.toLocaleString()}`} color="purple" />
          </div>
        )}

        {/* Loan Queue Tab */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Urgent Queue (Pending Fee Payment)</h2>
            {loanQueue.length > 0 ? (
              <div className="space-y-4">
                {loanQueue.map(loan => (
                  <div key={loan._id} className="flex justify-between items-center p-4 border rounded-lg hover:border-blue-300 transition-all">
                    <div>
                      <p className="font-bold">{loan.userId?.fullName}</p>
                      <p className="text-sm text-gray-500">KSh {loan.amount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setExpandedLoan(loan._id)} className="text-blue-600 font-medium hover:underline text-sm">
                      Process Now
                    </button>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No loans in processing queue.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white p-6 rounded-xl border border-${color}-100 shadow-sm`}>
    <div className="flex items-center space-x-4">
      <div className={`p-3 bg-${color}-50 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
        <p className="text-xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
