import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryForm } from "@/components/molecules/InventoryForm";
import { useAuth } from "@/hooks";
import { InventoryService, type InventoryFormData } from "@/services";

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { student } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingInventory, setCheckingInventory] = useState(true);

  // Check if user has student data and get student ID
  const studentId = student?.id;

  useEffect(() => {
    const checkExistingInventory = async () => {
      if (!studentId) {
        setCheckingInventory(false);
        return;
      }

      try {
        const hasInventory = await InventoryService.hasInventory(studentId);
        if (hasInventory) {
          // If inventory already exists, redirect to home
          navigate("/home", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error checking inventory:", err);
        // Continue to show inventory form if check fails
      } finally {
        setCheckingInventory(false);
      }
    };

    checkExistingInventory();
  }, [studentId, navigate]);

  // Handle navigation when no student ID is available
  useEffect(() => {
    if (!checkingInventory && !studentId) {
      navigate("/signin", { replace: true });
    }
  }, [checkingInventory, studentId, navigate]);

  const handleSubmitInventory = async (formData: InventoryFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await InventoryService.createInventory(formData);

      // Navigate to results page with the mental health prediction
      navigate("/inventory/results", {
        state: {
          inventoryResponse: response,
          mentalHealthPrediction: response.mentalHealthPrediction,
        },
        replace: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit inventory form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking existing inventory or if no student ID
  if (checkingInventory || !studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Checking inventory status...</p>
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center mr-0 sm:mr-3 mb-2 sm:mb-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Individual Inventory Form
            </h1>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Complete your individual inventory to help us provide personalized support
            </p>
            <p className="text-primary-600 text-xs sm:text-sm mt-1">
              Step 2 of 2 - Final assessment for comprehensive mental health evaluation
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Information Notice */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start">
            <div className="w-5 h-5 text-primary-600 mr-0 sm:mr-3 mb-2 sm:mb-0 mx-auto sm:mx-0">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-medium text-primary-900">
                Individual Inventory Assessment
              </h3>
              <div className="mt-2 text-xs sm:text-sm text-primary-800">
                <p className="mb-2">
                  This comprehensive form helps us understand your personal, family, and health
                  background to provide you with the most appropriate mental health support and
                  resources.
                </p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Generates your personalized mental health risk assessment</li>
                  <li>Provides tailored recommendations based on your profile</li>
                  <li>Helps connect you with the most suitable support services</li>
                  <li>Creates a baseline for tracking your progress over time</li>
                </ul>
                <p className="mt-3 font-medium">
                  Your information is completely confidential and will only be used to enhance your
                  care.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <InventoryForm
              studentId={studentId}
              onSubmit={handleSubmitInventory}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 sm:mt-8 bg-gray-100 rounded-lg p-3 sm:p-4">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            🔒 Your personal information is protected and handled in accordance with privacy laws
            and university policies. This information will be used solely for providing mental
            health support and will not be shared without your consent except as required by law or
            in case of immediate safety concerns.
          </p>
        </div>
      </div>
    </div>
  );
};
