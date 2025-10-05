import React from "react";
import { Brain, Heart, Zap, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SeverityIndicator } from "./SeverityIndicator";

interface AssessmentOverviewCardProps {
  type: "anxiety" | "stress" | "depression" | "suicide";
  totalCount: number;
  latestAssessment?: {
    totalScore?: number | null;
    severityLevel: string;
    riskLevel?: string;
    assessmentDate: string;
    requiresIntervention?: boolean;
  } | null;
  trend?: "up" | "down" | "stable";
  trendPercentage?: number;
}

export const AssessmentOverviewCard: React.FC<AssessmentOverviewCardProps> = ({
  type,
  totalCount,
  latestAssessment,
  trend,
  trendPercentage,
}) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "anxiety":
        return {
          icon: Brain,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          label: "Anxiety",
        };
      case "stress":
        return {
          icon: Zap,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          label: "Stress",
        };
      case "depression":
        return {
          icon: Heart,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          label: "Depression",
        };
      case "suicide":
        return {
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Suicide Risk",
        };
      default:
        return {
          icon: Brain,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: type,
        };
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSeverityLevel = () => {
    if (!latestAssessment) return "No Data";
    return latestAssessment.severityLevel || latestAssessment.riskLevel || "Unknown";
  };

  const getScore = () => {
    if (!latestAssessment) return null;
    return latestAssessment.totalScore;
  };

  return (
    <div
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <h3 className={`font-medium ${config.color}`}>{config.label}</h3>
        </div>
        {trend && trendPercentage !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
            <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Total Assessments */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Assessments</span>
          <span className="text-lg font-semibold text-gray-900">{totalCount}</span>
        </div>

        {/* Latest Assessment */}
        {latestAssessment ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Latest Assessment</span>
              <span className="text-xs text-gray-500">
                {formatDate(latestAssessment.assessmentDate)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Severity Level</span>
              <SeverityIndicator
                level={getSeverityLevel()}
                score={getScore()}
                showScore={type !== "suicide"}
              />
            </div>

            {latestAssessment.requiresIntervention && (
              <div className="bg-red-100 border border-red-200 rounded p-2">
                <p className="text-xs text-red-800 font-medium">
                  ⚠️ Immediate intervention required
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No assessments taken yet</p>
            <p className="text-xs text-gray-400 mt-1">Take your first assessment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
