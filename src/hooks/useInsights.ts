import type {
  ChartFilters,
  InsightData,
  InsightsDrilldownLevel,
  MentalHealthInsights,
} from "@/types/insights";
import { useCallback, useState } from "react";

// Mock data generators - replace with real API calls later
const generateOverviewData = (_type: string): InsightData[] => {
  const programs = [
    "Computer Science",
    "Engineering",
    "Business",
    "Medicine",
    "Arts",
    "Psychology",
  ];
  return programs.map((program, index) => ({
    label: program,
    value: Math.floor(Math.random() * 50) + 10,
    percentage: Math.floor(Math.random() * 30) + 5,
    color: `hsl(${index * 60}, 70%, 50%)`,
  }));
};

const generateYearData = (_type: string, _program: string): InsightData[] => {
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  return years.map((year, index) => ({
    label: year,
    value: Math.floor(Math.random() * 30) + 5,
    percentage: Math.floor(Math.random() * 25) + 10,
    color: `hsl(${index * 90}, 60%, 55%)`,
  }));
};

const generateGenderData = (_type: string, _program: string, _year: string): InsightData[] => {
  return [
    {
      label: "Male",
      value: Math.floor(Math.random() * 20) + 5,
      percentage: Math.floor(Math.random() * 20) + 15,
      color: "#3B82F6",
    },
    {
      label: "Female",
      value: Math.floor(Math.random() * 25) + 8,
      percentage: Math.floor(Math.random() * 25) + 20,
      color: "#EC4899",
    },
    {
      label: "Other",
      value: Math.floor(Math.random() * 3) + 1,
      percentage: Math.floor(Math.random() * 5) + 2,
      color: "#10B981",
    },
  ];
};

interface UseInsightsState {
  insights: MentalHealthInsights | null;
  loading: boolean;
  error: string | null;
  navigationStack: InsightsDrilldownLevel[];
}

export const useInsights = () => {
  const [state, setState] = useState<UseInsightsState>({
    insights: null,
    loading: false,
    error: null,
    navigationStack: [],
  });

  const fetchInsights = useCallback(
    async (type: "anxiety" | "depression" | "stress", filters: ChartFilters = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const overviewLevel: InsightsDrilldownLevel = {
          level: "overview",
          title: "By Program",
          data: generateOverviewData(type),
        };

        const insights: MentalHealthInsights = {
          type,
          currentLevel: overviewLevel,
          availableYears: [2020, 2021, 2022, 2023, 2024],
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
    (selectedValue: string) => {
      if (!state.insights) return;

      setState((prev) => {
        const currentLevel = prev.insights!.currentLevel;
        let nextLevel: InsightsDrilldownLevel;

        switch (currentLevel.level) {
          case "overview":
            nextLevel = {
              level: "year",
              title: `${selectedValue} - By Academic Year`,
              data: generateYearData(prev.insights!.type, selectedValue),
              parentValue: selectedValue,
            };
            break;
          case "year":
            nextLevel = {
              level: "gender",
              title: `${currentLevel.parentValue} - ${selectedValue} - By Gender`,
              data: generateGenderData(
                prev.insights!.type,
                currentLevel.parentValue!,
                selectedValue
              ),
              parentValue: selectedValue,
            };
            break;
          default:
            return prev; // Can't drill down further
        }

        return {
          ...prev,
          insights: {
            ...prev.insights!,
            currentLevel: nextLevel,
          },
          navigationStack: [...prev.navigationStack, nextLevel],
        };
      });
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
      };
    });
  }, []);

  const updateFilters = useCallback(
    async (newFilters: ChartFilters) => {
      if (!state.insights) return;

      setState((prev) => ({
        ...prev,
        insights: prev.insights
          ? {
              ...prev.insights,
              filters: { ...prev.insights.filters, ...newFilters },
            }
          : null,
      }));

      // Re-fetch data with new filters
      await fetchInsights(state.insights.type, { ...state.insights.filters, ...newFilters });
    },
    [state.insights, fetchInsights]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const canNavigateBack = state.navigationStack.length > 1;
  const canDrillDown = state.insights?.currentLevel.level !== "gender";

  return {
    // State
    insights: state.insights,
    loading: state.loading,
    error: state.error,
    navigationStack: state.navigationStack,
    canNavigateBack,
    canDrillDown,

    // Actions
    fetchInsights,
    drillDown,
    navigateBack,
    updateFilters,
    clearError,
  };
};
