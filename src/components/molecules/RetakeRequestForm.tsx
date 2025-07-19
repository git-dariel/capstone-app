import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { useRetakeRequest } from "@/hooks/useRetakeRequest";
import { useAuth } from "@/hooks/useAuth";
import { useAnxiety } from "@/hooks/useAnxiety";
import { useDepression } from "@/hooks/useDepression";
import { useStress } from "@/hooks/useStress";
import type { CreateRetakeRequestData } from "@/services/retakeRequest.service";
import type { CooldownInfo } from "@/services/anxiety.service";
import { Clock, AlertCircle, CheckCircle, XCircle, Send } from "lucide-react";

interface AssessmentCooldownStatus {
  type: "anxiety" | "depression" | "stress" | "suicide";
  displayName: string;
  cooldownInfo: CooldownInfo | null;
  canRequest: boolean;
  hasActiveCooldown: boolean;
}

export const RetakeRequestForm: React.FC = () => {
  const { user } = useAuth();
  const { createRequest, canRequestRetake, loading, error, clearError } = useRetakeRequest();
  const anxietyHook = useAnxiety();
  const depressionHook = useDepression();
  const stressHook = useStress();

  const [assessmentStatuses, setAssessmentStatuses] = useState<AssessmentCooldownStatus[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentCooldownStatus | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  useEffect(() => {
    checkCooldownStatuses();
  }, [user?.id]);

  const checkCooldownStatuses = async () => {
    if (!user?.id) return;

    setLoadingStatuses(true);
    try {
      const [anxietyCooldown, depressionCooldown, stressCooldown] = await Promise.all([
        anxietyHook.checkCooldownStatus(user.id),
        depressionHook.checkCooldownStatus(user.id),
        stressHook.checkCooldownStatus(user.id),
        // Note: Suicide assessment cooldown check would be added here when available
      ]);

      const assessmentTypes: Array<{
        type: "anxiety" | "depression" | "stress" | "suicide";
        displayName: string;
        cooldownInfo: CooldownInfo | null;
      }> = [
        { type: "anxiety", displayName: "Anxiety (GAD-7)", cooldownInfo: anxietyCooldown },
        { type: "depression", displayName: "Depression (PHQ-9)", cooldownInfo: depressionCooldown },
        { type: "stress", displayName: "Stress (PSS-10)", cooldownInfo: stressCooldown },
        // { type: 'suicide', displayName: 'Suicide Risk Assessment', cooldownInfo: null }, // When available
      ];

      const statusPromises = assessmentTypes.map(async (assessment) => {
        const canRequest = await canRequestRetake(assessment.type);
        return {
          ...assessment,
          canRequest,
          hasActiveCooldown: assessment.cooldownInfo?.isActive || false,
        };
      });

      const statuses = await Promise.all(statusPromises);
      setAssessmentStatuses(statuses);
    } catch (error) {
      console.error("Error checking cooldown statuses:", error);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssessment || !reason.trim()) {
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      const requestData: CreateRetakeRequestData = {
        assessmentType: selectedAssessment.type,
        reason: reason.trim(),
        cooldownExpiry: selectedAssessment.cooldownInfo?.nextAvailableDate,
      };

      await createRequest(requestData);

      // Reset form and show success
      setSelectedAssessment(null);
      setReason("");
      setShowSuccess(true);

      // Refresh cooldown statuses
      await checkCooldownStatuses();

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to create retake request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCooldownMessage = (cooldownInfo: CooldownInfo) => {
    const { daysRemaining, nextAvailableDate } = cooldownInfo;
    const nextDate = new Date(nextAvailableDate).toLocaleDateString();

    if (daysRemaining <= 1) {
      return `You can take this assessment again tomorrow (${nextDate}).`;
    } else if (daysRemaining <= 7) {
      return `You can take this assessment again in ${daysRemaining} days (${nextDate}).`;
    } else {
      return `You can take this assessment again on ${nextDate}.`;
    }
  };

  if (loadingStatuses) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
          <span className="ml-3 text-gray-600">Checking assessment status...</span>
        </div>
      </div>
    );
  }

  const availableAssessments = assessmentStatuses.filter(
    (assessment) => assessment.hasActiveCooldown && assessment.canRequest
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Request Assessment Retake</h3>
        <p className="text-sm text-gray-500 mt-1">
          Request to retake an assessment that's currently in cooldown period
        </p>
      </div>

      <div className="p-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Request Submitted Successfully
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your retake request has been submitted and is pending review by a guidance
                    counselor. You'll be notified once it's been reviewed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {availableAssessments.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments in Cooldown</h3>
            <p className="text-gray-500 mb-4">
              You don't have any assessments currently in cooldown period, or you may have already
              requested a retake for assessments that are in cooldown.
            </p>
            <Button
              onClick={checkCooldownStatuses}
              variant="outline"
              className="inline-flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assessment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Assessment to Retake
              </label>
              <div className="space-y-3">
                {availableAssessments.map((assessment) => (
                  <div
                    key={assessment.type}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAssessment?.type === assessment.type
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="assessment"
                        value={assessment.type}
                        checked={selectedAssessment?.type === assessment.type}
                        onChange={() => setSelectedAssessment(assessment)}
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {assessment.displayName}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            In Cooldown
                          </span>
                        </div>
                        {assessment.cooldownInfo && (
                          <p className="text-sm text-gray-600 mt-1">
                            {formatCooldownMessage(assessment.cooldownInfo)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Retake Request *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need to retake this assessment..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please provide a clear and specific reason for your request. This helps the guidance
                counselor make an informed decision.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!selectedAssessment || !reason.trim() || submitting || loading}
                className="inline-flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting || loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        )}

        {/* Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Retake requests are reviewed by guidance counselors</li>
                  <li>You can only have one pending request per assessment type</li>
                  <li>Approved requests immediately lift the cooldown restriction</li>
                  <li>Processing typically takes 1-2 business days</li>
                  <li>You'll be notified via the system once your request is reviewed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
