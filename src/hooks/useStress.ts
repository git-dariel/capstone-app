import { useState } from "react";
import { StressService } from "@/services";
import type {
  StressAssessment,
  CreateStressAssessmentRequest,
  UpdateStressAssessmentRequest,
  PaginatedResponse,
  QueryParams,
} from "@/services";

interface StressState {
  assessments: StressAssessment[];
  currentAssessment: StressAssessment | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useStress = () => {
  const [state, setState] = useState<StressState>({
    assessments: [],
    currentAssessment: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const fetchAssessments = async (params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<StressAssessment> = await StressService.getAllAssessments(
        params
      );

      setState((prev) => ({
        ...prev,
        assessments: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch stress assessments";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAssessmentById = async (id: string, params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const assessment = await StressService.getAssessmentById(id, params);

      setState((prev) => ({
        ...prev,
        currentAssessment: assessment,
        loading: false,
      }));

      return assessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch stress assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createAssessment = async (data: CreateStressAssessmentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newAssessment = await StressService.createAssessment(data);

      setState((prev) => ({
        ...prev,
        assessments: [newAssessment, ...prev.assessments],
        currentAssessment: newAssessment,
        total: prev.total + 1,
        loading: false,
      }));

      return newAssessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create stress assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Convenience method to create assessment from numeric responses
  const createAssessmentFromResponses = async (
    userId: string,
    responses: Record<number, number>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newAssessment = await StressService.createAssessmentFromResponses(userId, responses);

      setState((prev) => ({
        ...prev,
        assessments: [newAssessment, ...prev.assessments],
        currentAssessment: newAssessment,
        total: prev.total + 1,
        loading: false,
      }));

      return newAssessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create stress assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateAssessment = async (id: string, data: UpdateStressAssessmentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAssessment = await StressService.updateAssessment(id, data);

      setState((prev) => ({
        ...prev,
        assessments: prev.assessments.map((assessment) =>
          assessment.id === id ? updatedAssessment : assessment
        ),
        currentAssessment:
          prev.currentAssessment?.id === id ? updatedAssessment : prev.currentAssessment,
        loading: false,
      }));

      return updatedAssessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update stress assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteAssessment = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await StressService.deleteAssessment(id);

      setState((prev) => ({
        ...prev,
        assessments: prev.assessments.filter((assessment) => assessment.id !== id),
        currentAssessment: prev.currentAssessment?.id === id ? null : prev.currentAssessment,
        total: Math.max(0, prev.total - 1),
        loading: false,
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete stress assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const calculateScore = (responses: Record<number, number>) => {
    return StressService.calculateStressScore(responses);
  };

  const refreshAssessments = async (params?: QueryParams) => {
    return await fetchAssessments(params);
  };

  return {
    // State
    assessments: state.assessments,
    currentAssessment: state.currentAssessment,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    fetchAssessments,
    fetchAssessmentById,
    createAssessment,
    createAssessmentFromResponses,
    updateAssessment,
    deleteAssessment,
    calculateScore,
    refreshAssessments,
    clearError,
  };
};
