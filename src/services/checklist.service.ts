import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface ChecklistAnalysis {
  totalProblemsChecked: number;
  totalCircledImportant: number;
  categoryScores: Record<string, number>;
  riskLevel: "low" | "moderate" | "high" | "critical";
  urgencyLevel: "none" | "monitor" | "schedule" | "immediate";
  riskFactors: string[];
  recommendations: string[];
  needsAttention: boolean;
  analysisDate: string;
  disclaimer: string;
}

export interface PersonalProblemsChecklist {
  id: string;
  userId: string;
  date_completed: string;
  social_friends_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  appearance_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  attitude_opinion_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  parents_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  family_home_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  school_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  money_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  religion_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  emotional_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  dating_sex_problems: Record<string, "not_checked" | "checked" | "circled_most_important">;
  checklist_analysis?: ChecklistAnalysis;
  analysisGenerated: boolean;
  analysisUpdatedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    person: {
      firstName: string;
      lastName: string;
      middleName?: string;
    };
  };
}

export interface CreateChecklistRequest {
  userId: string;
  social_friends_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  appearance_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  attitude_opinion_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  parents_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  family_home_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  school_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  money_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  religion_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  emotional_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  dating_sex_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
}

export interface UpdateChecklistRequest {
  social_friends_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  appearance_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  attitude_opinion_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  parents_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  family_home_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  school_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  money_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  religion_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  emotional_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
  dating_sex_problems?: Record<string, "not_checked" | "checked" | "circled_most_important">;
}

export interface ChecklistAnalysisResponse {
  id: string;
  checklist_analysis: ChecklistAnalysis;
  analysisUpdatedAt: string;
  user: {
    person: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ChecklistQuestionMap {
  [key: string]: {
    category: keyof CreateChecklistRequest;
    field: string;
    text: string;
  };
}

export class ChecklistService {
  private static readonly BASE_URL = "/checklist";

  // Helper function to convert responses to API format
  static convertResponsesToChecklist(responses: Record<string, number>): CreateChecklistRequest {
    const checklist: CreateChecklistRequest = {
      userId: "", // Will be set by caller
      social_friends_problems: {},
      appearance_problems: {},
      attitude_opinion_problems: {},
      parents_problems: {},
      family_home_problems: {},
      school_problems: {},
      money_problems: {},
      religion_problems: {},
      emotional_problems: {},
      dating_sex_problems: {},
    };

    // Map question IDs to their categories and field names
    const questionMap = this.getQuestionMap();

    Object.entries(responses).forEach(([questionId, value]) => {
      const mapping = questionMap[questionId];
      if (mapping) {
        const severity = this.convertToSeverity(value);
        const category = checklist[mapping.category] as Record<
          string,
          "not_checked" | "checked" | "circled_most_important"
        >;
        if (category) {
          category[mapping.field] = severity;
        }
      }
    });

    return checklist;
  }

  // Convert numeric response to severity level
  private static convertToSeverity(value: number): "not_checked" | "checked" | "circled_most_important" {
    switch (value) {
      case 0:
        return "not_checked";
      case 1:
        return "checked";
      case 2:
        return "circled_most_important";
      default:
        return "not_checked";
    }
  }

  // Get checklist by ID
  static async getById(id: string, fields?: string): Promise<PersonalProblemsChecklist> {
    const params = new URLSearchParams();
    if (fields) params.append("fields", fields);

    const queryString = params.toString();
    const url = `${this.BASE_URL}/${id}${queryString ? `?${queryString}` : ""}`;

    return HttpClient.get<PersonalProblemsChecklist>(url);
  }

  // Get checklist by user ID
  static async getByUserId(userId: string, fields?: string): Promise<PersonalProblemsChecklist> {
    const params = new URLSearchParams();
    if (fields) params.append("fields", fields);

    const queryString = params.toString();
    const url = `${this.BASE_URL}/user/${userId}${queryString ? `?${queryString}` : ""}`;

    return HttpClient.get<PersonalProblemsChecklist>(url);
  }

  // Get checklist analysis by user ID
  static async getAnalysisByUserId(userId: string): Promise<{
    id: string;
    checklist_analysis: ChecklistAnalysis;
    analysisUpdatedAt: string;
    user: {
      person: {
        firstName: string;
        lastName: string;
      };
    };
  }> {
    return HttpClient.get<any>(`${this.BASE_URL}/user/${userId}/analysis`);
  }

  // Get all checklists with pagination
  static async getAll(params?: QueryParams): Promise<PaginatedResponse<PersonalProblemsChecklist>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.query) searchParams.append("search", params.query);
    if (params?.fields) searchParams.append("fields", params.fields);

    const queryString = searchParams.toString();
    const url = `${this.BASE_URL}${queryString ? `?${queryString}` : ""}`;

    return HttpClient.get<PaginatedResponse<PersonalProblemsChecklist>>(url);
  }

