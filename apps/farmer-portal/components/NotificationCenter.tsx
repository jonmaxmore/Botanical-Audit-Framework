/**
 * Notification Center Component (V2 - With Pagination)
 * In-app notification system for closed-loop communication
 * Replaces email notifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface Notification {
  _id: string;
  type: 'urgent' | 'payment' | 'info' | 'appointment' | 'approval' | 'rejection';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  priority: number;
  actionButton?: {
    label: string;
    url: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface NotificationCenterProps {
  className?: string;
}

const NOTIFICATION_ICONS = {
  urgent: AlertCircle,
  payment: DollarSign,
  info: Bell,
  appointment: Calendar,
  approval: CheckCircle,
  rejection: XCircle,
};

const NOTIFICATION_COLORS = {
  urgent: 'bg-red-50 border-red-200 text-red-800',
  payment: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  appointment: 'bg-purple-50 border-purple-200 text-purple-800',
  approval: 'bg-green-50 border-green-200 text-green-800',
  rejection: 'bg-gray-50 border-gray-200 text-gray-800',
};

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch notifications with pagination
  const fetchNotifications = async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v2/notifications?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // NEW: Handle pagination metadata
        const newNotifications = data.data.notifications;

        if (append) {
          // Append for "Load More"
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          // Replace for initial load
          setNotifications(newNotifications);
        }

        setUnreadCount(data.data.unreadCount);
        setPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
        setTotalCount(data.data.pagination.total);
        setHasMore(data.data.pagination.page < data.data.pagination.pages);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(
        err instanceof Error ? err.message : 'ไม่สามารถโหลดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  // NEW: Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/v2/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/v2/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false);
    }
  }, [isOpen]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/v2/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUnreadCount(data.data.count);
          }
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const Icon = (type: Notification['type']) => {
    const IconComponent = NOTIFICATION_ICONS[type] || Bell;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h3>
              {totalCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">ทั้งหมด {totalCount} รายการ</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  อ่านทั้งหมด
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* NEW: Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={() => fetchNotifications(1, false)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium mt-1 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`
                      p-4 hover:bg-gray-50 cursor-pointer transition-colors
                      ${!notification.read ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      if (notification.actionButton?.url) {
                        window.location.href = notification.actionButton.url;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          p-2 rounded-full
                          ${NOTIFICATION_COLORS[notification.type]}
                        `}
                      >
                        {Icon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString('th-TH')}
                        </p>
                        {notification.actionButton && (
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                            {notification.actionButton.label} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW: Load More Button */}
          {hasMore && !error && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    กำลังโหลด...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    โหลดเพิ่มเติม ({notifications.length} / {totalCount})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
