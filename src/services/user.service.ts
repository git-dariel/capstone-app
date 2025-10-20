import type { QueryParams } from "./api.config";
import { HttpClient, API_CONFIG, TokenManager } from "./api.config";

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  type: string;
  status?: string;
  avatar?: string; // Add this line
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
  password?: string;
  currentPassword?: string;
}

export interface ExportFilters {
  program?: string;
  gender?: string;
  severityLevel?: string;
  status?: string;
  assessmentType?: string;
  studentId?: string;
  firstName?: string;
  lastName?: string;
  year?: string;
}

// Add these interfaces for avatar management
export interface AvatarUploadResponse {
  avatar: {
    name: string;
    url: string;
  };
  updatedUser: {
    id: string;
    avatar: string;
  };
}

export class UserService {
  static async getAllUsers(params?: QueryParams): Promise<User[]> {
    try {
      const response = await HttpClient.get<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
      }>("/user", params);
      return response.users;
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

  static async exportStudentDataCsv(filters?: ExportFilters): Promise<void> {
    try {
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }

      const queryString = params.toString();
      const url = `${API_CONFIG.baseURL}/user/export/csv${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TokenManager.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to export CSV data");
      }

      // Create blob from response
      const blob = await response.blob();

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "student_mental_health_data.csv";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw error;
    }
  }

  static async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await HttpClient.postFormData<AvatarUploadResponse>('/user/avatar', formData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAvatar(): Promise<{ message: string }> {
    try {
      const response = await HttpClient.deletePermanent<{ message: string }>('/user/avatar');
      return response;
    } catch (error) {
      throw error;
    }
  }
}
