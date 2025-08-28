import { ScheduleService } from "@/services";
import type {
  CreateScheduleRequest,
  Schedule,
  ScheduleApiResponse,
  ScheduleQueryParams,
  UpdateScheduleRequest,
} from "@/services/schedule.service";
import { useState } from "react";

interface SchedulesState {
  schedules: Schedule[];
  availableSchedules: Schedule[];
  currentSchedule: Schedule | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useSchedules = () => {
  const [state, setState] = useState<SchedulesState>({
    schedules: [],
    availableSchedules: [],
    currentSchedule: null,
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

  const fetchSchedules = async (params?: ScheduleQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response: ScheduleApiResponse = await ScheduleService.getAllSchedules(params);

      setState((prev) => ({
        ...prev,
        schedules: response.schedules || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch schedules";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAvailableSchedules = async (params?: ScheduleQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const schedules = await ScheduleService.getAvailableSchedules(params);

      console.log("Available schedules fetched:", schedules);
      console.log("Number of available schedules:", schedules?.length || 0);

      setState((prev) => ({
        ...prev,
        availableSchedules: schedules || [],
        loading: false,
      }));

      return schedules;
    } catch (error: any) {
      console.error("Error fetching available schedules:", error);
      const errorMessage = error.message || "Failed to fetch available schedules";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchScheduleById = async (id: string, params?: ScheduleQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const schedule = await ScheduleService.getScheduleById(id, params);

      setState((prev) => ({
        ...prev,
        currentSchedule: schedule,
        loading: false,
      }));

      return schedule;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch schedule";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createSchedule = async (scheduleData: CreateScheduleRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newSchedule = await ScheduleService.createSchedule(scheduleData);

      setState((prev) => ({
        ...prev,
        schedules: [newSchedule, ...prev.schedules],
        total: prev.total + 1,
        currentSchedule: newSchedule,
        loading: false,
      }));

      return newSchedule;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create schedule";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateSchedule = async (id: string, scheduleData: UpdateScheduleRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedSchedule = await ScheduleService.updateSchedule(id, scheduleData);

      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((schedule) =>
          schedule.id === id ? updatedSchedule : schedule
        ),
        availableSchedules: prev.availableSchedules.map((schedule) =>
          schedule.id === id ? updatedSchedule : schedule
        ),
        currentSchedule: prev.currentSchedule?.id === id ? updatedSchedule : prev.currentSchedule,
        loading: false,
      }));

      return updatedSchedule;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update schedule";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await ScheduleService.deleteSchedule(id);

      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.filter((schedule) => schedule.id !== id),
        availableSchedules: prev.availableSchedules.filter((schedule) => schedule.id !== id),
        total: prev.total - 1,
        currentSchedule: prev.currentSchedule?.id === id ? null : prev.currentSchedule,
        loading: false,
      }));

      return { message: "Schedule deleted successfully" };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete schedule";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const refreshSchedules = async (params?: ScheduleQueryParams) => {
    return await fetchSchedules(params);
  };

  const refreshAvailableSchedules = async (params?: ScheduleQueryParams) => {
    return await fetchAvailableSchedules(params);
  };

  const resetState = () => {
    setState({
      schedules: [],
      availableSchedules: [],
      currentSchedule: null,
      loading: false,
      error: null,
      total: 0,
      page: 1,
      totalPages: 0,
    });
  };

  return {
    // State
    schedules: state.schedules,
    availableSchedules: state.availableSchedules,
    currentSchedule: state.currentSchedule,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    fetchSchedules,
    fetchAvailableSchedules,
    fetchScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refreshSchedules,
    refreshAvailableSchedules,
    clearError,
    resetState,
  };
};
