import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  /**
   * 1. Branded Loading State
   * Prevents "flicker" and maintains the Zambia Z identity during auth checks.
   */
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 h-12 w-12 border-4 border-indigo-100 rounded-full"></div>
        </div>
        <p className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">
          Securing Session...
        </p>
      </div>
    );
  }

  /**
   * 2. Authentication Check
   * If not logged in, send to login but "save" the page they were trying to reach.
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * 3. Authorization Check (Role-Based)
   * For Zambia Z, we distinguish between a regular Borrower and a Super Admin.
   * We redirect to a "Unauthorized" page or the user dashboard.
   */
  if (adminOnly && user?.role !== 'SUPER_ADMIN') {
    // Option A: Silently redirect back to their user dashboard
    // return <Navigate to="/dashboard" replace />;

    // Option B: Show an Access Denied view (More professional for security audits)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-full mb-6">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            This administrative area requires <span className="font-bold text-slate-700 underline decoration-indigo-500">Super Admin</span> privileges. Your current role is restricted from this view.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Return to Personal Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
