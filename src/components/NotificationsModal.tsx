import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X, Sparkles, Zap, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  todaySpent: number;
  dailyLimit: number;
  weeklySpent: number;
  weeklyLimit: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currency,
  todaySpent,
  dailyLimit,
  weeklySpent,
  weeklyLimit,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setPermissionGranted(true);
          new Notification('Finova Alerts Active', {
            body: 'You will now receive real-time budget & payment alerts!',
          });
        } else {
          setPermissionGranted(false);
        }
      } catch (e) {
        setPermissionGranted(true);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const triggerLiveAlert = () => {
    const newAlert: AppNotification = {
      id: `n-${Date.now()}`,
      title: '⚠️ Real-Time Budget Alert',
      message: `Finova Money Shield: You just spent on Food. Your remaining daily budget is ${formatCurrency(Math.max(0, dailyLimit - todaySpent), currency)}.`,
      time: 'Just now',
      type: 'alert',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newAlert.title, { body: newAlert.message });
      } catch (e) {
        // Fallback handled inside UI
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1C1A]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-[#E3E2E0] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#ffffff] border-b border-[#E3E2E0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 text-[#DCD0FF]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">Finova Smart Alerts</h3>
              <p className="text-xs text-[#79757E]">Real-time budget & cash activity updates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F4F3F1] text-[#79757E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Box */}
        <div className="p-4 bg-[#F5F5DC] border-b border-[#E3E2E0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-xs text-[#1A1C1A]">
            <ShieldCheck className="w-4 h-4 text-[#27AE60] shrink-0" />
            <div>
              <span className="font-bold block">Browser Push Notifications</span>
              <span className="text-[11px] text-[#48454E]">
                {permissionGranted ? '✅ Active - Instant alerts enabled' : 'Grant permission for instant budget overspending warnings'}
              </span>
            </div>
          </div>

          {!permissionGranted ? (
            <button
              onClick={requestBrowserPermission}
              className="px-3 py-1.5 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-extrabold hover:bg-[#2E312F] transition-all shrink-0"
            >
              Enable
            </button>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-wider text-[#27AE60] bg-[#E2F0D9] px-2 py-0.5 rounded-full">
              Enabled
            </span>
          )}
        </div>

        {/* Notification Actions Toolbar */}
        <div className="px-5 py-2.5 bg-[#ffffff] border-b border-[#E3E2E0] flex items-center justify-between text-xs">
          <span className="font-bold text-[#48454E]">
            {unreadCount > 0 ? `${unreadCount} Unread Notifications` : 'All notifications caught up!'}
          </span>
          <div className="flex space-x-3 items-center">
            <button
              onClick={triggerLiveAlert}
              className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#DCD0FF] text-[#1A1C1A] hover:bg-[#CCC0EE] transition-all flex items-center space-x-1"
            >
              <Zap className="w-3 h-3 text-[#1A1C1A]" />
              <span>Test Alert</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[#625981] font-bold hover:underline"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[#BA1A1A] font-bold hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-[#79757E]">
              <Bell className="w-10 h-10 mx-auto mb-2 text-[#DCD0FF]" />
              <p className="text-sm font-bold text-[#1A1C1A]">No active alerts</p>
              <p className="text-xs mt-1">You are all clear! New payment and budget alerts will show up here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-start space-x-3 ${
                  !n.read
                    ? 'bg-[#ffffff] border-[#625981] shadow-xs'
                    : 'bg-[#FAF9F6] border-[#E3E2E0] opacity-80'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />}
                  {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#27AE60]" />}
                  {n.type === 'info' && <Sparkles className="w-4 h-4 text-[#60577F]" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#1A1C1A]">{n.title}</h4>
                    <span className="text-[10px] text-[#79757E]">{n.time}</span>
                  </div>
                  <p className="text-xs text-[#48454E] mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#ffffff] border-t border-[#E3E2E0] text-center text-xs text-[#79757E]">
          <span>Finova Real-Time Spending Guard Active</span>
        </div>

      </div>
    </div>
  );
};
