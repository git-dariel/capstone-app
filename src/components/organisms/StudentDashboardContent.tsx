import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { StudentDashboardService } from "@/services/student-dashboard.service";
import { UserService } from "@/services";
import type {
  PersonalSummary,
  AssessmentHistoryItem,
  AssessmentTrends,
  AssessmentStats,
  ProgressInsight,
} from "@/services/student-dashboard.service";
import {
  AssessmentOverviewCard,
  AssessmentTrendsChart,
  WarningCard,
  RecommendationsPanel,
} from "@/components/molecules";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui";
import { RefreshCw, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

export const StudentDashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [personalSummary, setPersonalSummary] = useState<PersonalSummary | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [assessmentTrends, setAssessmentTrends] = useState<AssessmentTrends | null>(null);
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats | null>(null);
  const [progressInsights, setProgressInsights] = useState<ProgressInsight[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(user?.avatar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [assessmentTimeRanges, setAssessmentTimeRanges] = useState<Record<string, string>>({
    anxiety: "30d",
    depression: "30d",
    stress: "30d",
    checklist: "30d",
    suicide: "30d",
  });

  const loadDashboardData = async (showRefreshing = false, selectedTimeRange?: string) => {
    const timeRangeToUse = selectedTimeRange || "30d";
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [summary, history, trends, stats, insights] = await Promise.all([
        StudentDashboardService.getPersonalSummary(),
        StudentDashboardService.getAssessmentHistory(undefined, 5),
        StudentDashboardService.getAssessmentTrends(timeRangeToUse),
        StudentDashboardService.getAssessmentStats(),
        StudentDashboardService.getProgressInsights(),
      ]);

      setPersonalSummary(summary);
      setAssessmentHistory(history);
      setAssessmentTrends(trends);
      setAssessmentStats(stats);
      setProgressInsights(insights);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");

      // Load mock data as fallback
      setPersonalSummary(StudentDashboardService.getMockPersonalSummary());
      setAssessmentHistory(StudentDashboardService.getMockAssessmentHistory());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fetch fresh user data to get the latest avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.id) {
        try {
          const freshUser = await UserService.getUserById(user.id);
          setUserAvatar(freshUser.avatar);
        } catch (error) {
          console.error("Error fetching user avatar:", error);
          // Fallback to auth user avatar
          setUserAvatar(user.avatar);
        }
      }
    };

    fetchUserAvatar();
  }, [user?.id, user?.avatar]);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleAssessmentTimeRangeChange = async (assessmentType: string, newTimeRange: string) => {
    // Update the individual assessment time range
    setAssessmentTimeRanges((prev) => ({
      ...prev,
      [assessmentType]: newTimeRange,
    }));

    // Reload only the trends data with the new time range
    try {
      setRefreshing(true);
      const updatedTrends = await StudentDashboardService.getAssessmentTrends(newTimeRange);
      
      // Only update the specific assessment's data, keep others unchanged
      setAssessmentTrends((prevTrends) => {
        if (!prevTrends) return updatedTrends;
        
        return {
          ...prevTrends,
          [assessmentType]: updatedTrends[assessmentType as keyof typeof updatedTrends],
        };
      });
    } catch (error: any) {
      console.error(`Error loading ${assessmentType} trends:`, error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAssessmentTrend = (type: keyof AssessmentTrends) => {
    if (!assessmentTrends || !assessmentTrends[type] || assessmentTrends[type].length < 2) {
      return undefined;
    }

    const data = assessmentTrends[type];
    const first = data[0];
    const last = data[data.length - 1];

    if (
      typeof first === "string" ||
      typeof last === "string" ||
      first.score === null ||
      last.score === null
    ) {
      return "stable";
    }

    const change = last.score - first.score;
    const percentage = (change / first.score) * 100;

    if (percentage > 5) return "down"; // Higher scores are worse for mental health
    if (percentage < -5) return "up"; // Lower scores are better
    return "stable";
  };

  const getTrendPercentage = (type: keyof AssessmentTrends) => {
    if (!assessmentTrends || !assessmentTrends[type] || assessmentTrends[type].length < 2) {
      return undefined;
    }

    const data = assessmentTrends[type];
    const first = data[0];
    const last = data[data.length - 1];

    if (
      typeof first === "string" ||
      typeof last === "string" ||
      first.score === null ||
      last.score === null
    ) {
      return undefined;
    }

    const change = last.score - first.score;
    return Math.abs((change / first.score) * 100);
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !personalSummary) {
    return (
      <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              My Mental Health Dashboard
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Track your progress and get personalized insights
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Welcome Message */}
        {personalSummary && (
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
            <div className="flex items-center space-x-3">
              <Avatar 
                src={userAvatar} 
                fallback={personalSummary.userProfile.person?.firstName?.charAt(0) || "S"}
                className="w-12 h-12"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Welcome back, {personalSummary.userProfile.person?.firstName || "Student"}!
                </h2>
                <p className="text-gray-600 text-sm">
                  You've completed {personalSummary.totalAssessments.overall} mental health
                  assessments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Insights & Warnings */}
        {progressInsights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Progress Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressInsights.slice(0, 4).map((insight) => (
                <WarningCard key={`${insight.type}-${insight.assessmentType}`} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Assessment Overview Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Assessment Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <AssessmentOverviewCard
              type="anxiety"
              totalCount={personalSummary?.totalAssessments.anxiety || 0}
              latestAssessment={personalSummary?.latestAssessments.anxiety}
              trend={getAssessmentTrend("anxiety")}
              trendPercentage={getTrendPercentage("anxiety")}
            />
            <AssessmentOverviewCard
              type="stress"
              totalCount={personalSummary?.totalAssessments.stress || 0}
              latestAssessment={personalSummary?.latestAssessments.stress}
              trend={getAssessmentTrend("stress")}
              trendPercentage={getTrendPercentage("stress")}
            />
            <AssessmentOverviewCard
              type="depression"
              totalCount={personalSummary?.totalAssessments.depression || 0}
              latestAssessment={personalSummary?.latestAssessments.depression}
              trend={getAssessmentTrend("depression")}
              trendPercentage={getTrendPercentage("depression")}
            />
            <AssessmentOverviewCard
              type="suicide"
              totalCount={personalSummary?.totalAssessments.suicide || 0}
              latestAssessment={personalSummary?.latestAssessments.suicide}
              trend={getAssessmentTrend("suicide")}
              trendPercentage={getTrendPercentage("suicide")}
            />
            <AssessmentOverviewCard
              type="checklist"
              totalCount={personalSummary?.totalAssessments.checklist || 0}
              latestAssessment={personalSummary?.latestAssessments.checklist}
              trend={getAssessmentTrend("checklist")}
              trendPercentage={getTrendPercentage("checklist")}
            />
          </div>
        </div>

        {/* Assessment Severity Trends */}
        <AssessmentTrendsChart
          trends={assessmentTrends || undefined}
          title="Assessment Severity Trends"
          description="Track how your mental health severity levels change over time"
          onAssessmentTimeRangeChange={handleAssessmentTimeRangeChange}
          currentTimeRange={assessmentTimeRanges["anxiety"] || "30d"}
        />

        {/* Recent Assessment History */}
        {assessmentHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
            </div>
            <div className="space-y-3">
              {assessmentHistory.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {assessment.type.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {assessment.type === "checklist" ? "Personal Problems Checklist" : `${assessment.type} Assessment`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(assessment.assessmentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{assessment.severityLevel}</p>
                    {assessment.totalScore !== null && (
                      <p className="text-sm text-gray-600">
                        {assessment.type === "checklist" 
                          ? `${assessment.totalScore} Problem${assessment.totalScore !== 1 ? 's' : ''}` 
                          : `Score: ${assessment.totalScore}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <RecommendationsPanel
            insights={progressInsights}
            assessmentStats={assessmentStats || undefined}
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Some data may not be up to date</p>
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
