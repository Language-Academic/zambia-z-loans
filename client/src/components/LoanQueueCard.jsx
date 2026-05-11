import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  Star, 
  User, 
  CreditCard,
  Zap
} from 'lucide-react';

const LoanQueueCard = ({ loan, onApprove, onReject, onViewDetails, onSpecialApprove, actionLoading }) => {
  
  const getStatusBadge = (feePaid) => {
    return feePaid ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        FEE SECURED
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <Clock className="h-3 w-3 mr-1" />
        AWAITING FEE
      </span>
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const isProcessing = actionLoading === loan._id;

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* User Info & Identity */}
        <div className="flex items-start space-x-4">
          <div className="bg-slate-100 rounded-lg p-3 group-hover:bg-indigo-50 transition-colors">
            <User className="h-6 w-6 text-slate-500 group-hover:text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {loan.userId?.fullName || 'Unknown Borrower'}
            </h3>
            <div className="flex flex-wrap gap-y-1 gap-x-3 mt-1">
              <p className="text-xs font-medium text-slate-500 flex items-center">
                <CreditCard className="h-3 w-3 mr-1" />
                ID: {loan.userId?.nationalId}
              </p>
              <p className="text-xs font-medium text-slate-400">
                {loan.userId?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="flex lg:flex-col lg:items-end justify-between items-center px-4 py-2 bg-slate-50 lg:bg-transparent rounded-lg">
          <div className="text-right">
            <p className="text-lg font-black text-slate-900 tracking-tight">
              KSh {loan.amount.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              Fee: KSh {loan.feeAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center space-x-2">
          {loan.status === 'pending' && loan.feePaid ? (
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 space-x-1">
              <button
                onClick={() => onApprove(loan._id)}
                disabled={isProcessing}
                className="flex items-center px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 shadow-sm shadow-emerald-200 disabled:opacity-50 transition-all"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                {isProcessing ? '...' : 'APPROVE'}
              </button>
              
              <button
                onClick={() => onSpecialApprove(loan._id)}
                disabled={isProcessing}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 shadow-sm shadow-indigo-200 disabled:opacity-50 transition-all"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                PRIORITY
              </button>

              <button
                onClick={() => onReject(loan._id)}
                disabled={isProcessing}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                title="Reject Loan"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <button
            onClick={() => onViewDetails(loan)}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            title="View Full Analytics"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {getStatusBadge(loan.feePaid)}
          <span className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            <Clock className="h-3 w-3 mr-1" />
            Applied {getTimeAgo(loan.createdAt)}
          </span>
        </div>
        
        <div className="w-32 lg:w-48">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase">
            <span>Progress</span>
            <span>{loan.feePaid ? '100%' : '50%'}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${loan.feePaid ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: loan.feePaid ? '100%' : '50%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanQueueCard;
