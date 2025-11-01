export interface InventoryInsightData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface InventoryChartFilters {
  year?: number;
  month?: number;
  program?: string;
  yearLevel?: string;
  gender?: string;
}

export interface InventoryDrilldownLevel {
  level: "overview" | "program" | "year" | "gender" | "students";
  title: string;
  data: InventoryInsightData[];
  parentValue?: string;
  filters?: InventoryChartFilters;
}

export interface InventoryInsights {
  type: "mental-health-prediction" | "bmi-category" | "physical-health";
  currentLevel: InventoryDrilldownLevel;
  availableYears: number[];
  availableMonths: { value: number; label: string }[];
  availablePrograms: string[];
  availableYearLevels: string[];
  filters: InventoryChartFilters;
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
  mentalHealthPrediction?: string;
  bmiCategory?: string;
  createdAt: string;
}
