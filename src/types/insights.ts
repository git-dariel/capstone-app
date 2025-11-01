export interface InsightData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
  rawValue?: string; // Store the raw value for filtering (e.g., "4th" instead of "4th Year")
}

export interface ChartFilters {
  year?: number;
  month?: number;
}

export interface InsightsDrilldownLevel {
  level: "overview" | "program" | "year" | "gender" | "students";
  title: string;
  data: InsightData[];
  parentValue?: string;
  parentProgram?: string; // Track the program when drilling down to year/gender
  parentYear?: string; // Track the year when drilling down to gender
}

export interface MentalHealthInsights {
  type: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  currentLevel: InsightsDrilldownLevel;
  availableYears: number[];
  availableMonths: { value: number; label: string }[];
  filters: ChartFilters;
}

export interface StudentDetails {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  year: string;
  gender: string;
  assessmentType?: string;
  severity?: string;
  score?: number;
  assessmentDate?: string;
  createdAt: string;
}
