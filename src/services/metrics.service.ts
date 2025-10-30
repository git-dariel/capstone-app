import { HttpClient } from "./api.config";

export interface MetricFilter {
  userFilter?: Record<string, any>;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

export interface MetricRequest {
  model: string;
  data: string[];
  filter?: MetricFilter;
}

export interface MetricResponse {
  data: Record<string, any>[];
}

// Program data interface
export interface ProgramMetric {
  program: string;
  count: number;
}

// Year data interface
export interface YearMetric {
  year: string;
  count: number;
}

// Gender data interface
export interface GenderMetric {
  gender: string;
  count: number;
}

// Retake Request data interfaces
export interface RetakeRequestMetrics {
  pendingRequests: number;
  approvedThisWeek: number;
  totalRequests: number;
}

export interface StatusMetric {
  status: string;
  count: number;
}

export interface AssessmentTypeMetric {
  assessmentType: string;
  count: number;
}

export class MetricsService {
  // Generic method to fetch metrics
  static async fetchMetrics(request: MetricRequest): Promise<MetricResponse> {
    try {
      console.log("📤 Sending metrics request:", JSON.stringify(request, null, 2));
      const response = await HttpClient.post<MetricResponse>("/metrics", request);
      console.log("📥 Received metrics response:", response);
      return response as any;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  }

  // Method to fetch dashboard metrics for authenticated users
  static async fetchDashboardMetrics(
    data: string[], 
    filter?: MetricFilter, 
    methodParams?: Record<string, any>
  ): Promise<MetricResponse> {
    try {
      console.log("📤 Sending dashboard metrics request:", JSON.stringify({ data, filter, methodParams }, null, 2));
      const response = await HttpClient.post<MetricResponse>("/metrics/student/dashboard", {
        data,
        filter,
        methodParams,
      });
      console.log("📥 Received dashboard metrics response:", response);
      return response as any;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }

  // Method to fetch guidance dashboard metrics
  static async fetchGuidanceDashboardMetrics(data: string[], filter?: MetricFilter): Promise<MetricResponse> {
    try {
      console.log("📤 Sending guidance dashboard metrics request:", JSON.stringify({ data, filter }, null, 2));
      const response = await HttpClient.post<MetricResponse>("/metrics/guidance/dashboard", {
        data,
        filter,
      });
      console.log("📥 Received guidance dashboard metrics response:", response);
      return response as any;
    } catch (error) {
      console.error("Error fetching guidance dashboard metrics:", error);
      throw error;
    }
  }

  // Get available years dynamically from the database
  static async getAvailableYears(): Promise<number[]> {
    try {
      // Get years from anxiety assessments as a sample
      const anxietyYears = await this.fetchMetrics({
        model: "Anxiety",
        data: ["availableYears"],
      });

      const years = anxietyYears.data[0]?.availableYears || [];
      if (years.length > 0) {
        return years.sort((a: number, b: number) => b - a); // Descending order
      }

      throw new Error("No years data available");
    } catch (error) {
      console.error("Error fetching available years:", error);
      // Fallback to current year range if API fails
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
    }
  }

  // Get total unique student count
  static async getTotalStudentCount(filter?: MetricFilter): Promise<number> {
    const request: MetricRequest = {
      model: "Student",
      data: ["totalStudent"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.totalStudent || 0;
  }

  // Get total count for a specific assessment type
  static async getTotalCount(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ): Promise<number> {
    let model: string;
    let metricKey: string;
    
    // Handle special cases for suicide and checklist
    if (assessmentType === "suicide") {
      model = "Suicide";
      metricKey = "totalSuicide";
    } else if (assessmentType === "checklist") {
      model = "PersonalProblemsChecklist";
      metricKey = "totalChecklist";
    } else {
      model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
      metricKey = `total${model}`;
    }

    const request: MetricRequest = {
      model,
      data: [metricKey],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.[metricKey] || 0;
  }

  // Get assessments by program
  static async getByProgram(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ): Promise<ProgramMetric[]> {
    let model: string;
    let metricKey: string;
    
    // Handle special cases for suicide and checklist
    if (assessmentType === "suicide") {
      model = "Suicide";
      metricKey = "totalSuicideByProgram";
    } else if (assessmentType === "checklist") {
      model = "PersonalProblemsChecklist";
      metricKey = "totalChecklistByProgram";
    } else {
      model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
      metricKey = `total${model}ByProgram`;
    }

    const request: MetricRequest = {
      model,
      data: [metricKey],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.[metricKey] || [];
  }

  // Get assessments by academic year
  static async getByYear(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ): Promise<YearMetric[]> {
    let model: string;
    let metricKey: string;
    
    // Handle special cases for suicide and checklist
    if (assessmentType === "suicide") {
      model = "Suicide";
      metricKey = "totalSuicideByYear";
    } else if (assessmentType === "checklist") {
      model = "PersonalProblemsChecklist";
      metricKey = "totalChecklistByYear";
    } else {
      model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
      metricKey = `total${model}ByYear`;
    }

    const request: MetricRequest = {
      model,
      data: [metricKey],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.[metricKey] || [];
  }

  // Get assessments by gender
  static async getByGender(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ): Promise<GenderMetric[]> {
    let model: string;
    let metricKey: string;
    
    // Handle special cases for suicide and checklist
    if (assessmentType === "suicide") {
      model = "Suicide";
      metricKey = "totalSuicideByGender";
    } else if (assessmentType === "checklist") {
      model = "PersonalProblemsChecklist";
      metricKey = "totalChecklistByGender";
    } else {
      model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
      metricKey = `total${model}ByGender`;
    }

    const request: MetricRequest = {
      model,
      data: [metricKey],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.[metricKey] || [];
  }

  // Get comprehensive metrics for overview (program breakdown)
  static async getOverviewMetrics(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ) {
    const programData = await this.getByProgram(assessmentType, filter);
    const total = programData.reduce((sum, item) => sum + item.count, 0);

    // Generate colors for each program - matching InsightsBarChart colors
    const colors = [
      "#3b82f6", // Blue
      "#ef4444", // Red
      "#10b981", // Green
      "#f59e0b", // Yellow
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#06b6d4", // Cyan
      "#84cc16", // Lime
    ];

    return {
      data: programData.map((item, index) => ({
        label: item.program,
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: colors[index % colors.length],
      })),
      total,
    };
  }

  // Get year metrics for drilldown
  static async getYearMetrics(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ) {
    const yearData = await this.getByYear(assessmentType, filter);
    const total = yearData.reduce((sum, item) => sum + item.count, 0);

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    return {
      data: yearData.map((item, index) => ({
        label: `${item.year} Year`,
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: colors[index % colors.length],
      })),
      total,
    };
  }

  // Get gender metrics for drilldown
  static async getGenderMetrics(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ) {
    const genderData = await this.getByGender(assessmentType, filter);
    const total = genderData.reduce((sum, item) => sum + item.count, 0);

    const genderColors: Record<string, string> = {
      male: "#3b82f6",
      female: "#ec4899",
      other: "#10b981",
      others: "#10b981",
      unknown: "#6b7280",
    };

    return {
      data: genderData.map((item) => ({
        label: item.gender.charAt(0).toUpperCase() + item.gender.slice(1),
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: genderColors[item.gender.toLowerCase()] || "#6B7280",
      })),
      total,
    };
  }

  // Retake Request Metrics
  static async getRetakeRequestMetrics(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "RetakeRequest",
      data: ["totalPendingRequests", "totalApprovedThisWeek", "totalRequests"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0] || {};

    return {
      pendingRequests: data.totalPendingRequests || 0,
      approvedThisWeek: data.totalApprovedThisWeek || 0,
      totalRequests: data.totalRequests || 0,
    };
  }

  static async getRetakeRequestsByStatus(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "RetakeRequest",
      data: ["totalRequestsByStatus"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const statusData = response.data[0]?.totalRequestsByStatus || [];

    const statusColors: Record<string, string> = {
      pending: "#F59E0B",
      approved: "#10B981",
      rejected: "#EF4444",
    };

    const total = statusData.reduce((sum: number, item: any) => sum + item.count, 0);

    return {
      data: statusData.map((item: any) => ({
        label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: statusColors[item.status.toLowerCase()] || "#6B7280",
      })),
      total,
    };
  }

  static async getRetakeRequestsByAssessmentType(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "RetakeRequest",
      data: ["totalRequestsByAssessmentType"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const typeData = response.data[0]?.totalRequestsByAssessmentType || [];

    const typeColors: Record<string, string> = {
      anxiety: "#3B82F6",
      depression: "#8B5CF6",
      stress: "#EF4444",
      suicide: "#F59E0B",
    };

    const total = typeData.reduce((sum: number, item: any) => sum + item.count, 0);

    return {
      data: typeData.map((item: any) => ({
        label: item.assessmentType.charAt(0).toUpperCase() + item.assessmentType.slice(1),
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: typeColors[item.assessmentType.toLowerCase()] || "#6B7280",
      })),
      total,
    };
  }
}
