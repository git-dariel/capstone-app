import { MetricsService } from "./metrics.service";

export interface PersonalSummary {
  totalAssessments: {
    anxiety: number;
    stress: number;
    depression: number;
    suicide: number;
    checklist: number;    
    overall: number;
  };
  latestAssessments: {
    anxiety: any | null;
    stress: any | null;
    depression: any | null;
    suicide: any | null;
    checklist: any | null;
  };
  userProfile: {
    id: string;
    userName: string;
    type: string;
    status: string;
    lastLogin: string | null;
    createdAt: string;
    person: any;
  };
}

export interface AssessmentHistoryItem {
  id: string;
  totalScore: number | null;
  severityLevel: string;
  assessmentDate: string;
  createdAt: string;
  type: "anxiety" | "stress" | "depression" | "suicide" | "checklist";
  requiresIntervention?: boolean;
}

export interface AssessmentTrend {
  score: number | null;
  level: string;
  date: string;
  requiresIntervention?: boolean;
  count?: number; // Number of assessments on this date
}

export interface AssessmentTrends {
  period: string;
  startDate: string;
  endDate: string;
  anxiety: AssessmentTrend[];
  stress: AssessmentTrend[];
  depression: AssessmentTrend[];
  suicide: AssessmentTrend[];
  checklist: AssessmentTrend[];
}

