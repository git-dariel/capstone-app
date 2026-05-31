import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atoms";
import { useAuth } from "@/hooks";
import { InventoryService, type GetInventoryResponse } from "@/services";
import catSmile from "@/assets/cat-smile.gif";

export const MentalHealthResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { student, user } = useAuth();
  const [inventory, setInventory] = useState<GetInventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isStudentUser = user?.type === "student";

  // Fetch student's inventory
  useEffect(() => {
    if (isStudentUser) {
      setLoading(false);
      return;
    }

    const fetchInventory = async () => {
      if (!student?.id) {
        setError("Student ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await InventoryService.getInventoryByStudentId(student.id);
        if (!data) {
          setError("No inventory found. Please complete your inventory first.");
          setInventory(null);
        } else {
          setInventory(data);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load inventory");
        setInventory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [student?.id, isStudentUser]);

  if (isStudentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-10">
        <div className="bg-white/90 backdrop-blur p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border border-primary-100 max-w-md sm:max-w-lg w-full text-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 mx-auto rounded-3xl bg-primary-50 border border-primary-100 overflow-hidden mb-5 sm:mb-6">
            <img
              src={catSmile}
              alt="Smiling cat"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
            Thanks for waiting!
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4">
            Your assessment prediction will be validated first by the guidance counselor. Please
            wait for their decision before your results are released.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2 text-xs sm:text-sm md:text-base text-primary-800 mb-6">
            We’ll notify you once the review is complete.
          </div>
          <Button
            onClick={() => navigate("/student-dashboard")}
            className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-xl font-medium w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to get sorted predictions (latest first by timestamp)
  const getSortedPredictions = () => {
    if (!inventory?.mentalHealthPredictions || inventory.mentalHealthPredictions.length === 0) {
      return [];
    }

    return [...inventory.mentalHealthPredictions].sort(
      (a, b) =>
        new Date(b.createdAt || b.predictionDate || 0).getTime() -
        new Date(a.createdAt || a.predictionDate || 0).getTime(),
    );
  };

  // Get the latest prediction with ML predictions
  const latestPrediction = getSortedPredictions()[0];
  const mlPredictions = latestPrediction?.mlPredictions;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  // Error state or no inventory
  if (!inventory || !latestPrediction || !mlPredictions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {error ||
              "No mental health assessment results were found. Please complete your inventory first."}
          </p>
          <Button
            onClick={() => navigate("/inventory")}
            className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
          >
            Complete Inventory
          </Button>
        </div>
      </div>
    );
  }

  // Get ML prediction data (check if all low risk message or get specific condition)
  const getMLPredictionData = ():
    | {
        isLowRisk: true;
        message: string;
        riskLevels: {
          anxiety: string;
          depression: string;
          stress: string;
        };
      }
    | {
        isLowRisk: false;
        conditionName: string;
        conditionData: {
          riskLevel?: string;
          prediction: string;
          riskPercentage?: string;
          explanation: string;
          modelBasis?: string;
          riskFactors: string[];
          recommendations: string[];
          immediateAction?: string;
        };
        isHighRisk: boolean;
      }
    | null => {
    if (!mlPredictions) return null;

    // Check if it's the positive message format (all low risk)
    if (
      "message" in mlPredictions &&
      "status" in mlPredictions &&
      (mlPredictions as any).status === "all_low_risk"
    ) {
      const formattedML = mlPredictions as any;
      return {
        isLowRisk: true,
        message:
          formattedML.message ||
          "Great news! Based on our machine learning analysis of your profile, you are not prone to anxiety, depression, or stress.",
        riskLevels: {
          anxiety: formattedML.anxiety?.riskLevel || "Low Risk",
          depression: formattedML.depression?.riskLevel || "Low Risk",
          stress: formattedML.stress?.riskLevel || "Low Risk",
        },
      };
    }

    // Helper function to check if a condition is High Risk (case-insensitive)
    const isConditionHighRisk = (condition: any): boolean => {
      if (!condition) return false;
      const riskLevel = condition.riskLevel?.toLowerCase() || "";
      const prediction = condition.prediction?.toLowerCase() || "";
      return riskLevel.includes("high") || prediction.includes("high");
    };

    // Helper function to check if a condition is Moderate Risk (case-insensitive)
    const isConditionModerateRisk = (condition: any): boolean => {
      if (!condition) return false;
      const riskLevel = condition.riskLevel?.toLowerCase() || "";
      const prediction = condition.prediction?.toLowerCase() || "";
      return (
        (riskLevel.includes("moderate") || prediction.includes("moderate")) &&
        !isConditionHighRisk(condition)
      );
    };

    // Categorize all conditions
    const conditions = [
      { name: "depression", data: mlPredictions.depression },
      { name: "anxiety", data: mlPredictions.anxiety },
      { name: "stress", data: mlPredictions.stress },
    ].filter((c) => c.data);

    const highRiskConditions: { name: string; data: any }[] = [];
    const moderateRiskConditions: { name: string; data: any }[] = [];
    const lowRiskConditions: { name: string; data: any }[] = [];

    conditions.forEach((c) => {
      if (isConditionHighRisk(c.data)) {
        highRiskConditions.push(c);
      } else if (isConditionModerateRisk(c.data)) {
        moderateRiskConditions.push(c);
      } else {
        lowRiskConditions.push(c);
      }
    });

    // Check if all are Low Risk
    if (highRiskConditions.length === 0 && moderateRiskConditions.length === 0) {
      return {
        isLowRisk: true,
        message:
          "✅ Great news! Based on our machine learning analysis of your profile, you are not prone to anxiety, depression, or stress. Your profile shows protective factors similar to students who maintained good mental health. Continue maintaining your current positive habits and self-care practices.",
        riskLevels: {
          anxiety: mlPredictions.anxiety?.riskLevel || "Low Risk",
          depression: mlPredictions.depression?.riskLevel || "Low Risk",
          stress: mlPredictions.stress?.riskLevel || "Low Risk",
        },
      };
    }

    // Determine which category to pick from based on count
    // Pick from the category with MORE conditions
    // If counts are equal, prefer High Risk > Moderate Risk > Low Risk
    let selectedCondition: { name: string; data: any } | undefined;
    let isHighRiskSelected = false;

    if (
      highRiskConditions.length > moderateRiskConditions.length &&
      highRiskConditions.length > lowRiskConditions.length
    ) {
      // High Risk has the most - pick from High Risk
      isHighRiskSelected = true;
      selectedCondition =
        highRiskConditions.find((c) => c.name === "depression") ||
        highRiskConditions.find((c) => c.name === "anxiety") ||
        highRiskConditions.find((c) => c.name === "stress");
    } else if (
      moderateRiskConditions.length > highRiskConditions.length &&
      moderateRiskConditions.length > lowRiskConditions.length
    ) {
      // Moderate Risk has the most - pick from Moderate Risk
      isHighRiskSelected = false;
      selectedCondition =
        moderateRiskConditions.find((c) => c.name === "depression") ||
        moderateRiskConditions.find((c) => c.name === "anxiety") ||
        moderateRiskConditions.find((c) => c.name === "stress");
    } else if (
      lowRiskConditions.length > highRiskConditions.length &&
      lowRiskConditions.length > moderateRiskConditions.length
    ) {
      // Low Risk has the most - pick from Low Risk
      isHighRiskSelected = false;
      selectedCondition =
        lowRiskConditions.find((c) => c.name === "depression") ||
        lowRiskConditions.find((c) => c.name === "anxiety") ||
        lowRiskConditions.find((c) => c.name === "stress");
    } else {
      // Counts are equal or tied - use priority: High Risk > Moderate Risk > Low Risk
      if (highRiskConditions.length > 0) {
        isHighRiskSelected = true;
        selectedCondition =
          highRiskConditions.find((c) => c.name === "depression") ||
          highRiskConditions.find((c) => c.name === "anxiety") ||
          highRiskConditions.find((c) => c.name === "stress");
      } else if (moderateRiskConditions.length > 0) {
        isHighRiskSelected = false;
        selectedCondition =
          moderateRiskConditions.find((c) => c.name === "depression") ||
          moderateRiskConditions.find((c) => c.name === "anxiety") ||
          moderateRiskConditions.find((c) => c.name === "stress");
      } else {
        isHighRiskSelected = false;
        selectedCondition =
          lowRiskConditions.find((c) => c.name === "depression") ||
          lowRiskConditions.find((c) => c.name === "anxiety") ||
          lowRiskConditions.find((c) => c.name === "stress");
      }
    }

    if (!selectedCondition || !selectedCondition.data) return null;

    const riskPercentage =
      selectedCondition.data.riskPercentage ||
      (selectedCondition.data.confidence
        ? `${(selectedCondition.data.confidence * 100).toFixed(1)}%`
        : undefined);

    const isLowRiskResult = !isHighRiskSelected && !isConditionModerateRisk(selectedCondition.data);

    // Return false for isLowRisk when we have high or moderate risk (required by type)
    if (isLowRiskResult) {
      // This shouldn't happen here since we return early if all are low risk
      // But TypeScript needs this for type narrowing
      return {
        isLowRisk: false as const,
        conditionName: selectedCondition.name,
        conditionData: {
          ...selectedCondition.data,
          riskPercentage: riskPercentage,
        },
        isHighRisk: false,
      };
    }

    return {
      isLowRisk: false as const,
      conditionName: selectedCondition.name,
      conditionData: {
        ...selectedCondition.data,
        riskPercentage: riskPercentage,
      },
      isHighRisk: isHighRiskSelected,
    };
  };

  const mlData = getMLPredictionData();

  // If no ML data available
  if (!mlData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Machine learning predictions are not available for this assessment yet.
          </p>
          <Button
            onClick={() => navigate("/student-dashboard")}
            className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // const getPerformanceIcon = (outlook: string) => {
  //   switch (outlook.toLowerCase()) {
  //     case "improved":
  //       return (
  //         <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M7 11l3-3m0 0l3 3m-3-3v8M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
  //           />
  //         </svg>
  //       );
  //     case "declined":
  //       return (
  //         <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M17 13l-3 3m0 0l-3-3m3 3V4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
  //           />
  //         </svg>
  //       );
  //     default:
  //       return (
  //         <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
  //           />
  //         </svg>
  //       );
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <Logo className="scale-75" />
              <span className="text-base sm:text-xl font-semibold text-gray-900 ml-2">
                Office of Guidance and Counseling Services
              </span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Mental Health Assessment Results
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 px-2 sm:px-0">
              Machine Learning Analysis Results
            </p>
            {latestPrediction && (
              <p className="text-xs text-gray-500 mt-1">
                Generated on {formatDate(latestPrediction.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* All Low Risk Message */}
        {mlData.isLowRisk ? (
          <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 mb-4 sm:mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 font-bold text-2xl">✅</span>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-green-900 mb-2">
                  Positive Results
                </h2>
                <p className="text-sm sm:text-base text-green-900 mb-4">{mlData.message}</p>
                {mlData.riskLevels && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="bg-white rounded p-3">
                      <div className="text-xs text-gray-600 mb-1">Anxiety</div>
                      <div className="text-sm font-medium text-green-700 capitalize">
                        {mlData.riskLevels.anxiety}
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-xs text-gray-600 mb-1">Depression</div>
                      <div className="text-sm font-medium text-green-700 capitalize">
                        {mlData.riskLevels.depression}
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-xs text-gray-600 mb-1">Stress</div>
                      <div className="text-sm font-medium text-green-700 capitalize">
                        {mlData.riskLevels.stress}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Condition Display */}
            <div
              className={`rounded-lg shadow p-4 sm:p-6 border ${
                mlData.isHighRisk
                  ? "bg-red-50 border-red-200"
                  : mlData.conditionData.riskLevel?.toLowerCase().includes("moderate") ||
                      mlData.conditionData.prediction?.toLowerCase().includes("moderate")
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="text-center py-3 sm:py-4">
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  Student are possibly prone to:
                </p>
                <h2
                  className={`text-3xl sm:text-4xl font-bold mb-2 capitalize ${
                    mlData.isHighRisk
                      ? "text-red-600"
                      : mlData.conditionData.riskLevel?.toLowerCase().includes("moderate") ||
                          mlData.conditionData.prediction?.toLowerCase().includes("moderate")
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }`}
                >
                  {mlData.conditionName}
                </h2>
                <div
                  className={`text-sm sm:text-base font-medium mb-3 ${
                    mlData.isHighRisk
                      ? "text-red-600"
                      : mlData.conditionData.riskLevel?.toLowerCase().includes("moderate") ||
                          mlData.conditionData.prediction?.toLowerCase().includes("moderate")
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }`}
                >
                  Risk Level: {mlData.conditionData.riskLevel || mlData.conditionData.prediction}
                </div>
                <div className="text-xs sm:text-sm text-gray-700 mb-3">
                  {mlData.conditionData.explanation}
                </div>
                {mlData.conditionData.immediateAction && (
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mt-3">
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-amber-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm font-medium text-amber-800">
                        Immediate Action: {mlData.conditionData.immediateAction}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Risk Factors */}
        {!mlData.isLowRisk &&
          mlData.conditionData &&
          mlData.conditionData.riskFactors &&
          mlData.conditionData.riskFactors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-3 sm:mb-4">
                Risk Factors ({mlData.conditionData.riskFactors.length})
              </h3>
              <div className="space-y-2">
                {mlData.conditionData.riskFactors.map((factor: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div className="ml-3 text-xs sm:text-sm text-yellow-800">{factor}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Recommendations */}
        {!mlData.isLowRisk &&
          mlData.conditionData &&
          mlData.conditionData.recommendations &&
          mlData.conditionData.recommendations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4">
                Recommendations ({mlData.conditionData.recommendations.length})
              </h3>
              <div className="space-y-2">
                {mlData.conditionData.recommendations.map(
                  (recommendation: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div className="ml-3 text-xs sm:text-sm text-green-800">{recommendation}</div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

        {/* Disclaimer */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-start">
            <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5"
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
              <p className="text-xs sm:text-sm text-orange-800">
                <strong>⚠️ Disclaimer:</strong> This assessment is based on machine learning models
                trained on actual student outcome data. For comprehensive mental health evaluation,
                please consult with qualified mental health professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Button
            onClick={() => navigate("/student-dashboard")}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white px-4 sm:px-6 py-3 rounded-lg font-medium"
          >
            Continue to Dashboard
          </Button>
          <Button
            onClick={() => navigate("/resources")}
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 sm:px-6 py-3 rounded-lg font-medium"
          >
            Explore Resources
          </Button>
        </div>

        {/* Next Steps */}
        {!mlData.isLowRisk && mlData.conditionName && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-3">
              Next Steps for{" "}
              {mlData.conditionName.charAt(0).toUpperCase() + mlData.conditionName.slice(1)} Support
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-primary-800">
              <p>
                • Focus on {mlData.conditionName.toLowerCase()}-specific interventions and coping
                strategies
              </p>
              <p>• Schedule follow-up with guidance counselors for targeted support</p>
              <p>
                • Access specialized resources for {mlData.conditionName.toLowerCase()} management
              </p>
              <p>• Monitor progress and follow the recommendations provided above</p>
              <p>• Complete comprehensive assessments if additional concerns arise</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
