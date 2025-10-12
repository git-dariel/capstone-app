import type { QueryParams, PaginatedResponse } from "./api.config";
import { HttpClient } from "./api.config";

export interface Student {
  id: string;
  userId?: string; // User ID from the user table (for appointment system)
  studentNumber: string;
  program: string;
  year: string;
  isActive: boolean;
  notes?: Array<{
    title?: string;
    content?: string;
    isMinimized?: boolean;
  }>;
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
    users?: Array<{
      id: string;
      avatar?: string;
      anxietyAssessments?: Array<{
        id: string;
        severityLevel: "minimal" | "mild" | "moderate" | "severe";
        assessmentDate: string;
        totalScore: number;
      }>;
      depressionAssessments?: Array<{
        id: string;
        severityLevel: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
        assessmentDate: string;
        totalScore: number;
      }>;
      stressAssessments?: Array<{
        id: string;
        severityLevel: "low" | "moderate" | "high";
        assessmentDate: string;
        totalScore: number;
      }>;
      suicideAssessments?: Array<{
        id: string;
        riskLevel: "low" | "moderate" | "high";
        assessmentDate: string;
      }>;
    }>;
  };
}

export interface CreateStudentRequest {
  studentNumber?: string;
  program: string;
  year: string;
  notes?: Array<{
    title?: string;
    content?: string;
    isMinimized?: boolean;
  }>;
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
  notes?: Array<{
    title?: string;
    content?: string;
    isMinimized?: boolean;
  }>;
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
      const response = await HttpClient.get<any>("/student", params);
      // Backend returns { students, total, page, totalPages } format
      return {
        data: response.students || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: params?.limit || 10,
        totalPages: response.totalPages || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getStudentById(id: string, params?: QueryParams): Promise<Student> {
    try {
      const response = await HttpClient.get<Student>(`/student/${id}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async createStudent(data: CreateStudentRequest): Promise<Student> {
    try {
      const response = await HttpClient.post<Student>("/student", data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updateStudent(id: string, data: UpdateStudentRequest): Promise<Student> {
    try {
      const response = await HttpClient.patch<Student>(`/student/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStudent(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/student/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