export interface AssessmentStats {
  anxiety: {
    count: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  stress: {
    count: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  depression: {
    count: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  suicide: {
    count: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  checklist: {
    count: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  overall: {
    totalAssessments: number;
    firstAssessmentDate: string | null;
    latestAssessmentDate: string | null;
  };
}

export interface ProgressInsight {
  type: "improvement" | "decline" | "stable" | "warning";
  assessmentType: "anxiety" | "stress" | "depression" | "suicide" | "checklist" | "overall";
  message: string;
  severity: "low" | "medium" | "high";
  recommendation?: string;
}

export class StudentDashboardService {
  // Get personal summary for the authenticated student
  static async getPersonalSummary(): Promise<PersonalSummary> {
    try {
      const response = await MetricsService.fetchDashboardMetrics(["personalSummary"]);

      if (response.data && response.data.length > 0) {
        return response.data[0].personalSummary;
      }

      throw new Error("No personal summary data available");
    } catch (error) {
      console.error("Error fetching personal summary:", error);
      throw error;
    }
  }

  // Get assessment history for the authenticated student
  static async getAssessmentHistory(
    _assessmentType?: string,
    _limit: number = 10
  ): Promise<AssessmentHistoryItem[]> {
    try {
      const response = await MetricsService.fetchDashboardMetrics(["assessmentHistory"]);

      if (response.data && response.data.length > 0) {
        return response.data[0].assessmentHistory || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      return [];
    }
  }

  // Get assessment trends for the authenticated student
  static async getAssessmentTrends(timeRange: string = "30d"): Promise<AssessmentTrends> {
    try {
      const response = await MetricsService.fetchDashboardMetrics(
        ["assessmentTrends"],
        {},
        { timeRange }
      );

      if (response.data && response.data.length > 0) {
        const trends = response.data[0].assessmentTrends;
        // Ensure checklist data exists (fallback for backend compatibility)
        if (!trends.checklist) {
          trends.checklist = [];
        }
        return trends;
      }

      throw new Error("No assessment trends data available");
    } catch (error) {
      console.error("Error fetching assessment trends:", error);
      // Return empty trends as fallback
      return {
        period: timeRange,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        anxiety: [],
        stress: [],
        depression: [],
        suicide: [],
        checklist: [],
      };
    }
  }

  // Get assessment statistics for the authenticated student
  static async getAssessmentStats(): Promise<AssessmentStats> {
    try {
      const response = await MetricsService.fetchDashboardMetrics(["assessmentStats"]);

      if (response.data && response.data.length > 0) {
        return response.data[0].assessmentStats;
      }

      throw new Error("No assessment statistics data available");
    } catch (error) {
      console.error("Error fetching assessment statistics:", error);
      // Return empty stats as fallback
      return {
        anxiety: { count: 0, averageScore: null, minScore: null, maxScore: null },
        stress: { count: 0, averageScore: null, minScore: null, maxScore: null },
        depression: { count: 0, averageScore: null, minScore: null, maxScore: null },
        suicide: { count: 0, averageScore: null, minScore: null, maxScore: null },
        checklist: { count: 0, averageScore: null, minScore: null, maxScore: null },
        overall: {
          totalAssessments: 0,
          firstAssessmentDate: null,
          latestAssessmentDate: null,
        },
      };
    }
  }

  // Analyze progress and generate insights
  static async getProgressInsights(): Promise<ProgressInsight[]> {
    try {
      const [summary, trends] = await Promise.all([
        this.getPersonalSummary(),
        this.getAssessmentTrends("30d"),
      ]);

      const insights: ProgressInsight[] = [];

      // Analyze each assessment type
      const assessmentTypes = ["anxiety", "stress", "depression", "suicide", "checklist"] as const;

      for (const type of assessmentTypes) {
        const latestAssessment = summary.latestAssessments[type];
        const trendData = trends[type];

        if (latestAssessment && trendData.length > 0) {
          // Get the first and last assessments in the trend
          const firstAssessment = trendData[0];
          const lastAssessment = trendData[trendData.length - 1];

          // Calculate progress for scored assessments (exclude suicide and checklist)
          if (
            type !== "suicide" &&
            type !== "checklist" &&
            firstAssessment.score !== null &&
            lastAssessment.score !== null
          ) {
            const scoreChange = lastAssessment.score - firstAssessment.score;
            const percentageChange = (scoreChange / firstAssessment.score) * 100;

            // For mental health assessments: lower scores = improvement, higher scores = decline
            if (scoreChange < -5) {
              // Score decreased (improvement)
              insights.push({
                type: "improvement",
                assessmentType: type,
                message: `Your ${type} scores have improved by ${Math.abs(percentageChange).toFixed(
                  1
                )}% over the last 30 days.`,
                severity: "low",
                recommendation: "Keep up the great work! Continue with your current strategies.",
              });
            } else if (scoreChange > 5) {
              // Score increased (decline)
              insights.push({
                type: "decline",
                assessmentType: type,
                message: `Your ${type} scores have increased by ${Math.abs(
                  percentageChange
                ).toFixed(1)}% over the last 30 days.`,
                severity: "medium",
                recommendation:
                  "Consider reaching out to your guidance counselor or trying stress management techniques.",
              });
            } else {
              // Stable scores
              insights.push({
                type: "stable",
                assessmentType: type,
                message: `Your ${type} levels have remained stable over the last 30 days.`,
                severity: "low",
                recommendation:
                  "Maintain your current routine and consider adding new wellness activities.",
              });
            }
          }

          // Check for high severity levels based on latest assessment
          const severityLevel = latestAssessment.severityLevel || latestAssessment.riskLevel;
          if (severityLevel === "critical" || severityLevel === "Critical") {
            insights.push({
              type: "warning",
              assessmentType: type,
              message: `Your latest ${type} assessment shows critical levels.`,
              severity: "high",
              recommendation: "Please contact your guidance counselor or emergency services immediately.",
            });
          } else if (severityLevel === "severe" || severityLevel === "Severe") {
            insights.push({
              type: "warning",
              assessmentType: type,
              message: `Your latest ${type} assessment shows severe levels.`,
              severity: "high",
              recommendation: "Please contact your guidance counselor immediately for support.",
            });
          } else if (severityLevel === "moderate" || severityLevel === "Moderate") {
            insights.push({
              type: "warning",
              assessmentType: type,
              message: `Your latest ${type} assessment shows moderate levels.`,
              severity: "medium",
              recommendation: "Consider scheduling an appointment with your guidance counselor.",
            });
          }

          // Check for suicide risk level changes (suicide doesn't have scores)
          if (type === "suicide" && trendData.length > 1) {
            const firstRiskLevel = firstAssessment.level;
            const lastRiskLevel = lastAssessment.level;

            // Risk level progression: low -> moderate -> high (worse)
            const riskOrder = { low: 1, moderate: 2, high: 3 };
            const firstRisk = riskOrder[firstRiskLevel as keyof typeof riskOrder] || 1;
            const lastRisk = riskOrder[lastRiskLevel as keyof typeof riskOrder] || 1;

            if (lastRisk > firstRisk) {
              insights.push({
                type: "decline",
                assessmentType: "suicide",
                message: `Your suicide risk level has increased from ${firstRiskLevel} to ${lastRiskLevel} over the last 30 days.`,
                severity: "high",
                recommendation:
                  "Please contact your guidance counselor or emergency services immediately.",
              });
            } else if (lastRisk < firstRisk) {
              insights.push({
                type: "improvement",
                assessmentType: "suicide",
                message: `Your suicide risk level has improved from ${firstRiskLevel} to ${lastRiskLevel} over the last 30 days.`,
                severity: "low",
                recommendation:
                  "Keep up the great work! Continue with your current support strategies.",
              });
            } else {
              insights.push({
                type: "stable",
                assessmentType: "suicide",
                message: `Your suicide risk level has remained ${lastRiskLevel} over the last 30 days.`,
                severity:
                  lastRiskLevel === "high"
                    ? "high"
                    : lastRiskLevel === "moderate"
                    ? "medium"
                    : "low",
                recommendation:
                  lastRiskLevel === "high"
                    ? "Please contact your guidance counselor immediately for support."
                    : lastRiskLevel === "moderate"
                    ? "Consider scheduling an appointment with your guidance counselor."
                    : "Maintain your current routine and continue monitoring your mental health.",
              });
            }
          }

          // Check for checklist risk level changes (checklist uses risk levels)
          if (type === "checklist" && trendData.length > 1) {
            const firstRiskLevel = firstAssessment.level;
            const lastRiskLevel = lastAssessment.level;

            // Risk level progression: low -> moderate -> high -> critical (worse)
            const riskOrder = { low: 1, moderate: 2, high: 3, critical: 4 };
            const firstRisk = riskOrder[firstRiskLevel as keyof typeof riskOrder] || 1;
            const lastRisk = riskOrder[lastRiskLevel as keyof typeof riskOrder] || 1;

            if (lastRisk > firstRisk) {
              insights.push({
                type: "decline",
                assessmentType: "checklist",
                message: `Your personal problems risk level has increased from ${firstRiskLevel} to ${lastRiskLevel} over the last 30 days.`,
                severity: lastRiskLevel === "critical" ? "high" : "medium",
                recommendation:
                  lastRiskLevel === "critical"
                    ? "Please contact your guidance counselor or emergency services immediately."
                    : "Consider scheduling an appointment with your guidance counselor for support.",
              });
            } else if (lastRisk < firstRisk) {
              insights.push({
                type: "improvement",
                assessmentType: "checklist",
                message: `Your personal problems risk level has improved from ${firstRiskLevel} to ${lastRiskLevel} over the last 30 days.`,
                severity: "low",
                recommendation:
                  "Keep up the great work! Continue with your current coping strategies.",
              });
            } else {
              insights.push({
                type: "stable",
                assessmentType: "checklist",
                message: `Your personal problems risk level has remained ${lastRiskLevel} over the last 30 days.`,
                severity:
                  lastRiskLevel === "critical"
                    ? "high"
                    : lastRiskLevel === "high"
                    ? "high"
                    : lastRiskLevel === "moderate"
                    ? "medium"
                    : "low",
                recommendation:
                  lastRiskLevel === "critical"
                    ? "Please contact your guidance counselor immediately for support."
                    : lastRiskLevel === "high"
                    ? "Please contact your guidance counselor for support."
                    : lastRiskLevel === "moderate"
                    ? "Consider scheduling an appointment with your guidance counselor."
                    : "Maintain your current routine and continue monitoring your personal challenges.",
              });
            }
          }

          // Check for immediate intervention requirement
          if (type === "suicide" && latestAssessment.requires_immediate_intervention) {
            insights.push({
              type: "warning",
              assessmentType: "suicide",
              message: "Your latest suicide risk assessment requires immediate attention.",
              severity: "high",
              recommendation:
                "Please contact emergency services or your guidance counselor immediately.",
            });
          }
        } else if (latestAssessment) {
          // Single assessment case - check severity for scored assessments, risk level for suicide and checklist
          if (type === "suicide") {
            const riskLevel = latestAssessment.riskLevel;
            if (riskLevel === "high") {
              insights.push({
                type: "warning",
                assessmentType: "suicide",
                message: "Your suicide risk assessment shows high risk level.",
                severity: "high",
                recommendation:
                  "Please contact your guidance counselor or emergency services immediately.",
              });
            } else if (riskLevel === "moderate") {
              insights.push({
                type: "warning",
                assessmentType: "suicide",
                message: "Your suicide risk assessment shows moderate risk level.",
                severity: "medium",
                recommendation: "Consider scheduling an appointment with your guidance counselor.",
              });
            } else if (riskLevel === "low") {
              insights.push({
                type: "improvement",
                assessmentType: "suicide",
                message: "Your suicide risk assessment shows low risk level.",
                severity: "low",
                recommendation:
                  "Continue monitoring your mental health and maintain your current support strategies.",
              });
            }
          } else if (type === "checklist") {
            const riskLevel = latestAssessment.severityLevel || latestAssessment.riskLevel;
            if (riskLevel === "critical" || riskLevel === "Critical") {
              insights.push({
                type: "warning",
                assessmentType: "checklist",
                message: "Your personal problems checklist shows critical risk level.",
                severity: "high",
                recommendation:
                  "Please contact your guidance counselor or emergency services immediately.",
              });
            } else if (riskLevel === "high" || riskLevel === "High") {
              insights.push({
                type: "warning",
                assessmentType: "checklist",
                message: "Your personal problems checklist shows high risk level.",
                severity: "high",
                recommendation: "Please contact your guidance counselor immediately for support.",
              });
            } else if (riskLevel === "moderate" || riskLevel === "Moderate") {
              insights.push({
                type: "warning",
                assessmentType: "checklist",
                message: "Your personal problems checklist shows moderate risk level.",
                severity: "medium",
                recommendation: "Consider scheduling an appointment with your guidance counselor.",
              });
            } else if (riskLevel === "low" || riskLevel === "Low") {
              insights.push({
                type: "improvement",
                assessmentType: "checklist",
                message: "Your personal problems checklist shows low risk level.",
                severity: "low",
                recommendation:
                  "Continue monitoring your personal challenges and maintain your current coping strategies.",
              });
            }
          } else {
            // For scored assessments (anxiety, stress, depression)
            const severityLevel = latestAssessment.severityLevel;
            if (severityLevel === "critical" || severityLevel === "Critical") {
              insights.push({
                type: "warning",
                assessmentType: type,
                message: `Your ${type} assessment shows critical levels.`,
                severity: "high",
                recommendation: "Please contact your guidance counselor or emergency services immediately.",
              });
            } else if (severityLevel === "severe" || severityLevel === "Severe") {
              insights.push({
                type: "warning",
                assessmentType: type,
                message: `Your ${type} assessment shows severe levels.`,
                severity: "high",
                recommendation: "Please contact your guidance counselor immediately for support.",
              });
            } else if (severityLevel === "moderate" || severityLevel === "Moderate") {
              insights.push({
                type: "warning",
                assessmentType: type,
                message: `Your ${type} assessment shows moderate levels.`,
                severity: "medium",
                recommendation: "Consider scheduling an appointment with your guidance counselor.",
              });
            }
          }
        }
      }

      // Overall assessment frequency insight
      if (summary.totalAssessments.overall === 0) {
        insights.push({
          type: "warning",
          assessmentType: "overall",
          message: "You haven't completed any mental health assessments yet.",
          severity: "medium",
          recommendation:
            "Consider taking your first assessment to establish a baseline for your mental health.",
        });
      } else if (summary.totalAssessments.overall < 3) {
        insights.push({
          type: "improvement",
          assessmentType: "overall",
          message: "You've started tracking your mental health. Great first step!",
          severity: "low",
          recommendation:
            "Continue taking regular assessments to better understand your mental health patterns.",
        });
      }

      return insights.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    } catch (error) {
      console.error("Error generating progress insights:", error);
      return [];
    }
  }

  // Get mock data for development/fallback
  static getMockPersonalSummary(): PersonalSummary {
    return {
      totalAssessments: {
        anxiety: 5,
        stress: 4,
        depression: 3,
        suicide: 2,
        checklist: 3,
        overall: 17,
      },
      latestAssessments: {
        anxiety: {
          id: "1",
          totalScore: 12,
          severityLevel: "Moderate",
          assessmentDate: new Date().toISOString(),
        },
        stress: {
          id: "2",
          totalScore: 18,
          severityLevel: "Moderate",
          assessmentDate: new Date(Date.now() - 86400000).toISOString(),
        },
        depression: {
          id: "3",
          totalScore: 16,
          severityLevel: "Moderate",
          assessmentDate: new Date(Date.now() - 172800000).toISOString(),
        },
        suicide: {
          id: "4",
          riskLevel: "Low",
          requires_immediate_intervention: false,
          assessmentDate: new Date(Date.now() - 259200000).toISOString(),
        },
        checklist: {
          id: "5",
          totalProblemsChecked: 25,
          riskLevel: "moderate",
          assessmentDate: new Date(Date.now() - 345600000).toISOString(),
        },
      },
      userProfile: {
        id: "user-1",
        userName: "student@example.com",
        type: "student",
        status: "active",
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2592000000).toISOString(),
        person: {
          firstName: "John",
          lastName: "Doe",
          gender: "male",
        },
      },
    };
  }

  static getMockAssessmentHistory(): AssessmentHistoryItem[] {
    const now = new Date();
    return [
      {
        id: "1",
        totalScore: 12,
        severityLevel: "Moderate",
        assessmentDate: now.toISOString(),
        createdAt: now.toISOString(),
        type: "anxiety",
      },
      {
        id: "2",
        totalScore: 18,
        severityLevel: "Moderate",
        assessmentDate: new Date(now.getTime() - 86400000).toISOString(),
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        type: "stress",
      },
      {
        id: "3",
        totalScore: 16,
        severityLevel: "Moderate",
        assessmentDate: new Date(now.getTime() - 172800000).toISOString(),
        createdAt: new Date(now.getTime() - 172800000).toISOString(),
        type: "depression",
      },
      {
        id: "4",
        totalScore: null,
        severityLevel: "Low",
        assessmentDate: new Date(now.getTime() - 259200000).toISOString(),
        createdAt: new Date(now.getTime() - 259200000).toISOString(),
        type: "suicide",
        requiresIntervention: false,
      },
      {
        id: "5",
        totalScore: 25,
        severityLevel: "moderate",
        assessmentDate: new Date(now.getTime() - 345600000).toISOString(),
        createdAt: new Date(now.getTime() - 345600000).toISOString(),
        type: "checklist",
      },
    ];
  }
}
