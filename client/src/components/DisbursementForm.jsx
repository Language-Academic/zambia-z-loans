import { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, X, Banknote } from 'lucide-react';

const DisbursementForm = ({ loan, onSubmit, onCancel, loading }) => {
  const [confirmAmount, setConfirmAmount] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Safety check: parse to float to ensure precision comparison
    if (!confirmAmount) {
      newErrors.confirmAmount = 'Please enter the confirmation amount.';
    } else if (parseFloat(confirmAmount) !== parseFloat(loan.amount)) {
      newErrors.confirmAmount = `Security mismatch: Amount must be exactly KSh ${loan.amount.toLocaleString()}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(loan._id);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto w-full max-w-md shadow-2xl rounded-xl bg-white border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              Disbursement Security
            </h3>
          </div>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-50 rounded-full p-4">
              <Banknote className="h-10 w-10 text-indigo-600" />
            </div>
          </div>

          {/* Borrower Summary */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient:</span>
                <span className="text-sm font-semibold text-slate-900">{loan.userId?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount to Send:</span>
                <span className="text-sm font-bold text-indigo-700">KSh {loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">National ID:</span>
                <span className="text-sm font-medium text-slate-700">{loan.userId?.nationalId}</span>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">Authorization Notice:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Funds will be disbursed via <strong>Pesapal S3</strong>.</li>
                  <li>This will hit the borrower's registered M-PESA or Bank account.</li>
                  <li>This financial action is <strong>irreversible</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="confirmAmount" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Amount (To Verify)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">KSh</span>
                </div>
                <input
                  type="number"
                  id="confirmAmount"
                  value={confirmAmount}
                  onChange={(e) => {
                    setConfirmAmount(e.target.value);
                    if (errors.confirmAmount) setErrors({ ...errors, confirmAmount: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.confirmAmount ? 'border-red-500 ring-red-100' : 'border-slate-300 ring-indigo-100'} rounded-lg focus:outline-none focus:ring-4 transition-all`}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.confirmAmount && (
                <p className="mt-2 text-xs font-medium text-red-600">{errors.confirmAmount}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !confirmAmount}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisbursementForm;
