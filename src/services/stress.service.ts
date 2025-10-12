import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

// Cooldown interfaces to match API response
export interface CooldownInfo {
  isActive: boolean;
  daysRemaining: number;
  nextAvailableDate: string;
  lastAssessmentDate?: string;
  lastSeverityLevel?: string;
  cooldownPeriodDays: number;
  manuallyDeactivated: boolean;
  currentPhilippinesTime: string;
  debugInfo?: {
    lastAssessmentPhTime: string;
    nextAvailablePhTime: string;
    timeDifferenceMs: number;
  };
}

export interface CooldownError {
  error: string;
  message: string;
  cooldownInfo: CooldownInfo;
}

export interface StressAssessment {
  id: string;
  userId: string;
  totalScore: number;
  severityLevel: "low" | "moderate" | "high";
  assessmentDate: string;
  responses: Record<string, number>;
  cooldownActive?: boolean;
  analysis: {
    totalScore: number;
    severityLevel: string;
    severityDescription: string;
    recommendationMessage: string;
    needsProfessionalHelp: boolean;
  };
  cooldownInfo?: CooldownInfo;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    avatar?: string;
    person: {
      firstName: string;
      lastName: string;
      middleName?: string;
    };
  };
}

export interface CreateStressAssessmentRequest {
  userId: string;
  upset_because_something_unexpected: string;
  unable_control_important_things: string;
  feeling_nervous_and_stressed: string;
  confident_handle_personal_problems: string;
  feeling_things_going_your_way: string;
  unable_cope_with_all_things: string;
  able_control_irritations: string;
  feeling_on_top_of_things: string;
  angered_things_outside_control: string;
  difficulties_piling_up_cant_overcome: string;
}

export interface UpdateStressAssessmentRequest {
  responses?: Record<string, number>;
}

export class StressService {
  // Helper function to convert numeric response to enum string
  private static convertToStressFrequency(value: number): string {
    switch (value) {
      case 0:
        return "never";
      case 1:
        return "almost_never";
      case 2:
        return "sometimes";
      case 3:
        return "fairly_often";
      case 4:
        return "very_often";
      default:
        return "never";
    }
  }

  // Helper function to create assessment request from responses
  static createAssessmentRequest(
    userId: string,
    responses: Record<number, number>
  ): CreateStressAssessmentRequest {
    return {
      userId,
      upset_because_something_unexpected: this.convertToStressFrequency(responses[0] || 0),
      unable_control_important_things: this.convertToStressFrequency(responses[1] || 0),
      feeling_nervous_and_stressed: this.convertToStressFrequency(responses[2] || 0),
      confident_handle_personal_problems: this.convertToStressFrequency(responses[3] || 0),
      feeling_things_going_your_way: this.convertToStressFrequency(responses[4] || 0),
      unable_cope_with_all_things: this.convertToStressFrequency(responses[5] || 0),
      able_control_irritations: this.convertToStressFrequency(responses[6] || 0),
      feeling_on_top_of_things: this.convertToStressFrequency(responses[7] || 0),
      angered_things_outside_control: this.convertToStressFrequency(responses[8] || 0),
      difficulties_piling_up_cant_overcome: this.convertToStressFrequency(responses[9] || 0),
    };
  }

