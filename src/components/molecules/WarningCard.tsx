import React from "react";
import { AlertTriangle, AlertCircle, XCircle, Info } from "lucide-react";
import type { ProgressInsight } from "@/services/student-dashboard.service";

interface WarningCardProps {
  insight: ProgressInsight;
}

export const WarningCard: React.FC<WarningCardProps> = ({ insight }) => {
  const getWarningConfig = (type: string, severity: string) => {
    if (type === "warning") {
      switch (severity) {
        case "high":
          return {
            icon: XCircle,
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            iconColor: "text-red-600",
            textColor: "text-red-800",
            title: "High Priority Alert",
          };
        case "medium":
          return {
            icon: AlertTriangle,
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            iconColor: "text-orange-600",
            textColor: "text-orange-800",
            title: "Attention Required",
          };
        default:
          return {
            icon: AlertCircle,
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            iconColor: "text-yellow-600",
            textColor: "text-yellow-800",
            title: "Notice",
          };
      }
    }

    switch (type) {
      case "improvement":
        return {
          icon: Info,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          textColor: "text-green-800",
          title: "Positive Progress",
        };
      case "decline":
        return {
          icon: AlertTriangle,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          textColor: "text-orange-800",
          title: "Needs Attention",
        };
      case "stable":
        return {
          icon: Info,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
          title: "Stable Progress",
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          textColor: "text-gray-800",
          title: "Information",
        };
    }
  };

  const config = getWarningConfig(insight.type, insight.severity);
  const Icon = config.icon;

  const getAssessmentTypeDisplay = (type: string) => {
    switch (type) {
      case "anxiety":
        return "Anxiety";
      case "stress":
        return "Stress";
      case "depression":
        return "Depression";
      case "suicide":
        return "Suicide Risk";
      case "overall":
        return "Overall";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className={`text-sm font-medium ${config.textColor}`}>{config.title}</h4>
            <span
              className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
            >
              {getAssessmentTypeDisplay(insight.assessmentType)}
            </span>
          </div>
          <p className={`text-sm ${config.textColor} mb-2`}>{insight.message}</p>
          {insight.recommendation && (
            <div
              className={`text-xs ${config.textColor} bg-white bg-opacity-50 rounded p-2 border ${config.borderColor}`}
            >
              <strong>Recommendation:</strong> {insight.recommendation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
