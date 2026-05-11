import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import api from '../api/axios';

const LoanContext = createContext(null);

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) throw new Error('useLoan must be used within a LoanProvider');
  return context;
};

export const LoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([]); // User-specific history
  const [adminLoans, setAdminLoans] = useState([]); // Master list for Admin
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const searchTimeoutRef = useRef(null);

  /**
   * REUSABLE REQUEST WRAPPER
   * Standardizes the response format and handles loading/errors globally.
   */
  const handleRequest = useCallback(async (requestFn, errorMessage) => {
    setLoading(true);
    try {
      const response = await requestFn();
      return { 
        success: true, 
        data: response.data.data, 
        pagination: response.data.pagination,
        message: response.data.message 
      };
    } catch (error) {
      console.error(`Zambia Z API Error:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * LOCAL STATE UPDATER
   * Keeps the Admin UI responsive by updating the list immediately after an action.
   */
  const syncLocalAdminState = useCallback((loanId, updates) => {
    setAdminLoans(prev => prev.map(loan => 
      loan._id === loanId ? { ...loan, ...updates } : loan
    ));
  }, []);

  // --- USER CORE ACTIONS ---

  const checkEligibility = useCallback(() => 
    handleRequest(() => api.get('/user/eligibility'), 'Eligibility check failed')
      .then(res => { if (res.success) setEligibility(res.data); return res; }), 
  [handleRequest]);

  const applyLoan = useCallback((loanData) => 
    handleRequest(() => api.post('/loan/apply', loanData), 'Application failed'), 
  [handleRequest]);

  const fetchLoanHistory = useCallback(() => 
    handleRequest(() => api.get('/user/loans'), 'Could not fetch history')
      .then(res => { if (res.success) setLoans(res.data); return res; }), 
  [handleRequest]);

  // --- ADMIN CORE ACTIONS ---

  /**
   * GET ALL LOANS (With Search & Filter)
   * usage: getAllLoans({ status: 'pending', search: 'John' })
   */
  const getAllLoans = useCallback((params = {}) => 
    handleRequest(() => api.get('/admin/loans', { params }), 'Failed to fetch loans')
      .then(res => { if (res.success) setAdminLoans(res.data); return res; }), 
  [handleRequest]);

  /**
   * DEBOUNCED SEARCH
   * Perfect for a search input. It waits 500ms after the user stops typing.
   */
  const searchLoans = useCallback((query, filters = {}) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    return new Promise((resolve) => {
      searchTimeoutRef.current = setTimeout(async () => {
        const res = await getAllLoans({ search: query, ...filters });
        resolve(res);
      }, 500);
    });
  }, [getAllLoans]);

  const approveLoanAdmin = useCallback((loanId) => 
    handleRequest(() => api.patch(`/admin/loan/${loanId}/approve`), 'Approval failed')
      .then(res => { if (res.success) syncLocalAdminState(loanId, { status: 'approved' }); return res; }), 
  [handleRequest, syncLocalAdminState]);

  const rejectLoanAdmin = useCallback((loanId, rejectionReason) => 
    handleRequest(() => api.patch(`/admin/loan/${loanId}/reject`, { rejectionReason }), 'Rejection failed')
      .then(res => { if (res.success) syncLocalAdminState(loanId, { status: 'rejected', rejectionReason }); return res; }), 
  [handleRequest, syncLocalAdminState]);

  const initiateLoanDisbursement = useCallback((loanId) => 
    handleRequest(() => api.post(`/admin/loan/${loanId}/disbursement`), 'Disbursement failed')
      .then(res => { if (res.success) syncLocalAdminState(loanId, { status: 'disbursed' }); return res; }), 
  [handleRequest, syncLocalAdminState]);

  const getAdminStats = useCallback(() => 
    handleRequest(() => api.get('/admin/stats'), 'Stats fetch failed'), 
  [handleRequest]);

  // --- ADDITIONAL ADMIN TOOLS ---

  const autoApproveLoanAdmin = useCallback((loanId) => 
    handleRequest(() => api.patch(`/admin/loan/${loanId}/auto-approve`), 'Auto-approve failed')
      .then(res => { if (res.success) syncLocalAdminState(loanId, { status: 'approved', type: 'auto' }); return res; }), 
  [handleRequest, syncLocalAdminState]);

  const sendApprovalNotification = useCallback((loanId) => 
    handleRequest(() => api.post(`/admin/loan/${loanId}/notify-approval`), 'Notification failed'), 
  [handleRequest]);

  /**
   * CONTEXT VALUE MEMOIZATION
   */
  const value = useMemo(() => ({
    loans,
    adminLoans,
    loading,
    eligibility,
    checkEligibility,
    applyLoan,
    fetchLoanHistory,
    getAllLoans,
    searchLoans,
    approveLoanAdmin,
    rejectLoanAdmin,
    autoApproveLoanAdmin,
    initiateLoanDisbursement,
    getAdminStats,
    sendApprovalNotification
  }), [
    loans, adminLoans, loading, eligibility, 
    checkEligibility, applyLoan, fetchLoanHistory, 
    getAllLoans, searchLoans, approveLoanAdmin, rejectLoanAdmin, 
    autoApproveLoanAdmin, initiateLoanDisbursement, 
    getAdminStats, sendApprovalNotification
  ]);

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};
