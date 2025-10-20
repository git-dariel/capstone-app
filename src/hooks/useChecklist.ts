import {
  ChecklistService,
  type PersonalProblemsChecklist,
  type ChecklistAnalysis,
  type CreateChecklistRequest,
  type UpdateChecklistRequest,
} from "@/services";
import type { PaginatedResponse, QueryParams } from "@/services/api.config";
import { useState } from "react";

interface ChecklistState {
  checklists: PersonalProblemsChecklist[];
  currentChecklist: PersonalProblemsChecklist | null;
  currentAnalysis: ChecklistAnalysis | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useChecklist = () => {
  const [state, setState] = useState<ChecklistState>({
    checklists: [],
    currentChecklist: null,
    currentAnalysis: null,
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

  const fetchChecklists = async (params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<PersonalProblemsChecklist> = await ChecklistService.getAllChecklists(
        params
      );

      setState((prev) => ({
        ...prev,
        checklists: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch personal problems checklists";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchChecklistById = async (id: string, params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const checklist = await ChecklistService.getChecklistById(id, params);

      setState((prev) => ({
        ...prev,
        currentChecklist: checklist,
        loading: false,
      }));

      return checklist;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch personal problems checklist";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchChecklistByUserId = async (userId: string, params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const checklist = await ChecklistService.getChecklistByUserId(userId, params);

      setState((prev) => ({
        ...prev,
        currentChecklist: checklist,
        loading: false,
      }));

      return checklist;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch personal problems checklist for student";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createChecklist = async (data: CreateChecklistRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newChecklist = await ChecklistService.createChecklist(data);

      setState((prev) => ({
        ...prev,
        checklists: [newChecklist, ...prev.checklists],
        currentChecklist: newChecklist,
        total: prev.total + 1,
        loading: false,
      }));

      return newChecklist;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create personal problems checklist";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createChecklistFromResponses = async (
    userId: string,
    responses: Record<string, string>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newChecklist = await ChecklistService.createChecklistFromResponses(userId, responses);

      setState((prev) => ({
        ...prev,
        checklists: [newChecklist, ...prev.checklists],
        currentChecklist: newChecklist,
        total: prev.total + 1,
        loading: false,
      }));

      return newChecklist;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create personal problems checklist";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateChecklist = async (id: string, data: UpdateChecklistRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedChecklist = await ChecklistService.updateChecklist(id, data);

      setState((prev) => ({
        ...prev,
        checklists: prev.checklists.map((checklist) =>
          checklist.id === id ? updatedChecklist : checklist
        ),
        currentChecklist:
          prev.currentChecklist?.id === id ? updatedChecklist : prev.currentChecklist,
        loading: false,
      }));

      return updatedChecklist;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update personal problems checklist";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteChecklist = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ChecklistService.deleteChecklist(id);

      setState((prev) => ({
        ...prev,
        checklists: prev.checklists.filter((checklist) => checklist.id !== id),
        currentChecklist: prev.currentChecklist?.id === id ? null : prev.currentChecklist,
        total: Math.max(0, prev.total - 1),
        loading: false,
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete personal problems checklist";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const analyzeChecklist = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await ChecklistService.analyzeChecklist(id);

      setState((prev) => ({
        ...prev,
        currentAnalysis: analysis.checklist_analysis,
        loading: false,
      }));

      return analysis;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to analyze personal problems checklist";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const getAnalysisByUserId = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await ChecklistService.getAnalysisByUserId(userId);

      setState((prev) => ({
        ...prev,
        currentAnalysis: analysis.checklist_analysis,
        loading: false,
      }));

      return analysis;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to get checklist analysis for student";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const refreshChecklists = async (params?: QueryParams) => {
    return await fetchChecklists(params);
  };

  const getQuestions = () => {
    return ChecklistService.getQuestionMap();
  };

  return {
    // State
    checklists: state.checklists,
    currentChecklist: state.currentChecklist,
    currentAnalysis: state.currentAnalysis,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    fetchChecklists,
    fetchChecklistById,
    fetchChecklistByUserId,
    createChecklist,
    createChecklistFromResponses,
    updateChecklist,
    deleteChecklist,
    analyzeChecklist,
    getAnalysisByUserId,
    refreshChecklists,
    clearError,
    getQuestions,
  };
};