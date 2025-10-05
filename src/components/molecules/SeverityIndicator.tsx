import React from "react";
import { CheckCircle, AlertTriangle, AlertCircle, XCircle } from "lucide-react";

interface SeverityIndicatorProps {
  level: string;
  score?: number | null;
  showScore?: boolean;
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
  level,
  score,
  showScore = true,
}) => {
  const getSeverityConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case "minimal":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: CheckCircle,
          label: "Minimal",
        };
      case "mild":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: AlertTriangle,
          label: "Mild",
        };
      case "moderate":
        return {
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          icon: AlertCircle,
          label: "Moderate",
        };
      case "severe":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: XCircle,
          label: "Severe",
        };
      case "low":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: CheckCircle,
          label: "Low Risk",
        };
      case "medium":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: AlertTriangle,
          label: "Medium Risk",
        };
      case "high":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: XCircle,
          label: "High Risk",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: AlertCircle,
          label: level,
        };
    }
  };

  const config = getSeverityConfig(level);
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon className={`w-4 h-4 ${config.color} mr-2`} />
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        {showScore && score !== null && score !== undefined && (
          <span className="text-xs text-gray-500">Score: {score}</span>
        )}
      </div>
    </div>
  );
};
