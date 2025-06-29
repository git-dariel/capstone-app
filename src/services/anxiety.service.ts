import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface AnxietyAssessment {
  id: string;
  userId: string;
  totalScore: number;
  severityLevel: "minimal" | "mild" | "moderate" | "severe";
  assessmentDate: string;
  responses: Record<string, number>;
  analysis: {
    totalScore: number;
    severityLevel: string;
    severityDescription: string;
    recommendationMessage: string;
    needsProfessionalHelp: boolean;
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

  // Helper function to convert numeric difficulty to enum string
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
    } catch (error) {
      throw error;
    }
  }

  // Convenience method to create assessment from numeric responses
  static async createAssessmentFromResponses(
    userId: string,
    responses: Record<number, number>
  ): Promise<AnxietyAssessment> {
    const assessmentData = this.createAssessmentRequest(userId, responses);
    return this.createAssessment(assessmentData);
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
