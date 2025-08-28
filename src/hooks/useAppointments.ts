import { AppointmentService } from "@/services";
import type {
  Appointment,
  AppointmentQueryParams,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "@/services/appointment.service";
import { useState } from "react";

interface AppointmentsState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useAppointments = () => {
  const [state, setState] = useState<AppointmentsState>({
    appointments: [],
    currentAppointment: null,
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

  const fetchAppointments = async (params?: AppointmentQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response: any = await AppointmentService.getAllAppointments(params);

      console.log("All appointments response:", response);

      setState((prev) => ({
        ...prev,
        appointments: response.appointments || response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      const errorMessage = error.message || "Failed to fetch appointments";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAppointmentById = async (id: string, params?: AppointmentQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const appointment = await AppointmentService.getAppointmentById(id, params);

      setState((prev) => ({
        ...prev,
        currentAppointment: appointment,
        loading: false,
      }));

      return appointment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch appointment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAppointmentsByStudentId = async (
    studentId: string,
    params?: AppointmentQueryParams
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: any = await AppointmentService.getAppointmentsByStudentId(studentId, params);

      console.log("Student appointments response:", response);

      setState((prev) => ({
        ...prev,
        appointments: response.appointments || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      console.error("Error fetching student appointments:", error);
      const errorMessage = error.message || "Failed to fetch student appointments";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAppointmentsByCounselorId = async (
    counselorId: string,
    params?: AppointmentQueryParams
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: any = await AppointmentService.getAppointmentsByCounselorId(
        counselorId,
        params
      );

      console.log("Counselor appointments response:", response);

      setState((prev) => ({
        ...prev,
        appointments: response.appointments || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      console.error("Error fetching counselor appointments:", error);
      const errorMessage = error.message || "Failed to fetch counselor appointments";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newAppointment = await AppointmentService.createAppointment(appointmentData);

      setState((prev) => ({
        ...prev,
        appointments: [newAppointment, ...prev.appointments],
        total: prev.total + 1,
        currentAppointment: newAppointment,
        loading: false,
      }));

      return newAppointment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create appointment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateAppointment = async (id: string, appointmentData: UpdateAppointmentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAppointment = await AppointmentService.updateAppointment(id, appointmentData);

      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment
        ),
        currentAppointment:
          prev.currentAppointment?.id === id ? updatedAppointment : prev.currentAppointment,
        loading: false,
      }));

      return updatedAppointment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update appointment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await AppointmentService.deleteAppointment(id);

      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.filter((appointment) => appointment.id !== id),
        total: prev.total - 1,
        currentAppointment: prev.currentAppointment?.id === id ? null : prev.currentAppointment,
        loading: false,
      }));

      return { message: "Appointment deleted successfully" };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete appointment";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const refreshAppointments = async (params?: AppointmentQueryParams) => {
    return await fetchAppointments(params);
  };

  const resetState = () => {
    setState({
      appointments: [],
      currentAppointment: null,
      loading: false,
      error: null,
      total: 0,
      page: 1,
      totalPages: 0,
    });
  };

  return {
    // State
    appointments: state.appointments,
    currentAppointment: state.currentAppointment,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    fetchAppointments,
    fetchAppointmentById,
    fetchAppointmentsByStudentId,
    fetchAppointmentsByCounselorId,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments,
    clearError,
    resetState,
  };
};
