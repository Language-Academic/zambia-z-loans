import { CheckCircle, XCircle, Clock, AlertTriangle, Info, Check, ArrowRightLeft, Wallet } from 'lucide-react';

const NotificationItem = ({ notification, onMarkAsRead, onClick }) => {
  
  // High-end iconography for financial events
  const getNotificationIcon = (type) => {
    const iconMap = {
      loan_approved: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      loan_rejected: <XCircle className="h-5 w-5 text-rose-500" />,
      loan_disbursed: <ArrowRightLeft className="h-5 w-5 text-blue-500" />,
      payment_reminder: <Clock className="h-5 w-5 text-amber-500" />,
      loan_defaulted: <AlertTriangle className="h-5 w-5 text-rose-600" />,
    };
    return iconMap[type] || <Info className="h-5 w-5 text-slate-400" />;
  };

  // Subtle left-border colors based on urgency
  const getThemeStyles = (type, isRead) => {
    const base = isRead ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent shadow-sm';
    
    const statusColors = {
      loan_approved: 'border-l-emerald-500',
      loan_rejected: 'border-l-rose-500',
      loan_disbursed: 'border-l-blue-500',
      payment_reminder: 'border-l-amber-500',
      loan_defaulted: 'border-l-rose-600',
    };

    return `${base} ${statusColors[type] || 'border-l-slate-400'}`;
  };

  const formatTimeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div
      onClick={() => onClick && onClick(notification)}
      className={`relative group border-l-4 rounded-xl p-4 mb-3 transition-all duration-200 cursor-pointer border ${
        getThemeStyles(notification.type, notification.isRead)
      } hover:shadow-md hover:border-indigo-100`}
    >
      <div className="flex items-start gap-4">
        {/* Status Icon Wrapper */}
        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-slate-100' : 'bg-white'}`}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className={`text-sm font-bold truncate ${
              notification.isRead ? 'text-slate-500' : 'text-slate-900'
            }`}>
              {notification.title}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>

          <p className={`text-sm leading-relaxed ${
            notification.isRead ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {notification.message}
          </p>

          {/* Enhanced Metadata Chips */}
          {notification.metadata && (
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.metadata.amount && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-100 text-[11px] font-bold text-slate-700 shadow-sm">
                  <Wallet className="h-3 w-3 text-indigo-500" />
                  KSh {notification.metadata.amount.toLocaleString()}
                </div>
              )}
              {notification.metadata.transactionId && (
                <div className="px-2 py-1 rounded-md bg-indigo-50 text-[10px] font-mono font-bold text-indigo-700">
                  #{notification.metadata.transactionId}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Read Status & Quick Actions */}
        <div className="flex flex-col items-end justify-between self-stretch">
          {!notification.isRead ? (
            <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full animate-pulse" />
          ) : (
            <div className="h-2.5 w-2.5 bg-transparent" />
          )}
          
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification._id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-indigo-50 rounded-md"
              title="Mark as read"
            >
              <Check className="h-4 w-4 text-indigo-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
