import { useCallback, useState } from "react";
import { MetricsService, type MetricFilter } from "@/services";
import type { ChartFilters, InsightData, StudentDetails } from "@/types/insights";

interface UseSimplifiedInsightsState {
  assessmentType: "anxiety" | "depression" | "stress" | "suicide" | "checklist" | null;
  programData: InsightData[];
  availablePrograms: string[];
  selectedProgram: string | null;
  studentList: StudentDetails[];
  loading: boolean;
  error: string | null;
  filters: ChartFilters;
  totalCount: number;
  studentTotal: number;
  studentPage: number;
  studentTotalPages: number;
  studentQuery: string;
}

export const useSimplifiedInsights = () => {
  const [state, setState] = useState<UseSimplifiedInsightsState>({
    assessmentType: null,
    programData: [],
    availablePrograms: [],
    selectedProgram: null,
    studentList: [],
    loading: false,
    error: null,
    filters: {},
    totalCount: 0,
    studentTotal: 0,
    studentPage: 1,
    studentTotalPages: 0,
    studentQuery: "",
  });

  /**
   * Initialize insights by fetching program-level data for the selected assessment type
   */
  const fetchInsights = useCallback(
    async (
      type: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
      filters: ChartFilters = {},
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Create filter for API call
        const metricFilter: MetricFilter = {};

        if (filters.year && filters.month) {
          const startDate = new Date(filters.year, filters.month - 1, 1);
          const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        } else if (filters.year) {
          const startDate = new Date(filters.year, 0, 1); // First day of year
          const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999); // Last day of year
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        }

        // Apply yearLevel filter if it exists
        if (filters.yearLevel) {
          metricFilter.yearLevel = filters.yearLevel;
        }

        // Apply gender filter if it exists
        if (filters.gender) {
          metricFilter.gender = filters.gender;
        }

        // Fetch program-level data
        const overviewData = await MetricsService.getOverviewMetrics(type, metricFilter);

        // Extract unique programs from the data
        const programs = overviewData.data.map((item) => item.label);

        // Calculate total count
        const total = overviewData.data.reduce((sum, item) => sum + item.value, 0);

        setState({
          assessmentType: type,
          programData: overviewData.data,
          availablePrograms: programs,
          selectedProgram: null, // No program selected initially
          studentList: [],
          loading: false,
          error: null,
          filters,
          totalCount: total,
          studentTotal: 0,
          studentPage: 1,
          studentTotalPages: 0,
          studentQuery: "",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch insights";
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
   * Select a program and automatically fetch students under that program
   */
  const selectProgram = useCallback(
    async (
      program: string,
      filterOverrides?: ChartFilters,
      options?: { page?: number; limit?: number; query?: string },
    ) => {
      if (!state.assessmentType) return;

      const page = options?.page ?? 1;
      const limit = options?.limit ?? 10;
      const query = options?.query?.trim() ?? "";

      setState((prev) => ({
        ...prev,
        loading: true,
        selectedProgram: program,
      }));

      try {
        // Use filter overrides if provided, otherwise use state filters
        const activeFilters = filterOverrides || state.filters;

        // Create filter for API call
        const metricFilter: MetricFilter = {
          program: program,
          page,
          limit,
          ...(query ? { query } : {}),
        };

        // Apply date filters if they exist
        if (activeFilters.year && activeFilters.month) {
          const startDate = new Date(activeFilters.year, activeFilters.month - 1, 1);
          const endDate = new Date(activeFilters.year, activeFilters.month, 0, 23, 59, 59, 999);
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        } else if (activeFilters.year) {
          const startDate = new Date(activeFilters.year, 0, 1);
          const endDate = new Date(activeFilters.year, 11, 31, 23, 59, 59, 999);
          metricFilter.startDate = startDate.toISOString();
          metricFilter.endDate = endDate.toISOString();
        }

        // Apply yearLevel filter if it exists
        if (activeFilters.yearLevel) {
          metricFilter.yearLevel = activeFilters.yearLevel;
        }

        // Apply gender filter if it exists
        if (activeFilters.gender) {
          metricFilter.gender = activeFilters.gender;
        }

        // Fetch students for the selected program and assessment type
        const studentResponse = await MetricsService.getAssessmentStudentList(
          state.assessmentType,
          metricFilter,
        );

        setState((prev) => ({
          ...prev,
          selectedProgram: program,
          studentList: studentResponse.students || [],
          studentTotal: studentResponse.total || 0,
          studentPage: studentResponse.page || page,
          studentTotalPages: studentResponse.totalPages || 0,
          studentQuery: query,
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching students for program:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load students for selected program",
        }));
      }
    },
    [state.assessmentType, state.filters],
  );

  /**
   * Clear program selection and student list
   */
  const clearProgramSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedProgram: null,
      studentList: [],
      studentTotal: 0,
      studentPage: 1,
      studentTotalPages: 0,
      studentQuery: "",
    }));
  }, []);

  /**
   * Update filters and re-fetch data
   */
  const updateFilters = useCallback(
    async (newFilters: ChartFilters) => {
      if (!state.assessmentType) return;

      // Merge filters
      const mergedFilters = { ...state.filters, ...newFilters };

      // Store current program selection
      const currentProgram = state.selectedProgram;

      // Update filters
      setState((prev) => ({
        ...prev,
        filters: mergedFilters,
        loading: true,
      }));

      // Re-fetch data with new filters
      await fetchInsights(state.assessmentType, mergedFilters);

      // If a program was selected, re-fetch students with updated filters
      if (currentProgram) {
        await selectProgram(currentProgram, mergedFilters, {
          page: 1,
          limit: 10,
          query: state.studentQuery,
        });
      }
    },
    [
      state.assessmentType,
      state.filters,
      state.selectedProgram,
      state.studentQuery,
      fetchInsights,
      selectProgram,
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
    assessmentType: state.assessmentType,
    programData: state.programData,
    availablePrograms: state.availablePrograms,
    selectedProgram: state.selectedProgram,
    studentList: state.studentList,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    totalCount: state.totalCount,
    studentTotal: state.studentTotal,
    studentPage: state.studentPage,
    studentTotalPages: state.studentTotalPages,
    studentQuery: state.studentQuery,

    // Computed
    hasStudents: state.studentList.length > 0,
    isProgramSelected: state.selectedProgram !== null,

    // Actions
    fetchInsights,
    selectProgram,
    clearProgramSelection,
    updateFilters,
    clearError,
  };
};
