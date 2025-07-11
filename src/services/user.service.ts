import type { QueryParams } from "./api.config";
import { HttpClient, API_CONFIG, TokenManager } from "./api.config";

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  type: string;
  status?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    contactNumber?: string;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
    age?: number;
    religion?: string;
    civilStatus?: string;
  };
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: string;
}

export class UserService {
  static async getAllUsers(params?: QueryParams): Promise<User[]> {
    try {
      const response = await HttpClient.get<User[]>("/user", params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id: string, params?: QueryParams): Promise<User> {
    try {
      const response = await HttpClient.get<User>(`/user/${id}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await HttpClient.patch<User>(`/user/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/user/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async exportStudentDataCsv(): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/user/export/csv`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TokenManager.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export CSV data");
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "student_mental_health_data.csv";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }
}
