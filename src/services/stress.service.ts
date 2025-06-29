import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface StressAssessment {
  id: string;
  userId: string;
  totalScore: number;
  severityLevel: "low" | "moderate" | "high";
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

  static async getAllAssessments(
    params?: QueryParams
  ): Promise<PaginatedResponse<StressAssessment>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<StressAssessment>>("/stress", params);
      // Backend returns data directly
      return response as any;
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
    } catch (error) {
      throw error;
    }
  }

  // Convenience method to create assessment from numeric responses
  static async createAssessmentFromResponses(
    userId: string,
    responses: Record<number, number>
  ): Promise<StressAssessment> {
    const assessmentData = this.createAssessmentRequest(userId, responses);
    return this.createAssessment(assessmentData);
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
