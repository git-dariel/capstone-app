import { HttpClient } from "./api.config";

export interface MetricFilter {
  userFilter?: Record<string, any>;
  startDate?: string | Date;
  endDate?: string | Date;
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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ): Promise<number> {
    const model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
    const metricKey = `total${model}`;

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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ): Promise<ProgramMetric[]> {
    const model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
    const metricKey = `total${model}ByProgram`;

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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ): Promise<YearMetric[]> {
    const model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
    const metricKey = `total${model}ByYear`;

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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ): Promise<GenderMetric[]> {
    const model = assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1);
    const metricKey = `total${model}ByGender`;

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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ) {
    const programData = await this.getByProgram(assessmentType, filter);
    const total = programData.reduce((sum, item) => sum + item.count, 0);

    // Generate colors for each program
    const colors = [
      "#3B82F6",
      "#EF4444",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ) {
    const yearData = await this.getByYear(assessmentType, filter);
    const total = yearData.reduce((sum, item) => sum + item.count, 0);

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

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
    assessmentType: "anxiety" | "depression" | "stress",
    filter?: MetricFilter
  ) {
    const genderData = await this.getByGender(assessmentType, filter);
    const total = genderData.reduce((sum, item) => sum + item.count, 0);

    const genderColors: Record<string, string> = {
      male: "#3B82F6",
      female: "#EC4899",
      other: "#10B981",
      others: "#10B981",
      unknown: "#6B7280",
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
}
