'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

interface NotificationBellProps {
  userId: string;
  className?: string;
}

export default function NotificationBell({ userId, className = '' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      const data = await response.json();

      if (data.success) {
        const newCount = data.data.unreadCount;

        // Animate if count increased
        if (newCount > unreadCount) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
        }

        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [unreadCount]);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        // Get auth token from localStorage or cookie
        const token = localStorage.getItem('authToken') || '';

        // Connect to WebSocket server
        ws = new WebSocket(`ws://localhost:3000/notifications?token=${token}`);

        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data);

            if (message.event === 'notification') {
              // New notification received
              console.log('New notification:', message.data);

              // Update unread count
              fetchUnreadCount();

              // Show browser notification if supported
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(message.data.title, {
                  body: message.data.message,
                  icon: '/notification-icon.png',
                  badge: '/badge-icon.png',
                  tag: message.data.notificationId,
                  requireInteraction: message.data.priority === 'critical',
                });
              }

              // Play notification sound
              playNotificationSound();
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = error => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');

          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('Reconnecting WebSocket...');
            connectWebSocket();
          }, 5000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    // Initial unread count fetch
    fetchUnreadCount();

    // Setup polling as fallback (every 30 seconds)
    const pollInterval = setInterval(fetchUnreadCount, 30000);

    // Connect WebSocket
    connectWebSocket();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (ws) {
        ws.close();
      }
      clearInterval(pollInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [userId, fetchUnreadCount]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        // Autoplay might be blocked by browser
        console.log('Could not play notification sound:', err);
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Toggle panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Close panel and refresh unread count
  const handleClosePanel = () => {
    setIsOpen(false);
    fetchUnreadCount();
  };

  return (
    <>
      <button
        onClick={togglePanel}
        className={`relative p-2 rounded-lg hover:bg-gray-100 transition-all ${
          isAnimating ? 'animate-bounce' : ''
        } ${className}`}
        title="การแจ้งเตือน"
      >
        <Bell
          className={`w-6 h-6 transition-colors ${
            unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'
          }`}
        />

        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-semibold text-white rounded-full transition-all ${
              isAnimating ? 'bg-red-600 scale-110' : 'bg-red-500'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel userId={userId} isOpen={isOpen} onClose={handleClosePanel} />
    </>
  );
}
