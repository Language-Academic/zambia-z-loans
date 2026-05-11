import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, CreditCard, TrendingUp, CheckCircle, LogOut, 
  User, History, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { loans, loading, fetchLoanHistory } = useLoan();

  useEffect(() => {
    fetchLoanHistory();
  }, [fetchLoanHistory]);

  // Optimized Chart Data
  const chartData = useMemo(() => {
    return loans
      .filter(loan => ['approved', 'paid'].includes(loan.status))
      .slice(0, 7) // Last 7 approved loans
      .map(loan => ({
        date: new Date(loan.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
        amount: loan.amount,
      }))
      .reverse();
  }, [loans]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-rose-100 text-rose-700 border-rose-200',
      paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      defaulted: 'bg-gray-800 text-white border-gray-900',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${variants[status] || variants.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">JAMII<span className="text-primary-600">LOAN</span></span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">System Active</span>
              </div>
              <div className="flex items-center gap-3 border-l pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user?.nationalId}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900">Dashboard</h2>
          <p className="text-gray-500 font-medium">Welcome back! Here is your current financial standing.</p>
        </div>

        {/* Pro Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Credit Score" 
            value={user?.creditScore || 0} 
            icon={<TrendingUp className="text-indigo-600" />} 
            trend="+5% this month"
            color="indigo"
          />
          <StatCard 
            title="Available Limit" 
            value={`KSh ${(user?.loanLimit || 0).toLocaleString()}`} 
            icon={<CreditCard className="text-emerald-600" />} 
            trend="Instant disbursement"
            color="emerald"
          />
          <StatCard 
            title="Total Applications" 
            value={user?.totalLoansApplied || 0} 
            icon={<Plus className="text-blue-600" />} 
            trend="Across lifetime"
            color="blue"
          />
          <StatCard 
            title="Active Loans" 
            value={loans.filter(l => l.status === 'approved').length} 
            icon={<CheckCircle className="text-amber-600" />} 
            trend="Awaiting repayment"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-primary-600" />
                  Loan Utilization
                </h3>
                <select className="text-xs font-bold bg-gray-50 border-none rounded-lg p-2 outline-none">
                  <option>Last 7 Loans</option>
                </select>
              </div>
              
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val) => [`KSh ${val.toLocaleString()}`, 'Amount']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                    <History className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No financial history yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                <Link to="/history" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loans.slice(0, 5).map((loan) => (
                      <tr key={loan._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">KSh {loan.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Fee: {loan.feeAmount}</p>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(loan.status)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Quick Actions */}
          <div className="space-y-6">
            <div className="bg-primary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-100 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">Need a boost?</h4>
                <p className="text-primary-100 text-sm mb-6 leading-relaxed">Apply for a loan and get approved in under 24 hours.</p>
                <Link 
                  to="/apply-loan" 
                  className="inline-flex items-center justify-center w-full py-4 px-6 bg-white text-primary-600 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  APPLY NOW
                </Link>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tips for you</h4>
              <div className="space-y-4">
                <TipItem 
                  icon={<AlertCircle className="text-amber-500" />} 
                  text="Pay on time to increase your loan limit by up to 20%." 
                />
                <TipItem 
                  icon={<CheckCircle className="text-emerald-500" />} 
                  text="Complete your profile to unlock premium rates." 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components for cleaner code
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 bg-${color}-50 rounded-2xl`}>{icon}</div>
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-sm font-bold text-gray-400 mt-1">{title}</p>
    <div className="mt-4 pt-4 border-t border-gray-50">
      <span className={`text-xs font-bold text-${color}-600`}>{trend}</span>
    </div>
  </div>
);

const TipItem = ({ icon, text }) => (
  <div className="flex gap-3 items-start">
    <div className="mt-1">{icon}</div>
    <p className="text-sm font-medium text-gray-600 leading-snug">{text}</p>
  </div>
);

export default Dashboard;
