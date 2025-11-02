import { Modal, LoadingSpinner } from "@/components/atoms";
import {
  AnxietyQuestionnaire,
  AssessmentGrid,
  ChecklistQuestionnaire,
  DepressionQuestionnaire,
  RetakeRequestForm,
  RetakeRequestsTable,
  StressQuestionnaire,
  SuicideQuestionnaire,
  RecommendationsCard,
} from "@/components/molecules";
import { useAnxiety, useAuth, useChecklist, useDepression, useStress, useSuicide } from "@/hooks";
import type { CooldownInfo } from "@/services/stress.service";
import { activityCategories, type Activity } from "@/data/activities";
import { AlertCircle, CheckCircle, Clock, FileText, Play, BookOpen, Headphones, Heart } from "lucide-react";
import React, { useState } from "react";

type AssessmentType = "anxiety" | "depression" | "stress" | "suicide" | "checklist" | null;
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
  const checklistHook = useChecklist();

  const isStudent = user?.type === "student";
  const isGuidance = user?.type === "guidance";

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

  const handleSubmitChecklist = async (responses: Record<string, string>) => {
    if (!user?.id) {
      setSubmissionState({
        loading: false,
        error: "User not authenticated. Please log in to submit checklist.",
        success: false,
        results: null,
      });
      return;
    }

    setSubmissionState({ loading: true, error: null, success: false, results: null });

    try {
      const result = await checklistHook.createChecklistFromResponses(user.id, responses);

      setSubmissionState({
        loading: false,
        error: null,
        success: true,
        results: result,
      });
    } catch (error: any) {
      setSubmissionState({
        loading: false,
        error: error.message || "Failed to submit checklist. Please try again.",
        success: false,
        results: null,
      });
    }
  };

  const getRecommendedActivities = (assessmentType: AssessmentType, severityLevel?: string): Activity[] => {
    if (!assessmentType || !severityLevel) return [];

    const normalizedSeverity = severityLevel.toLowerCase().replace("_", " ");
    const allActivities = activityCategories.flatMap((category) => category.activities);

    // Filter activities based on assessment type and severity
    let recommendedActivities: Activity[] = [];

    switch (assessmentType) {
      case "anxiety":
        // For anxiety, prioritize breathing exercises and mindfulness
        recommendedActivities = allActivities.filter(
          (activity) =>
            activity.type === "breathing" ||
            activity.type === "audio" ||
            activity.benefits.some(
              (benefit) =>
                benefit.toLowerCase().includes("anxiety") ||
                benefit.toLowerCase().includes("calm") ||
                benefit.toLowerCase().includes("stress")
            )
        );
        break;

      case "depression":
        // For depression, prioritize mood-boosting activities
        recommendedActivities = allActivities.filter(
          (activity) =>
            activity.type === "exercise" ||
            activity.type === "video" ||
            activity.benefits.some(
              (benefit) =>
                benefit.toLowerCase().includes("mood") ||
                benefit.toLowerCase().includes("depression") ||
                benefit.toLowerCase().includes("energy")
            )
        );
        break;

      case "stress":
        // For stress, prioritize relaxation and physical activities
        recommendedActivities = allActivities.filter(
          (activity) =>
            activity.type === "breathing" ||
            activity.type === "exercise" ||
            activity.type === "audio" ||
            activity.benefits.some(
              (benefit) =>
                benefit.toLowerCase().includes("stress") ||
                benefit.toLowerCase().includes("relax") ||
                benefit.toLowerCase().includes("tension")
            )
        );
        break;

      case "suicide":
        // For suicide risk, prioritize immediate coping and grounding activities
        recommendedActivities = allActivities.filter(
          (activity) =>
            activity.type === "breathing" ||
            activity.type === "video" ||
            activity.benefits.some(
              (benefit) =>
                benefit.toLowerCase().includes("grounding") ||
                benefit.toLowerCase().includes("immediate") ||
                benefit.toLowerCase().includes("panic")
            )
        );
        break;

      case "checklist":
        // For general checklist, provide a balanced mix
        recommendedActivities = allActivities.filter(
          (activity) => activity.isRecommended || activity.type === "breathing" || activity.type === "exercise"
        );
        break;

      default:
        recommendedActivities = allActivities.filter((activity) => activity.isRecommended);
    }

    // Adjust recommendations based on severity
    if (normalizedSeverity.includes("severe") || normalizedSeverity.includes("high")) {
      // For severe cases, prioritize beginner-friendly, immediate relief activities
      recommendedActivities = recommendedActivities
        .filter((activity) => activity.difficulty === "beginner")
        .sort((a, b) => {
          // Prioritize shorter duration activities for immediate relief
          const aDuration = parseInt(a.duration) || 999;
          const bDuration = parseInt(b.duration) || 999;
          return aDuration - bDuration;
        });
    } else if (normalizedSeverity.includes("moderate") || normalizedSeverity.includes("mild")) {
      // For moderate cases, include beginner and intermediate activities
      recommendedActivities = recommendedActivities.filter(
        (activity) => activity.difficulty === "beginner" || activity.difficulty === "intermediate"
      );
    }

    // Return top 6 activities to avoid overwhelming the user
    return recommendedActivities.slice(0, 6);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "breathing":
        return <Heart className="w-5 h-5" />;
      case "video":
        return <Play className="w-5 h-5" />;
      case "audio":
        return <Headphones className="w-5 h-5" />;
      case "reading":
        return <BookOpen className="w-5 h-5" />;
      case "exercise":
        return <Heart className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const renderResultsModal = () => {
    if (!submissionState.success || !submissionState.results) return null;

    // Handle different response structures for different assessment types
    const analysis =
      currentAssessment === "checklist" ? submissionState.results.checklist_analysis : submissionState.results.analysis;

    const { totalScore } = submissionState.results;
    const assessmentName = currentAssessment
      ? currentAssessment.charAt(0).toUpperCase() + currentAssessment.slice(1)
      : "Assessment";

    // For suicide and checklist, we do not display a total score in the UI
    const shouldShowScore = !(currentAssessment === "suicide" || currentAssessment === "checklist");
    // For checklist, if needed elsewhere, we compute but won't render in the summary
    const displayScore = currentAssessment === "checklist" ? analysis?.totalProblemsChecked : totalScore;
    const scoreLabel = currentAssessment === "checklist" ? "Problems Identified" : "Total Score";

    // Handle different assessment types
    const displayLevel =
      currentAssessment === "suicide"
        ? analysis?.riskLevel
        : currentAssessment === "checklist"
        ? analysis?.riskLevel
        : analysis?.severityLevel;

    // const displayDescription =
    //   currentAssessment === "suicide"
    //     ? analysis?.riskDescription
    //     : currentAssessment === "checklist"
    //     ? analysis?.disclaimer
    //     : analysis?.severityDescription;

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
      <Modal isOpen={submissionState.success} onClose={handleCloseModal} title="Assessment Results" size="full">
        <div className="h-full flex flex-col bg-gray-50">
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Summary Column */}
                <section className="lg:col-span-4 space-y-6">
                  {/* Result Summary Card */}
                  <div className={`rounded-xl border ${severityColors.border} bg-white`}>
                    <div className={`px-6 py-5 border-b ${severityColors.border} ${severityColors.bg}`}>
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-6 h-6 ${severityColors.icon}`} />
                        <h2 className="text-lg font-semibold text-gray-900">{assessmentName} Assessment</h2>
                      </div>
                    </div>
                    <div className="px-6 py-5 space-y-5">
                      {/* Severity */}
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Result</p>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${severityColors.badge}`}
                        >
                          {displayLevel?.replace("_", " ").toUpperCase() || "N/A"}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className={"grid gap-4 " + (shouldShowScore ? "grid-cols-2" : "grid-cols-1")}>
                        {shouldShowScore && (
                          <div className="rounded-lg border border-gray-200 p-4 text-center">
                            <p className="text-xs text-gray-500">{scoreLabel}</p>
                            <p className="text-2xl font-bold text-gray-900">{displayScore}</p>
                          </div>
                        )}
                        <div className="rounded-lg border border-gray-200 p-4 text-center">
                          <p className="text-xs text-gray-500">Assessment Date</p>
                          <p className="text-base font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Key message (if any) */}
                      {analysis?.recommendationMessage && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm text-blue-900">{analysis.recommendationMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Safety Notice for high risk */}
                  {displayLevel &&
                    (displayLevel.toLowerCase().includes("high") || displayLevel.toLowerCase().includes("severe")) && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">Immediate attention recommended.</p>
                        <p className="text-sm text-red-700 mt-1">
                          If there is imminent risk, contact emergency services or a crisis hotline right away.
                        </p>
                      </div>
                    )}
                </section>

                {/* Detail Column */}
                <section className="lg:col-span-8 space-y-6">
                  {/* Clinical Interpretation */}
                  {/* {displayDescription && (
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900">Clinical Interpretation</h3>
                      </div>
                      <div className="px-6 py-5">
                        <p className="text-gray-700 leading-relaxed">{displayDescription}</p>
                      </div>
                    </div>
                  )} */}

                  {/* Recommendations */}
                  {analysis?.recommendations && analysis.recommendations.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="px-6 py-5">
                        <RecommendationsCard
                          recommendations={analysis.recommendations}
                          assessmentType={currentAssessment!}
                          severity={displayLevel}
                          className="border-0"
                        />
                      </div>
                    </div>
                  )}

                  {/* Recommended Activities */}
                  {(() => {
                    const recommendedActivities = getRecommendedActivities(currentAssessment, displayLevel);
                    return (
                      recommendedActivities.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white">
                          <div className="px-6 py-5 border-b border-gray-200">
                            <h3 className="text-base font-semibold text-gray-900">Recommended Activities</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Activities specifically selected based on your assessment results
                            </p>
                          </div>
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {recommendedActivities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 text-primary-600 mt-0.5">
                                      {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                          {activity.title}
                                        </h4>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                          {activity.duration}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {activity.benefits.slice(0, 2).map((benefit) => (
                                          <span
                                            key={benefit}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                                          >
                                            {benefit}
                                          </span>
                                        ))}
                                      </div>
                                      {activity.url && (
                                        <a
                                          href={activity.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                        >
                                          Start Activity
                                          <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </a>
                                      )}
                                      {activity.instructions && !activity.url && (
                                        <button
                                          onClick={() => {
                                            const activityData = encodeURIComponent(JSON.stringify(activity));
                                            const timerUrl = `/activity-timer?activity=${activityData}`;
                                            window.open(timerUrl, "_blank");
                                          }}
                                          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                        >
                                          Start Activity
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    );
                  })()}

                  {/* Score Breakdown */}
                  {/* {analysis?.scoreBreakdown && (
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900">Score Breakdown</h3>
                      </div>
                      <div className="px-6 py-5 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                              <tr key={key}>
                                <td className="px-4 py-2 text-sm text-gray-700 capitalize">{key.replace(/_/g, " ")}</td>
                                <td className="px-4 py-2 text-sm font-semibold text-gray-900">{value as number}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )} */}
                </section>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-gray-200 bg-white p-4 lg:p-6">
            <div className="max-w-7xl mx-auto flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleCloseModal();
                    window.location.href = "/history";
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View All Results
                </button>
                {/* <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Print Report
                </button> */}
              </div>
              <button
                onClick={() => {
                  handleCloseModal();
                  window.location.href = "/resources";
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"
              >
                Return to Assessments
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const renderErrorMessage = () => {
    if (!submissionState.error) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
        <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mx-auto sm:mx-0 flex-shrink-0" />
          <div className="text-center sm:text-left flex-1">
            <h4 className="text-sm font-medium text-red-800 mb-1">
              {submissionState.cooldownInfo ? "Assessment Cooldown Active" : "Submission Failed"}
            </h4>
            <p className="text-sm text-red-700 mb-2">{submissionState.error}</p>
            {submissionState.cooldownInfo && (
              <p className="text-sm text-red-600 mb-3">{formatCooldownMessage(submissionState.cooldownInfo)}</p>
            )}
            <button
              onClick={() => setSubmissionState((prev) => ({ ...prev, error: null }))}
              className="text-sm text-red-600 hover:text-red-700 underline font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 p-3 sm:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Loading Overlay */}
        {submissionState.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mx-4 w-full max-w-sm">
              <div className="flex flex-col items-center justify-center space-y-3">
                <LoadingSpinner size="lg" variant="lottie" />
                <p className="text-gray-700 text-sm sm:text-base text-center">Submitting your assessment...</p>
                <div className="text-xs text-gray-500 text-center">Please wait while we process your responses</div>
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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Mental Health Resources</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Access mental health assessments and manage your assessment requests.
              </p>
            </div>

            {/* Navigation Tabs (only for students) */}
            {isStudent && (
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav
                    className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8"
                    aria-label="Tabs"
                  >
                    <button
                      onClick={() => setCurrentView("assessments")}
                      className={`whitespace-nowrap py-3 px-4 sm:py-2 sm:px-1 border-b-2 font-medium text-sm rounded-t-lg sm:rounded-none ${
                        currentView === "assessments"
                          ? "border-primary-500 text-primary-600 bg-primary-50 sm:bg-transparent"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent"
                      } transition-colors duration-200`}
                    >
                      <FileText className="w-4 h-4 mr-2 inline" />
                      Take Assessments
                    </button>

                    <button
                      onClick={() => setCurrentView("retake-requests")}
                      className={`whitespace-nowrap py-3 px-4 sm:py-2 sm:px-1 border-b-2 font-medium text-sm rounded-t-lg sm:rounded-none ${
                        currentView === "retake-requests"
                          ? "border-primary-500 text-primary-600 bg-primary-50 sm:bg-transparent"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent"
                      } transition-colors duration-200`}
                    >
                      <Clock className="w-4 h-4 mr-2 inline" />
                      Request Retake
                    </button>

                    <button
                      onClick={() => setCurrentView("my-requests")}
                      className={`whitespace-nowrap py-3 px-4 sm:py-2 sm:px-1 border-b-2 font-medium text-sm rounded-t-lg sm:rounded-none ${
                        currentView === "my-requests"
                          ? "border-primary-500 text-primary-600 bg-primary-50 sm:bg-transparent"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent"
                      } transition-colors duration-200`}
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
                <AssessmentGrid onSelectAssessment={handleSelectAssessment} isGuidanceUser={isGuidance} />

                <div className="mt-6 sm:mt-8 lg:mt-12 bg-blue-50 rounded-lg p-4 sm:p-6 mx-2 sm:mx-0">
                  <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 text-center sm:text-left">
                    Important Notice
                  </h2>
                  <p className="text-blue-800 text-xs sm:text-sm leading-relaxed text-center sm:text-left">
                    These assessments are screening tools and not diagnostic instruments. If you're experiencing
                    significant distress or having thoughts of self-harm, please contact a mental health professional or
                    call a crisis helpline immediately.
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
          <AnxietyQuestionnaire
            onBack={handleBackToGrid}
            onSubmit={handleSubmitAssessment}
            loading={submissionState.loading}
          />
        )}

        {currentAssessment === "depression" && (
          <DepressionQuestionnaire
            onBack={handleBackToGrid}
            onSubmit={handleSubmitAssessment}
            loading={submissionState.loading}
          />
        )}

        {currentAssessment === "stress" && (
          <StressQuestionnaire
            onBack={handleBackToGrid}
            onSubmit={handleSubmitAssessment}
            loading={submissionState.loading}
          />
        )}

        {currentAssessment === "suicide" && (
          <SuicideQuestionnaire
            onBack={handleBackToGrid}
            onSubmit={handleSubmitAssessment}
            loading={submissionState.loading}
          />
        )}

        {currentAssessment === "checklist" && (
          <ChecklistQuestionnaire
            onBack={handleBackToGrid}
            onSubmit={handleSubmitChecklist}
            loading={submissionState.loading}
          />
        )}
      </div>
    </main>
  );
};
