import { HttpClient } from "./api.config";

// Types for inventory
export interface InventoryFormData {
  studentId: string;
  height: string;
  weight: string;
  coplexion: string;
  person_to_be_contacted_in_case_of_accident_or_illness: {
    firstName: string;
    lastName: string;
    middleName?: string;
    address: {
      houseNo?: number;
      street?: string;
      province?: string;
      city?: string;
      barangay?: string;
      zipCode?: number;
      country?: string;
    };
    relationship:
      | "parent"
      | "child"
      | "sibling"
      | "spouse"
      | "granparent"
      | "cousin"
      | "partner"
      | "classmate";
  };
  educational_background: {
    level: "pre_elementary" | "elementary" | "high_school" | "vocational" | "college_if_any";
    school_graduation: string;
    school_address: {
      houseNo?: number;
      street?: string;
      province?: string;
      city?: string;
      barangay?: string;
      zipCode?: number;
      country?: string;
    };
    status: "public" | "private";
    dates_of_attendance: string; // ISO DateTime string
    honors_received: string; // Required in schema
  };
  nature_of_schooling: {
    continuous: boolean;
    interrupted: boolean;
    exaplain_why?: string | null;
  };
  home_and_family_background: {
    father: {
      firstName: string;
      lastName: string;
      middleName?: string;
      age: number;
      status: "living" | "deceased";
      educational_attainment:
        | "none"
        | "elementary"
        | "high_school"
        | "senior_high_school"
        | "bachelors_degree"
        | "vocational";
      occupation: string; // Required in schema
      employer: {
        firstName: string;
        lastName: string;
        middleName?: string;
        address: {
          houseNo?: number;
          street?: string;
          province?: string;
          city?: string;
          barangay?: string;
          zipCode?: number;
          country?: string;
        };
      };
    };
    mother: {
      firstName: string;
      lastName: string;
      middleName?: string;
      age: number;
      status: "living" | "deceased";
      educational_attainment:
        | "none"
        | "elementary"
        | "high_school"
        | "senior_high_school"
        | "bachelors_degree"
        | "vocational";
      occupation: string; // Required in schema
      employer: {
        firstName: string;
        lastName: string;
        middleName?: string;
        address: {
          houseNo?: number;
          street?: string;
          province?: string;
          city?: string;
          barangay?: string;
          zipCode?: number;
          country?: string;
        };
      };
    };
    guardian: {
      firstName: string;
      lastName: string;
      middleName?: string;
      age: number;
      status: "living" | "deceased";
      educational_attainment:
        | "none"
        | "elementary"
        | "high_school"
        | "senior_high_school"
        | "bachelors_degree"
        | "vocational";
      occupation: string; // Required in schema
      employer: {
        firstName: string;
        lastName: string;
        middleName?: string;
        address: {
          houseNo?: number;
          street?: string;
          province?: string;
          city?: string;
          barangay?: string;
          zipCode?: number;
          country?: string;
        };
      };
    };
    parents_martial_relationship:
      | "single_parent"
      | "married_and_staying_together"
      | "married_but_separated"
      | "not_married_but_living_together"
      | "others";
    number_of_children_in_the_family_including_yourself: number;
    number_of_brothers: number;
    number_of_sisters: number;
    number_of_brothers_or_sisters_employed: number;
    ordinal_position: string;
    is_your_brother_sister_who_is_gainfully_employed_providing_support_to_your:
      | "family"
      | "your_studies"
      | "his__or_her_own_family";
    who_finances_your_schooling:
      | "parents"
      | "spouse"
      | "relatives"
      | "brother"
      | "sister"
      | "scholarship"
      | "self_supporting";
    how_much_is_your_weekly_allowance: number;
    parents_total_montly_income: {
      income:
        | "below_five_thousand"
        | "five_thousand_to_ten_thousand"
        | "ten_thousand_to_fifteen_thousand"
        | "fifteen_thousand_to_twenty_thousand"
        | "twenty_thousand_to_twenty_five_thousand"
        | "twenty_five_thousand_to_thirty_thousand"
        | "thirty_thousand_to_thirty_five_thousand"
        | "thirty_five_thousand_to_forty_thousand"
        | "forty_thousand_to_forty_five_thousand"
        | "forty_five_thousand_to_fifty_thousand"
        | "above_fifty_thousand";
      others: string; // Required in schema
    };
    do_you_have_quiet_place_to_study: "yes" | "no";
    do_you_share_your_room_with_anyone: {
      status: "yes" | "no";
      if_yes_with_whom?: string | null;
    };
    nature_of_residence_while_attending_school:
      | "family_home"
      | "relatives_home"
      | "bed_spacer"
      | "rented_apartment"
      | "house_of_married_brother_or_sister"
      | "dorm"
      | "shares_apartment_with_friends_or_relatives";
  };
  health: {
    physical: {
      your_vision?: boolean;
      your_hearing?: boolean;
      your_speech?: boolean;
      your_general_health?: boolean;
      if_yes_please_specify?: string; // Optional in schema
    };
    psychological: {
      consulted: "psychiatrist" | "psychologist" | "councelor";
      status: "yes" | "no";
      when?: string | null; // ISO DateTime string, optional in schema
      for_what?: string; // Optional in schema
    };
  };
  interest_and_hobbies: {
    academic: "match_club" | "debating_club" | "science_club" | "quizzers_club"; // Required enum in schema
    favorite_subject: string; // Required in schema
    favorite_least_subject: string; // Required in schema
    what_are_your_hobbies: string[]; // Required in schema
    organizations_participated:
      | "athletics"
      | "dramatics"
      | "religous_organization"
      | "chess_club"
      | "glee_club"
      | "scouting"
      | "others"; // Required enum in schema
    occupational_position_organization: "officer" | "member" | "others"; // Required enum in schema
  };
  test_results?: {
    date?: string | null; // ISO DateTime string, optional in schema
    name_of_test?: string; // Optional in schema
    rs?: string; // Optional in schema
    pr?: string; // Optional in schema
    description?: string; // Optional in schema
  };
  significant_notes_councilor_only?: {
    date?: string; // ISO DateTime string, optional in schema
    incident?: string; // Optional in schema
    remarks?: string; // Optional in schema
  };
  student_signature: string;
}

