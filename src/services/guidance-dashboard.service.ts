import { MetricsService } from "./metrics.service";

export interface StudentProgressInsight {
  studentId: string;
  studentName: string;
  studentNumber: string;
  program: string;
  year: number;
  totalAssessments: {
    anxiety: number;
    stress: number;
    depression: number;
    suicide: number;
    overall: number;
  };
  latestAssessments: {
    anxiety: any | null;
    stress: any | null;
    depression: any | null;
    suicide: any | null;
  };
  progressInsights: Array<{
    type: "improvement" | "decline" | "stable" | "warning";
    assessmentType: "anxiety" | "stress" | "depression" | "suicide" | "overall";
    message: string;
    severity: "low" | "medium" | "high";
    recommendation?: string;
  }>;
  riskLevel: "low" | "medium" | "high";
  lastAssessmentDate: string | null;
}

export interface StudentProgressOverview {
  students: StudentProgressInsight[];
  summary: {
    totalStudents: number;
    studentsWithAssessments: number;
    highRiskStudents: number;
    moderateRiskStudents: number;
    lowRiskStudents: number;
  };
}

export class GuidanceDashboardService {
  // Get overall student progress insights for guidance dashboard
  static async getStudentProgressOverview(): Promise<StudentProgressOverview> {
    try {
      const response = await MetricsService.fetchGuidanceDashboardMetrics([
        "studentProgressOverview",
      ]);

      console.log("📥 Full API response:", response);

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const overviewData = response.data[0];
        console.log("📊 Overview data:", overviewData);

        // The backend returns [{ studentProgressOverview: { students, summary } }]
        if (overviewData && overviewData.studentProgressOverview) {
          console.log("📋 Student progress overview:", overviewData.studentProgressOverview);
          return overviewData.studentProgressOverview as StudentProgressOverview;
        }

        // Fallback: if the data is directly the overview structure
        if (overviewData && overviewData.students && overviewData.summary) {
          console.log("📋 Direct overview structure:", overviewData);
          return overviewData as StudentProgressOverview;
        }
      }

      throw new Error("No student progress data received from API");
    } catch (error) {
      console.error("Error fetching student progress overview:", error);
      throw error;
    }
  }

  // Get detailed progress insights for a specific student
  static async getStudentProgressInsights(
    studentId: string
  ): Promise<StudentProgressInsight | null> {
    try {
      const overview = await this.getStudentProgressOverview();
      return overview.students.find((student) => student.studentId === studentId) || null;
    } catch (error) {
      console.error("Error fetching student progress insights:", error);
      return null;
    }
  }
}
