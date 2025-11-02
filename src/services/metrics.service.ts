import { HttpClient } from "./api.config";

export interface MetricFilter {
  userFilter?: Record<string, any>;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
  program?: string;
  yearLevel?: string;
  gender?: string;
  assessmentId?: string;
  assessmentType?: string;
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
      const response = await HttpClient.post<MetricResponse>("/metrics", request);
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
      const response = await HttpClient.post<MetricResponse>("/metrics/student/dashboard", {
        data,
        filter,
        methodParams,
      });
      return response as any;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }

  // Method to fetch guidance dashboard metrics
  static async fetchGuidanceDashboardMetrics(data: string[], filter?: MetricFilter): Promise<MetricResponse> {
    try {
      const response = await HttpClient.post<MetricResponse>("/metrics/guidance/dashboard", {
        data,
        filter,
      });
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
    
    // Try to access the data directly if it's in the response.data array
    let result;
    if (Array.isArray(response.data) && response.data[0]?.[metricKey]) {
      result = response.data[0][metricKey];
    } else if (Array.isArray(response.data)) {
      // Data might be directly in response.data if it's an array of gender objects
      result = response.data;
    } else {
      result = [];
    }
    
    return result;
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
        rawValue: item.year, // Store the raw year value (e.g., "4th")
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

  // Get student list for assessments
  static async getAssessmentStudentList(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    filter?: MetricFilter
  ) {
    let model: string;
    let metricKey: string;
    
    // Handle special cases for suicide and checklist
    if (assessmentType === "suicide") {
      model = "Suicide";
      metricKey = "assessmentStudentList";
    } else if (assessmentType === "checklist") {
      model = "PersonalProblemsChecklist";
      metricKey = "assessmentStudentList";
    } else {
      model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
      metricKey = "assessmentStudentList";
    }

    const request: MetricRequest = {
      model,
      data: [metricKey],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.[metricKey] || [];
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

  // Inventory Metrics Methods
  static async getInventoryStats(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["inventoryStats"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const stats = response.data[0]?.inventoryStats || {};

    return {
      totalRecords: stats.totalRecords || 0,
      highRiskCount: stats.highRiskCount || 0,
      completionRate: stats.completionRate || 0,
      avgBmi: stats.avgBmi || 0,
    };
  }

  static async getInventoryAvailableYears(): Promise<number[]> {
    try {
      const response = await this.fetchMetrics({
        model: "Inventory",
        data: ["availableYears"],
      });

      const years = response.data[0]?.availableYears || [];
      if (years.length > 0) {
        return years.sort((a: number, b: number) => b - a);
      }

      throw new Error("No years data available");
    } catch (error) {
      console.error("Error fetching available years:", error);
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2];
    }
  }

  static async getMentalHealthPredictionOverview(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["mentalHealthPredictionDistribution"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.mentalHealthPredictionDistribution || [];

    const colors: Record<string, string> = {
      "Low Risk": "#10B981",
      "Moderate Risk": "#F59E0B",
      "High Risk": "#EF4444",
      "Critical Risk": "#8B5CF6",
    };

    const total = data.reduce((sum: number, item: any) => sum + item.count, 0);

    return {
      data: data.map((item: any) => ({
        label: item.risk,
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: colors[item.risk] || "#6B7280",
      })),
      total,
    };
  }

  static async getBMICategoryOverview(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["bmiCategoryDistribution"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.bmiCategoryDistribution || [];

    const colors: Record<string, string> = {
      "Underweight": "#3B82F6",
      "Normal": "#10B981",
      "Overweight": "#F59E0B",
      "Obese": "#EF4444",
    };

    const total = data.reduce((sum: number, item: any) => sum + item.count, 0);

    return {
      data: data.map((item: any) => ({
        label: item.category,
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: colors[item.category] || "#6B7280",
      })),
      total,
    };
  }

  static async getMentalHealthPredictionByProgram(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["mentalHealthPredictionByProgram"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.mentalHealthPredictionByProgram || [];

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

    return {
      data: data.map((item: any, index: number) => ({
        label: item.program,
        value: item.total,
        percentage: 0, // Will be calculated after
        color: colors[index % colors.length],
      })),
      total: data.reduce((sum: number, item: any) => sum + item.total, 0),
    };
  }

  static async getMentalHealthPredictionByYear(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["mentalHealthPredictionByYear"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.mentalHealthPredictionByYear || [];

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

    return {
      data: data.map((item: any, index: number) => ({
        label: item.year,
        value: item.total,
        percentage: 0,
        color: colors[index % colors.length],
      })),
      total: data.reduce((sum: number, item: any) => sum + item.total, 0),
    };
  }

  static async getMentalHealthPredictionByGender(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["mentalHealthPredictionByGender"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.mentalHealthPredictionByGender || [];

    const colors = ["#3B82F6", "#EC4899"];

    return {
      data: data.map((item: any, index: number) => ({
        label: item.gender,
        value: item.total,
        percentage: 0,
        color: colors[index % colors.length],
      })),
      total: data.reduce((sum: number, item: any) => sum + item.total, 0),
    };
  }

  static async getBMICategoryByProgram(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["bmiCategoryByProgram"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.bmiCategoryByProgram || [];

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

    return {
      data: data.map((item: any, index: number) => ({
        label: item.program,
        value: item.total,
        percentage: 0,
        color: colors[index % colors.length],
      })),
      total: data.reduce((sum: number, item: any) => sum + item.total, 0),
    };
  }

  static async getBMICategoryByYear(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["bmiCategoryByYear"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.bmiCategoryByYear || [];

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

    return {
      data: data.map((item: any, index: number) => ({
        label: item.year,
        value: item.total,
        percentage: 0,
        color: colors[index % colors.length],
      })),
      total: data.reduce((sum: number, item: any) => sum + item.total, 0),
    };
  }

  static async getBMICategoryByGender(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["bmiCategoryByGender"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    const data = response.data[0]?.bmiCategoryByGender || [];

    const colors = ["#3B82F6", "#EC4899"];

    return {
      data: data.map((item: any, index: number) => ({
        label: item.gender,
        value: item.total,
        percentage: 0,
        color: colors[index % colors.length],
      })),
      total: data.reduce((sum: number, item: any) => sum + item.total, 0),
    };
  }

  static async getInventoryStudentList(filter?: MetricFilter) {
    const request: MetricRequest = {
      model: "Inventory",
      data: ["inventoryStudentList"],
      filter,
    };

    const response = await this.fetchMetrics(request);
    return response.data[0]?.inventoryStudentList || [];
  }
}
