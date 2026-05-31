import { useState, useCallback } from "react";
import { AuditLogsService } from "@/services/audit-logs.service";
import type {
  AuditLogResponse,
  AuditLogStatistics,
  ExportAuditLogsRequest,
  CleanupAuditLogsRequest,
  CleanupAuditLogsResponse,
} from "@/types/audit-logs.types";
import type { QueryParams } from "@/services/api.config";
import { useToast } from "./useToast";

interface UseAuditLogsState {
  auditLogs: AuditLogResponse[];
  auditLog: AuditLogResponse | null;
  statistics: AuditLogStatistics | null;
  availableActions: string[];
  availableModules: string[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface UseAuditLogsReturn extends UseAuditLogsState {
  // Fetch operations
  fetchAuditLogs: (params?: QueryParams) => Promise<void>;
  fetchAuditLogById: (id: string) => Promise<void>;
  fetchStatistics: (params?: {
    startDate?: string;
    endDate?: string;
    modules?: string[];
    actions?: string[];
  }) => Promise<void>;
  fetchActions: () => Promise<void>;
  fetchModules: () => Promise<void>;

  // Export and cleanup operations
  exportAuditLogs: (request: ExportAuditLogsRequest) => Promise<{
    downloadUrl?: string;
    filename: string;
    format: string;
    recordCount: number;
  }>;
  cleanupAuditLogs: (request: CleanupAuditLogsRequest) => Promise<CleanupAuditLogsResponse>;

  // Utility methods
  clearError: () => void;
  clearAuditLog: () => void;
  refreshData: () => Promise<void>;
}

export const useAuditLogs = (): UseAuditLogsReturn => {
  const { error: showErrorToast, success: showSuccessToast, info: showInfoToast } = useToast();

  const [state, setState] = useState<UseAuditLogsState>({
    auditLogs: [],
    auditLog: null,
    statistics: null,
    availableActions: [],
    availableModules: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    limit: 10,
  });

  const [lastFetchParams, setLastFetchParams] = useState<QueryParams>({});

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Clear current audit log
  const clearAuditLog = useCallback(() => {
    setState((prev) => ({ ...prev, auditLog: null }));
  }, []);

  // Fetch audit logs with pagination and filtering
  const fetchAuditLogs = useCallback(
    async (params: QueryParams = {}) => {
      try {
        setLoading(true);
        setError(null);
        setLastFetchParams(params);

        const defaultParams = {
          page: 1,
          limit: 10,
          sort: "-timestamp",
          ...params,
        };

        const response = await AuditLogsService.getAuditLogs(defaultParams);

        setState((prev) => ({
          ...prev,
          auditLogs: response.data || [],
          totalCount: response.total || 0,
          currentPage: response.page || 1,
          totalPages: response.totalPages || 0,
          limit: response.limit || 10,
        }));
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || "Failed to fetch audit logs";
        setError(errorMessage);
        showErrorToast(errorMessage);
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, showErrorToast],
  );

  // Fetch single audit log by ID
  const fetchAuditLogById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await AuditLogsService.getAuditLogById(id);
        setState((prev) => ({ ...prev, auditLog: response.data }));
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || "Failed to fetch audit log details";
        setError(errorMessage);
        showErrorToast(errorMessage);
        console.error("Error fetching audit log:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, showErrorToast],
  );

  // Fetch audit log statistics
  const fetchStatistics = useCallback(
    async (params?: {
      startDate?: string;
      endDate?: string;
      modules?: string[];
      actions?: string[];
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await AuditLogsService.getAuditLogStatistics(params);
        setState((prev) => ({ ...prev, statistics: response.data }));
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || "Failed to fetch audit log statistics";
        setError(errorMessage);
        showErrorToast(errorMessage);
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, showErrorToast],
  );

  // Fetch available actions
  const fetchActions = useCallback(async () => {
    try {
      const response = await AuditLogsService.getAuditLogActions();
      setState((prev) => ({ ...prev, availableActions: response.data }));
    } catch (error: unknown) {
      console.error("Error fetching audit log actions:", error);
    }
  }, []);

  // Fetch available modules
  const fetchModules = useCallback(async () => {
    try {
      const response = await AuditLogsService.getAuditLogModules();
      setState((prev) => ({ ...prev, availableModules: response.data }));
    } catch (error: unknown) {
      console.error("Error fetching audit log modules:", error);
    }
  }, []);

  // Export audit logs
  const exportAuditLogs = useCallback(
    async (request: ExportAuditLogsRequest) => {
      try {
        setLoading(true);
        setError(null);

        const response = await AuditLogsService.exportAuditLogs(request);

        showSuccessToast(
          "Export completed successfully",
          `${response.data.recordCount} records exported.`,
        );

        return response.data;
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || "Failed to export audit logs";
        setError(errorMessage);
        showErrorToast(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, showErrorToast, showSuccessToast],
  );

  // Cleanup old audit logs
  const cleanupAuditLogs = useCallback(
    async (request: CleanupAuditLogsRequest) => {
      try {
        setLoading(true);
        setError(null);

        const response = await AuditLogsService.cleanupAuditLogs(request);

        if (request.dryRun) {
          showInfoToast(
            "Dry run completed",
            `${response.data.deletedCount} logs would be deleted.`,
          );
        } else {
          showSuccessToast(
            "Cleanup completed successfully",
            `${response.data.deletedCount} logs deleted.`,
          );
          // Refresh the audit logs list after cleanup
          await fetchAuditLogs(lastFetchParams);
        }

        return response.data;
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || "Failed to cleanup audit logs";
        setError(errorMessage);
        showErrorToast(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      setLoading,
      setError,
      showErrorToast,
      showSuccessToast,
      showInfoToast,
      fetchAuditLogs,
      lastFetchParams,
    ],
  );

  // Refresh current data
  const refreshData = useCallback(async () => {
    await fetchAuditLogs(lastFetchParams);
  }, [fetchAuditLogs, lastFetchParams]);

  return {
    // State
    auditLogs: state.auditLogs,
    auditLog: state.auditLog,
    statistics: state.statistics,
    availableActions: state.availableActions,
    availableModules: state.availableModules,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    limit: state.limit,

    // Operations
    fetchAuditLogs,
    fetchAuditLogById,
    fetchStatistics,
    fetchActions,
    fetchModules,
    exportAuditLogs,
    cleanupAuditLogs,

    // Utilities
    clearError,
    clearAuditLog,
    refreshData,
  };
};
