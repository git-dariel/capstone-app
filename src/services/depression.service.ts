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

export interface DepressionAssessment {
  id: string;
  userId: string;
  totalScore: number;
  severityLevel: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
  assessmentDate: string;
  responses: Record<string, number>;
  cooldownActive?: boolean;
  analysis: {
    totalScore: number;
    severityLevel: string;
    severityDescription: string;
    recommendationMessage: string;
    needsProfessionalHelp: boolean;
    requiresImmediateAttention: boolean;
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

export interface CreateDepressionAssessmentRequest {
  userId: string;
  little_interest_pleasure_doing_things: string;
  feeling_down_depressed_hopeless: string;
  trouble_falling_staying_asleep_too_much: string;
  feeling_tired_having_little_energy: string;
  poor_appetite_overeating: string;
  feeling_bad_about_yourself_failure: string;
  trouble_concentrating_things: string;
  moving_speaking_slowly_fidgety_restless: string;
  thoughts_better_off_dead_hurting_yourself: string;
  difficulty_level?: string;
}

export interface UpdateDepressionAssessmentRequest {
  responses?: Record<string, number>;
}

export class DepressionService {
  // Helper function to convert numeric response to enum string
  private static convertToDepressionFrequency(value: number): string {
    switch (value) {
      case 0:
        return "not_at_all";
      case 1:
        return "several_days";
      case 2:
        return "more_than_half_days";
      case 3:
        return "nearly_every_day";
      default:
        return "not_at_all";
    }
  }

  // Helper function to convert numeric difficulty to enum string
  private static convertToDepressionDifficultyLevel(value: number): string {
    switch (value) {
      case 0:
        return "not_difficult_at_all";
      case 1:
        return "somewhat_difficult";
      case 2:
        return "very_difficult";
      case 3:
        return "extremely_difficult";
      default:
        return "not_difficult_at_all";
    }
  }

  // Check cooldown status for a user before allowing new assessment
  static async checkCooldownStatus(userId: string): Promise<CooldownInfo | null> {
    try {
      // Get the most recent assessment for the user
      const response = await HttpClient.get<any>(
        `/depression?userId=${userId}&limit=1&order=desc&fields=id,assessmentDate,severityLevel,cooldownActive`
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
      case "minimal":
        return 30;
      case "mild":
        return 25;
      case "moderate":
        return 14;
      case "moderately_severe":
        return 7;
      case "severe":
        return 2;
      default:
        return 30;
    }
  }

  // Helper function to create assessment request from responses
  static createAssessmentRequest(
    userId: string,
    responses: Record<number, number>
  ): CreateDepressionAssessmentRequest {
    const request: CreateDepressionAssessmentRequest = {
      userId,
      little_interest_pleasure_doing_things: this.convertToDepressionFrequency(responses[0] || 0),
      feeling_down_depressed_hopeless: this.convertToDepressionFrequency(responses[1] || 0),
      trouble_falling_staying_asleep_too_much: this.convertToDepressionFrequency(responses[2] || 0),
      feeling_tired_having_little_energy: this.convertToDepressionFrequency(responses[3] || 0),
      poor_appetite_overeating: this.convertToDepressionFrequency(responses[4] || 0),
      feeling_bad_about_yourself_failure: this.convertToDepressionFrequency(responses[5] || 0),
      trouble_concentrating_things: this.convertToDepressionFrequency(responses[6] || 0),
      moving_speaking_slowly_fidgety_restless: this.convertToDepressionFrequency(responses[7] || 0),
      thoughts_better_off_dead_hurting_yourself: this.convertToDepressionFrequency(
        responses[8] || 0
      ),
    };

    // Add difficulty level if present (question 9)
    if (responses[9] !== undefined) {
      request.difficulty_level = this.convertToDepressionDifficultyLevel(responses[9]);
    }

    return request;
  }

  static async getAllAssessments(
    params?: QueryParams
  ): Promise<PaginatedResponse<DepressionAssessment>> {
    try {
      const response = await HttpClient.get<any>("/depression", params);
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

  static async getAssessmentById(id: string, params?: QueryParams): Promise<DepressionAssessment> {
    try {
      const response = await HttpClient.get<DepressionAssessment>(`/depression/${id}`, params);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async createAssessment(
    data: CreateDepressionAssessmentRequest
  ): Promise<DepressionAssessment> {
    try {
      const response = await HttpClient.post<DepressionAssessment>("/depression", data);
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
  ): Promise<DepressionAssessment> {
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
    data: UpdateDepressionAssessmentRequest
  ): Promise<DepressionAssessment> {
    try {
      const response = await HttpClient.patch<DepressionAssessment>(`/depression/${id}`, data);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAssessment(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.put<{ message: string }>(`/depression/${id}`);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  // Utility method to calculate depression score and severity
  static calculateDepressionScore(responses: Record<number, number>): {
    totalScore: number;
    severityLevel: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
  } {
    const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);

    let severityLevel: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
    if (totalScore <= 4) severityLevel = "minimal";
    else if (totalScore <= 9) severityLevel = "mild";
    else if (totalScore <= 14) severityLevel = "moderate";
    else if (totalScore <= 19) severityLevel = "moderately_severe";
    else severityLevel = "severe";

    return { totalScore, severityLevel };
  }
}
