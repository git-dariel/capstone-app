import { useState, useCallback } from "react";
import { MetricsService, type MetricFilter } from "@/services";
import type {
  InventoryInsights,
  InventoryDrilldownLevel,
  InventoryChartFilters,
  StudentDetails,
} from "@/types/inventory-insights";

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

  const drillDown = useCallback(async (selectedValue: string) => {
    if (!state.insights) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const currentLevel = state.insights.currentLevel;
      const filters = state.insights.filters;
      let nextLevel: InventoryDrilldownLevel;
      let newFilters = { ...filters };

      // Create filter for API call
      const metricFilter: MetricFilter = {};

      if (filters.year && filters.month) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
        metricFilter.startDate = startDate.toISOString();
        metricFilter.endDate = endDate.toISOString();
      } else if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
        metricFilter.startDate = startDate.toISOString();
        metricFilter.endDate = endDate.toISOString();
      }

      switch (currentLevel.level) {
        case "overview": {
          // Drill down to program level
          // Store the selected risk/category level for filtering
          if (state.insights.type === "mental-health-prediction") {
            newFilters.riskLevel = selectedValue;
            metricFilter.riskLevel = selectedValue;
          } else if (state.insights.type === "bmi-category") {
            newFilters.bmiCategory = selectedValue;
            metricFilter.bmiCategory = selectedValue;
          }
          
          let programData;
          if (state.insights.type === "mental-health-prediction") {
            programData = await MetricsService.getMentalHealthPredictionByProgram(metricFilter);
          } else {
            programData = await MetricsService.getBMICategoryByProgram(metricFilter);
          }

          nextLevel = {
            level: "program",
            title: `${selectedValue} - By Program`,
            data: programData.data.map((item: any) => ({
              ...item,
              percentage: programData.total > 0 ? Math.round((item.value / programData.total) * 100) : 0,
            })),
            parentValue: selectedValue,
          };
          break;
        }
        case "program": {
          // Drill down to year level
          newFilters.program = selectedValue;
          
          // Add program filter to API call, keep risk/category level from previous drill-down
          metricFilter.program = selectedValue;
          if (newFilters.riskLevel) {
            metricFilter.riskLevel = newFilters.riskLevel;
          }
          if (newFilters.bmiCategory) {
            metricFilter.bmiCategory = newFilters.bmiCategory;
          }
          
          let yearData;
          if (state.insights.type === "mental-health-prediction") {
            yearData = await MetricsService.getMentalHealthPredictionByYear(metricFilter);
          } else {
            yearData = await MetricsService.getBMICategoryByYear(metricFilter);
          }

          nextLevel = {
            level: "year",
            title: `${selectedValue} - By Academic Year`,
            data: yearData.data.map((item: any) => ({
              ...item,
              percentage: yearData.total > 0 ? Math.round((item.value / yearData.total) * 100) : 0,
            })),
            parentValue: selectedValue,
          };
          break;
        }
        case "year": {
          // Drill down to gender level
          newFilters.yearLevel = selectedValue;
          
          // Add program, year level, and risk/category level filters to API call
          metricFilter.program = newFilters.program;
          metricFilter.yearLevel = selectedValue;
          if (newFilters.riskLevel) {
            metricFilter.riskLevel = newFilters.riskLevel;
          }
          if (newFilters.bmiCategory) {
            metricFilter.bmiCategory = newFilters.bmiCategory;
          }
          
          let genderData;
          if (state.insights.type === "mental-health-prediction") {
            genderData = await MetricsService.getMentalHealthPredictionByGender(metricFilter);
          } else {
            genderData = await MetricsService.getBMICategoryByGender(metricFilter);
          }

          nextLevel = {
            level: "gender",
            title: `${newFilters.program} ${selectedValue} - By Gender`,
            data: genderData.data.map((item: any) => ({
              ...item,
              percentage: genderData.total > 0 ? Math.round((item.value / genderData.total) * 100) : 0,
            })),
            parentValue: selectedValue,
          };
          break;
        }
        case "gender": {
          // Drill down to student list
          newFilters.gender = selectedValue;
          
          // Add all filters to API call
          metricFilter.program = newFilters.program;
          metricFilter.yearLevel = newFilters.yearLevel;
          metricFilter.gender = selectedValue;
          if (newFilters.riskLevel) {
            metricFilter.riskLevel = newFilters.riskLevel;
          }
          if (newFilters.bmiCategory) {
            metricFilter.bmiCategory = newFilters.bmiCategory;
          }
          
          // Fetch real student list from API
          const studentList = await MetricsService.getInventoryStudentList(metricFilter);
          
          setState(prev => ({
            ...prev,
            studentList,
            loading: false,
            insights: prev.insights ? {
              ...prev.insights,
              filters: newFilters,
            } : null,
          }));
          return;
        }
        default:
          setState(prev => ({ ...prev, loading: false }));
          return;
      }

      const updatedInsights = {
        ...state.insights,
        currentLevel: nextLevel,
        filters: newFilters,
      };

      setState(prev => ({
        ...prev,
        insights: updatedInsights,
        drilldownHistory: [...prev.drilldownHistory, nextLevel],
        loading: false,
      }));
    } catch (error) {
      console.error("Error drilling down:", error);
      setState(prev => ({
        ...prev,
        error: "Failed to fetch drill-down data",
        loading: false,
      }));
    }
  }, [state.insights, state.drilldownHistory]);

  const navigateBack = useCallback(() => {
    if (state.drilldownHistory.length <= 1) return;

    const newHistory = [...state.drilldownHistory];
    newHistory.pop();
    const previousLevel = newHistory[newHistory.length - 1];

    // Clear filters based on level
    let newFilters = { ...state.insights?.filters };
    if (previousLevel.level === "program") {
      delete newFilters.yearLevel;
      delete newFilters.gender;
    } else if (previousLevel.level === "year") {
      delete newFilters.gender;
    } else if (previousLevel.level === "overview") {
      delete newFilters.program;
      delete newFilters.yearLevel;
      delete newFilters.gender;
      delete newFilters.riskLevel; // Clear risk level when going back to overview
      delete newFilters.bmiCategory; // Clear BMI category when going back to overview
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
      const metricFilter: MetricFilter = {};

      if (filters.year && filters.month) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
        metricFilter.startDate = startDate.toISOString();
        metricFilter.endDate = endDate.toISOString();
      } else if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
        metricFilter.startDate = startDate.toISOString();
        metricFilter.endDate = endDate.toISOString();
      }

      // Refetch data for current level with new filters
      let updatedData;
      const currentLevel = state.insights.currentLevel.level;
      const type = state.insights.type;

      if (currentLevel === "overview") {
        if (type === "mental-health-prediction") {
          updatedData = await MetricsService.getMentalHealthPredictionOverview(metricFilter);
        } else {
          updatedData = await MetricsService.getBMICategoryOverview(metricFilter);
        }
      } else if (currentLevel === "program") {
        if (type === "mental-health-prediction") {
          updatedData = await MetricsService.getMentalHealthPredictionByProgram(metricFilter);
        } else {
          updatedData = await MetricsService.getBMICategoryByProgram(metricFilter);
        }
      } else if (currentLevel === "year") {
        if (type === "mental-health-prediction") {
          updatedData = await MetricsService.getMentalHealthPredictionByYear(metricFilter);
        } else {
          updatedData = await MetricsService.getBMICategoryByYear(metricFilter);
        }
      } else if (currentLevel === "gender") {
        if (type === "mental-health-prediction") {
          updatedData = await MetricsService.getMentalHealthPredictionByGender(metricFilter);
        } else {
          updatedData = await MetricsService.getBMICategoryByGender(metricFilter);
        }
      }

      if (updatedData) {
        setState(prev => ({
          ...prev,
          insights: prev.insights ? {
            ...prev.insights,
            currentLevel: {
              ...prev.insights.currentLevel,
              data: updatedData.data.map((item: any) => ({
                ...item,
                percentage: updatedData.total > 0 ? Math.round((item.value / updatedData.total) * 100) : 0,
              })),
            },
            filters,
          } : null,
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error updating filters:", error);
      setState(prev => ({
        ...prev,
        error: "Failed to update filters",
        loading: false,
      }));
    }
  }, [state.insights]);

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
