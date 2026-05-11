import { useState, useEffect, useMemo } from 'react';
import { 
  Bell, CheckCircle, XCircle, Clock, 
  AlertTriangle, Info, MoreHorizontal, 
  Trash2, CheckSquare, Zap, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Optimized for Zambia Z context
    const mockNotifications = [
      {
        _id: '1',
        type: 'loan_approved',
        title: 'Funding Secured',
        message: 'Strategic Approval: Your application for ZK 5,000 has been verified and approved.',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        metadata: { amount: 5000 }
      },
      {
        _id: '2',
        type: 'payment_reminder',
        title: 'Repayment Window',
        message: 'Your upcoming installment of ZK 550 is scheduled for processing in 48 hours.',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        metadata: { amount: 550, dueDate: new Date(Date.now() + 172800000) }
      },
      {
        _id: '3',
        type: 'loan_disbursed',
        title: 'Capital Transferred',
        message: 'ZK 5,000 has been successfully moved to your linked disbursement wallet.',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        metadata: { amount: 5000, transactionId: 'ZMZ-992-X' }
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const getStatusKit = (type) => {
    const kits = {
      loan_approved: { icon: <Zap className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      loan_disbursed: { icon: <CheckCircle className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
      payment_reminder: { icon: <Clock className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      loan_defaulted: { icon: <AlertTriangle className="h-5 w-5" />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', pulse: true },
    };
    return kits[type] || { icon: <Info className="h-5 w-5" />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
  };

  const filteredData = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Network...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* High-End Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Activity</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Zambia Z Updates</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Clear New
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Modern Segmented Control */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit mb-8">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Logs
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all relative ${filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Unread
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />}
          </button>
        </div>

        {/* Notification Feed */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((notif) => {
              const kit = getStatusKit(notif.type);
              return (
                <div 
                  key={notif._id}
                  className={`group relative bg-white border rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${!notif.isRead ? 'border-blue-100 ring-1 ring-blue-50' : 'border-slate-100'}`}
                >
                  <div className="flex gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kit.bg} ${kit.color} ${kit.pulse ? 'animate-pulse' : ''}`}>
                      {kit.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-sm font-black tracking-tight ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                        {notif.message}
                      </p>

                      {notif.metadata && (
                        <div className="flex flex-wrap gap-3 mb-4">
                          {notif.metadata.amount && (
                            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Value</p>
                              <p className="text-[11px] font-black text-slate-700">ZK {notif.metadata.amount.toLocaleString()}</p>
                            </div>
                          )}
                          {notif.metadata.transactionId && (
                            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reference</p>
                              <p className="text-[11px] font-black text-slate-700">{notif.metadata.transactionId}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                        {!notif.isRead && (
                          <button 
                            onClick={() => markAsRead(notif._id)}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notif._id)}
                          className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-8 w-8 text-slate-200" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Quiet for now</h2>
              <p className="text-slate-400 text-xs font-medium mt-2 max-w-[200px] mx-auto">
                We'll ping you here when your financial status changes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
