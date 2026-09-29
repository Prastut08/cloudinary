import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Trash2,
  Share2,
  CheckCheck,
  X,
  Loader2,
  Inbox
} from 'lucide-react';
import { useNotifications, formatRelativeTime } from '../hooks/useNotifications';

export default function NotificationPanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close panel on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }

    // Related navigation based on real application routes
    if (notif.relatedId && notif.relatedType === 'product') {
      navigate(`/products/${notif.relatedId}`);
      onClose();
    } else if (notif.type === 'product_created' || notif.type === 'product_deleted') {
      navigate('/products');
      onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'processing_complete':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'processing_partial':
      case 'processing_failed':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'asset_regenerated':
        return <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'product_created':
        return <PlusCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'product_deleted':
        return <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      case 'share_created':
        return <Share2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />;
      default:
        return <Bell className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-stone-900 border border-amber-900/30 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-xl animate-in fade-in duration-150"
    >
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-amber-900/20 flex items-center justify-between bg-stone-950/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white tracking-wide">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors p-1 rounded hover:bg-stone-800"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Body List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-amber-900/10">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-xs text-rose-400">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-2 text-stone-400">
            <Inbox className="w-8 h-8 text-stone-600 stroke-1" />
            <p className="text-xs font-medium text-stone-300">You're all caught up.</p>
            <p className="text-[11px] text-stone-500">No recent notifications found.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors group relative ${
                  isUnread
                    ? 'bg-amber-500/5 hover:bg-amber-500/10'
                    : 'bg-transparent hover:bg-stone-800/40'
                }`}
              >
                {/* Subtle Unread Indicator Line */}
                {isUnread && (
                  <span className="absolute left-1 top-4 w-1 h-8 rounded-full bg-amber-500" />
                )}

                {getNotificationIcon(notif.type)}

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isUnread ? 'text-amber-200' : 'text-stone-300'
                      }`}
                    >
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Optional Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-400 transition-all rounded hover:bg-stone-800 shrink-0"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