  // Check cooldown status for a user before allowing new assessment
  static async checkCooldownStatus(userId: string): Promise<CooldownInfo | null> {
    try {
      // Get the most recent assessment for the user
      const response = await HttpClient.get<any>(
        `/stress?userId=${userId}&limit=1&order=desc&fields=id,assessmentDate,severityLevel,cooldownActive`
      );

      if (response.assessments && response.assessments.length > 0) {
        const lastAssessment = response.assessments[0];

        // If the last assessment exists and cooldownActive is true,
        // we can assume there might be a cooldown
        if (lastAssessment.cooldownActive) {
          // Calculate cooldown days based on severity level
          const cooldownDays = this.getCooldownDays(lastAssessment.severityLevel);
          const lastDate = new Date(lastAssessment.assessmentDate);
          const nextAvailableDate = new Date(lastDate);
          nextAvailableDate.setDate(nextAvailableDate.getDate() + cooldownDays);

          const now = new Date();
          const isActive = now < nextAvailableDate;

          if (isActive) {
            const daysRemaining = Math.ceil(
              (nextAvailableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
              isActive: true,
              daysRemaining,
              nextAvailableDate: nextAvailableDate.toISOString(),
              lastAssessmentDate: lastAssessment.assessmentDate,
              lastSeverityLevel: lastAssessment.severityLevel,
              cooldownPeriodDays: cooldownDays,
              manuallyDeactivated: false,
              currentPhilippinesTime: now.toISOString(),
            };
          }
        }
      }

      return null; // No cooldown active
    } catch (error) {
      console.error("Error checking cooldown status:", error);
      return null;
    }
  }

  // Get cooldown days based on severity level (matching API logic)
  private static getCooldownDays(severityLevel: string): number {
    switch (severityLevel) {
      case "low":
        return 30;
      case "moderate":
        return 14;
      case "high":
        return 7;
      default:
        return 30;
    }
  }

  static async getAllAssessments(
    params?: QueryParams
  ): Promise<PaginatedResponse<StressAssessment>> {
    try {
      const response = await HttpClient.get<any>("/stress", params);
      // Backend returns { assessments, total, page, totalPages } format
      return {
        data: response.assessments || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: params?.limit || 10,
        totalPages: response.totalPages || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAssessmentById(id: string, params?: QueryParams): Promise<StressAssessment> {
    try {
      const response = await HttpClient.get<StressAssessment>(`/stress/${id}`, params);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async createAssessment(data: CreateStressAssessmentRequest): Promise<StressAssessment> {
    try {
      const response = await HttpClient.post<StressAssessment>("/stress", data);
      // Backend returns assessment data directly, not wrapped in response.data
      return response as any;
    } catch (error: any) {
      if (error.status === 429 && error.data?.cooldownInfo) {
        throw {
          error: "CooldownError",
          message: "Assessment cooldown active. Please try again later.",
          cooldownInfo: error.data.cooldownInfo,
        };
      }
      throw error;
    }
  }

  // Convenience method to create assessment from numeric responses
  static async createAssessmentFromResponses(
    userId: string,
    responses: Record<number, number>
  ): Promise<StressAssessment> {
    try {
      const assessmentData = this.createAssessmentRequest(userId, responses);
      return await this.createAssessment(assessmentData);
    } catch (error: any) {
      if (error.error === "CooldownError") {
        throw error; // Re-throw cooldown errors as-is
      }
      throw error;
    }
  }

  static async updateAssessment(
    id: string,
    data: UpdateStressAssessmentRequest
  ): Promise<StressAssessment> {
    try {
      const response = await HttpClient.patch<StressAssessment>(`/stress/${id}`, data);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAssessment(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.put<{ message: string }>(`/stress/${id}`);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  // Utility method to calculate stress score and severity with reverse scoring
  static calculateStressScore(responses: Record<number, number>): {
    totalScore: number;
    severityLevel: "low" | "moderate" | "high";
  } {
    // Questions 4, 5, 7, and 8 are reverse scored (indices 3, 4, 6, 7)
    const reverseScoreQuestions = [3, 4, 6, 7];

    let calculatedScore = 0;
    Object.entries(responses).forEach(([questionIndex, value]) => {
      const index = parseInt(questionIndex);
      if (reverseScoreQuestions.includes(index)) {
        calculatedScore += 4 - value; // Reverse scoring
      } else {
        calculatedScore += value;
      }
    });

    let severityLevel: "low" | "moderate" | "high";
    if (calculatedScore <= 13) severityLevel = "low";
    else if (calculatedScore <= 26) severityLevel = "moderate";
    else severityLevel = "high";

    return { totalScore: calculatedScore, severityLevel };
  }
}
