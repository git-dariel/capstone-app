import { useState, useCallback } from "react";
import {
  ConsentService,
  type GetConsentResponse,
  type GetAllConsentsResponse,
  type ConsentFilters,
} from "@/services/consent.service";

interface UseConsentState {
  consents: GetConsentResponse[];
  totalConsents: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export const useConsent = () => {
  const [state, setState] = useState<UseConsentState>({
    consents: [],
    totalConsents: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const fetchConsents = useCallback(async (filters: ConsentFilters = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: GetAllConsentsResponse = await ConsentService.getAllConsents(filters);
      setState((prev) => ({
        ...prev,
        consents: response.consents,
        totalConsents: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        loading: false,
      }));
      return response;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch consents",
      }));
      throw error;
    }
  }, []);

  const getConsentByStudentId = useCallback(async (studentId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const consent = await ConsentService.getConsentByStudentId(studentId);
      setState((prev) => ({ ...prev, loading: false }));
      return consent;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch consent",
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    consents: state.consents,
    totalConsents: state.totalConsents,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    fetchConsents,
    getConsentByStudentId,
    clearError,
  };
};
