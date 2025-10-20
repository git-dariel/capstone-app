import React from "react";
import { CheckCircle, AlertTriangle, AlertCircle, XCircle } from "lucide-react";

interface SeverityIndicatorProps {
  level: string;
  score?: number | null;
  showScore?: boolean;
  scoreLabel?: string;
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
  level,
  score,
  showScore = true,
  scoreLabel,
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
      case "critical":
        return {
          color: "text-red-800",
          bgColor: "bg-red-100",
          borderColor: "border-red-300",
          icon: XCircle,
          label: "Critical Risk",
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
    <div className="flex items-center space-x-2">
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
      >
        <Icon className={`w-3 h-3 mr-1`} />
        {config.label}
      </div>
      {showScore && score !== null && score !== undefined && (
        <span className="text-xs text-gray-500">
          {scoreLabel ? `${score} ${scoreLabel}` : `${score}`}
        </span>
      )}
    </div>
  );
};
