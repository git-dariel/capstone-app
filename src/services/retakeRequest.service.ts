import { HttpClient } from "./api.config";

export interface RetakeRequest {
  id: string;
  userId: string;
  assessmentType: "anxiety" | "depression" | "stress" | "suicide";
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerComments?: string;
  lastAssessmentId?: string;
  cooldownExpiry?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    userName?: string;
    person?: {
      firstName: string;
      lastName: string;
      email?: string;
    };
  };
  reviewer?: {
    id: string;
    userName?: string;
    person?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateRetakeRequestData {
  assessmentType: "anxiety" | "depression" | "stress" | "suicide";
  reason: string;
  lastAssessmentId?: string;
  cooldownExpiry?: string;
}

export interface UpdateRetakeRequestData {
  status: "approved" | "rejected";
  reviewerComments?: string;
}

export interface PaginatedRetakeRequests {
  requests: RetakeRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RetakeRequestQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  assessmentType?: "anxiety" | "depression" | "stress" | "suicide";
  userId?: string;
}

export class RetakeRequestService {
  private static baseUrl = "/retake-request";

  /**
   * Create a new retake request
   */
  static async createRequest(data: CreateRetakeRequestData): Promise<RetakeRequest> {
    try {
      const response = await HttpClient.post<RetakeRequest>(this.baseUrl, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all retake requests (Admin only)
   */
  static async getAllRequests(params?: RetakeRequestQueryParams): Promise<PaginatedRetakeRequests> {
    try {
      const response = await HttpClient.get<PaginatedRetakeRequests>(this.baseUrl, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user's retake requests
   */
  static async getUserRequests(
    params?: RetakeRequestQueryParams
  ): Promise<PaginatedRetakeRequests> {
    try {
      // Use the same endpoint as getAllRequests - the backend will filter based on user role
      const response = await HttpClient.get<PaginatedRetakeRequests>(this.baseUrl, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get retake request by ID
   */
  static async getRequestById(id: string): Promise<RetakeRequest> {
    try {
      const response = await HttpClient.get<RetakeRequest>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update retake request status (Admin only)
   */
  static async updateRequest(id: string, data: UpdateRetakeRequestData): Promise<RetakeRequest> {
    try {
      const response = await HttpClient.patch<RetakeRequest>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete retake request (Admin only)
   */
  static async deleteRequest(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user can request retake for a specific assessment type
   */
  static async canRequestRetake(
    assessmentType: "anxiety" | "depression" | "stress" | "suicide"
  ): Promise<boolean> {
    try {
      const userRequests = await this.getUserRequests({
        status: "pending",
        assessmentType,
        limit: 1,
      });

      // If there's already a pending request, user cannot request another
      return userRequests.requests.length === 0;
    } catch (error) {
      console.error("Error checking retake eligibility:", error);
      return false;
    }
  }

  /**
   * Get formatted display text for assessment types
   */
  static getAssessmentTypeDisplayName(type: string): string {
    switch (type) {
      case "anxiety":
        return "Anxiety (GAD-7)";
      case "depression":
        return "Depression (PHQ-9)";
      case "stress":
        return "Stress (PSS-10)";
      case "suicide":
        return "Suicide Risk Assessment";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  /**
   * Get status display info with colors
   */
  static getStatusDisplayInfo(status: string): { label: string; color: string; bgColor: string } {
    switch (status) {
      case "pending":
        return {
          label: "Pending Review",
          color: "text-yellow-700",
          bgColor: "bg-yellow-100",
        };
      case "approved":
        return {
          label: "Approved",
          color: "text-green-700",
          bgColor: "bg-green-100",
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "text-red-700",
          bgColor: "bg-red-100",
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: "text-gray-700",
          bgColor: "bg-gray-100",
        };
    }
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
