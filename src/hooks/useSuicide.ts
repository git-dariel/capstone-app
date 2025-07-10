import { useState } from "react";
import { SuicideService } from "@/services";
import type {
  SuicideAssessment,
  CreateSuicideAssessmentRequest,
  UpdateSuicideAssessmentRequest,
  PaginatedResponse,
  QueryParams,
} from "@/services";

interface SuicideState {
  assessments: SuicideAssessment[];
  currentAssessment: SuicideAssessment | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useSuicide = () => {
  const [state, setState] = useState<SuicideState>({
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
      const response: PaginatedResponse<SuicideAssessment> = await SuicideService.getAllAssessments(
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
      const errorMessage = error.message || "Failed to fetch suicide assessments";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAssessmentById = async (id: string, params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const assessment = await SuicideService.getAssessmentById(id, params);

      setState((prev) => ({
        ...prev,
        currentAssessment: assessment,
        loading: false,
      }));

      return assessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch suicide assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createAssessment = async (data: CreateSuicideAssessmentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newAssessment = await SuicideService.createAssessment(data);

      setState((prev) => ({
        ...prev,
        assessments: [newAssessment, ...prev.assessments],
        currentAssessment: newAssessment,
        total: prev.total + 1,
        loading: false,
      }));

      return newAssessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create suicide assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createAssessmentFromResponses = async (
    userId: string,
    responses: Record<number, number>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newAssessment = await SuicideService.createAssessmentFromResponses(userId, responses);

      setState((prev) => ({
        ...prev,
        assessments: [newAssessment, ...prev.assessments],
        currentAssessment: newAssessment,
        total: prev.total + 1,
        loading: false,
      }));

      return newAssessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create suicide assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateAssessment = async (id: string, data: UpdateSuicideAssessmentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAssessment = await SuicideService.updateAssessment(id, data);

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
      const errorMessage = error.message || "Failed to update suicide assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteAssessment = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await SuicideService.deleteAssessment(id);

      setState((prev) => ({
        ...prev,
        assessments: prev.assessments.filter((assessment) => assessment.id !== id),
        currentAssessment: prev.currentAssessment?.id === id ? null : prev.currentAssessment,
        total: Math.max(0, prev.total - 1),
        loading: false,
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete suicide assessment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const calculateScore = (responses: Record<number, number>) => {
    return SuicideService.calculateSuicideRiskScore(responses);
  };

  const refreshAssessments = async (params?: QueryParams) => {
    return await fetchAssessments(params);
  };

  const resetState = () => {
    setState({
      assessments: [],
      currentAssessment: null,
      loading: false,
      error: null,
      total: 0,
      page: 1,
      totalPages: 0,
    });
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
    resetState,
    clearError,
  };
};
