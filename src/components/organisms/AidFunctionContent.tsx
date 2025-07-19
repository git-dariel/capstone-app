import React, { useState } from "react";
import { RetakeRequestsTable } from "@/components/molecules/RetakeRequestsTable";
import { useAuth } from "@/hooks/useAuth";
import { useRetakeRequestMetrics } from "@/hooks/useRetakeRequestMetrics";

type AidView = "retake-requests" | "cooldown-management";

export const AidFunctionContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AidView>("retake-requests");

  // Fetch retake request metrics
  const { metrics, loading: metricsLoading, error: metricsError } = useRetakeRequestMetrics();

  const isGuidance = user?.type === "guidance";

  // Redirect non-guidance users
  if (!isGuidance) {
    return (
      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>This page is only accessible to guidance counselors and administrators.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Aid Functions</h1>
          <p className="text-gray-600 mt-1">
            Manage student retake requests and assessment cooldown periods
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setCurrentView("retake-requests")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === "retake-requests"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Retake Requests
                <span className="ml-2 bg-gray-100 text-gray-900 hidden sm:inline-block py-0.5 px-2.5 rounded-full text-xs font-medium">
                  Assessment Appeals
                </span>
              </button>

              {/* Future tab for additional aid functions */}
              <button
                onClick={() => setCurrentView("cooldown-management")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === "cooldown-management"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                disabled
              >
                Cooldown Management
                <span className="ml-2 bg-yellow-100 text-yellow-800 hidden sm:inline-block py-0.5 px-2.5 rounded-full text-xs font-medium">
                  Coming Soon
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === "retake-requests" && (
            <div>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metricsLoading ? (
                          <span className="inline-flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="opacity-25"
                              ></circle>
                              <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                className="opacity-75"
                              ></path>
                            </svg>
                            Loading...
                          </span>
                        ) : metricsError ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          metrics?.pendingRequests ?? 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Approved This Week</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metricsLoading ? (
                          <span className="inline-flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="opacity-25"
                              ></circle>
                              <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                className="opacity-75"
                              ></path>
                            </svg>
                            Loading...
                          </span>
                        ) : metricsError ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          metrics?.approvedThisWeek ?? 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Requests</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metricsLoading ? (
                          <span className="inline-flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="opacity-25"
                              ></circle>
                              <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                className="opacity-75"
                              ></path>
                            </svg>
                            Loading...
                          </span>
                        ) : metricsError ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          metrics?.totalRequests ?? 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retake Requests Table */}
              <RetakeRequestsTable showUserColumn={true} isUserView={false} />

              {/* Information Panel */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">About Retake Requests</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Students can request to retake assessments when they are in cooldown period.
                        When you approve a request, the cooldown for that specific assessment type
                        will be automatically deactivated, allowing the student to take a new
                        assessment immediately.
                      </p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>Review each request carefully and consider the student's reasoning</li>
                        <li>Add comments to provide context for your decision</li>
                        <li>Approved requests immediately lift the cooldown restriction</li>
                        <li>Students will be notified of your decision via the system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "cooldown-management" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cooldown Management</h3>
                <p className="text-gray-500 mb-4">
                  Advanced cooldown management features are coming soon. This will include:
                </p>
                <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-2">
                  <li>• Bulk cooldown adjustments</li>
                  <li>• Custom cooldown periods</li>
                  <li>• Student-specific overrides</li>
                  <li>• Cooldown analytics and reports</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
