import React, { useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  User,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { NotificationModal } from "@/components/molecules/NotificationModal";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Notification } from "@/services/notification.service";

interface NotificationsContentProps {
  className?: string;
}

export const NotificationsContent: React.FC<NotificationsContentProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    pagination,
    unreadCount,
    socketConnected,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    clearError,
    refresh,
  } = useNotifications();

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const isGuidance = user?.type === "guidance";

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread" && notification.status === "read") return false;
    if (filter === "read" && notification.status !== "read") return false;
    if (severityFilter !== "all" && notification.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-blue-500";
      default:
        return "border-l-green-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getActionTypeLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      APPOINTMENT_CREATED: "Appointment",
      APPOINTMENT_UPDATED: "Appointment",
      APPOINTMENT_CANCELLED: "Appointment",
      APPOINTMENT_CONFIRMED: "Appointment",
      APPOINTMENT_COMPLETED: "Appointment",
      ANXIETY_ASSESSMENT_CREATED: "Anxiety Assessment",
      ANXIETY_ASSESSMENT_UPDATED: "Anxiety Assessment",
      DEPRESSION_ASSESSMENT_CREATED: "Depression Assessment",
      DEPRESSION_ASSESSMENT_UPDATED: "Depression Assessment",
      STRESS_ASSESSMENT_CREATED: "Stress Assessment",
      STRESS_ASSESSMENT_UPDATED: "Stress Assessment",
      SUICIDE_ASSESSMENT_CREATED: "Suicide Assessment",
      SUICIDE_ASSESSMENT_UPDATED: "Suicide Assessment",
      MESSAGE_SENT: "Message",
      MESSAGE_RECEIVED: "Message",
      MESSAGE_READ: "Message",
      CONSENT_CREATED: "Consent",
      CONSENT_UPDATED: "Consent",
      INVENTORY_CREATED: "Inventory",
      INVENTORY_UPDATED: "Inventory",
      RETAKE_REQUEST_CREATED: "Retake Request",
      RETAKE_REQUEST_APPROVED: "Retake Request",
      RETAKE_REQUEST_REJECTED: "Retake Request",
      SCHEDULE_CREATED: "Schedule",
      SCHEDULE_UPDATED: "Schedule",
    };

    return actionMap[action] || "Notification";
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Note: The modal will automatically mark as read via useEffect
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  return (
    <main className={cn("flex-1 p-3 sm:p-4 md:p-6 bg-gray-50 overflow-auto", className)}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-full text-xs",
                socketConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  socketConnected ? "bg-green-500" : "bg-red-500"
                )}
              />
              {socketConnected ? "Live" : "Offline"}
            </div>

            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>

            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Unread</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
              <EyeOff className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Critical</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {stats.bySeverity.critical || 0}
                </p>
              </div>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">High Priority</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {stats.bySeverity.high || 0}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Notifications</h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {loading
                    ? "Loading notifications..."
                    : `Showing ${filteredNotifications.length} notifications`}
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                >
                  Unread
                  <span className="ml-1 inline-block min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-xs">
                    {unreadCount}
                  </span>
                </Button>
                <Button
                  variant={filter === "read" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("read")}
                >
                  Read
                </Button>
              </div>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-4 md:mx-6">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{error}</p>
                <Button onClick={clearError} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Content */}
          <div className="overflow-hidden">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 sm:py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {filter === "unread" ? "No unread notifications" : "No notifications found"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4",
                      notification.status === "unread" && "bg-blue-50",
                      getSeverityColor(notification.severity)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        {getSeverityIcon(notification.severity)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] sm:text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              {getActionTypeLabel(notification.action)}
                            </span>
                            {notification.status === "unread" && (
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>

                          <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                            {notification.title}
                          </h3>

                          {notification.message && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 sm:line-clamp-none">
                              {notification.message}
                            </p>
                          )}

                          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(notification.createdAt)}
                            </div>

                            {notification.user && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {notification.user.person
                                  ? `${notification.user.person.firstName} ${notification.user.person.lastName}`
                                  : notification.user.userName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(
                              actionMenuOpen === notification.id ? null : notification.id
                            );
                          }}
                          className="p-1 h-8 w-8"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {actionMenuOpen === notification.id && (
                          <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                            {notification.status === "unread" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Mark as Read
                              </button>
                            )}

                            {isGuidance && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {pagination.hasNextPage && (
            <div className="flex justify-center p-4 border-t border-gray-200">
              <Button onClick={loadMore} variant="outline" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Notification Modal */}
        <NotificationModal
          notification={selectedNotification}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNotification(null);
          }}
          onMarkAsRead={handleMarkAsRead}
          onDelete={isGuidance ? handleDelete : undefined}
          canDelete={isGuidance}
        />
      </div>
    </main>
  );
};
