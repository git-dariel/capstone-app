import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface Student {
  id: string;
  studentNumber: string;
  program: string;
  year: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
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

export interface CreateStudentRequest {
  studentNumber: string;
  program: string;
  year: string;
  personId?: string; // If linking to existing person
  // If creating new person
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: string;
  address?: {
    street?: string;
    city?: string;
    houseNo?: string;
    province?: string;
    barangay?: string;
    zipCode?: string;
    country?: string;
    type?: string;
  };
}

export interface UpdateStudentRequest {
  studentNumber?: string;
  program?: string;
  year?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: string;
}

export class StudentService {
  static async getAllStudents(params?: QueryParams): Promise<PaginatedResponse<Student>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<Student>>("/student", params);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async getStudentById(id: string, params?: QueryParams): Promise<Student> {
    try {
      const response = await HttpClient.get<Student>(`/student/${id}`, params);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async createStudent(data: CreateStudentRequest): Promise<Student> {
    try {
      const response = await HttpClient.post<Student>("/student", data);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async updateStudent(id: string, data: UpdateStudentRequest): Promise<Student> {
    try {
      const response = await HttpClient.patch<Student>(`/student/${id}`, data);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStudent(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/student/${id}`);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }
}
