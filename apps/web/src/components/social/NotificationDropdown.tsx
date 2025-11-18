'use client';

import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  TrendingUp,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  userId: string;
}

const ICON_MAP: Record<string, any> = {
  POST_LIKE: Heart,
  POST_COMMENT: MessageCircle,
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPTED: UserPlus,
  ACHIEVEMENT_UNLOCK: Trophy,
  LEVEL_UP: TrendingUp,
  CHALLENGE_INVITE: Trophy,
  CHALLENGE_COMPLETED: Trophy,
  WORKOUT_SHARE: TrendingUp,
  TRENDING_WORKOUT: TrendingUp,
};

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/social/notifications?limit=10');
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId?: string) => {
    try {
      const res = await fetch('/api/social/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notificationId || undefined,
          markAllRead: !notificationId,
        }),
      });

      if (res.ok) {
        if (notificationId) {
          setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch('/api/social/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notifications.find(n => n.id === notificationId && !n.read)) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // You can add navigation logic here based on notification type
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead()}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              const Icon = ICON_MAP[notification.type] || Bell;
              return (
                <div
                  key={notification.id}
                  className={`relative p-3 border-b hover:bg-slate-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full" />
                  )}

                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        !notification.read ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-slate-400" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {notifications.length > 0 && (
          <div className="p-3 text-center border-t">
            <Button
              variant="link"
              size="sm"
              className="text-blue-600"
              onClick={() => {
                setOpen(false);
                // Navigate to full notifications page
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
