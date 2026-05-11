import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoanProvider } from './context/LoanContext';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout'; // The persistent sidebar/nav shell

// Pro-Level: Code Splitting (Lazy Loading)
// Components are only loaded when needed, speeding up initial boot time.
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoanApplication = lazy(() => import('./pages/LoanApplication'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ActivityCenter = lazy(() => import('./pages/Notifications')); // Your Activity/Notification feed
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * ZAMBIA Z Brand Loader
 * High-end visual feedback for page transitions
 */
const GlobalLoader = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-[3px] border-blue-50 rounded-[2rem] animate-pulse" />
      <div className="absolute inset-0 border-t-[3px] border-blue-600 rounded-[2rem] animate-spin" />
    </div>
    <div className="mt-8 text-center">
      <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Zambia Z</p>
      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1 opacity-60">Secure Link Established</p>
    </div>
  </div>
);

function AppContent() {
  const { user, loading } = useAuth();

  // Initial Authentication Check
  if (loading) return <GlobalLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <Suspense fallback={<GlobalLoader />}>
        <Router>
          <Routes>
            {/* --- PUBLIC AUTH ROUTES --- */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* --- PROTECTED CLIENT ROUTES --- */}
            {/* Wrapped in MainLayout so the Sidebar/Navbar stays static during navigation */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apply-loan" element={<LoanApplication />} />
              <Route path="/activity" element={<ActivityCenter />} />
            </Route>

            {/* --- PROTECTED ADMIN ROUTES --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* --- INTELLIGENT NAVIGATION LOGIC --- */}
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to={user.role === 'SUPER_ADMIN' ? "/admin" : "/dashboard"} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* --- 404 FALLBACK --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Suspense>
    </div>
  );
}

/**
 * Root Provider Wrapper
 * Nested for clean data flow: Auth -> Loans -> UI
 */
export default function App() {
  return (
    <AuthProvider>
      <LoanProvider>
        <AppContent />
      </LoanProvider>
    </AuthProvider>
  );
}
