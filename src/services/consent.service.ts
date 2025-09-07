import { HttpClient } from "./api.config";

export interface ConsentFormData {
  studentId: string;
  referred?: "self" | "family" | "friend" | "faculty" | "administrative_staff" | "others";
  with_whom_do_you_live?: "alone" | "spouse" | "partner" | "roommates" | "children" | "guardians";
  financial_status:
    | "always_stressful"
    | "often_stressful"
    | "never_stressful"
    | "sometimes_stressful"
    | "rarely_stressful";
  what_brings_you_to_guidance?: string;
  physical_problem?: "yes" | "no";
  physical_symptoms:
    | "shortness_of_breath"
    | "racing_heart"
    | "headaches"
    | "insomnia"
    | "teeth_clenching"
    | "cold_hands_and_feet"
    | "high_blood_pressure"
    | "muscle_tension"
    | "diarrhea"
    | "stomach_discomfort";
  concerns: {
    personal_growth?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    depression?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    suicidal_thoughts?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    study_skills?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    family_concerns?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    sexual_concerns?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    educational_concerns?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    anxiety?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    drug_use?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    physical_concerns?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    self_concept?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    decision_making_about_leaving_pup?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    financial_concerns?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    relationship_with_others?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    spirituality?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    weight_eating_issues?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
    career?:
      | "not_applicable"
      | "leat_important"
      | "somewhat_important"
      | "important"
      | "very_important"
      | "most_important";
  };
  services:
    | "general_information"
    | "one_or_two_session_problem_solving"
    | "stress_management"
    | "group_counseling"
    | "substance_abuse_services"
    | "career_exploration"
    | "individual_counseling"
    | "referral_for_university";
}

export interface ConsentResponse {
  message: string;
  consent: {
    id: string;
    studentId: string;
    referred: string;
    with_whom_do_you_live: string;
    financial_status: string;
    what_brings_you_to_guidance?: string;
    physical_problem: string;
    physical_symptoms: string;
    concerns: any;
    services: string;
    createdAt: string;
    updatedAt: string;
    student: {
      id: string;
      studentNumber: string;
      program: string;
      year: string;
      person: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        gender: string;
        age: number;
      };
    };
  };
}

export interface GetConsentResponse {
  id: string;
  studentId: string;
  referred: string;
  with_whom_do_you_live: string;
  financial_status: string;
  what_brings_you_to_guidance?: string;
  physical_problem: string;
  physical_symptoms: string;
  concerns: any;
  services: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  student?: {
    id: string;
    studentNumber: string;
    program: string;
    year: string;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      gender: string;
      age: number;
    };
  };
}

export interface GetAllConsentsResponse {
  consents: GetConsentResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ConsentFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  fields?: string;
  query?: string;
}

export class ConsentService {
  /**
   * Get all consents with pagination and filtering (for guidance users)
   */
  static async getAllConsents(filters: ConsentFilters = {}): Promise<GetAllConsentsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.order) params.append("order", filters.order);
      if (filters.fields) params.append("fields", filters.fields);
      if (filters.query) params.append("query", filters.query);

      const queryString = params.toString();
      const url = `/consent${queryString ? `?${queryString}` : ""}`;

      const response = await HttpClient.get<GetAllConsentsResponse>(url);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || "Failed to get consents");
    }
  }

  /**
   * Create a new consent form
   */
  static async createConsent(data: ConsentFormData): Promise<ConsentResponse> {
    try {
      const response = await HttpClient.post<ConsentResponse>("/consent", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || "Failed to create consent");
    }
  }

  /**
   * Get consent by student ID
   */
  static async getConsentByStudentId(studentId: string): Promise<GetConsentResponse | null> {
    try {
      const response = await HttpClient.get<GetConsentResponse>(`/consent/student/${studentId}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No consent found
      }
      throw new Error(error.response?.data?.error || error.message || "Failed to get consent");
    }
  }

  /**
   * Check if student has completed consent form
   */
  static async hasConsent(studentId: string): Promise<boolean> {
    try {
      const consent = await this.getConsentByStudentId(studentId);
      return consent !== null;
    } catch (error) {
      return false;
    }
  }
}
