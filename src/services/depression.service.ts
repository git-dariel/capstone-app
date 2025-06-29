import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface DepressionAssessment {
  id: string;
  userId: string;
  totalScore: number;
  severityLevel: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
  assessmentDate: string;
  responses: Record<string, number>;
  analysis: {
    totalScore: number;
    severityLevel: string;
    severityDescription: string;
    recommendationMessage: string;
    needsProfessionalHelp: boolean;
    requiresImmediateAttention: boolean;
  };
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
      const response = await HttpClient.get<PaginatedResponse<DepressionAssessment>>(
        "/depression",
        params
      );
      // Backend returns data directly
      return response as any;
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
    } catch (error) {
      throw error;
    }
  }

  // Convenience method to create assessment from numeric responses
  static async createAssessmentFromResponses(
    userId: string,
    responses: Record<number, number>
  ): Promise<DepressionAssessment> {
    const assessmentData = this.createAssessmentRequest(userId, responses);
    return this.createAssessment(assessmentData);
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
