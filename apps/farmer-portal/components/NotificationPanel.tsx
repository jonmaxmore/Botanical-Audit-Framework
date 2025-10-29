'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Filter } from 'lucide-react';

// Notification types matching backend
export enum NotificationType {
  JOB_ASSIGNED = 'job_assigned',
  PAYMENT_REQUIRED = 'payment_required',
  PAYMENT_COMPLETED = 'payment_completed',
  STATUS_UPDATE = 'status_update',
  DELAY_ALERT = 'delay_alert',
  DEADLINE_WARNING = 'deadline_warning',
  DOCUMENT_RECEIVED = 'document_received',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  CERTIFICATE_READY = 'certificate_ready',
  REJECTION_NOTICE = 'rejection_notice',
  SYSTEM_ALERT = 'system_alert',
  MESSAGE_RECEIVED = 'message_received'
}

// Priority levels
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Notification interface
interface Notification {
  _id: string;
  userId: string;
  applicationId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
}

interface NotificationPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  userId: _userId,
  isOpen,
  onClose
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '20',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        if (filterType !== 'all') params.append('type', filterType);
        if (filterPriority !== 'all') params.append('priority', filterPriority);

        const response = await fetch(`/api/notifications?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          const newNotifications = data.data.notifications;
          setNotifications(prev => (reset ? newNotifications : [...prev, ...newNotifications]));
          setHasMore(data.data.pagination.page < data.data.pagination.pages);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [filterType, filterPriority]
  );

  // Load initial notifications
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchNotifications(1, true);
    }
  }, [isOpen, fetchNotifications]);

  // Load more on scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 'text-red-600 bg-red-50';
      case NotificationPriority.HIGH:
        return 'text-orange-600 bg-orange-50';
      case NotificationPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case NotificationPriority.LOW:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get type icon
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.JOB_ASSIGNED:
        return '📋';
      case NotificationType.PAYMENT_REQUIRED:
        return '💳';
      case NotificationType.PAYMENT_COMPLETED:
        return '✅';
      case NotificationType.STATUS_UPDATE:
        return '🔄';
      case NotificationType.DELAY_ALERT:
        return '⚠️';
      case NotificationType.DEADLINE_WARNING:
        return '⏰';
      case NotificationType.DOCUMENT_RECEIVED:
        return '📄';
      case NotificationType.INSPECTION_SCHEDULED:
        return '📅';
      case NotificationType.CERTIFICATE_READY:
        return '🎓';
      case NotificationType.REJECTION_NOTICE:
        return '❌';
      case NotificationType.SYSTEM_ALERT:
        return '🔔';
      case NotificationType.MESSAGE_RECEIVED:
        return '💬';
      default:
        return '📬';
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'เมื่อสักครู่';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h2>
              <span className="text-sm text-gray-500">
                ({notifications.filter(n => !n.read).length} ยังไม่อ่าน)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-4 pb-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              อ่านทั้งหมด
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              กรอง
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="px-4 pb-3 space-y-2">
              <select
                value={filterType}
                onChange={e => {
                  setFilterType(e.target.value as NotificationType | 'all');
                  setPage(1);
                  fetchNotifications(1, true);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">ทุกประเภท</option>
                <option value={NotificationType.JOB_ASSIGNED}>งานที่ได้รับมอบหมาย</option>
                <option value={NotificationType.PAYMENT_REQUIRED}>ต้องชำระเงิน</option>
                <option value={NotificationType.PAYMENT_COMPLETED}>ชำระเงินสำเร็จ</option>
                <option value={NotificationType.STATUS_UPDATE}>อัปเดตสถานะ</option>
                <option value={NotificationType.DELAY_ALERT}>แจ้งเตือนล่าช้า</option>
                <option value={NotificationType.DEADLINE_WARNING}>ใกล้ครบกำหนด</option>
              </select>

              <select
                value={filterPriority}
                onChange={e => {
                  setFilterPriority(e.target.value as NotificationPriority | 'all');
                  setPage(1);
                  fetchNotifications(1, true);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">ทุกความสำคัญ</option>
                <option value={NotificationPriority.CRITICAL}>สำคัญมาก</option>
                <option value={NotificationPriority.HIGH}>สำคัญ</option>
                <option value={NotificationPriority.MEDIUM}>ปานกลาง</option>
                <option value={NotificationPriority.LOW}>น้อย</option>
              </select>
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto h-[calc(100vh-140px)]" onScroll={handleScroll}>
          {notifications.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 mb-2 opacity-50" />
              <p>ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">{getTypeIcon(notification.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span
                          className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 hover:bg-white rounded transition-colors"
                              title="ทำเครื่องหมายว่าอ่านแล้ว"
                            >
                              <Check className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Action URL */}
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          ดูรายละเอียด →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* End of list */}
          {!hasMore && notifications.length > 0 && (
            <div className="text-center py-4 text-sm text-gray-500">ไม่มีการแจ้งเตือนเพิ่มเติม</div>
          )}
        </div>
      </div>
    </div>
  );
}
