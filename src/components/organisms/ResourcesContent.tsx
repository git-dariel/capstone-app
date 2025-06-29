import React, { useState } from "react";
import {
  AssessmentGrid,
  AnxietyQuestionnaire,
  DepressionQuestionnaire,
  StressQuestionnaire,
} from "@/components/molecules";
import { useAnxiety, useDepression, useStress, useAuth } from "@/hooks";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/atoms";

type AssessmentType = "anxiety" | "depression" | "stress" | null;

export const ResourcesContent: React.FC = () => {
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>(null);
  const [submissionState, setSubmissionState] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
    results: any;
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

  const handleSelectAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
    setSubmissionState({ loading: false, error: null, success: false, results: null });
  };

  const handleBackToGrid = () => {
    setCurrentAssessment(null);
    setSubmissionState({ loading: false, error: null, success: false, results: null });
  };

  const handleCloseModal = () => {
    setSubmissionState((prev) => ({ ...prev, success: false, results: null }));
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
      }

      setSubmissionState({
        loading: false,
        error: null,
        success: true,
        results: result,
      });
    } catch (error: any) {
      setSubmissionState({
        loading: false,
        error: error.message || "Failed to submit assessment. Please try again.",
        success: false,
        results: null,
      });
    }
  };

  const renderResultsModal = () => {
    if (!submissionState.success || !submissionState.results) return null;

    const { analysis, totalScore } = submissionState.results;
    const assessmentName = currentAssessment
      ? currentAssessment.charAt(0).toUpperCase() + currentAssessment.slice(1)
      : "Assessment";

    return (
      <Modal
        isOpen={submissionState.success}
        onClose={handleCloseModal}
        title="Assessment Complete!"
        size="xl"
      >
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Results Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Assessment Type</p>
                <p className="text-lg font-medium text-gray-900">{assessmentName} Assessment</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-lg font-medium text-gray-900">{totalScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Severity Level</p>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {analysis?.severityLevel?.replace("_", " ") || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assessment Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis & Recommendations */}
          {analysis?.severityDescription && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Analysis</h4>
              <p className="text-gray-700 leading-relaxed">{analysis.severityDescription}</p>
            </div>
          )}

          {analysis?.recommendationMessage && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Recommendations</h4>
              <p className="text-gray-700 leading-relaxed">{analysis?.recommendationMessage}</p>
            </div>
          )}

          {/* Professional Help Alert */}
          {analysis?.needsProfessionalHelp && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Professional Support Recommended
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Based on your results, we recommend speaking with a mental health professional.
                    Please consider reaching out to our Student Counseling Center.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          {analysis?.scoreBreakdown && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Score Breakdown</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{value as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Take Another Assessment
            </button>
            <button
              onClick={() => {
                handleCloseModal();
                window.location.href = "/reports";
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              View All Results
            </button>
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
            <h4 className="text-sm font-medium text-red-800">Submission Failed</h4>
            <p className="text-sm text-red-700 mt-1">{submissionState.error}</p>
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
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Loading Overlay */}
        {submissionState.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                <p className="text-gray-700">Submitting your assessment...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {renderErrorMessage()}

        {/* Results Modal */}
        {renderResultsModal()}

        {/* Assessment Grid */}
        {currentAssessment === null && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Mental Health Resources</h1>
              <p className="text-gray-600 mt-1">
                Take a confidential assessment to better understand your mental health. Choose an
                assessment below to get started.
              </p>
            </div>

            <AssessmentGrid onSelectAssessment={handleSelectAssessment} />

            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h2>
              <p className="text-blue-800 text-sm leading-relaxed">
                These assessments are screening tools and not diagnostic instruments. If you're
                experiencing significant distress or having thoughts of self-harm, please contact a
                mental health professional or call a crisis helpline immediately.
              </p>
            </div>
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
      </div>
    </main>
  );
};
