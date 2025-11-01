import { MetricsService, type MetricFilter } from "@/services";
import type { ChartFilters, InsightsDrilldownLevel, MentalHealthInsights, StudentDetails } from "@/types/insights";
import { useCallback, useState } from "react";

interface UseInsightsState {
  insights: MentalHealthInsights | null;
  studentList: StudentDetails[];
  loading: boolean;
  error: string | null;
  navigationStack: InsightsDrilldownLevel[];
}

export const useInsights = () => {
  const [state, setState] = useState<UseInsightsState>({
    insights: null,
    studentList: [],
    loading: false,
    error: null,
    navigationStack: [],
  });

  const fetchInsights = useCallback(
    async (type: "anxiety" | "depression" | "stress" | "suicide" | "checklist", filters: ChartFilters = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Create filter for API call
        const metricFilter: MetricFilter = {};

        if (filters.year && filters.month) {
          // Create date filter for the specific month/year
          const startDate = new Date(filters.year, filters.month - 1, 1);
          const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999); // Last day of month
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        } else if (filters.year) {
          // If only year is specified, get data for the whole year
          const startDate = new Date(filters.year, 0, 1); // First day of year
          const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999); // Last day of year
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        }

        // Fetch real data and available years from API
        const [overviewData, availableYears] = await Promise.all([
          MetricsService.getOverviewMetrics(type, metricFilter),
          MetricsService.getAvailableYears(),
        ]);

        const overviewLevel: InsightsDrilldownLevel = {
          level: "overview",
          title: "By Program",
          data: overviewData.data,
        };

        const insights: MentalHealthInsights = {
          type,
          currentLevel: overviewLevel,
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
          filters,
        };

        setState((prev) => ({
          ...prev,
          insights,
          loading: false,
          navigationStack: [overviewLevel],
        }));

        return insights;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch insights";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  const drillDown = useCallback(
    async (selectedValue: string) => {
      if (!state.insights) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const currentLevel = state.insights.currentLevel;
        const filters = state.insights.filters;
        let nextLevel: InsightsDrilldownLevel;

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
            // Drill down to year level - filter by program
            metricFilter.program = selectedValue;
            
            const yearData = await MetricsService.getYearMetrics(state.insights.type, metricFilter);
            nextLevel = {
              level: "year",
              title: "By Academic Year",
              data: yearData.data,
              parentValue: selectedValue,
              parentProgram: selectedValue, // Store the selected program
            };
            break;
          }
          case "year": {
            // Drill down to gender level - filter by program and year
            metricFilter.program = currentLevel.parentProgram || currentLevel.parentValue; // Use stored program
            metricFilter.yearLevel = selectedValue;
            
            const genderData = await MetricsService.getGenderMetrics(
              state.insights.type,
              metricFilter
            );
            
            nextLevel = {
              level: "gender",
              title: `${selectedValue} - By Gender`,
              data: genderData.data,
              parentValue: selectedValue,
              parentProgram: currentLevel.parentProgram || currentLevel.parentValue, // Pass program forward
              parentYear: selectedValue, // Store the selected year
            };
            
            break;
          }
          case "gender": {
            // Drill down to student list - filter by program, year, and gender
            metricFilter.program = currentLevel.parentProgram;
            metricFilter.yearLevel = currentLevel.parentYear;
            metricFilter.gender = selectedValue.toLowerCase(); // Use the selected gender
            
            const studentList = await MetricsService.getAssessmentStudentList(
              state.insights.type,
              metricFilter
            );
            
            nextLevel = {
              level: "students",
              title: `Students - ${currentLevel.parentProgram} ${currentLevel.parentYear} ${selectedValue}`,
              data: [], // No chart data for student list
              parentValue: selectedValue,
              parentProgram: currentLevel.parentProgram,
              parentYear: currentLevel.parentYear,
            };
            
            setState((prev) => ({
              ...prev,
              insights: prev.insights
                ? {
                    ...prev.insights,
                    currentLevel: nextLevel,
                  }
                : null,
              navigationStack: [...prev.navigationStack, nextLevel],
              studentList: studentList,
              loading: false,
            }));
            return;
          }
          default:
            setState((prev) => ({ ...prev, loading: false }));
            return; // Can't drill down further
        }

        setState((prev) => {
          const newState = {
            ...prev,
            insights: prev.insights
              ? {
                  ...prev.insights,
                  currentLevel: nextLevel,
                }
              : null,
            navigationStack: [...prev.navigationStack, nextLevel],
            studentList: [], // Clear student list for non-student views
            loading: false,
          };
          
          return newState;
        });
      } catch (error: any) {
        console.error("Error drilling down:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load detailed data",
        }));
      }
    },
    [state.insights]
  );

  const navigateBack = useCallback(() => {
    setState((prev) => {
      const newStack = [...prev.navigationStack];
      newStack.pop(); // Remove current level

      if (newStack.length === 0) return prev;

      const previousLevel = newStack[newStack.length - 1];

      return {
        ...prev,
        insights: prev.insights
          ? {
              ...prev.insights,
              currentLevel: previousLevel,
            }
          : null,
        navigationStack: newStack,
        studentList: [], // Clear student list when navigating back
      };
    });
  }, []);

  const updateFilters = useCallback(
    async (newFilters: ChartFilters) => {
      if (!state.insights) return;

      // Merge filters correctly
      const mergedFilters = { ...state.insights.filters, ...newFilters };

      setState((prev) => ({
        ...prev,
        insights: prev.insights
          ? {
              ...prev.insights,
              filters: mergedFilters,
            }
          : null,
      }));

      // Re-fetch data with merged filters
      await fetchInsights(state.insights.type, mergedFilters);
    },
    [state.insights, fetchInsights]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const canNavigateBack = state.navigationStack.length > 1;
  const canDrillDown = state.insights?.currentLevel.level !== "students"; // Can drill down from all levels except students

  return {
    // State
    insights: state.insights,
    studentList: state.studentList,
    loading: state.loading,
    error: state.error,
    navigationStack: state.navigationStack,
    canNavigateBack,
    canDrillDown,
    isStudentView: state.insights?.currentLevel.level === "students" || state.studentList.length > 0,

    // Actions
    fetchInsights,
    drillDown,
    navigateBack,
    updateFilters,
    clearError,
  };
};
