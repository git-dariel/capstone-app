import type { QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  email?: string;
  contactNumber?: string;
  gender?: "male" | "female" | "others";
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: "single" | "married" | "separated" | "widow" | "cohabiting";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  gender?: "male" | "female" | "others";
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: "single" | "married" | "separated" | "widow" | "cohabiting";
}

export interface UpdatePersonRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  gender?: "male" | "female" | "others";
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: "single" | "married" | "separated" | "widow" | "cohabiting";
}

export class PersonService {
  static async getAllPersons(params?: QueryParams): Promise<Person[]> {
    try {
      const response = await HttpClient.get<Person[]>("/person", params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async getPersonById(id: string, params?: QueryParams): Promise<Person> {
    try {
      const response = await HttpClient.get<Person>(`/person/${id}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async createPerson(data: CreatePersonRequest): Promise<Person> {
    try {
      const response = await HttpClient.post<Person>("/person", data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updatePerson(id: string, data: UpdatePersonRequest): Promise<Person> {
    try {
      const response = await HttpClient.patch<Person>(`/person/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async deletePerson(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.put<{ message: string }>(`/person/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
