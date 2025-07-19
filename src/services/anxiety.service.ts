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

export interface AnxietyAssessment {
  id: string;
  userId: string;
  totalScore: number;
  severityLevel: "minimal" | "mild" | "moderate" | "severe";
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
    person: {
      firstName: string;
      lastName: string;
      middleName?: string;
    };
  };
}

export interface CreateAnxietyAssessmentRequest {
  userId: string;
  feeling_nervous_anxious_edge: string;
  not_able_stop_control_worrying: string;
  worrying_too_much_different_things: string;
  trouble_relaxing: string;
  restless_hard_sit_still: string;
  easily_annoyed_irritable: string;
  feeling_afraid_awful_happen: string;
  difficulty_level?: string;
}

export interface UpdateAnxietyAssessmentRequest {
  responses?: Record<string, number>;
}

export class AnxietyService {
  // Helper function to convert numeric response to enum string
  private static convertToAnxietyLevel(value: number): string {
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

  // Helper function to convert numeric difficulty response to enum string
  private static convertToDifficultyLevel(value: number): string {
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
        `/anxiety?userId=${userId}&limit=1&order=desc&fields=id,assessmentDate,severityLevel,cooldownActive`
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
  ): CreateAnxietyAssessmentRequest {
    const request: CreateAnxietyAssessmentRequest = {
      userId,
      feeling_nervous_anxious_edge: this.convertToAnxietyLevel(responses[0] || 0),
      not_able_stop_control_worrying: this.convertToAnxietyLevel(responses[1] || 0),
      worrying_too_much_different_things: this.convertToAnxietyLevel(responses[2] || 0),
      trouble_relaxing: this.convertToAnxietyLevel(responses[3] || 0),
      restless_hard_sit_still: this.convertToAnxietyLevel(responses[4] || 0),
      easily_annoyed_irritable: this.convertToAnxietyLevel(responses[5] || 0),
      feeling_afraid_awful_happen: this.convertToAnxietyLevel(responses[6] || 0),
    };

    // Add difficulty level if present (question 7)
    if (responses[7] !== undefined) {
      request.difficulty_level = this.convertToDifficultyLevel(responses[7]);
    }

    return request;
  }

  static async getAllAssessments(
    params?: QueryParams
  ): Promise<PaginatedResponse<AnxietyAssessment>> {
    try {
      const response = await HttpClient.get<any>("/anxiety", params);
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

  static async getAssessmentById(id: string, params?: QueryParams): Promise<AnxietyAssessment> {
    try {
      const response = await HttpClient.get<AnxietyAssessment>(`/anxiety/${id}`, params);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async createAssessment(data: CreateAnxietyAssessmentRequest): Promise<AnxietyAssessment> {
    try {
      const response = await HttpClient.post<AnxietyAssessment>("/anxiety", data);
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
  ): Promise<AnxietyAssessment> {
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
    data: UpdateAnxietyAssessmentRequest
  ): Promise<AnxietyAssessment> {
    try {
      const response = await HttpClient.patch<AnxietyAssessment>(`/anxiety/${id}`, data);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAssessment(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.put<{ message: string }>(`/anxiety/${id}`);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  // Utility method to calculate anxiety score and severity
  static calculateAnxietyScore(responses: Record<number, number>): {
    totalScore: number;
    severityLevel: "minimal" | "mild" | "moderate" | "severe";
  } {
    const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);

    let severityLevel: "minimal" | "mild" | "moderate" | "severe";
    if (totalScore <= 4) severityLevel = "minimal";
    else if (totalScore <= 9) severityLevel = "mild";
    else if (totalScore <= 14) severityLevel = "moderate";
    else severityLevel = "severe";

    return { totalScore, severityLevel };
  }
}
