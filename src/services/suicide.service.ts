import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface SuicideAssessment {
  id: string;
  userId: string;
  wished_dead_or_sleep_not_wake_up: "yes" | "no";
  actually_had_thoughts_killing_self: "yes" | "no";
  thinking_about_how_might_do_this?: "yes" | "no" | null;
  had_thoughts_and_some_intention?: "yes" | "no" | null;
  started_worked_out_details_how_kill?: "yes" | "no" | null;
  done_anything_started_prepared_end_life?: "yes" | "no" | null;
  behavior_timeframe?: "past_three_months" | "lifetime_but_not_recent" | "never" | null;
  riskLevel: "low" | "moderate" | "high";
  requires_immediate_intervention: boolean;
  assessmentDate: string;
  analysis: {
    riskLevel: string;
    requiresImmediateIntervention: boolean;
    riskDescription: string;
    recommendationMessage: string;
    crisisProtocolRequired: boolean;
    safetyPlanNeeded: boolean;
    riskScore?: number;
    recommendations: string[];
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

export interface CreateSuicideAssessmentRequest {
  userId: string;
  wished_dead_or_sleep_not_wake_up: "yes" | "no";
  actually_had_thoughts_killing_self: "yes" | "no";
  thinking_about_how_might_do_this?: "yes" | "no";
  had_thoughts_and_some_intention?: "yes" | "no";
  started_worked_out_details_how_kill?: "yes" | "no";
  done_anything_started_prepared_end_life?: "yes" | "no";
  behavior_timeframe?: "past_three_months" | "lifetime_but_not_recent" | "never";
}

export interface UpdateSuicideAssessmentRequest {
  wished_dead_or_sleep_not_wake_up?: "yes" | "no";
  actually_had_thoughts_killing_self?: "yes" | "no";
  thinking_about_how_might_do_this?: "yes" | "no";
  had_thoughts_and_some_intention?: "yes" | "no";
  started_worked_out_details_how_kill?: "yes" | "no";
  done_anything_started_prepared_end_life?: "yes" | "no";
  behavior_timeframe?: "past_three_months" | "lifetime_but_not_recent" | "never";
}

export class SuicideService {
  // Helper function to convert numeric response to enum string for yes/no questions
  private static convertToSuicideResponse(value: number): "yes" | "no" {
    return value === 1 ? "yes" : "no";
  }

  // Helper function to convert numeric response to timeframe enum
  private static convertToBehaviorTimeframe(
    value: number
  ): "past_three_months" | "lifetime_but_not_recent" | "never" {
    switch (value) {
      case 0:
        return "never";
      case 1:
        return "lifetime_but_not_recent";
      case 2:
        return "past_three_months";
      default:
        return "never";
    }
  }

  // Helper function to create assessment request from responses
  static createAssessmentRequest(
    userId: string,
    responses: Record<number, number>
  ): CreateSuicideAssessmentRequest {
    const request: CreateSuicideAssessmentRequest = {
      userId,
      wished_dead_or_sleep_not_wake_up: this.convertToSuicideResponse(responses[0] || 0),
      actually_had_thoughts_killing_self: this.convertToSuicideResponse(responses[1] || 0),
    };

    // Add optional questions only if they should be answered based on previous responses
    if (responses[1] === 1) {
      // Only if actually_had_thoughts_killing_self is "yes"
      if (responses[2] !== undefined) {
        request.thinking_about_how_might_do_this = this.convertToSuicideResponse(responses[2]);
      }
      if (responses[3] !== undefined) {
        request.had_thoughts_and_some_intention = this.convertToSuicideResponse(responses[3]);
      }
      if (responses[4] !== undefined) {
        request.started_worked_out_details_how_kill = this.convertToSuicideResponse(responses[4]);
      }
      if (responses[5] !== undefined) {
        request.done_anything_started_prepared_end_life = this.convertToSuicideResponse(
          responses[5]
        );
      }

      // Behavior timeframe question (question 6)
      if (responses[6] !== undefined) {
        request.behavior_timeframe = this.convertToBehaviorTimeframe(responses[6]);
      }
    }

    return request;
  }

  static async getAllAssessments(
    params?: QueryParams
  ): Promise<PaginatedResponse<SuicideAssessment>> {
    try {
      const response = await HttpClient.get<any>("/suicide", params);
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

  static async getAssessmentById(id: string, params?: QueryParams): Promise<SuicideAssessment> {
    try {
      const response = await HttpClient.get<SuicideAssessment>(`/suicide/${id}`, params);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async createAssessment(data: CreateSuicideAssessmentRequest): Promise<SuicideAssessment> {
    try {
      const response = await HttpClient.post<SuicideAssessment>("/suicide", data);
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
  ): Promise<SuicideAssessment> {
    const assessmentData = this.createAssessmentRequest(userId, responses);
    return this.createAssessment(assessmentData);
  }

  static async updateAssessment(
    id: string,
    data: UpdateSuicideAssessmentRequest
  ): Promise<SuicideAssessment> {
    try {
      const response = await HttpClient.patch<SuicideAssessment>(`/suicide/${id}`, data);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAssessment(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.put<{ message: string }>(`/suicide/${id}`);
      // Backend returns data directly
      return response as any;
    } catch (error) {
      throw error;
    }
  }

  // Utility method to calculate suicide risk score
  static calculateSuicideRiskScore(responses: Record<number, number>): {
    riskScore: number;
    riskLevel: "low" | "moderate" | "high";
  } {
    let riskScore = 0;

    // Questions 0 and 1 are always scored
    riskScore += responses[0] || 0;
    riskScore += responses[1] || 0;

    // Questions 2-5 only if question 1 was "yes" (value 1)
    if (responses[1] === 1) {
      riskScore += responses[2] || 0;
      riskScore += responses[3] || 0;
      riskScore += responses[4] || 0;
      riskScore += responses[5] || 0;
    }

    let riskLevel: "low" | "moderate" | "high";
    if (riskScore <= 1) riskLevel = "low";
    else if (riskScore <= 3) riskLevel = "moderate";
    else riskLevel = "high";

    return { riskScore, riskLevel };
  }
}
