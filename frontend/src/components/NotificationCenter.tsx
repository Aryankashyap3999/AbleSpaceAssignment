import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Bell, X, CheckCircle } from 'lucide-react';

export const NotificationCenter = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useSocket();
  const [showPanel, setShowPanel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Only auto-show if there's a new unread notification
    if (notifications.length > 0 && notifications[0].read === false) {
      // Clear previous timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Use Promise microtask to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        setShowPanel(true);
        
        // Auto-hide after 5 seconds
        timerRef.current = setTimeout(() => {
          setShowPanel(false);
        }, 5000);
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notifications[0]?.id]); // Only depend on the first notification's ID

  const handleClose = useCallback(() => {
    setShowPanel(false);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
            <h3 className="text-lg font-bold">📬 Notifications</h3>
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b last:border-b-0 p-4 hover:bg-gray-50 transition cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-purple-600">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.message}
                      </p>
                      {notification.task && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          Task: {notification.task.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="shrink-0 ml-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 p-3 border-t border-gray-200 text-center">
              <button
                onClick={clearNotifications}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
