import { useCallback, useState } from "react";
import { MetricsService, type MetricFilter } from "@/services";
import type {
  InventoryInsightData,
  InventoryChartFilters,
  StudentDetails,
} from "@/types/inventory-insights";

interface UseSimplifiedInventoryInsightsState {
  insightType:
    | "mental-health-prediction"
    | "bmi-category"
    | "physical-health"
    | null;
  categoryData: InventoryInsightData[];
  availableCategories: string[];
  selectedCategory: string | null;
  studentList: StudentDetails[];
  loading: boolean;
  error: string | null;
  filters: InventoryChartFilters;
  totalCount: number;
}

export const useSimplifiedInventoryInsights = () => {
  const [state, setState] = useState<UseSimplifiedInventoryInsightsState>({
    insightType: null,
    categoryData: [],
    availableCategories: [],
    selectedCategory: null,
    studentList: [],
    loading: false,
    error: null,
    filters: {},
    totalCount: 0,
  });

  /**
   * Initialize insights by fetching category-level data for the selected insight type
   */
  const fetchInsights = useCallback(
    async (
      type: "mental-health-prediction" | "bmi-category" | "physical-health",
      filters: InventoryChartFilters = {},
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Create filter for API call
        const metricFilter: MetricFilter = {};

        if (filters.year && filters.month) {
          const startDate = new Date(filters.year, filters.month - 1, 1);
          const endDate = new Date(
            filters.year,
            filters.month,
            0,
            23,
            59,
            59,
            999,
          );
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        } else if (filters.year) {
          const startDate = new Date(filters.year, 0, 1);
          const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        }

        // Apply program filter if it exists
        if (filters.program) {
          metricFilter.program = filters.program;
        }

        // Apply yearLevel filter if it exists
        if (filters.yearLevel) {
          metricFilter.yearLevel = filters.yearLevel;
        }

        // Apply gender filter if it exists
        if (filters.gender) {
          metricFilter.gender = filters.gender;
        }

        // Fetch category-level data based on type
        let overviewData;
        if (type === "mental-health-prediction") {
          overviewData =
            await MetricsService.getMentalHealthPredictionOverview(
              metricFilter,
            );
        } else if (type === "bmi-category") {
          overviewData =
            await MetricsService.getBMICategoryOverview(metricFilter);
        } else {
          // physical-health uses BMI as well
          overviewData =
            await MetricsService.getBMICategoryOverview(metricFilter);
        }

        // Extract unique categories from the data
        const categories = overviewData.data.map(
          (item: InventoryInsightData) => item.label,
        );

        // Calculate total count
        const total = overviewData.data.reduce(
          (sum: number, item: InventoryInsightData) => sum + item.value,
          0,
        );

        setState({
          insightType: type,
          categoryData: overviewData.data,
          availableCategories: categories,
          selectedCategory: null, // No category selected initially
          studentList: [],
          loading: false,
          error: null,
          filters,
          totalCount: total,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch inventory insights";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [],
  );

  /**
   * Select a category and automatically fetch students under that category
   */
  const selectCategory = useCallback(
    async (category: string, filterOverrides?: InventoryChartFilters) => {
      if (!state.insightType) return;

      setState((prev) => ({
        ...prev,
        loading: true,
        selectedCategory: category,
      }));

      try {
        // Use filter overrides if provided, otherwise use state filters
        const activeFilters = filterOverrides || state.filters;

        // Create filter for API call
        const metricFilter: MetricFilter = {};

        // Add category filter based on type
        if (state.insightType === "mental-health-prediction") {
          metricFilter.riskLevel = category;
        } else if (
          state.insightType === "bmi-category" ||
          state.insightType === "physical-health"
        ) {
          metricFilter.bmiCategory = category;
        }

        // Apply date filters if they exist
        if (activeFilters.year && activeFilters.month) {
          const startDate = new Date(
            activeFilters.year,
            activeFilters.month - 1,
            1,
          );
          const endDate = new Date(
            activeFilters.year,
            activeFilters.month,
            0,
            23,
            59,
            59,
            999,
          );
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        } else if (activeFilters.year) {
          const startDate = new Date(activeFilters.year, 0, 1);
          const endDate = new Date(activeFilters.year, 11, 31, 23, 59, 59, 999);
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        }

        // Apply program filter if it exists
        if (activeFilters.program) {
          metricFilter.program = activeFilters.program;
        }

        // Apply yearLevel filter if it exists
        if (activeFilters.yearLevel) {
          metricFilter.yearLevel = activeFilters.yearLevel;
        }

        // Apply gender filter if it exists
        if (activeFilters.gender) {
          metricFilter.gender = activeFilters.gender;
        }

        // Fetch students for the selected category
        const studentList =
          await MetricsService.getInventoryStudentList(metricFilter);

        setState((prev) => ({
          ...prev,
          selectedCategory: category,
          studentList: studentList,
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching students for category:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load students for selected category",
        }));
      }
    },
    [state.insightType, state.filters],
  );

  /**
   * Clear category selection and student list
   */
  const clearCategorySelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCategory: null,
      studentList: [],
    }));
  }, []);

  /**
   * Update filters and re-fetch data
   */
  const updateFilters = useCallback(
    async (newFilters: InventoryChartFilters) => {
      if (!state.insightType) return;

      // Merge filters
      const mergedFilters = { ...state.filters, ...newFilters };

      // Store current category selection
      const currentCategory = state.selectedCategory;

      // Update filters
      setState((prev) => ({
        ...prev,
        filters: mergedFilters,
        loading: true,
      }));

      // Re-fetch data with new filters
      await fetchInsights(state.insightType, mergedFilters);

      // If a category was selected, re-fetch students with updated filters
      if (currentCategory) {
        await selectCategory(currentCategory, mergedFilters);
      }
    },
    [
      state.insightType,
      state.filters,
      state.selectedCategory,
      fetchInsights,
      selectCategory,
    ],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    insightType: state.insightType,
    categoryData: state.categoryData,
    availableCategories: state.availableCategories,
    selectedCategory: state.selectedCategory,
    studentList: state.studentList,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    totalCount: state.totalCount,

    // Computed
    hasStudents: state.studentList.length > 0,
    isCategorySelected: state.selectedCategory !== null,

    // Actions
    fetchInsights,
    selectCategory,
    clearCategorySelection,
    updateFilters,
    clearError,
  };
};
