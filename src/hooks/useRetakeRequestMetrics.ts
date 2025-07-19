import { useState, useEffect } from "react";
import { MetricsService, type RetakeRequestMetrics, type MetricFilter } from "@/services";

interface RetakeRequestMetricsState {
  metrics: RetakeRequestMetrics | null;
  loading: boolean;
  error: string | null;
}

export const useRetakeRequestMetrics = (filter?: MetricFilter) => {
  const [state, setState] = useState<RetakeRequestMetricsState>({
    metrics: null,
    loading: false,
    error: null,
  });

  const fetchMetrics = async (customFilter?: MetricFilter) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const metrics = await MetricsService.getRetakeRequestMetrics(customFilter || filter);
      setState((prev) => ({
        ...prev,
        metrics,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Error fetching retake request metrics:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch metrics",
      }));
    }
  };

  const refresh = () => {
    fetchMetrics(filter);
  };

  // Auto-fetch on mount and when filter changes
  useEffect(() => {
    fetchMetrics(filter);
  }, [filter]);

  return {
    ...state,
    fetchMetrics,
    refresh,
  };
};
