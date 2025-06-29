import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  type: string;
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
  static async getAllUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<User>>("/user", params);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id: string, params?: QueryParams): Promise<User> {
    try {
      const response = await HttpClient.get<User>(`/user/${id}`, params);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await HttpClient.patch<User>(`/user/${id}`, data);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/user/${id}`);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }
}
