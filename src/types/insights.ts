export interface InsightData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface ChartFilters {
  year?: number;
  month?: number;
}

export interface InsightsDrilldownLevel {
  level: "overview" | "program" | "year" | "gender";
  title: string;
  data: InsightData[];
  parentValue?: string;
}

export interface MentalHealthInsights {
  type: "anxiety" | "depression" | "stress";
  currentLevel: InsightsDrilldownLevel;
  availableYears: number[];
  availableMonths: { value: number; label: string }[];
  filters: ChartFilters;
}
