import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';

interface TechNotification {
  id: string;
  type: 'new_job' | 'job_claimed';
  message: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = 'tech_notifications';
const MAX_NOTIFICATIONS = 20;

function loadNotifications(): TechNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotifications(notifications: TechNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {}
}

export function addTechNotification(type: TechNotification['type'], message: string) {
  const notifications = loadNotifications();
  const newNotification: TechNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  window.dispatchEvent(new CustomEvent('tech-notification'));
}

export default function TechnicianNotificationBell() {
  const [notifications, setNotifications] = useState<TechNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setNotifications(loadNotifications());

    const handler = () => setNotifications(loadNotifications());
    window.addEventListener('tech-notification', handler);
    return () => window.removeEventListener('tech-notification', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
    setOpen(false);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative p-1.5 rounded-lg text-primary-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-primary-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-700">
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 ${
                    !n.read ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-900">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
