import { useState, useCallback } from "react";
import { RetakeRequestService } from "@/services/retakeRequest.service";
import type {
  RetakeRequest,
  CreateRetakeRequestData,
  UpdateRetakeRequestData,
  RetakeRequestQueryParams,
  PaginatedRetakeRequests,
} from "@/services/retakeRequest.service";

interface RetakeRequestState {
  requests: RetakeRequest[];
  currentRequest: RetakeRequest | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: RetakeRequestState = {
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};

export const useRetakeRequest = () => {
  const [state, setState] = useState<RetakeRequestState>(initialState);

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const clearError = () => {
    setError(null);
  };

  // Create a new retake request
  const createRequest = useCallback(
    async (data: CreateRetakeRequestData): Promise<RetakeRequest> => {
      setLoading(true);
      setError(null);

      try {
        const newRequest = await RetakeRequestService.createRequest(data);

        setState((prev) => ({
          ...prev,
          requests: [newRequest, ...prev.requests],
          currentRequest: newRequest,
          total: prev.total + 1,
          loading: false,
        }));

        return newRequest;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to create retake request";
        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  // Get all requests (Admin only)
  const fetchAllRequests = useCallback(
    async (params?: RetakeRequestQueryParams): Promise<PaginatedRetakeRequests> => {
      setLoading(true);
      setError(null);

      try {
        const response = await RetakeRequestService.getAllRequests(params);

        setState((prev) => ({
          ...prev,
          requests: response.requests,
          total: response.pagination.total,
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          loading: false,
        }));

        return response;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch retake requests";
        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  // Get user's requests
  const fetchUserRequests = useCallback(
    async (params?: RetakeRequestQueryParams): Promise<PaginatedRetakeRequests> => {
      setLoading(true);
      setError(null);

      try {
        const response = await RetakeRequestService.getUserRequests(params);

        setState((prev) => ({
          ...prev,
          requests: response.requests,
          total: response.pagination.total,
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          loading: false,
        }));

        return response;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch user retake requests";
        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  // Get request by ID
  const fetchRequestById = useCallback(async (id: string): Promise<RetakeRequest> => {
    setLoading(true);
    setError(null);

    try {
      const request = await RetakeRequestService.getRequestById(id);

      setState((prev) => ({
        ...prev,
        currentRequest: request,
        loading: false,
      }));

      return request;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch retake request";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  // Update request status (Admin only)
  const updateRequest = useCallback(
    async (id: string, data: UpdateRetakeRequestData): Promise<RetakeRequest> => {
      setLoading(true);
      setError(null);

      try {
        const updatedRequest = await RetakeRequestService.updateRequest(id, data);

        setState((prev) => ({
          ...prev,
          requests: prev.requests.map((request) => (request.id === id ? updatedRequest : request)),
          currentRequest: prev.currentRequest?.id === id ? updatedRequest : prev.currentRequest,
          loading: false,
        }));

        return updatedRequest;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to update retake request";
        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  // Delete request (Admin only)
  const deleteRequest = useCallback(async (id: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await RetakeRequestService.deleteRequest(id);

      setState((prev) => ({
        ...prev,
        requests: prev.requests.filter((request) => request.id !== id),
        currentRequest: prev.currentRequest?.id === id ? null : prev.currentRequest,
        total: Math.max(0, prev.total - 1),
        loading: false,
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete retake request";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  // Check if user can request retake for assessment type
  const canRequestRetake = useCallback(
    async (assessmentType: "anxiety" | "depression" | "stress" | "suicide"): Promise<boolean> => {
      try {
        return await RetakeRequestService.canRequestRetake(assessmentType);
      } catch (error: any) {
        console.error("Error checking retake eligibility:", error);
        return false;
      }
    },
    []
  );

  // Approve request
  const approveRequest = useCallback(
    async (id: string, reviewerComments?: string): Promise<RetakeRequest> => {
      return updateRequest(id, { status: "approved", reviewerComments });
    },
    [updateRequest]
  );

  // Reject request
  const rejectRequest = useCallback(
    async (id: string, reviewerComments?: string): Promise<RetakeRequest> => {
      return updateRequest(id, { status: "rejected", reviewerComments });
    },
    [updateRequest]
  );

  // Refresh requests
  const refreshRequests = useCallback(
    async (params?: RetakeRequestQueryParams, isUserRequests = false) => {
      if (isUserRequests) {
        return await fetchUserRequests(params);
      } else {
        return await fetchAllRequests(params);
      }
    },
    [fetchAllRequests, fetchUserRequests]
  );

  return {
    // State
    requests: state.requests,
    currentRequest: state.currentRequest,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    createRequest,
    fetchAllRequests,
    fetchUserRequests,
    fetchRequestById,
    updateRequest,
    deleteRequest,
    canRequestRetake,
    approveRequest,
    rejectRequest,
    refreshRequests,
    clearError,
  };
};
