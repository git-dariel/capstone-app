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
  progressInsights: Array<{
    type: "improvement" | "decline" | "stable" | "warning";
    assessmentType: "anxiety" | "stress" | "depression" | "suicide" | "checklist" | "overall";
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class GuidanceDashboardService {
  // Get overall student progress insights for guidance dashboard
  static async getStudentProgressOverview(
    page: number = 1,
    limit: number = 10
  ): Promise<StudentProgressOverview> {
    try {
      const response = await MetricsService.fetchGuidanceDashboardMetrics(
        ["studentProgressOverview"],
        { page, limit }
      );

      // Handle different possible response structures
      let overviewData: StudentProgressOverview | null = null;

      // Type guard to check if object has StudentProgressOverview structure
      const isStudentProgressOverview = (obj: any): obj is StudentProgressOverview => {
        if (!obj || typeof obj !== "object") return false;
        // Check for required properties - be lenient with empty arrays
        const hasStudents = Array.isArray(obj.students);
        const hasSummary = obj.summary && typeof obj.summary === "object";
        const hasPagination = obj.pagination && typeof obj.pagination === "object";

        return hasStudents && hasSummary && hasPagination;
      };

      // Case 1: response.data is an array with the expected structure
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        const firstItem: any = response.data[0];

        // Check if studentProgressOverview is null (error case)
        if (firstItem?.studentProgressOverview === null) {
          // Return empty structure
          overviewData = {
            students: [],
            summary: {
              totalStudents: 0,
              studentsWithAssessments: 0,
              highRiskStudents: 0,
              moderateRiskStudents: 0,
              lowRiskStudents: 0,
            },
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        }
        // Check if it has studentProgressOverview property
        else if (
          firstItem?.studentProgressOverview &&
          isStudentProgressOverview(firstItem.studentProgressOverview)
        ) {
          overviewData = firstItem.studentProgressOverview;
        }
        // Check if the first item itself is the overview structure
        else if (isStudentProgressOverview(firstItem)) {
          overviewData = firstItem;
        }
      }
      // Case 2: response itself might be the data array (if HttpClient unwraps it)
      else if (Array.isArray(response) && response.length > 0) {
        const firstItem: any = response[0];
        if (
          firstItem?.studentProgressOverview &&
          isStudentProgressOverview(firstItem.studentProgressOverview)
        ) {
          overviewData = firstItem.studentProgressOverview;
        } else if (isStudentProgressOverview(firstItem)) {
          overviewData = firstItem;
        }
      }
      // Case 3: response might have studentProgressOverview directly
      else if (
        (response as any)?.studentProgressOverview &&
        isStudentProgressOverview((response as any).studentProgressOverview)
      ) {
        overviewData = (response as any).studentProgressOverview;
      }
      // Case 4: response itself might be the overview structure
      else if (isStudentProgressOverview(response)) {
        overviewData = response as unknown as StudentProgressOverview;
      }

      // Check if we have valid data
      if (overviewData && typeof overviewData === "object") {
        // Double-check the structure before returning
        if (
          Array.isArray(overviewData.students) &&
          overviewData.summary &&
          overviewData.pagination
        ) {
          return overviewData;
        }
      }

      // If we get here, try one more time with a more lenient check
      // Sometimes the response might be wrapped differently
      if (response?.data?.[0]?.studentProgressOverview) {
        const data = response.data[0].studentProgressOverview;
        if (
          data &&
          typeof data === "object" &&
          "students" in data &&
          "summary" in data &&
          "pagination" in data
        ) {
          return data as StudentProgressOverview;
        }
      }

      // Also check if response.data[0] itself is the structure
      if (response?.data?.[0]) {
        const data = response.data[0];
        if (
          data &&
          typeof data === "object" &&
          "students" in data &&
          "summary" in data &&
          "pagination" in data
        ) {
          return data as StudentProgressOverview;
        }
      }

      // Last resort: return empty structure instead of throwing
      return {
        students: [],
        summary: {
          totalStudents: 0,
          studentsWithAssessments: 0,
          highRiskStudents: 0,
          moderateRiskStudents: 0,
          lowRiskStudents: 0,
        },
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
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
      // For now, we'll get the first page and search through it
      // In a real implementation, you might want to add a separate API endpoint for this
      const overview = await this.getStudentProgressOverview(1, 100); // Get more results to increase chance of finding the student
      return overview.students.find((student) => student.studentId === studentId) || null;
    } catch (error) {
      console.error("Error fetching student progress insights:", error);
      return null;
    }
  }

  // Get detailed assessment data by ID and type
  static async getAssessmentDetails(
    assessmentId: string,
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist"
  ): Promise<any> {
    try {
      const response = await MetricsService.fetchGuidanceDashboardMetrics(
        ["getAssessmentDetails"],
        { assessmentId, assessmentType }
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const detailsData = response.data[0];

        // The backend returns [{ getAssessmentDetails: { ...assessment data } }]
        if (detailsData && detailsData.getAssessmentDetails) {
          return detailsData.getAssessmentDetails;
        }
      }

      throw new Error("No assessment details received from API");
    } catch (error) {
      console.error("Error fetching assessment details:", error);
      throw error;
    }
  }
}