export interface MentalHealthPrediction {
  academicPerformanceOutlook: "Improved" | "Same" | "Declined";
  confidence: string;
  modelAccuracy: {
    decisionTree: string;
    randomForest: string;
  };
  riskFactors: string[];
  mentalHealthRisk: {
    level: string;
    description: string;
    needsAttention: boolean;
    urgency: string;
    assessmentSummary: string;
    disclaimer: string;
  };
  inputData: any;
  recommendations: string[];
}

export interface InventoryResponse {
  message: string;
  disclaimer?: string;
  inventory: {
    id: string;
    studentId: string;
    height: string;
    weight: string;
    coplexion: string;
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
  mentalHealthPrediction?: MentalHealthPrediction;
}

export interface GetInventoryResponse {
  id: string;
  studentId: string;
  height: string;
  weight: string;
  coplexion: string;
  createdAt: string;
  updatedAt: string;
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

export interface GetAllInventoriesResponse {
  inventories: GetInventoryResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InventoryFilters {
  page?: number;
  limit?: number;
  query?: string;
  sort?: string;
  order?: "asc" | "desc";
  fields?: string;
}

export class InventoryService {
  /**
   * Get all inventories with pagination and filtering (for guidance users)
   */
  static async getAllInventories(
    filters: InventoryFilters = {}
  ): Promise<GetAllInventoriesResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await HttpClient.get<GetAllInventoriesResponse>(
        `/inventory?${searchParams.toString()}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || error.message || "Failed to fetch inventories"
      );
    }
  }

  /**
   * Create a new inventory form
   */
  static async createInventory(data: InventoryFormData): Promise<InventoryResponse> {
    try {
      const response = await HttpClient.post<InventoryResponse>("/inventory", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || "Failed to create inventory");
    }
  }

  /**
   * Get inventory by student ID
   */
  static async getInventoryByStudentId(studentId: string): Promise<GetInventoryResponse | null> {
    try {
      const response = await HttpClient.get<GetInventoryResponse>(
        `/inventory/student/${studentId}`
      );
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.error || error.message || "Failed to fetch inventory");
    }
  }

  /**
   * Check if student has completed inventory form
   */
  static async hasInventory(studentId: string): Promise<boolean> {
    try {
      const inventory = await this.getInventoryByStudentId(studentId);
      return inventory !== null;
    } catch (error) {
      console.error("Error checking inventory:", error);
      return false;
    }
  }

  /**
   * Get mental health prediction for a student based on inventory data
   */
  static async getMentalHealthPrediction(
    studentId: string,
    overrideData?: {
      gender?: string;
      age?: number;
      highSchoolAverage?: number;
      natureOfSchooling?: string;
      parentsMaritalRelationship?: string;
      numberOfChildren?: number;
      ordinalPosition?: string;
      whoFinancesYourSchooling?: string;
      parentsTotalMonthlyIncome?: string;
      quietPlaceToStudy?: string;
      natureOfResidence?: string;
      visionProblems?: string;
      generalHealthProblems?: string;
      psychologicalConsultation?: string;
      favoriteSubject?: string;
      leastFavoriteSubject?: string;
      academicOrganizations?: string;
      organizationPosition?: string;
    }
  ): Promise<MentalHealthPrediction> {
    try {
      const response = await HttpClient.post<{ prediction: MentalHealthPrediction }>(
        `/inventory/${studentId}/predict`,
        overrideData || {}
      );
      return response.prediction;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || error.message || "Failed to get mental health prediction"
      );
    }
  }
}
