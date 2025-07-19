import { Modal } from "@/components/atoms";
import {
  AnxietyQuestionnaire,
  AssessmentGrid,
  DepressionQuestionnaire,
  RetakeRequestForm,
  RetakeRequestsTable,
  StressQuestionnaire,
  SuicideQuestionnaire,
} from "@/components/molecules";
import { useAnxiety, useAuth, useDepression, useStress, useSuicide } from "@/hooks";
import type { CooldownInfo } from "@/services/stress.service";
import { AlertCircle, CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import React, { useState } from "react";

type AssessmentType = "anxiety" | "depression" | "stress" | "suicide" | null;
type ResourceView = "assessments" | "retake-requests" | "my-requests";

export const ResourcesContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ResourceView>("assessments");
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>(null);
  const [submissionState, setSubmissionState] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
    results: any;
    cooldownInfo?: CooldownInfo;
  }>({
    loading: false,
    error: null,
    success: false,
    results: null,
  });

  const { user } = useAuth();
  const anxietyHook = useAnxiety();
  const depressionHook = useDepression();
  const stressHook = useStress();
  const suicideHook = useSuicide();

  const isStudent = user?.type === "student";

  const handleSelectAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
    setSubmissionState({ loading: false, error: null, success: false, results: null });
  };

  const handleBackToGrid = () => {
    setCurrentAssessment(null);
    setSubmissionState({ loading: false, error: null, success: false, results: null });
  };

  // const handleBackToMain = () => {
  //   setCurrentView("assessments");
  //   setCurrentAssessment(null);
  //   setSubmissionState({ loading: false, error: null, success: false, results: null });
  // };

  const handleCloseModal = () => {
    setSubmissionState((prev) => ({ ...prev, success: false, results: null }));
  };

  const formatCooldownMessage = (cooldownInfo: CooldownInfo) => {
    const { daysRemaining, nextAvailableDate } = cooldownInfo;
    const nextDate = new Date(nextAvailableDate).toLocaleDateString();

    if (daysRemaining === 1) {
      return `You can take this assessment again tomorrow (${nextDate}).`;
    } else if (daysRemaining <= 7) {
      return `You can take this assessment again in ${daysRemaining} days (${nextDate}).`;
    } else {
      return `You can take this assessment again on ${nextDate}.`;
    }
  };

  const handleSubmitAssessment = async (responses: Record<number, number>) => {
    if (!user?.id) {
      setSubmissionState({
        loading: false,
        error: "User not authenticated. Please log in to submit assessment.",
        success: false,
        results: null,
      });
      return;
    }

    setSubmissionState({ loading: true, error: null, success: false, results: null });

    try {
      let result;

      if (currentAssessment === "anxiety") {
        result = await anxietyHook.createAssessmentFromResponses(user.id, responses);
      } else if (currentAssessment === "depression") {
        result = await depressionHook.createAssessmentFromResponses(user.id, responses);
      } else if (currentAssessment === "stress") {
        result = await stressHook.createAssessmentFromResponses(user.id, responses);
      } else if (currentAssessment === "suicide") {
        result = await suicideHook.createAssessmentFromResponses(user.id, responses);
      }

      setSubmissionState({
        loading: false,
        error: null,
        success: true,
        results: result,
      });
    } catch (error: any) {
      if (error.error === "CooldownError") {
        setSubmissionState({
          loading: false,
          error: "Assessment cooldown is active.",
          success: false,
          results: null,
          cooldownInfo: error.cooldownInfo,
        });
      } else {
        setSubmissionState({
          loading: false,
          error: error.message || "Failed to submit assessment. Please try again.",
          success: false,
          results: null,
        });
      }
    }
  };

  const renderResultsModal = () => {
    if (!submissionState.success || !submissionState.results) return null;

    const { analysis, totalScore } = submissionState.results;
    const assessmentName = currentAssessment
      ? currentAssessment.charAt(0).toUpperCase() + currentAssessment.slice(1)
      : "Assessment";

    // Handle different assessment types - suicide uses riskLevel, others use severityLevel
    const displayLevel =
      currentAssessment === "suicide" ? analysis?.riskLevel : analysis?.severityLevel;

    const displayDescription =
      currentAssessment === "suicide" ? analysis?.riskDescription : analysis?.severityDescription;

    // Determine severity level color and styling
    const getSeverityColor = (level: string) => {
      const normalizedLevel = level?.toLowerCase().replace("_", " ");
      switch (normalizedLevel) {
        case "minimal":
        case "low":
        case "none":
          return {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-800",
            icon: "text-green-600",
            badge: "bg-green-100 text-green-800",
          };
        case "mild":
        case "moderate":
          return {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-800",
            icon: "text-yellow-600",
            badge: "bg-yellow-100 text-yellow-800",
          };
        case "severe":
        case "high":
          return {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-800",
            icon: "text-red-600",
            badge: "bg-red-100 text-red-800",
          };
        default:
          return {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-800",
            icon: "text-blue-600",
            badge: "bg-blue-100 text-blue-800",
          };
      }
    };

    const severityColors = getSeverityColor(displayLevel || "");

    return (
      <Modal
        isOpen={submissionState.success}
        onClose={handleCloseModal}
        title="Assessment Results"
        size="xl"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Hero Section - Prominent Result Display */}
          <div
            className={`${severityColors.bg} ${severityColors.border} border-2 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-center`}
          >
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <CheckCircle
                className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${severityColors.icon}`}
              />
            </div>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              {assessmentName} Assessment Complete
            </h2>

            {/* Severity Level - Most Prominent */}
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Your Result</p>
              <div
                className={`inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full text-lg sm:text-xl font-bold ${severityColors.badge}`}
              >
                {displayLevel?.replace("_", " ").toUpperCase() || "N/A"}
              </div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mt-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalScore}</p>
              </div>
              <div className="hidden sm:block h-12 w-px bg-gray-300"></div>
              <div className="sm:hidden w-full h-px bg-gray-300"></div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Assessment Date</p>
                <p className="text-base sm:text-lg font-medium text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Help Alert - High Priority */}
          {(analysis?.needsProfessionalHelp || analysis?.requiresImmediateIntervention) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mx-auto sm:mx-0 sm:mt-1" />
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2">
                    🚨 Professional Support Recommended
                  </h3>
                  <p className="text-red-700 text-base sm:text-lg mb-4">
                    Based on your results, we strongly recommend speaking with a mental health
                    professional.
                  </p>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-red-200">
                    <p className="text-red-800 font-medium text-sm sm:text-base">
                      📞 Student Counseling Center: Available 24/7
                    </p>
                    <p className="text-red-700 text-xs sm:text-sm mt-1">
                      Please don't hesitate to reach out for support. You don't have to face this
                      alone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Section */}
          {displayDescription && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center sm:justify-start">
                📊 What This Means
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center sm:text-left">
                  {displayDescription}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {analysis?.recommendationMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 sm:mb-4 flex items-center justify-center sm:justify-start">
                💡 Personalized Recommendations
              </h3>
              <div className="prose prose-blue max-w-none">
                <p className="text-blue-800 text-base sm:text-lg leading-relaxed text-center sm:text-left">
                  {analysis.recommendationMessage}
                </p>
              </div>
            </div>
          )}

          {/* Score Breakdown - Collapsible/Secondary */}
          {analysis?.scoreBreakdown && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">
                📈 Detailed Score Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                  <div key={key} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                      <span className="text-gray-700 font-medium capitalize text-sm sm:text-base mb-1 sm:mb-0">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {value as number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              onClick={() => {
                handleCloseModal();
                window.location.href = "/resources";
              }}
              className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ✨ Take Another Assessment
            </button>
            <button
              onClick={() => {
                handleCloseModal();
                window.location.href = "/history";
              }}
              className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📋 View All Results
            </button>
          </div>

          {/* Additional Resources */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              💙 Remember: Seeking help is a sign of strength, not weakness.
            </p>
          </div>
        </div>
      </Modal>
    );
  };

  const renderErrorMessage = () => {
    if (!submissionState.error) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">
              {submissionState.cooldownInfo ? "Assessment Cooldown Active" : "Submission Failed"}
            </h4>
            <p className="text-sm text-red-700 mt-1">{submissionState.error}</p>
            {submissionState.cooldownInfo && (
              <p className="text-sm text-red-600 mt-2">
                {formatCooldownMessage(submissionState.cooldownInfo)}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setSubmissionState((prev) => ({ ...prev, error: null }))}
          className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <main className="flex-1 p-3 sm:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Loading Overlay */}
        {submissionState.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mx-4">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700 animate-spin" />
                <p className="text-gray-700 text-sm sm:text-base">Submitting your assessment...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {renderErrorMessage()}

        {/* Results Modal */}
        {renderResultsModal()}

        {/* Main Content */}
        {currentAssessment === null && (
          <>
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Mental Health Resources
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Access mental health assessments and manage your assessment requests.
              </p>
            </div>

            {/* Navigation Tabs (only for students) */}
            {isStudent && (
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setCurrentView("assessments")}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        currentView === "assessments"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2 inline" />
                      Take Assessments
                    </button>

                    <button
                      onClick={() => setCurrentView("retake-requests")}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        currentView === "retake-requests"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Clock className="w-4 h-4 mr-2 inline" />
                      Request Retake
                    </button>

                    <button
                      onClick={() => setCurrentView("my-requests")}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        currentView === "my-requests"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      📋 My Requests
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* Content based on current view */}
            {(currentView === "assessments" || !isStudent) && (
              <>
                <AssessmentGrid onSelectAssessment={handleSelectAssessment} />

                <div className="mt-8 sm:mt-12 bg-blue-50 rounded-lg p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                    Important Notice
                  </h2>
                  <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                    These assessments are screening tools and not diagnostic instruments. If you're
                    experiencing significant distress or having thoughts of self-harm, please
                    contact a mental health professional or call a crisis helpline immediately.
                  </p>
                </div>
              </>
            )}

            {currentView === "retake-requests" && isStudent && <RetakeRequestForm />}

            {currentView === "my-requests" && isStudent && (
              <RetakeRequestsTable showUserColumn={false} isUserView={true} />
            )}
          </>
        )}

        {/* Questionnaires */}
        {currentAssessment === "anxiety" && (
          <AnxietyQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}

        {currentAssessment === "depression" && (
          <DepressionQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}

        {currentAssessment === "stress" && (
          <StressQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}

        {currentAssessment === "suicide" && (
          <SuicideQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}
      </div>
    </main>
  );
};
