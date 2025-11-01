import React from "react";
import { Lightbulb, AlertTriangle, CheckCircle, Info, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationsCardProps {
  recommendations: string[];
  assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  severity?: string;
  className?: string;
  showTitle?: boolean;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendations,
  assessmentType,
  severity,
  className,
  showTitle = true,
}) => {
  // Get appropriate icon and colors based on assessment type and severity
  const getCardConfig = () => {
    if (assessmentType === "suicide") {
      return {
        icon: AlertTriangle,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
        textColor: "text-red-800",
        title: "Crisis Support Recommendations",
      };
    }

    // For other assessments, base colors on severity
    switch (severity) {
      case "severe":
      case "high":
      case "critical":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          textColor: "text-red-800",
          title: "High Priority Recommendations",
        };
      case "moderately_severe":
      case "moderate":
        return {
          icon: Info,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          textColor: "text-orange-800",
          title: "Important Recommendations",
        };
      case "mild":
      case "low":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          textColor: "text-green-800",
          title: "Wellness Recommendations",
        };
      case "minimal":
        return {
          icon: Heart,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
          title: "Maintenance Recommendations",
        };
      default:
        return {
          icon: Lightbulb,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          textColor: "text-gray-800",
          title: "Personalized Recommendations",
        };
    }
  };

  const getAssessmentTypeDisplay = (type: string) => {
    switch (type) {
      case "anxiety":
        return "Anxiety (GAD-7)";
      case "depression":
        return "Depression (PHQ-9)";
      case "stress":
        return "Stress (PSS-10)";
      case "suicide":
        return "Suicide Risk Assessment";
      case "checklist":
        return "Personal Problems Checklist";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const config = getCardConfig();
  const Icon = config.icon;

  // Don't render if no recommendations
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-lg border p-4", config.bgColor, config.borderColor, className)}>
      {showTitle && (
        <div className="flex items-start space-x-3 mb-4">
          <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconColor)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={cn("text-sm font-medium", config.textColor)}>{config.title}</h4>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full border",
                  config.bgColor,
                  config.textColor,
                  config.borderColor
                )}
              >
                {getAssessmentTypeDisplay(assessmentType)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className={cn("text-xs bg-white bg-opacity-50 rounded p-3 border", config.borderColor, config.textColor)}
          >
            <div className="flex items-start space-x-2">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                  config.iconColor.replace("text-", "bg-")
                )}
              />
              <p className="flex-1 leading-relaxed">{recommendation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Crisis support footer for suicide assessments */}
      {assessmentType === "suicide" && (
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h5 className="text-xs font-medium text-red-800">Emergency Resources</h5>
          </div>
          <div className="space-y-1 text-xs text-red-700">
            <p>
              • <strong>National Emergency Hotline in the Philippines:</strong> 911
            </p>
            <p>
              • <strong>Student Counseling Center:</strong> 0928-832-7363
            </p>
            <p>• Contact your guidance counselor immediately</p>
          </div>
        </div>
      )}

      {/* General support footer for other high-severity assessments */}
      {assessmentType !== "suicide" && (severity === "severe" || severity === "high" || severity === "critical") && (
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border border-orange-200">
          <div className="flex items-center space-x-2 mb-1">
            <Info className="w-4 h-4 text-orange-600" />
            <h5 className="text-xs font-medium text-orange-800">Professional Support</h5>
          </div>
          <p className="text-xs text-orange-700">
            Consider scheduling an appointment with your guidance counselor for personalized support and additional
            resources.
          </p>
        </div>
      )}
    </div>
  );
};
