import { MetricsService } from "@/services";
import type {
  InventoryChartFilters,
  InventoryDrilldownLevel,
  InventoryInsights,
  StudentDetails,
} from "@/types/inventory-insights";
import { useCallback, useState } from "react";

interface UseInventoryInsightsState {
  insights: InventoryInsights | null;
  studentList: StudentDetails[];
  loading: boolean;
  error: string | null;
  drilldownHistory: InventoryDrilldownLevel[];
}

export const useInventoryInsights = () => {
  const [state, setState] = useState<UseInventoryInsightsState>({
    insights: null,
    studentList: [],
    loading: false,
    error: null,
    drilldownHistory: [],
  });

  // Mock data generator
  const generateMockData = useCallback((
    type: "mental-health-prediction" | "bmi-category" | "physical-health",
    level: "overview" | "program" | "year" | "gender" | "students",
    filters: InventoryChartFilters = {}
  ): InventoryDrilldownLevel => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    if (level === "overview") {
      if (type === "mental-health-prediction") {
        return {
          level: "overview",
          title: "Mental Health Predictions by Severity",
          data: [
            { label: "Low Risk", value: 45, percentage: 45, color: colors[1] },
            { label: "Moderate Risk", value: 35, percentage: 35, color: colors[2] },
            { label: "High Risk", value: 15, percentage: 15, color: colors[3] },
            { label: "Critical Risk", value: 5, percentage: 5, color: colors[4] },
          ],
        };
      } else if (type === "bmi-category") {
        return {
          level: "overview",
          title: "BMI Categories Distribution",
          data: [
            { label: "Underweight", value: 18, percentage: 18, color: colors[0] },
            { label: "Normal", value: 52, percentage: 52, color: colors[1] },
            { label: "Overweight", value: 25, percentage: 25, color: colors[2] },
            { label: "Obese", value: 5, percentage: 5, color: colors[3] },
          ],
        };
      }
    } else if (level === "program") {
      return {
        level: "program",
        title: `${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} by Program`,
        data: [
          { label: "BSIT", value: 32, percentage: 32, color: colors[0] },
          { label: "BSCS", value: 28, percentage: 28, color: colors[1] },
          { label: "BSE", value: 22, percentage: 22, color: colors[2] },
          { label: "BSBA", value: 18, percentage: 18, color: colors[3] },
        ],
        parentValue: filters.program,
      };
    } else if (level === "year") {
      return {
        level: "year",
        title: `Year Level Distribution - ${filters.program}`,
        data: [
          { label: "1st Year", value: 25, percentage: 31, color: colors[0] },
          { label: "2nd Year", value: 22, percentage: 27, color: colors[1] },
          { label: "3rd Year", value: 20, percentage: 25, color: colors[2] },
          { label: "4th Year", value: 13, percentage: 17, color: colors[3] },
        ],
        parentValue: filters.yearLevel,
      };
    } else if (level === "gender") {
      return {
        level: "gender",
        title: `Gender Distribution - ${filters.program} ${filters.yearLevel}`,
        data: [
          { label: "Male", value: 12, percentage: 48, color: colors[0] },
          { label: "Female", value: 13, percentage: 52, color: colors[1] },
        ],
        parentValue: filters.gender,
      };
    }

    return {
      level: "overview",
      title: "Overview",
      data: [],
    };
  }, []);

  const generateMockStudentList = useCallback((filters: InventoryChartFilters): StudentDetails[] => {
    const programs = ["BSIT", "BSCS", "BSE", "BSBA"];
    const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    const genders = ["Male", "Female"];
    const predictions = ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"];
    const bmiCategories = ["Underweight", "Normal", "Overweight", "Obese"];

    const students: StudentDetails[] = [];
    const count = Math.floor(Math.random() * 15) + 5; // 5-20 students

    for (let i = 0; i < count; i++) {
      const randomProgram = filters.program || programs[Math.floor(Math.random() * programs.length)];
      const randomYear = filters.yearLevel || years[Math.floor(Math.random() * years.length)];
      const randomGender = filters.gender || genders[Math.floor(Math.random() * genders.length)];

      students.push({
        id: `student-${i + 1}`,
        studentNumber: `2024-${(Math.floor(Math.random() * 90000) + 10000).toString()}`,
        firstName: `Student${i + 1}`,
        lastName: `Lastname${i + 1}`,
        email: `student${i + 1}@university.edu`,
        program: randomProgram,
        year: randomYear,
        gender: randomGender,
        mentalHealthPrediction: predictions[Math.floor(Math.random() * predictions.length)],
        bmiCategory: bmiCategories[Math.floor(Math.random() * bmiCategories.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return students;
  }, []);

  const fetchInsights = useCallback(async (
    type: "mental-health-prediction" | "bmi-category" | "physical-health"
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch available years
      const availableYears = await MetricsService.getInventoryAvailableYears();

      // Fetch initial overview data based on type
      let overviewData;
      if (type === "mental-health-prediction") {
        overviewData = await MetricsService.getMentalHealthPredictionOverview();
      } else if (type === "bmi-category") {
        overviewData = await MetricsService.getBMICategoryOverview();
      } else {
        // physical-health uses BMI as well
        overviewData = await MetricsService.getBMICategoryOverview();
      }

      const initialLevel: InventoryDrilldownLevel = {
        level: "overview",
        title: type === "mental-health-prediction" 
          ? "Mental Health Predictions by Severity"
          : type === "bmi-category"
          ? "BMI Categories Distribution"
          : "Physical Health Overview",
        data: overviewData.data,
      };

      const insights: InventoryInsights = {
        type,
        currentLevel: initialLevel,
        availableYears: availableYears,
        availableMonths: [
          { value: 1, label: "January" },
          { value: 2, label: "February" },
          { value: 3, label: "March" },
          { value: 4, label: "April" },
          { value: 5, label: "May" },
          { value: 6, label: "June" },
          { value: 7, label: "July" },
          { value: 8, label: "August" },
          { value: 9, label: "September" },
          { value: 10, label: "October" },
          { value: 11, label: "November" },
          { value: 12, label: "December" },
        ],
        availablePrograms: ["BSIT", "BSCS", "BSE", "BSBA"],
        availableYearLevels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        filters: {},
      };

      setState(prev => ({
        ...prev,
        insights,
        drilldownHistory: [initialLevel],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to fetch inventory insights",
        loading: false,
      }));
    }
  }, []);

  const drillDown = useCallback((selectedValue: string) => {
    if (!state.insights) return;

    const currentLevel = state.insights.currentLevel;
    let nextLevel: "program" | "year" | "gender" | "students";
    let newFilters = { ...state.insights.filters };

    if (currentLevel.level === "overview") {
      nextLevel = "program";
    } else if (currentLevel.level === "program") {
      nextLevel = "year";
      newFilters.program = selectedValue;
    } else if (currentLevel.level === "year") {
      nextLevel = "gender";
      newFilters.yearLevel = selectedValue;
    } else if (currentLevel.level === "gender") {
      nextLevel = "students";
      newFilters.gender = selectedValue;
    } else {
      return; // Already at deepest level
    }

    if (nextLevel === "students") {
      // Generate student list
      const studentList = generateMockStudentList(newFilters);
      setState(prev => ({
        ...prev,
        studentList,
        insights: prev.insights ? {
          ...prev.insights,
          filters: newFilters,
        } : null,
      }));
    } else {
      // Generate next level data
      const nextLevelData = generateMockData(state.insights.type, nextLevel, newFilters);
      const updatedInsights = {
        ...state.insights,
        currentLevel: nextLevelData,
        filters: newFilters,
      };

      setState(prev => ({
        ...prev,
        insights: updatedInsights,
        drilldownHistory: [...prev.drilldownHistory, nextLevelData],
        studentList: [],
      }));
    }
  }, [state.insights, generateMockData, generateMockStudentList]);

  const navigateBack = useCallback(() => {
    if (state.drilldownHistory.length <= 1) return;

    const newHistory = [...state.drilldownHistory];
    newHistory.pop();
    const previousLevel = newHistory[newHistory.length - 1];

    // Update filters based on previous level
    let newFilters = { ...state.insights?.filters };
    if (previousLevel.level === "overview") {
      newFilters = {};
    } else if (previousLevel.level === "program") {
      newFilters = { program: newFilters.program };
    } else if (previousLevel.level === "year") {
      newFilters = { program: newFilters.program, yearLevel: newFilters.yearLevel };
    }

    setState(prev => ({
      ...prev,
      insights: prev.insights ? {
        ...prev.insights,
        currentLevel: previousLevel,
        filters: newFilters,
      } : null,
      drilldownHistory: newHistory,
      studentList: [],
    }));
  }, [state.drilldownHistory, state.insights]);

  const updateFilters = useCallback(async (filters: InventoryChartFilters) => {
    if (!state.insights) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedLevel = generateMockData(
        state.insights.type,
        state.insights.currentLevel.level,
        filters
      );

      setState(prev => ({
        ...prev,
        insights: prev.insights ? {
          ...prev.insights,
          currentLevel: updatedLevel,
          filters,
        } : null,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to update filters",
        loading: false,
      }));
    }
  }, [state.insights, generateMockData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    insights: state.insights,
    studentList: state.studentList,
    loading: state.loading,
    error: state.error,
    canNavigateBack: state.drilldownHistory.length > 1,
    canDrillDown: state.insights?.currentLevel.level !== "students",
    isStudentView: state.insights?.currentLevel.level === "students" || state.studentList.length > 0,
    fetchInsights,
    drillDown,
    navigateBack,
    updateFilters,
    clearError,
  };
};