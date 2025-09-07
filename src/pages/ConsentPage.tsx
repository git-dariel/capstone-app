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
      await ConsentService.createConsent(formData);

      // Navigate to inventory page after consent completion
      navigate("/inventory", {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <Logo className="scale-75 sm:scale-75" />
              <span className="text-base sm:text-xl font-semibold text-gray-900 ml-2">
                Office of Guidance and Counseling Services
              </span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Consent Form</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 px-2 sm:px-0">
              Welcome {user?.person?.firstName}! Please complete this consent form to access our
              mental health resources.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Information Notice */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start">
            <div className="flex-shrink-0 mx-auto sm:mx-0 mb-3 sm:mb-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700"
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
            <div className="sm:ml-3 text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-medium text-primary-900">
                Before You Begin
              </h3>
              <div className="mt-2 text-xs sm:text-sm text-primary-800">
                <p className="mb-2">
                  This form helps us understand your current situation and provide personalized
                  mental health support. Your responses will be used to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-left">
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
          <div className="p-4 sm:p-6">
            <ConsentForm
              studentId={studentId}
              onSubmit={handleSubmitConsent}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 sm:mt-8 bg-gray-100 rounded-lg p-3 sm:p-4">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
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
