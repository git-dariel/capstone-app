import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atoms";
import type { ConsentResponse, MentalHealthPrediction } from "@/services";

interface LocationState {
  consentResponse?: ConsentResponse;
  mentalHealthPrediction?: MentalHealthPrediction;
}

export const MentalHealthResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const prediction = state?.mentalHealthPrediction;
  const consentResponse = state?.consentResponse;

  // Redirect if no prediction data
  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            No mental health assessment results were found. Please complete the consent form first.
          </p>
          <Button
            onClick={() => navigate("/consent")}
            className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
          >
            Take Assessment
          </Button>
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("high") || lowerLevel.includes("urgent")) return "text-red-600";
    if (lowerLevel.includes("medium") || lowerLevel.includes("moderate")) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskLevelBgColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("high") || lowerLevel.includes("urgent")) return "bg-red-50 border-red-200";
    if (lowerLevel.includes("medium") || lowerLevel.includes("moderate")) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900"> Mental Health Risk Assessment</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 px-2 sm:px-0">
              Your personalized mental health screening results
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Disclaimer */}
        {consentResponse?.disclaimer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5"
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
                <p className="text-xs sm:text-sm text-blue-800">{consentResponse.disclaimer}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
          {/* Academic Performance Prediction */}
          {/* <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              {getPerformanceIcon(prediction.academicPerformanceOutlook)}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 ml-2">
                Academic Performance Outlook
              </h3>
            </div>
            <div className="text-center py-3 sm:py-4">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {prediction.academicPerformanceOutlook}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Confidence: {prediction.confidence}
              </div>
            </div>
          </div> */}

          {/* Mental Health Risk Level */}
          <div
            className={`rounded-lg shadow p-4 sm:p-6 border ${getRiskLevelBgColor(prediction.mentalHealthRisk.level)}`}
          >
            {/* <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center">
              Mental Health Risk Assessment
            </h3> */}
            <div className="text-center py-3 sm:py-4">
              <div
                className={`text-xl sm:text-2xl font-bold mb-2 ${getRiskLevelColor(prediction.mentalHealthRisk.level)}`}
              >
                {prediction.mentalHealthRisk.level}
              </div>
              <div className="text-xs sm:text-sm text-gray-700 mb-3">{prediction.mentalHealthRisk.description}</div>
              <div className={`text-xs sm:text-sm font-medium ${getRiskLevelColor(prediction.mentalHealthRisk.level)}`}>
                {prediction.mentalHealthRisk.assessmentSummary}
              </div>
            </div>
          </div>
        </div>

        {/* Model Accuracy */}
        {/* <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Prediction Model Accuracy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{prediction.modelAccuracy.decisionTree}</div>
              <div className="text-xs sm:text-sm text-gray-600">Decision Tree Model</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{prediction.modelAccuracy.randomForest}</div>
              <div className="text-xs sm:text-sm text-gray-600">Random Forest Model</div>
            </div>
          </div>
        </div> */}

        {/* Risk Factors */}
        {prediction.riskFactors && prediction.riskFactors.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Areas to Monitor</h3>
            <div className="space-y-2">
              {prediction.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div className="ml-3 text-xs sm:text-sm text-gray-700">{factor}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {prediction.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-primary-700 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-xs sm:text-sm text-gray-700">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mental Health Risk Disclaimer */}
        {prediction.mentalHealthRisk.disclaimer && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row items-start">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5"
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
              </div>
              <div className="sm:ml-3 text-center sm:text-left">
                <p className="text-xs sm:text-sm text-amber-800">{prediction.mentalHealthRisk.disclaimer}</p>
              </div>
            </div>
          </div>
        )}

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
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-3">What's Next?</h3>
          <div className="space-y-2 text-xs sm:text-sm text-primary-800">
            <p>• Use our comprehensive mental health assessment tools for detailed analysis</p>
            <p>• Access personalized resources and coping strategies</p>
            <p>• Connect with guidance counselors and mental health professionals</p>
            <p>• Track your progress over time with regular check-ins</p>
          </div>
        </div>
      </div>
    </div>
  );
};
