import { useAnxiety, useAuth, useChecklist, useDepression, useStress, useSuicide } from "@/hooks";
import { AlertCircle, Calendar, Clock, Loader2, Search, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { AssessmentDetailModal } from "@/components/molecules";

interface AssessmentHistoryItem {
  id: string;
  type: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  score: number;
  severityLevel: string;
  date: string;
  createdAt: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "minimal":
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    case "mild":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "moderate":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "moderately severe":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "severe":
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "extremely severe":
    case "very severe":
      return "text-red-700 bg-red-100 border-red-300";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "anxiety":
      return "🧠";
    case "depression":
      return "💭";
    case "stress":
      return "⚡";
    case "suicide":
      return "🛡️";
    case "checklist":
      return "📝";
    default:
      return "📊";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "anxiety":
      return "text-primary-700 bg-primary-50 border-primary-200";
    case "depression":
      return "text-purple-700 bg-purple-50 border-purple-200";
    case "stress":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "suicide":
      return "text-red-700 bg-red-50 border-red-200";
    case "checklist":
      return "text-green-700 bg-green-50 border-green-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

export const HistoryContent: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { fetchAssessments: fetchAnxietyAssessments } = useAnxiety();
  const { fetchAssessments: fetchDepressionAssessments } = useDepression();
  const { fetchAssessments: fetchStressAssessments } = useStress();
  const { fetchAssessments: fetchSuicideAssessments } = useSuicide();
  const { fetchChecklists: fetchChecklistAssessments } = useChecklist();

  // Helper functions - moved before useMemo to avoid TDZ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSeverityLabel = (severity: string) => {
    switch (severity) {
      case "moderately_severe":
        return "Moderately Severe";
      default:
        return severity.charAt(0).toUpperCase() + severity.slice(1);
    }
  };

  const loadAssessmentHistory = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const [anxietyData, depressionData, stressData, suicideData, checklistData] = await Promise.all([
        fetchAnxietyAssessments({
          limit: 100,
          fields: "id,totalScore,severityLevel,assessmentDate,createdAt",
        }),
        fetchDepressionAssessments({
          limit: 100,
          fields: "id,totalScore,severityLevel,assessmentDate,createdAt",
        }),
        fetchStressAssessments({
          limit: 100,
          fields: "id,totalScore,severityLevel,assessmentDate,createdAt",
        }),
        fetchSuicideAssessments({
          limit: 100,
          fields: "id,riskLevel,assessmentDate,createdAt",
        }),
        fetchChecklistAssessments({
          limit: 100,
          fields: "id,checklist_analysis,date_completed,createdAt",
        }),
      ]);

      const combinedHistory: AssessmentHistoryItem[] = [
        ...(anxietyData?.data || []).map((item: any) => ({
          id: item.id,
          type: "anxiety" as const,
          score: item.totalScore,
          severityLevel: item.severityLevel,
          date: item.assessmentDate,
          createdAt: item.createdAt,
        })),
        ...(depressionData?.data || []).map((item: any) => ({
          id: item.id,
          type: "depression" as const,
          score: item.totalScore,
          severityLevel: item.severityLevel,
          date: item.assessmentDate,
          createdAt: item.createdAt,
        })),
        ...(stressData?.data || []).map((item: any) => ({
          id: item.id,
          type: "stress" as const,
          score: item.totalScore,
          severityLevel: item.severityLevel,
          date: item.assessmentDate,
          createdAt: item.createdAt,
        })),
        ...(suicideData?.data || []).map((item: any) => ({
          id: item.id,
          type: "suicide" as const,
          score: item.riskScore || 0,
          severityLevel: item.riskLevel,
          date: item.assessmentDate,
          createdAt: item.createdAt,
        })),
        ...(checklistData?.data || []).map((item: any) => ({
          id: item.id,
          type: "checklist" as const,
          score: item.checklist_analysis?.totalProblemsChecked || 0,
          severityLevel: item.checklist_analysis?.riskLevel || "unknown",
          date: item.date_completed,
          createdAt: item.createdAt,
        })),
      ];

      // Sort by date (most recent first)
      combinedHistory.sort(
        (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      );

      setAssessmentHistory(combinedHistory);
    } catch (error) {
      console.error("Error loading assessment history:", error);
      setError("Failed to load assessment history. Please try again later.");
      setAssessmentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (assessment: AssessmentHistoryItem) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssessment(null);
  };

  useEffect(() => {
    loadAssessmentHistory();
  }, [user?.id]);

  // Filter assessments based on search term
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return assessmentHistory;
    return assessmentHistory.filter((assessment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        assessment.type.toLowerCase().includes(searchLower) ||
        assessment.severityLevel.toLowerCase().includes(searchLower) ||
        assessment.score.toString().includes(searchLower) ||
        formatDate(assessment.date || assessment.createdAt)
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [searchTerm, assessmentHistory]);

  // Get assessments to display (limited by displayCount)
  const displayedHistory = useMemo(() => {
    return filteredHistory.slice(0, displayCount);
  }, [filteredHistory, displayCount]);

  // Reset display count when search term changes
  useEffect(() => {
    setDisplayCount(10);
  }, [searchTerm]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (displayCount < filteredHistory.length) {
        setDisplayCount((prev) => Math.min(prev + 10, filteredHistory.length));
      }
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3 mb-3 sm:mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 sm:w-2/3 mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Assessment History</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View your mental health assessment history and track your progress over time
          </p>
        </div>

        {/* Summary Stats - Moved to top */}
        {assessmentHistory.length > 0 && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {["anxiety", "depression", "stress", "suicide", "checklist"].map((type) => {
              const typeAssessments = assessmentHistory.filter((a) => a.type === type);
              const latestScore = typeAssessments[0]?.score;
              const latestLevel = typeAssessments[0]?.severityLevel;
              const averageScore =
                typeAssessments.length > 0 && type !== "suicide" && type !== "checklist"
                  ? Math.round(typeAssessments.reduce((sum, a) => sum + a.score, 0) / typeAssessments.length)
                  : 0;

              return (
                <div
                  key={type}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-900 capitalize">
                      {type === "checklist" ? "Personal Problems" : type}
                    </h3>
                    <span className="text-2xl">{getTypeIcon(type)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-medium text-primary-700">{typeAssessments.length}</span>
                    </div>
                    {type === "suicide" || type === "checklist" ? (
                      latestLevel && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Latest:</span>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded-full border ${getSeverityColor(
                              latestLevel
                            )}`}
                          >
                            {formatSeverityLabel(latestLevel)}
                          </span>
                        </div>
                      )
                    ) : (
                      <>
                        {latestScore !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Latest:</span>
                            <span className="text-sm font-semibold text-gray-900">{latestScore}</span>
                          </div>
                        )}
                        {typeAssessments.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Average:</span>
                            <span className="text-sm font-medium text-gray-700">{averageScore}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assessment History Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Assessment History</h2>
                <p className="text-sm text-gray-500">
                  {loading
                    ? "Loading assessments..."
                    : `Showing ${displayedHistory.length} of ${filteredHistory.length} assessments • Click any row for details`}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by type, severity, score, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                disabled={loading}
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto" onScroll={handleScroll}>
            {error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load History</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={loadAssessmentHistory}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : displayedHistory.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No matching assessments" : "No Assessment History"}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search terms to find more assessments."
                      : "You haven't taken any assessments yet. Start by taking an assessment to track your mental health."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <table className="hidden md:table w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assessment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score/Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">View Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedHistory.map((assessment, _index) => {
                      return (
                        <tr 
                          key={assessment.id} 
                          className="hover:bg-primary-50 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(assessment)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(
                                assessment.type
                              )}`}
                            >
                              <span>{getTypeIcon(assessment.type)}</span>
                              <span className="capitalize">
                                {assessment.type === "suicide"
                                  ? "Suicide Risk"
                                  : assessment.type === "checklist"
                                  ? "Personal Problems"
                                  : assessment.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {assessment.type === "suicide" ? (
                              <span className="text-sm font-medium text-gray-900">Risk Assessment</span>
                            ) : assessment.type === "checklist" ? (
                              <span className="text-sm font-medium text-gray-900">
                                {assessment.score} Problem{assessment.score !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="text-lg font-semibold text-gray-900">{assessment.score}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                                assessment.severityLevel
                              )}`}
                            >
                              {formatSeverityLabel(assessment.severityLevel)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{formatDate(assessment.date || assessment.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatTime(assessment.date || assessment.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile Card View - Visible only on mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {displayedHistory.map((assessment, _index) => (
                    <div
                      key={assessment.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleRowClick(assessment)}
                    >
                      {/* Assessment Type and Score Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(
                            assessment.type
                          )}`}
                        >
                          <span>{getTypeIcon(assessment.type)}</span>
                          <span className="capitalize">
                            {assessment.type === "suicide"
                              ? "Suicide Risk"
                              : assessment.type === "checklist"
                              ? "Personal Problems"
                              : assessment.type}
                          </span>
                        </div>
                        {assessment.type === "suicide" ? (
                          <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
                        ) : assessment.type === "checklist" ? (
                          <span className="text-sm font-medium text-gray-600">
                            {assessment.score} Problem{assessment.score !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">{assessment.score}</span>
                        )}
                      </div>

                      {/* Severity Badge */}
                      <div className="mb-3">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(
                            assessment.severityLevel
                          )}`}
                        >
                          {formatSeverityLabel(assessment.severityLevel)}
                        </div>
                      </div>

                      {/* Date and Time Row */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(assessment.date || assessment.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatTime(assessment.date || assessment.createdAt)}</span>
                          <ChevronRight className="w-4 h-4 ml-2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Load More Indicator */}
            {displayCount < filteredHistory.length && (
              <div className="flex items-center justify-center py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Scroll down to load more...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Detail Modal */}
        <AssessmentDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          assessment={selectedAssessment}
        />
      </div>
    </main>
  );
};
