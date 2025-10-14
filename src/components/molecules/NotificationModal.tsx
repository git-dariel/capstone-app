import React, { useEffect } from "react";
import { X, Clock, User, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Notification } from "@/services/notification.service";

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete,
  canDelete = false,
}) => {
  // Auto-mark as read when modal opens
  useEffect(() => {
    if (isOpen && notification && notification.status === "unread" && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [isOpen, notification, onMarkAsRead]);

  if (!isOpen || !notification) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "low":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      case "high":
        return "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20";
      case "medium":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
      case "low":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";
      default:
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionTypeLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      // Appointment actions
      APPOINTMENT_CREATED: "Appointment Created",
      APPOINTMENT_UPDATED: "Appointment Updated",
      APPOINTMENT_CANCELLED: "Appointment Cancelled",
      APPOINTMENT_CONFIRMED: "Appointment Confirmed",
      APPOINTMENT_COMPLETED: "Appointment Completed",

      // Assessment actions
      ANXIETY_ASSESSMENT_CREATED: "Anxiety Assessment Completed",
      ANXIETY_ASSESSMENT_UPDATED: "Anxiety Assessment Updated",
      DEPRESSION_ASSESSMENT_CREATED: "Depression Assessment Completed",
      DEPRESSION_ASSESSMENT_UPDATED: "Depression Assessment Updated",
      STRESS_ASSESSMENT_CREATED: "Stress Assessment Completed",
      STRESS_ASSESSMENT_UPDATED: "Stress Assessment Updated",
      SUICIDE_ASSESSMENT_CREATED: "Suicide Assessment Completed",
      SUICIDE_ASSESSMENT_UPDATED: "Suicide Assessment Updated",

      // Message actions
      MESSAGE_SENT: "Message Sent",
      MESSAGE_RECEIVED: "Message Received",
      MESSAGE_READ: "Message Read",

      // Consent actions
      CONSENT_CREATED: "Consent Form Created",
      CONSENT_UPDATED: "Consent Form Updated",

      // Inventory actions
      INVENTORY_CREATED: "Inventory Created",
      INVENTORY_UPDATED: "Inventory Updated",

      // Retake request actions
      RETAKE_REQUEST_CREATED: "Retake Request Submitted",
      RETAKE_REQUEST_APPROVED: "Retake Request Approved",
      RETAKE_REQUEST_REJECTED: "Retake Request Rejected",

      // Schedule actions
      SCHEDULE_CREATED: "Schedule Created",
      SCHEDULE_UPDATED: "Schedule Updated",
      SCHEDULE_CANCELLED: "Schedule Cancelled",
      SCHEDULE_AVAILABLE: "Schedule Available",
      SCHEDULE_BOOKED: "Schedule Booked",
    };

    return actionMap[action] || action.replace(/_/g, " ");
  };

  const handleMarkAsRead = () => {
    if (notification.status === "unread" && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
      onClose();
    }
  };

  const formatAdditionalData = (data: any) => {
    if (!data || typeof data !== "object") return null;

    return Object.entries(data).map(([key, value]) => {
      // Format key to be more readable
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      // Format value based on type
      let formattedValue: string;
      if (typeof value === "boolean") {
        formattedValue = value ? "Yes" : "No";
      } else if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          formattedValue = value.join(", ");
        } else {
          formattedValue = JSON.stringify(value, null, 2);
        }
      } else {
        formattedValue = String(value);
      }

      return { key: formattedKey, value: formattedValue };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-2 sm:mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:max-h-[90vh] overflow-hidden sm:overflow-visible sm:rounded-lg 
        max-h-[100vh] h-auto sm:h-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            {getSeverityIcon(notification.severity)}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Details
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-none">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                notification.status === "read"
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              )}
            >
              {notification.status === "read" ? "Read" : "Unread"}
            </span>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              {formatDate(notification.createdAt)}
            </div>
          </div>

          {/* Action Type */}
          <div className={cn("p-3 rounded-lg border", getSeverityColor(notification.severity))}>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {getActionTypeLabel(notification.action)}
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {notification.title}
            </h3>
            {notification.message && (
              <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
            )}
          </div>

          {/* User Info */}
          {notification.user && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {notification.user.person
                  ? `${notification.user.person.firstName} ${notification.user.person.lastName}`
                  : notification.user.userName}
              </span>
            </div>
          )}

          {/* Additional Data */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Additional Information
              </h4>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                {formatAdditionalData(notification.data)?.map(({ key, value }, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key}:
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-right sm:max-w-xs break-words">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entity Info */}
          {notification.entityType && notification.entityId && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Related to: {notification.entityType} ({notification.entityId})
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
          <div className="flex gap-2">
            {notification.status === "unread" && (
              <Button onClick={handleMarkAsRead} size="sm" variant="outline">
                Mark as Read
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {canDelete && (
              <Button onClick={handleDelete} size="sm" variant="destructive">
                Delete
              </Button>
            )}
            <Button onClick={onClose} size="sm" variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
