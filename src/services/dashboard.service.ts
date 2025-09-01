import { HttpClient } from "./api.config";

export interface ChartDataPoint {
  date: string;
  anxiety: number;
  depression: number;
  stress: number;
}

export interface ProgramDistribution {
  program: string;
  anxiety?: number;
  depression?: number;
  stress?: number;
}

export interface SeverityDistribution {
  severity: string;
  anxiety?: number;
  depression?: number;
  stress?: number;
}
export interface AssessmentBreakdown {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface DashboardChartsData {
  trendsData: ChartDataPoint[];
  severityData: SeverityDistribution[];
  programData: ProgramDistribution[];
  assessmentBreakdown: AssessmentBreakdown[];
}

export class DashboardService {
  // Get chart data from the metrics API
  static async getChartData(): Promise<DashboardChartsData> {
    try {
      const response = await HttpClient.get<{
        success: boolean;
        message: string;
        data: {
          trendsData: ChartDataPoint[];
          assessmentBreakdown: AssessmentBreakdown[];
          severityData: SeverityDistribution[];
          monthlyTrends: ChartDataPoint[];
          programDistribution: any[];
          totalStats: {
            anxiety: number;
            depression: number;
            stress: number;
            total: number;
          };
        };
      }>("/metrics/chart-data");

      if (response.success) {
        return {
          trendsData: response.data.trendsData,
          severityData: response.data.severityData,
          programData: response.data.programDistribution || [],
          assessmentBreakdown: response.data.assessmentBreakdown,
        };
      }

      throw new Error(response.message || "Failed to fetch chart data");
    } catch (error) {
      console.error("Error fetching chart data:", error);

      // Return mock data as fallback
      return this.getMockChartData();
    }
  }

  // Generate mock data for development/fallback
  static getMockChartData(): DashboardChartsData {
    const dates = this.getLast7Days();

    const trendsData: ChartDataPoint[] = dates.map((date) => ({
      date,
      anxiety: Math.floor(Math.random() * 15) + 5,
      depression: Math.floor(Math.random() * 12) + 3,
      stress: Math.floor(Math.random() * 18) + 7,
    }));

    const severityData: SeverityDistribution[] = [
      { severity: "Minimal", anxiety: 45, depression: 38, stress: 52 },
      { severity: "Mild", anxiety: 32, depression: 28, stress: 35 },
      { severity: "Moderate", anxiety: 18, depression: 22, stress: 25 },
      { severity: "Severe", anxiety: 12, depression: 15, stress: 8 },
    ];

    const programData: ProgramDistribution[] = [
      { program: "Computer Science", anxiety: 25, depression: 18, stress: 32 },
      { program: "Engineering", anxiety: 22, depression: 15, stress: 28 },
      { program: "Business", anxiety: 18, depression: 12, stress: 22 },
      { program: "Arts & Sciences", anxiety: 15, depression: 10, stress: 18 },
      { program: "Education", anxiety: 12, depression: 8, stress: 15 },
    ];

    const assessmentBreakdown: AssessmentBreakdown[] = [
      { name: "Anxiety", value: 107, color: "#f59e0b", percentage: 38 },
      { name: "Depression", value: 103, color: "#8b5cf6", percentage: 37 },
      { name: "Stress", value: 70, color: "#ef4444", percentage: 25 },
    ];

    return {
      trendsData,
      severityData,
      programData,
      assessmentBreakdown,
    };
  }

  private static getLast7Days(): string[] {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }
    return days;
  }

  // Get assessment trends over a specific period
  static async getAssessmentTrends(_days: number = 30): Promise<ChartDataPoint[]> {
    try {
      const data = await this.getChartData();
      return data.trendsData;
    } catch (error) {
      console.error("Error fetching assessment trends:", error);
      return this.getMockChartData().trendsData;
    }
  }

  // Get severity level distribution
  static async getSeverityDistribution(): Promise<SeverityDistribution[]> {
    try {
      const data = await this.getChartData();
      return data.severityData;
    } catch (error) {
      console.error("Error fetching severity distribution:", error);
      return this.getMockChartData().severityData;
    }
  }

  // Get program distribution
  static async getProgramDistribution(): Promise<ProgramDistribution[]> {
    try {
      const data = await this.getChartData();
      return data.programData;
    } catch (error) {
      console.error("Error fetching program distribution:", error);
      return this.getMockChartData().programData;
    }
  }

  // Get assessment type breakdown
  static async getAssessmentBreakdown(): Promise<AssessmentBreakdown[]> {
    try {
      const data = await this.getChartData();
      return data.assessmentBreakdown;
    } catch (error) {
      console.error("Error fetching assessment breakdown:", error);
      return this.getMockChartData().assessmentBreakdown;
    }
  }
}
