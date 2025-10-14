import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationService } from "@/services/notification.service";
import { socketService } from "@/services/socket.service";
import { useAuth } from "./useAuth";
import type { Notification, NotificationQueryParams } from "@/services/notification.service";

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
  };
  unreadCount: number;
  socketConnected: boolean;
  stats: {
    total: number;
    unread: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  };
}

interface UseNotificationsOptions {
  autoConnect?: boolean;
  initialLimit?: number;
  autoFetch?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { autoConnect = true, initialLimit = 20, autoFetch = true } = options;
  const { user } = useAuth();
  const hasConnectedRef = useRef(false);
  const didConnectRef = useRef(false);
  // Unique instance id to avoid processing our own broadcast events
  const instanceIdRef = useRef<string>(
    (() => {
      try {
        // @ts-ignore
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
          // @ts-ignore
          return crypto.randomUUID() as string;
        }
      } catch {}
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    })()
  );

  const [notificationsState, setNotificationsState] = useState<NotificationsState>({
    notifications: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNextPage: false,
    },
    unreadCount: 0,
    socketConnected: false,
    stats: {
      total: 0,
      unread: 0,
      bySeverity: {},
      byType: {},
    },
  });

  // Initialize socket connection for real-time notifications
  const initializeSocket = useCallback(() => {
    if (!user || hasConnectedRef.current) return;

    socketService.connect({
      onConnect: () => {
        console.log("Socket connected for notifications");
        setNotificationsState((prev) => ({ ...prev, socketConnected: true }));
      },
      onDisconnect: () => {
        console.log("Socket disconnected");
        setNotificationsState((prev) => ({ ...prev, socketConnected: false }));
      },
      onError: (error) => {
        console.error("Socket error in useNotifications:", error);
        setNotificationsState((prev) => ({
          ...prev,
          error: "Real-time connection error",
          socketConnected: false,
        }));
      },
    });

    // Listen for new notifications
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("new_notification", handleNewNotification);
    }

    hasConnectedRef.current = true;
    didConnectRef.current = true;
  }, [user]);

  // Handle new notification from socket
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log("Received new notification:", notification);

    setNotificationsState((prev) => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
      pagination: {
        ...prev.pagination,
        total: prev.pagination.total + 1,
      },
      stats: {
        ...prev.stats,
        total: prev.stats.total + 1,
        unread: prev.stats.unread + 1,
        bySeverity: {
          ...prev.stats.bySeverity,
          [notification.severity]: (prev.stats.bySeverity[notification.severity] || 0) + 1,
        },
      },
    }));

    // Broadcast globally so other hook instances (e.g., sidebar) stay in sync
    try {
      window.dispatchEvent(
        new CustomEvent("notification:new", {
          detail: { notification, sourceId: instanceIdRef.current },
        })
      );
      window.dispatchEvent(
        new CustomEvent("notifications:unreadHint", { detail: { sourceId: instanceIdRef.current } })
      );
    } catch {}

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/mental-icon.png",
        tag: notification.id,
      });
    }
  }, []);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (didConnectRef.current) {
        const socket = socketService.getSocket();
        if (socket) {
          socket.off("new_notification", handleNewNotification);
        }
      }
    };
  }, [handleNewNotification]);

  // Initialize socket when user is available
  useEffect(() => {
    if (user && autoConnect && !hasConnectedRef.current) {
      initializeSocket();
    }
  }, [user, autoConnect, initializeSocket]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (params?: NotificationQueryParams) => {
      if (!user) return;

      setNotificationsState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const userType = user.type === "guidance" ? "guidance" : "student";
        const response = await NotificationService.getNotificationsByRole(userType, {
          limit: initialLimit,
          order: "desc",
          ...params,
        });

        setNotificationsState((prev) => ({
          ...prev,
          notifications: response.logs,
          loading: false,
          pagination: {
            page: response.page,
            totalPages: response.totalPages,
            total: response.total,
            hasNextPage: response.page < response.totalPages,
          },
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch notifications";
        setNotificationsState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [user, initialLimit]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const { count } = await NotificationService.getUnreadCount();
      setNotificationsState((prev) => ({ ...prev, unreadCount: count }));
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user]);

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await NotificationService.getNotificationStats(
        user.type === "guidance" ? "guidance" : "student"
      );
      setNotificationsState((prev) => ({ ...prev, stats }));
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);

      setNotificationsState((prev) => {
        const notification = prev.notifications.find((n) => n.id === id);
        const wasUnread = notification?.status === "unread";

        return {
          ...prev,
          notifications: prev.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, status: "read" as const, readAt: new Date().toISOString() }
              : notification
          ),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          stats: {
            ...prev.stats,
            unread: wasUnread ? Math.max(0, prev.stats.unread - 1) : prev.stats.unread,
          },
        };
      });

      // Broadcast to keep other instances in sync
      try {
        window.dispatchEvent(
          new CustomEvent("notification:read", { detail: { id, sourceId: instanceIdRef.current } })
        );
      } catch {}
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }, []);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (ids: string[]) => {
    try {
      await NotificationService.markMultipleAsRead(ids);

      setNotificationsState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          ids.includes(notification.id)
            ? { ...notification, status: "read" as const, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - ids.length),
        stats: {
          ...prev.stats,
          unread: Math.max(0, prev.stats.unread - ids.length),
        },
      }));

      try {
        window.dispatchEvent(
          new CustomEvent("notification:readMany", {
            detail: { ids, sourceId: instanceIdRef.current },
          })
        );
      } catch {}
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notificationsState.notifications
      .filter((n) => n.status === "unread")
      .map((n) => n.id);

    if (unreadIds.length > 0) {
      await markMultipleAsRead(unreadIds);
    }
  }, [notificationsState.notifications, markMultipleAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);

      setNotificationsState((prev) => {
        const deletedNotification = prev.notifications.find((n) => n.id === id);
        const wasUnread = deletedNotification?.status === "unread";

        return {
          ...prev,
          notifications: prev.notifications.filter((notification) => notification.id !== id),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - 1,
          },
          stats: {
            ...prev.stats,
            total: prev.stats.total - 1,
            unread: wasUnread ? Math.max(0, prev.stats.unread - 1) : prev.stats.unread,
            bySeverity: deletedNotification
              ? {
                  ...prev.stats.bySeverity,
                  [deletedNotification.severity]: Math.max(
                    0,
                    (prev.stats.bySeverity[deletedNotification.severity] || 0) - 1
                  ),
                }
              : prev.stats.bySeverity,
          },
        };
      });

      try {
        window.dispatchEvent(
          new CustomEvent("notification:deleted", {
            detail: { id, sourceId: instanceIdRef.current },
          })
        );
      } catch {}
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }, []);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (notificationsState.loading || !notificationsState.pagination.hasNextPage) return;

    const nextPage = notificationsState.pagination.page + 1;

    setNotificationsState((prev) => ({ ...prev, loading: true }));

    try {
      const userType = user?.type === "guidance" ? "guidance" : "student";
      const response = await NotificationService.getNotificationsByRole(userType, {
        page: nextPage,
        limit: initialLimit,
        order: "desc",
      });

      setNotificationsState((prev) => ({
        ...prev,
        notifications: [...prev.notifications, ...response.logs],
        loading: false,
        pagination: {
          page: response.page,
          totalPages: response.totalPages,
          total: response.total,
          hasNextPage: response.page < response.totalPages,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load more notifications";
      setNotificationsState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [notificationsState.loading, notificationsState.pagination, user, initialLimit]);

  // Clear error
  const clearError = useCallback(() => {
    setNotificationsState((prev) => ({ ...prev, error: null }));
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount(), fetchStats()]);
  }, [fetchNotifications, fetchUnreadCount, fetchStats]);

  // Sync across multiple hook instances using window-level events
  useEffect(() => {
    const onRead = (e: Event) => {
      const detail = (e as CustomEvent).detail as any;
      if (detail?.sourceId === instanceIdRef.current) return;
      const id = detail?.id as string | undefined;
      if (!id) return;
      setNotificationsState((prev) => {
        const wasUnread = prev.notifications.find((n) => n.id === id)?.status === "unread";
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n
          ),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          stats: {
            ...prev.stats,
            unread: wasUnread ? Math.max(0, prev.stats.unread - 1) : prev.stats.unread,
          },
        };
      });
    };

    const onReadMany = (e: Event) => {
      const detail = (e as CustomEvent).detail as any;
      if (detail?.sourceId === instanceIdRef.current) return;
      const ids = detail?.ids as string[] | undefined;
      if (!ids || ids.length === 0) return;
      setNotificationsState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, status: "read", readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - ids.length),
        stats: { ...prev.stats, unread: Math.max(0, prev.stats.unread - ids.length) },
      }));
    };

    const onNew = (e: Event) => {
      const detail = (e as CustomEvent).detail as any;
      if (detail?.sourceId === instanceIdRef.current) return;
      const notification = detail?.notification as Notification | undefined;
      if (!notification) return;
      setNotificationsState((prev) => ({
        ...prev,
        notifications: [notification, ...prev.notifications],
        unreadCount: prev.unreadCount + 1,
        pagination: { ...prev.pagination, total: prev.pagination.total + 1 },
        stats: {
          ...prev.stats,
          total: prev.stats.total + 1,
          unread: prev.stats.unread + 1,
          bySeverity: {
            ...prev.stats.bySeverity,
            [notification.severity]: (prev.stats.bySeverity[notification.severity] || 0) + 1,
          },
        },
      }));
    };

    const onDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail as any;
      if (detail?.sourceId === instanceIdRef.current) return;
      const id = detail?.id as string | undefined;
      if (!id) return;
      setNotificationsState((prev) => {
        const deleted = prev.notifications.find((n) => n.id === id);
        const wasUnread = deleted?.status === "unread";
        return {
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          pagination: { ...prev.pagination, total: Math.max(0, prev.pagination.total - 1) },
          stats: {
            ...prev.stats,
            total: Math.max(0, prev.stats.total - 1),
            unread: wasUnread ? Math.max(0, prev.stats.unread - 1) : prev.stats.unread,
          },
        };
      });
    };

    window.addEventListener("notification:read", onRead as EventListener);
    window.addEventListener("notification:readMany", onReadMany as EventListener);
    window.addEventListener("notification:new", onNew as EventListener);
    window.addEventListener("notification:deleted", onDeleted as EventListener);

    return () => {
      window.removeEventListener("notification:read", onRead as EventListener);
      window.removeEventListener("notification:readMany", onReadMany as EventListener);
      window.removeEventListener("notification:new", onNew as EventListener);
      window.removeEventListener("notification:deleted", onDeleted as EventListener);
    };
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (user && autoFetch) {
      refresh();
    }
  }, [user, autoFetch, refresh]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  return {
    notifications: notificationsState.notifications,
    loading: notificationsState.loading,
    error: notificationsState.error,
    pagination: notificationsState.pagination,
    unreadCount: notificationsState.unreadCount,
    socketConnected: notificationsState.socketConnected,
    stats: notificationsState.stats,
    fetchNotifications,
    fetchUnreadCount,
    fetchStats,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    clearError,
    refresh,
    requestNotificationPermission,
  };
};
