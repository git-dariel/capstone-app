import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, AlertTriangle, Clock, RefreshCw, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  getReminderMessage,
  getReminderSeverity,
  formatTimeRemaining,
  type InventoryReminderInfo,
  type RiskLevel,
} from "@/utils/inventoryReminder";

interface InventoryReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderInfo: InventoryReminderInfo;
  onUpdateNow: () => void;
  onDismiss: () => void;
}

export const InventoryReminderModal: React.FC<InventoryReminderModalProps> = ({
  isOpen,
  onClose,
  reminderInfo,
  onUpdateNow,
  onDismiss,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const severity = getReminderSeverity(reminderInfo);
  const message = getReminderMessage(reminderInfo);
  const timeRemaining = formatTimeRemaining(reminderInfo);

  const getRiskLevelColor = (level: RiskLevel | null) => {
    switch (level) {
      case "low":
        return "text-green-700 bg-green-100 border-green-300";
      case "moderate":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "high":
        return "text-orange-700 bg-orange-100 border-orange-300";
      case "critical":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "high":
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case "medium":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <Calendar className="w-6 h-6 text-blue-500" />;
    }
  };

  const getSeverityBackground = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "high":
        return "border-orange-200 bg-orange-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const handleUpdateNow = () => {
    onUpdateNow();
    onClose();
    // Navigate to inventory page
    navigate("/inventory/my-inventory");
  };

  const handleDismiss = () => {
    onDismiss();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getSeverityIcon(severity)}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inventory Update Reminder
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Banner */}
          <div className={cn("p-4 rounded-lg border", getSeverityBackground(severity))}>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {reminderInfo.isOverdue ? "Update Overdue" : "Update Reminder"}
              </span>
            </div>
            <p className="text-sm text-gray-700">{message}</p>
          </div>

          {/* Risk Level Info */}
          {reminderInfo.riskLevel && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Current Risk Level</h4>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-3 py-1 text-sm font-semibold rounded-lg capitalize border",
                    getRiskLevelColor(reminderInfo.riskLevel)
                  )}
                >
                  {reminderInfo.riskLevel}
                </span>
                <span className="text-sm text-gray-600">
                  (Update every {reminderInfo.updateFrequencyMonths} months)
                </span>
              </div>
            </div>
          )}

          {/* Timeline Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Timeline</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">
                  {reminderInfo.lastUpdated
                    ? reminderInfo.lastUpdated.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Never"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    reminderInfo.isOverdue ? "text-red-600" : "text-orange-600"
                  )}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          {/* Benefits of Updating */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Why Update Your Inventory?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Get updated mental health predictions based on current status</span>
              </li>
              <li className="flex items-start gap-2">
                <Brain className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>Receive personalized recommendations for your wellbeing</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                <span>Maintain accurate records for counseling sessions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            Remind Me Later
          </Button>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
            <Button
              onClick={handleUpdateNow}
              size="sm"
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Update Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
