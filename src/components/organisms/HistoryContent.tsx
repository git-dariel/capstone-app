import React, { useState, useEffect } from "react";
import { Calendar, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "@/hooks";
import { useAnxiety, useDepression, useStress } from "@/hooks";

interface AssessmentHistoryItem {
  id: string;
  type: "anxiety" | "depression" | "stress";
  score: number;
  severityLevel: string;
  date: string;
  createdAt: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "minimal":
    case "low":
      return "text-green-600 bg-green-50";
    case "mild":
    case "moderate":
      return "text-yellow-600 bg-yellow-50";
    case "moderately severe":
    case "severe":
      return "text-orange-600 bg-orange-50";
    case "extremely severe":
    case "very severe":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
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
    default:
      return "📊";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "anxiety":
      return "text-blue-700 bg-blue-50";
    case "depression":
      return "text-purple-700 bg-purple-50";
    case "stress":
      return "text-red-700 bg-red-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
};

export const HistoryContent: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { fetchAssessments: fetchAnxietyAssessments } = useAnxiety();
  const { fetchAssessments: fetchDepressionAssessments } = useDepression();
  const { fetchAssessments: fetchStressAssessments } = useStress();

  const loadAssessmentHistory = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const [anxietyData, depressionData, stressData] = await Promise.all([
        fetchAnxietyAssessments({
          limit: 50,
          fields: "id,totalScore,severityLevel,assessmentDate,createdAt",
        }),
        fetchDepressionAssessments({
          limit: 50,
          fields: "id,totalScore,severityLevel,assessmentDate,createdAt",
        }),
        fetchStressAssessments({
          limit: 50,
          fields: "id,totalScore,severityLevel,assessmentDate,createdAt",
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
      ];

      // Sort by date (most recent first)
      combinedHistory.sort(
        (a, b) =>
          new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      );

      setAssessmentHistory(combinedHistory);
    } catch (error) {
      console.error("Error loading assessment history:", error);
      setError("Failed to load assessment history. Please try again later.");
      // Set empty history on error to show the empty state
      setAssessmentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentHistory();
  }, [user?.id]); // Only depend on user?.id to prevent infinite loops

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

  const getScoreTrend = (currentIndex: number) => {
    if (currentIndex === assessmentHistory.length - 1) return null;

    const current = assessmentHistory[currentIndex];
    const previous = assessmentHistory[currentIndex + 1];

    if (current.type !== previous.type) return null;

    if (current.score > previous.score) return "up";
    if (current.score < previous.score) return "down";
    return "same";
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case "same":
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3 mb-3 sm:mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 sm:w-2/3 mb-6 sm:mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
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

        {/* Assessment History List */}
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-red-400">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load History</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAssessmentHistory}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : assessmentHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <Calendar className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment History</h3>
            <p className="text-gray-600">
              You haven't taken any assessments yet. Start by taking an assessment to track your
              mental health.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessmentHistory.map((assessment, index) => {
              const trend = getScoreTrend(index);
              return (
                <div
                  key={assessment.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  {/* Mobile Layout (flex-col) for screens < md, Desktop Layout (flex-row) for screens >= md */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    {/* Main Content - Full width on mobile, left side on desktop */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                      {/* Assessment Type */}
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getTypeColor(
                          assessment.type
                        )}`}
                      >
                        <span>{getTypeIcon(assessment.type)}</span>
                        <span className="capitalize">{assessment.type}</span>
                      </div>

                      {/* Score and Severity - Stack on mobile, inline on tablet+ */}
                      <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-3 flex-1">
                        <div className="text-lg font-semibold text-gray-900">
                          Score: {assessment.score}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getSeverityColor(
                              assessment.severityLevel
                            )}`}
                          >
                            {assessment.severityLevel}
                          </div>
                          {getTrendIcon(trend)}
                        </div>
                      </div>
                    </div>

                    {/* Date and Time - Full width on mobile, right side on desktop */}
                    <div className="flex flex-row sm:flex-col sm:text-right space-x-4 sm:space-x-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-xs sm:text-sm">
                          {formatDate(assessment.date || assessment.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formatTime(assessment.date || assessment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {assessmentHistory.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["anxiety", "depression", "stress"].map((type) => {
              const typeAssessments = assessmentHistory.filter((a) => a.type === type);
              const latestScore = typeAssessments[0]?.score;
              const averageScore =
                typeAssessments.length > 0
                  ? Math.round(
                      typeAssessments.reduce((sum, a) => sum + a.score, 0) / typeAssessments.length
                    )
                  : 0;

              return (
                <div key={type} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-900 capitalize">{type}</h3>
                    <span className="text-2xl">{getTypeIcon(type)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-medium">{typeAssessments.length}</span>
                    </div>
                    {latestScore !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Latest:</span>
                        <span className="text-sm font-medium">{latestScore}</span>
                      </div>
                    )}
                    {typeAssessments.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average:</span>
                        <span className="text-sm font-medium">{averageScore}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