  // Create new checklist
  static async createChecklist(data: CreateChecklistRequest): Promise<PersonalProblemsChecklist> {
    return this.create(data);
  }

  // Get all checklists with pagination
  static async getAllChecklists(params?: QueryParams): Promise<PaginatedResponse<PersonalProblemsChecklist>> {
    return this.getAll(params);
  }

  // Get checklist by ID
  static async getChecklistById(id: string, params?: QueryParams): Promise<PersonalProblemsChecklist> {
    return this.getById(id, params?.fields);
  }

  // Get checklist by user ID
  static async getChecklistByUserId(userId: string, params?: QueryParams): Promise<PersonalProblemsChecklist> {
    return this.getByUserId(userId, params?.fields);
  }

  // Update checklist
  static async updateChecklist(id: string, data: UpdateChecklistRequest): Promise<PersonalProblemsChecklist> {
    return this.update(id, data);
  }

  // Delete checklist
  static async deleteChecklist(id: string): Promise<{ message: string }> {
    return this.delete(id);
  }

  // Analyze checklist
  static async analyzeChecklist(id: string): Promise<ChecklistAnalysisResponse> {
    const result = await this.analyze(id);
    // Transform the result to match ChecklistAnalysisResponse
    return {
      id: result.id,
      checklist_analysis: result.checklist_analysis!,
      analysisUpdatedAt: result.analysisUpdatedAt!,
      user: result.user!,
    } as ChecklistAnalysisResponse;
  }

  // Create checklist from responses
  static async createChecklistFromResponses(
    userId: string,
    responses: Record<string, string>
  ): Promise<PersonalProblemsChecklist> {
    // Convert string responses to numbers for the existing method
    const numberResponses = Object.entries(responses).reduce((acc, [key, value]) => {
      acc[key] = parseInt(value, 10);
      return acc;
    }, {} as Record<string, number>);

    return this.createFromResponses(userId, numberResponses);
  }

  // Get question mapping
  static getQuestionMap(): ChecklistQuestionMap {
    return this.getChecklistQuestions();
  }

