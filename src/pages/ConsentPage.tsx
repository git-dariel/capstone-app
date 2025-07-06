import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConsentForm } from "@/components/molecules/ConsentForm";
import { Logo } from "@/components/atoms";
import { useAuth } from "@/hooks";
import { ConsentService, type ConsentFormData } from "@/services";

export const ConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, student } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingConsent, setCheckingConsent] = useState(true);

  // Check if user has student data and get student ID
  const studentId = student?.id;

  useEffect(() => {
    const checkExistingConsent = async () => {
      if (!studentId) {
        setCheckingConsent(false);
        return;
      }

      try {
        const hasConsent = await ConsentService.hasConsent(studentId);
        if (hasConsent) {
          // If consent already exists, redirect to home
          navigate("/home", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error checking consent:", err);
        // Continue to show consent form if check fails
      } finally {
        setCheckingConsent(false);
      }
    };

    checkExistingConsent();
  }, [studentId, navigate]);

  // Handle navigation when no student ID is available
  useEffect(() => {
    if (!checkingConsent && !studentId) {
      navigate("/signin", { replace: true });
    }
  }, [checkingConsent, studentId, navigate]);

  const handleSubmitConsent = async (formData: ConsentFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ConsentService.createConsent(formData);

      // Navigate to results page with the mental health prediction
      navigate("/consent/results", {
        state: {
          consentResponse: response,
          mentalHealthPrediction: response.mentalHealthPrediction,
        },
        replace: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit consent form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking existing consent or if no student ID
  if (checkingConsent || !studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingConsent ? "Checking your consent status..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-4">
            <Logo className="scale-75" />
            <span className="text-xl font-semibold text-gray-900 ml-2">Bloom</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Student Consent Form</h1>
            <p className="text-gray-600 mt-2">
              Welcome {user?.person?.firstName}! Please complete this consent form to access our
              mental health resources.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Information Notice */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-teal-900">Before You Begin</h3>
              <div className="mt-2 text-sm text-teal-800">
                <p className="mb-2">
                  This form helps us understand your current situation and provide personalized
                  mental health support. Your responses will be used to:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Create a preliminary mental health assessment</li>
                  <li>Provide tailored resources and recommendations</li>
                  <li>Connect you with appropriate support services</li>
                  <li>Track your progress over time</li>
                </ul>
                <p className="mt-3 font-medium">
                  All information is confidential and will only be shared with qualified mental
                  health professionals involved in your care.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <ConsentForm
              studentId={studentId}
              onSubmit={handleSubmitConsent}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center">
            <strong>Privacy Notice:</strong> Your personal information is protected and handled in
            accordance with privacy laws and university policies. This information will be used
            solely for providing mental health support and will not be shared without your consent
            except as required by law or in case of immediate safety concerns.
          </p>
        </div>
      </div>
    </div>
  );
};
