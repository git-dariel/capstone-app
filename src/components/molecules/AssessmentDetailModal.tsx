import { Modal } from "@/components/atoms";
import { AlertTriangle, Calendar, CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";
import React from "react";

interface AssessmentHistoryItem {
  id: string;
  type: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  score: number;
  severityLevel: string;
  date: string;
  createdAt: string;
}

interface AssessmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentHistoryItem | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "minimal":
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    case "mild":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "moderate":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "moderately severe":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "severe":
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "extremely severe":
    case "very severe":
      return "text-red-700 bg-red-100 border-red-300";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "anxiety":
      return "🧠";
    case "depression":
      return "💭";
    case "stress":
      return "⚡";
    case "suicide":
      return "🛡️";
    case "checklist":
      return "📝";
    default:
      return "📊";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "anxiety":
      return "text-primary-700 bg-primary-50 border-primary-200";
    case "depression":
      return "text-purple-700 bg-purple-50 border-purple-200";
    case "stress":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "suicide":
      return "text-red-700 bg-red-50 border-red-200";
    case "checklist":
      return "text-green-700 bg-green-50 border-green-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatSeverityLabel = (severity: string) => {
  switch (severity) {
    case "moderately_severe":
      return "Moderately Severe";
    default:
      return severity.charAt(0).toUpperCase() + severity.slice(1);
  }
};

const getScoreInterpretation = (type: string, score: number, severity: string) => {
  if (type === "suicide") {
    return {
      interpretation: "Risk assessment completed",
      recommendation:
        severity === "high" || severity === "severe"
          ? "Please seek immediate professional help. Contact emergency services if needed."
          : severity === "moderate"
          ? "Consider speaking with a mental health professional."
          : "Continue monitoring your mental health and maintain healthy coping strategies.",
    };
  }

  if (type === "checklist") {
    return {
      interpretation: `${score} personal problem${score !== 1 ? "s" : ""} identified`,
      recommendation:
        score > 10
          ? "Consider discussing these issues with a counselor to develop coping strategies."
          : score > 5
          ? "Some challenges identified. Consider seeking support for better management."
          : "Good overall management of personal challenges.",
    };
  }

  // For anxiety, depression, stress
  let interpretation = `Score of ${score}`;
  let recommendation = "";

  if (severity.toLowerCase().includes("severe")) {
    recommendation = "Consider seeking professional help. These symptoms may significantly impact daily functioning.";
  } else if (severity.toLowerCase().includes("moderate")) {
    recommendation = "Monitor symptoms closely. Consider speaking with a counselor or healthcare provider.";
  } else if (severity.toLowerCase().includes("mild")) {
    recommendation = "Continue self-care practices and stress management techniques.";
  } else {
    recommendation = "Maintain current wellness practices and continue monitoring your mental health.";
  }

  return { interpretation, recommendation };
};

export const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({ isOpen, onClose, assessment }) => {
  if (!assessment) return null;

  const { interpretation, recommendation } = getScoreInterpretation(
    assessment.type,
    assessment.score,
    assessment.severityLevel
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assessment Details" size="lg">
      <div className="space-y-4 sm:space-y-6 pb-2">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-3 rounded-full ${getTypeColor(assessment.type)}`}>
              <span className="text-xl sm:text-2xl">{getTypeIcon(assessment.type)}</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                {assessment.type === "checklist" ? "Personal Problems" : assessment.type} Assessment
              </h3>
            </div>
          </div>
          <div
            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full border ${getSeverityColor(
              assessment.severityLevel
            )} self-start sm:self-auto`}
          >
            <span className="font-medium text-sm sm:text-base">{formatSeverityLabel(assessment.severityLevel)}</span>
          </div>
        </div>

        {/* Score Section */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Score</h4>
            </div>
            {assessment.type === "suicide" ? (
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">Risk Assessment</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Level: {formatSeverityLabel(assessment.severityLevel)}
                </p>
              </div>
            ) : assessment.type === "checklist" ? (
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{assessment.score}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Problem{assessment.score !== 1 ? "s" : ""} Identified
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{assessment.score}</p>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Severity Level</h4>
            </div>
            <div
              className={`inline-flex px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium ${getSeverityColor(
                assessment.severityLevel
              )} mb-2`}
            >
              {formatSeverityLabel(assessment.severityLevel)}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">{interpretation}</p>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Assessment Date</h4>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {formatDate(assessment.date || assessment.createdAt)}
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Time Completed</h4>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {formatTime(assessment.date || assessment.createdAt)}
            </p>
          </div>
        </div>

        {/* Interpretation Section */}
        <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900 text-sm sm:text-base">Interpretation & Recommendations</h4>
          </div>
          <p className="text-blue-800 leading-relaxed text-sm sm:text-base">{recommendation}</p>
        </div>

        {/* Warning for High Risk */}
        {(assessment.severityLevel.toLowerCase().includes("severe") ||
          assessment.severityLevel.toLowerCase().includes("high")) && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <h4 className="font-medium text-red-900 text-sm sm:text-base">Important Notice</h4>
            </div>
            <p className="text-red-800 text-xs sm:text-sm leading-relaxed">
              This assessment indicates elevated levels that may require professional attention. If you're experiencing
              thoughts of self-harm or suicide, please contact emergency services immediately or reach out to a mental
              health crisis line.
            </p>
          </div>
        )}

        {/* Additional Resources */}
        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h4 className="font-medium text-green-900 text-sm sm:text-base">Next Steps</h4>
          </div>
          <ul className="text-green-800 text-xs sm:text-sm space-y-1">
            <li>• Continue regular self-assessments to track your progress</li>
            <li>• Practice healthy coping strategies and stress management techniques</li>
            <li>• Consider scheduling an appointment with a counselor if needed</li>
            <li>• Maintain regular sleep, exercise, and social connection routines</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