  // Get all checklist questions with detailed mapping
  // SIMPLIFIED VERSION - Only fields that exist in backend schema
  private static getChecklistQuestions(): ChecklistQuestionMap {
    return {
      // Social/Friends Problems (SOC/FR) - Backend schema fields only
      "1": {
        category: "social_friends_problems",
        field: "not_getting_along_with_other_people",
        text: "Not getting along with other people",
      },
      "2": {
        category: "social_friends_problems",
        field: "being_criticized_by_others",
        text: "Being criticized by others",
      },
      "3": {
        category: "social_friends_problems",
        field: "not_fitting_in_with_peers",
        text: "Not fitting in with peers",
      },
      "4": {
        category: "social_friends_problems",
        field: "feeling_uncomfortable_in_social_settings",
        text: "Feeling uncomfortable in social settings",
      },
      "5": { category: "social_friends_problems", field: "having_a_bad_reputation", text: "Having a bad reputation" },
      "6": { category: "social_friends_problems", field: "feeling_immature", text: "Feeling immature" },
      "7": {
        category: "social_friends_problems",
        field: "being_suspicious_of_others",
        text: "Being suspicious of others",
      },
      "8": { category: "social_friends_problems", field: "being_shy", text: "Being shy" },
      "9": { category: "social_friends_problems", field: "not_having_close_friends", text: "Not having close friends" },
      "10": {
        category: "social_friends_problems",
        field: "being_taken_advantage_of_by_friends",
        text: "Being taken advantage of by friends",
      },
      "11": {
        category: "social_friends_problems",
        field: "not_having_anyone_to_share_interests_with",
        text: "Not having anyone to share interests with",
      },
      "12": { category: "social_friends_problems", field: "feeling_lonely", text: "Feeling lonely" },
      "13": { category: "social_friends_problems", field: "feeling_unpopular", text: "Feeling unpopular" },
      "14": {
        category: "social_friends_problems",
        field: "feeling_uncomfortable_when_talking_to_people",
        text: "Feeling uncomfortable when talking to people",
      },
      "15": { category: "social_friends_problems", field: "feeling_inferior", text: "Feeling inferior" },
      "16": {
        category: "social_friends_problems",
        field: "feeling_like_people_are_against_me",
        text: "Feeling like people are against me",
      },
      "17": {
        category: "social_friends_problems",
        field: "being_embarrassed_by_family_background",
        text: "Being embarrassed by family background",
      },
      "18": {
        category: "social_friends_problems",
        field: "being_let_down_by_friends",
        text: "Being let down by friends",
      },
      "19": {
        category: "social_friends_problems",
        field: "feeling_different_from_everyone_else",
        text: "Feeling different from everyone else",
      },
      "20": {
        category: "social_friends_problems",
        field: "being_pressured_to_do_the_wrong_thing",
        text: "Being pressured to do the wrong thing",
      },

      // Appearance Problems (APP) - 14 questions
      "21": { category: "appearance_problems", field: "being_overweight", text: "Being overweight" },
      "22": {
        category: "appearance_problems",
        field: "being_too_short_or_too_tall",
        text: "Being too short or too tall",
      },
      "23": {
        category: "appearance_problems",
        field: "having_a_physical_handicap",
        text: "Having a physical handicap",
      },
      "24": { category: "appearance_problems", field: "being_too_thin", text: "Being too thin" },
      "25": {
        category: "appearance_problems",
        field: "looking_too_young_or_too_old",
        text: "Looking too young or too old",
      },
      "26": {
        category: "appearance_problems",
        field: "being_noticed_for_physical_appearance",
        text: "Being noticed for physical appearance",
      },
      "27": { category: "appearance_problems", field: "looking_too_plain", text: "Looking too plain" },
      "28": {
        category: "appearance_problems",
        field: "feeling_clumsy_and_awkward",
        text: "Feeling clumsy and awkward",
      },
      "29": {
        category: "appearance_problems",
        field: "not_being_clean_and_well_groomed",
        text: "Not being clean and well groomed",
      },
      "30": {
        category: "appearance_problems",
        field: "not_having_the_right_clothes",
        text: "Not having the right clothes",
      },
      "31": {
        category: "appearance_problems",
        field: "having_an_unattractive_face",
        text: "Having an unattractive face",
      },
      "32": { category: "appearance_problems", field: "having_scars", text: "Having scars" },
      "33": { category: "appearance_problems", field: "having_facial_blemishes", text: "Having facial blemishes" },
      "34": { category: "appearance_problems", field: "not_being_well_developed", text: "Not being well developed" },

      // Attitude/Opinion Problems (ATT/OP) - 12 questions (matching backend schema)
      "35": {
        category: "attitude_opinion_problems",
        field: "having_a_poor_attitude_about_everything",
        text: "Having a poor attitude about everything",
      },
      "36": {
        category: "attitude_opinion_problems",
        field: "not_having_any_goals_in_life",
        text: "Not having any goals in life",
      },
      "37": {
        category: "attitude_opinion_problems",
        field: "having_a_recent_change_in_attitude",
        text: "Having a recent change in attitude",
      },
      "38": {
        category: "attitude_opinion_problems",
        field: "not_listening_to_the_opinions_of_others",
        text: "Not listening to the opinions of others",
      },
      "39": {
        category: "attitude_opinion_problems",
        field: "having_no_opinions_about_things",
        text: "Having no opinions about things",
      },
      "40": {
        category: "attitude_opinion_problems",
        field: "having_different_values_from_others",
        text: "Having different values from others",
      },
      "41": {
        category: "attitude_opinion_problems",
        field: "not_understanding_the_attitudes_of_others",
        text: "Not understanding the attitudes of others",
      },
      "42": {
        category: "attitude_opinion_problems",
        field: "having_a_poor_attitude_toward_religion",
        text: "Having a poor attitude toward religion",
      },
      "43": {
        category: "attitude_opinion_problems",
        field: "having_a_poor_attitude_toward_school",
        text: "Having a poor attitude toward school",
      },
      "44": {
        category: "attitude_opinion_problems",
        field: "having_a_poor_attitude_toward_work",
        text: "Having a poor attitude toward work",
      },
      "45": {
        category: "attitude_opinion_problems",
        field: "having_a_poor_attitude_toward_family",
        text: "Having a poor attitude toward family",
      },
      "46": {
        category: "attitude_opinion_problems",
        field: "having_a_poor_attitude_toward_self",
        text: "Having a poor attitude toward self",
      },

      // Parents Problems (PAR) - 22 questions (matching backend schema exactly)
      "47": { category: "parents_problems", field: "father_or_mother_being_sick", text: "Father or mother being sick" },
      "48": { category: "parents_problems", field: "father_or_mother_having_emotional_problems", text: "Father or mother having emotional problems" },
      "49": { category: "parents_problems", field: "father_or_mother_being_unemployed", text: "Father or mother being unemployed" },
      "50": { category: "parents_problems", field: "father_or_mother_having_problem_with_alcohol", text: "Father or mother having problem with alcohol" },
      "51": { category: "parents_problems", field: "parents_fighting_or_arguing", text: "Parents fighting or arguing" },
      "52": { category: "parents_problems", field: "parents_being_separated_or_getting_divorced", text: "Parents being separated or getting divorced" },
      "53": { category: "parents_problems", field: "parents_being_divorced_remarried_or_stepmother", text: "Parents being divorced, remarried or stepmother" },
      "54": { category: "parents_problems", field: "having_problems_with_stepfather_or_stepmother", text: "Having problems with stepfather or stepmother" },
      "55": { category: "parents_problems", field: "parents_never_being_home", text: "Parents never being home" },
      "56": { category: "parents_problems", field: "not_being_able_to_talk_to_parents", text: "Not being able to talk to parents" },
      "57": { category: "parents_problems", field: "parents_being_too_strict", text: "Parents being too strict" },
      "58": { category: "parents_problems", field: "parents_interfering_with_decisions", text: "Parents interfering with decisions" },
      "59": { category: "parents_problems", field: "parents_expecting_too_much", text: "Parents expecting too much" },
      "60": { category: "parents_problems", field: "parents_disapproving_of_boyfriend_girlfriend", text: "Parents disapproving of boyfriend/girlfriend" },
      "61": { category: "parents_problems", field: "parents_not_trusting_me", text: "Parents not trusting me" },
      "62": { category: "parents_problems", field: "parents_disapproving_of_job", text: "Parents disapproving of job" },
      "63": { category: "parents_problems", field: "parents_disapproving_of_clothes_or_appearance", text: "Parents disapproving of clothes or appearance" },
      "64": { category: "parents_problems", field: "parents_disapproving_of_dating", text: "Parents disapproving of dating" },
      "65": { category: "parents_problems", field: "parents_disapproving_of_music", text: "Parents disapproving of music" },
      "66": { category: "parents_problems", field: "parents_disapproving_of_activities", text: "Parents disapproving of activities" },
      "67": { category: "parents_problems", field: "parents_favoring_brothers_or_sisters", text: "Parents favoring brothers or sisters" },
      "68": { category: "parents_problems", field: "being_ignored_by_parents", text: "Being ignored by parents" },

      // Family/Home Problems (FAM/HM) - 24 questions (matching backend schema exactly)
      "69": { category: "family_home_problems", field: "brother_or_sister_being_sick", text: "Brother or sister being sick" },
      "70": { category: "family_home_problems", field: "brother_or_sister_having_emotional_problems", text: "Brother or sister having emotional problems" },
      "71": { category: "family_home_problems", field: "brother_or_sister_being_unemployed_drugs", text: "Brother or sister being unemployed/drugs" },
      "72": { category: "family_home_problems", field: "brother_or_sister_being_in_trouble_with_law", text: "Brother or sister being in trouble with law" },
      "73": { category: "family_home_problems", field: "being_physically_abused_at_home", text: "Being physically abused at home" },
      "74": { category: "family_home_problems", field: "being_sexually_abused_at_home", text: "Being sexually abused at home" },
      "75": { category: "family_home_problems", field: "arguing_with_brother_or_sister", text: "Arguing with brother or sister" },
      "76": { category: "family_home_problems", field: "family_always_arguing", text: "Family always arguing" },
      "77": { category: "family_home_problems", field: "being_bothered_by_brother_or_sister", text: "Being bothered by brother or sister" },
      "78": { category: "family_home_problems", field: "family_fighting_or_arguing", text: "Family fighting or arguing" },
      "79": { category: "family_home_problems", field: "having_problems_with_relatives", text: "Having problems with relatives" },
      "80": { category: "family_home_problems", field: "not_being_any_privacy", text: "Not being any privacy" },
      "81": { category: "family_home_problems", field: "having_to_do_household_chores", text: "Having to do household chores" },
      "82": { category: "family_home_problems", field: "not_feeling_close_to_family", text: "Not feeling close to family" },
      "83": { category: "family_home_problems", field: "family_not_having_enough_money", text: "Family not having enough money" },
      "84": { category: "family_home_problems", field: "not_getting_along_with_neighbors", text: "Not getting along with neighbors" },
      "85": { category: "family_home_problems", field: "not_willing_to_live_at_home", text: "Not willing to live at home" },
      "86": { category: "family_home_problems", field: "home_being_dirty_or_messy", text: "Home being dirty or messy" },
      "87": { category: "family_home_problems", field: "family_having_a_bad_reputation", text: "Family having a bad reputation" },
      "88": { category: "family_home_problems", field: "living_in_a_bad_neighborhood", text: "Living in a bad neighborhood" },
      "89": { category: "family_home_problems", field: "being_adopted", text: "Being adopted" },
      "90": { category: "family_home_problems", field: "not_being_allowed_to_use_the_car", text: "Not being allowed to use the car" },
      "91": { category: "family_home_problems", field: "not_being_allowed_to_buy_a_car", text: "Not being allowed to buy a car" },
      "92": { category: "family_home_problems", field: "wanting_to_run_away_from_home", text: "Wanting to run away from home" },

      // School Problems (SCH) - 22 questions (matching backend schema exactly)
      "93": { category: "school_problems", field: "getting_bad_grades", text: "Getting bad grades" },
      "94": { category: "school_problems", field: "not_getting_along_with_teachers", text: "Not getting along with teachers" },
      "95": { category: "school_problems", field: "deciding_on_the_right_course_or_studies", text: "Deciding on the right course or studies" },
      "96": { category: "school_problems", field: "not_having_good_study_habits", text: "Not having good study habits" },
      "97": { category: "school_problems", field: "not_having_a_good_place_to_study", text: "Not having a good place to study" },
      "98": { category: "school_problems", field: "taking_the_wrong_courses", text: "Taking the wrong courses" },
      "99": { category: "school_problems", field: "not_being_interested_in_school_or_teams", text: "Not being interested in school or teams" },
      "100": { category: "school_problems", field: "not_qualifying_for_clubs_or_teams", text: "Not qualifying for clubs or teams" },
      "101": { category: "school_problems", field: "not_having_close_friends_at_school", text: "Not having close friends at school" },
      "102": { category: "school_problems", field: "school_being_too_large", text: "School being too large" },
      "103": { category: "school_problems", field: "missing_school_because_of_illness", text: "Missing school because of illness" },
      "104": { category: "school_problems", field: "not_understanding_class_material", text: "Not understanding class material" },
      "105": { category: "school_problems", field: "not_getting_along_with_other_students", text: "Not getting along with other students" },
      "106": { category: "school_problems", field: "feeling_out_of_place_in_school", text: "Feeling out of place in school" },
      "107": { category: "school_problems", field: "not_being_interested_in_school", text: "Not being interested in school" },
      "108": { category: "school_problems", field: "having_a_language_problem_in_school", text: "Having a language problem in school" },
      "109": { category: "school_problems", field: "being_in_the_wrong_school", text: "Being in the wrong school" },
      "110": { category: "school_problems", field: "teachers_not_being_interested_in_students", text: "Teachers not being interested in students" },
      "111": { category: "school_problems", field: "being_bored_in_school", text: "Being bored in school" },
      "112": { category: "school_problems", field: "getting_in_trouble_in_school", text: "Getting in trouble in school" },
      "113": { category: "school_problems", field: "school_being_too_far_from_home", text: "School being too far from home" },
      "114": { category: "school_problems", field: "worrying_about_future_job_or_college", text: "Worrying about future job or college" },

      // Money Problems (MON) - 12 questions (matching backend schema exactly)
      "115": { category: "money_problems", field: "budgeting_money", text: "Budgeting money" },
      "116": { category: "money_problems", field: "not_making_enough_money", text: "Not making enough money" },
      "117": { category: "money_problems", field: "not_having_a_steady_income", text: "Not having a steady income" },
      "118": { category: "money_problems", field: "having_to_spend_savings", text: "Having to spend savings" },
      "119": { category: "money_problems", field: "owing_money", text: "Owing money" },
      "120": { category: "money_problems", field: "wasting_money", text: "Wasting money" },
      "121": { category: "money_problems", field: "depending_on_others_for_money", text: "Depending on others for money" },
      "122": { category: "money_problems", field: "lending_money_to_friends_or_family", text: "Lending money to friends or family" },
      "123": { category: "money_problems", field: "having_to_give_money_to_parents", text: "Having to give money to parents" },
      "124": { category: "money_problems", field: "not_having_enough_money_to_date", text: "Not having enough money to date" },
      "125": { category: "money_problems", field: "not_having_gas_money", text: "Not having gas money" },
      "126": { category: "money_problems", field: "not_having_money_for_clothes", text: "Not having money for clothes" },

      // Religion Problems (REL) - 14 questions (matching backend schema exactly)
      "127": { category: "religion_problems", field: "feeling_guilty_about_religion", text: "Feeling guilty about religion" },
      "128": { category: "religion_problems", field: "not_liking_any_religious_beliefs", text: "Not liking any religious beliefs" },
      "129": { category: "religion_problems", field: "arguing_with_parents_about_religious_beliefs", text: "Arguing with parents about religious beliefs" },
      "130": { category: "religion_problems", field: "being_confused_about_religious_beliefs", text: "Being confused about religious beliefs" },
      "131": { category: "religion_problems", field: "falling_in_religious_beliefs", text: "Falling in religious beliefs" },
      "132": { category: "religion_problems", field: "boyfriend_girlfriend_having_a_different_religion", text: "Boyfriend/girlfriend having a different religion" },
      "133": { category: "religion_problems", field: "arguing_with_girlfriend_boyfriend_about_religion", text: "Arguing with girlfriend/boyfriend about religion" },
      "134": { category: "religion_problems", field: "not_being_able_to_get_to_church", text: "Not being able to get to church" },
      "135": { category: "religion_problems", field: "chores_interfering_with_church_activities", text: "Chores interfering with church activities" },
      "136": { category: "religion_problems", field: "job_interfering_with_church_activities", text: "Job interfering with church activities" },
      "137": { category: "religion_problems", field: "being_upset_by_religious_beliefs_of_others", text: "Being upset by religious beliefs of others" },
      "138": { category: "religion_problems", field: "worrying_about_being_accepted_by_God", text: "Worrying about being accepted by God" },
      "139": { category: "religion_problems", field: "being_rejected_by_church_members", text: "Being rejected by church members" },
      "140": { category: "religion_problems", field: "not_having_friends_at_church", text: "Not having friends at church" },

      // Emotional Problems (EMO) - 24 questions (matching backend schema exactly)
      "141": { category: "emotional_problems", field: "feeling_anxious_or_uptight", text: "Feeling anxious or uptight" },
      "142": { category: "emotional_problems", field: "being_afraid_of_things", text: "Being afraid of things" },
      "143": { category: "emotional_problems", field: "having_the_same_thoughts_over_and_over_again", text: "Having the same thoughts over and over again" },
      "144": { category: "emotional_problems", field: "being_tired_and_having_no_energy", text: "Being tired and having no energy" },
      "145": { category: "emotional_problems", field: "feeling_depressed_or_sad", text: "Feeling depressed or sad" },
      "146": { category: "emotional_problems", field: "having_trouble_concentrating", text: "Having trouble concentrating" },
      "147": { category: "emotional_problems", field: "not_remembering_things", text: "Not remembering things" },
      "148": { category: "emotional_problems", field: "getting_too_emotional", text: "Getting too emotional" },
      "149": { category: "emotional_problems", field: "losing_control", text: "Losing control" },
      "150": { category: "emotional_problems", field: "worrying_about_diseases_or_illness", text: "Worrying about diseases or illness" },
      "151": { category: "emotional_problems", field: "having_nightmares", text: "Having nightmares" },
      "152": { category: "emotional_problems", field: "thinking_too_much_about_death", text: "Thinking too much about death" },
      "153": { category: "emotional_problems", field: "being_afraid_of_hurting_self", text: "Being afraid of hurting self" },
      "154": { category: "emotional_problems", field: "feeling_things_are_unreal", text: "Feeling things are unreal" },
      "155": { category: "emotional_problems", field: "crying_without_good_reason", text: "Crying without good reason" },
      "156": { category: "emotional_problems", field: "worrying_about_having_a_nervous_breakdown", text: "Worrying about having a nervous breakdown" },
      "157": { category: "emotional_problems", field: "not_being_able_to_stop_worrying", text: "Not being able to stop worrying" },
      "158": { category: "emotional_problems", field: "not_being_able_to_relax", text: "Not being able to relax" },
      "159": { category: "emotional_problems", field: "being_unhappy_all_the_time", text: "Being unhappy all the time" },
      "160": { category: "emotional_problems", field: "not_having_any_enjoyment_in_life", text: "Not having any enjoyment in life" },
      "161": { category: "emotional_problems", field: "being_influenced_by_others", text: "Being influenced by others" },
      "162": { category: "emotional_problems", field: "behaving_in_strange_ways", text: "Behaving in strange ways" },
      "163": { category: "emotional_problems", field: "feeling_out_of_control", text: "Feeling out of control" },
      "164": { category: "emotional_problems", field: "being_afraid_of_hurting_someone_else", text: "Being afraid of hurting someone else" },
      // Dating/Sex Problems (DAT/SEX) - 19 questions (matching backend schema exactly)
      "165": { category: "dating_sex_problems", field: "being_uncomfortable_with_opposite_sex", text: "Being uncomfortable with opposite sex" },
      "166": { category: "dating_sex_problems", field: "not_being_able_to_get_a_boyfriend_girlfriend", text: "Not being able to get a boyfriend/girlfriend" },
      "167": { category: "dating_sex_problems", field: "having_problems_with_boyfriend_girlfriend", text: "Having problems with boyfriend/girlfriend" },
      "168": { category: "dating_sex_problems", field: "wanting_to_break_up_with_boyfriend_girlfriend", text: "Wanting to break up with boyfriend/girlfriend" },
      "169": { category: "dating_sex_problems", field: "losing_boyfriend_girlfriend", text: "Losing boyfriend/girlfriend" },
      "170": { category: "dating_sex_problems", field: "arguing_with_boyfriend_girlfriend_and_dating_and_sex", text: "Arguing with boyfriend/girlfriend and dating and sex" },
      "171": { category: "dating_sex_problems", field: "not_having_enough_dates", text: "Not having enough dates" },
      "172": { category: "dating_sex_problems", field: "worrying_about_getting_pregnant", text: "Worrying about getting pregnant" },
      "173": { category: "dating_sex_problems", field: "not_being_able_to_talk_about_dating_and_sex", text: "Not being able to talk about dating and sex" },
      "174": { category: "dating_sex_problems", field: "being_pregnant_or_girlfriend_being_pregnant", text: "Being pregnant or girlfriend being pregnant" },
      "175": { category: "dating_sex_problems", field: "not_knowing_enough_about_sex", text: "Not knowing enough about sex" },
      "176": { category: "dating_sex_problems", field: "worrying_about_sex", text: "Worrying about sex" },
      "177": { category: "dating_sex_problems", field: "thinking_about_sex_too_often", text: "Thinking about sex too often" },
      "178": { category: "dating_sex_problems", field: "worrying_about_being_gay", text: "Worrying about being gay" },
      "179": { category: "dating_sex_problems", field: "being_troubled_by_sexual_attitudes_of_friends", text: "Being troubled by sexual attitudes of friends" },
      "180": { category: "dating_sex_problems", field: "being_troubled_by_unusual_sexual_behavior", text: "Being troubled by unusual sexual behavior" },
      "181": { category: "dating_sex_problems", field: "being_sexually_underdeveloped", text: "Being sexually underdeveloped" },
      "182": { category: "dating_sex_problems", field: "boyfriend_girlfriend_wanting_to_get_married", text: "Boyfriend/girlfriend wanting to get married" },
      "183": { category: "dating_sex_problems", field: "feeling_used_or_being_pushed_into_having_sex", text: "Feeling used or being pushed into having sex" },
    };
  }

  // Create new checklist
  static async create(data: CreateChecklistRequest): Promise<PersonalProblemsChecklist> {
    return HttpClient.post<PersonalProblemsChecklist>(this.BASE_URL, data);
  }

  // Create checklist from responses
  static async createFromResponses(
    userId: string,
    responses: Record<string, number>
  ): Promise<PersonalProblemsChecklist> {
    const checklistData = this.convertResponsesToChecklist(responses);
    checklistData.userId = userId;
    return this.create(checklistData);
  }

  // Update checklist
  static async update(id: string, data: UpdateChecklistRequest): Promise<PersonalProblemsChecklist> {
    return HttpClient.put<PersonalProblemsChecklist>(`${this.BASE_URL}/${id}`, data);
  }

  // Delete checklist
  static async delete(id: string): Promise<{ message: string }> {
    return HttpClient.delete<{ message: string }>(`${this.BASE_URL}/${id}`);
  }

  // Analyze checklist
  static async analyze(id: string): Promise<PersonalProblemsChecklist> {
    return HttpClient.post<PersonalProblemsChecklist>(`${this.BASE_URL}/${id}/analyze`, {});
  }
}
