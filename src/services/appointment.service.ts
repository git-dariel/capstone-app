import type { QueryParams, PaginatedResponse } from "./api.config";
import { HttpClient } from "./api.config";

export interface Appointment {
  id: string;
  studentId: string;
  counselorId: string;
  scheduleId: string;
  title: string;
  description?: string;
  appointmentType: "consultation" | "counseling" | "follow_up" | "emergency" | "group_session";
  requestedDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show" | "rescheduled";
  location?: string;
  duration: number;
  cancellationReason?: string;
  completionNotes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;

  // Populated relationships
  student?: {
    id: string;
    studentNumber: string;
    program: string;
    year: string;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      contactNumber?: string;
    };
  };
  counselor?: {
    id: string;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      contactNumber?: string;
    };
  };
  schedule?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    status: "available" | "booked" | "unavailable" | "cancelled";
  };
}

export interface CreateAppointmentRequest {
  studentId: string;
  counselorId: string;
  scheduleId: string;
  title: string;
  description?: string;
  appointmentType?: "consultation" | "counseling" | "follow_up" | "emergency" | "group_session";
  requestedDate: string;
  priority?: "low" | "normal" | "high" | "urgent";
  location?: string;
  duration?: number;
  attachments?: string[];
}

export interface UpdateAppointmentRequest {
  status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show" | "rescheduled";
  title?: string;
  description?: string;
  appointmentType?: "consultation" | "counseling" | "follow_up" | "emergency" | "group_session";
  requestedDate?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  location?: string;
  duration?: number;
  cancellationReason?: string;
  completionNotes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  attachments?: string[];
}

export interface AppointmentQueryParams extends QueryParams {
  status?: string;
  studentId?: string;
  counselorId?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  query?: string;
}

export class AppointmentService {
  /**
   * Get all appointments with pagination and filtering
   */
  static async getAllAppointments(
    params?: AppointmentQueryParams
  ): Promise<PaginatedResponse<Appointment>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<Appointment>>("/appointment", params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: string, params?: QueryParams): Promise<Appointment> {
    try {
      const response = await HttpClient.get<Appointment>(`/appointment/${id}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appointments by student ID
   */
  static async getAppointmentsByStudentId(
    studentId: string,
    params?: AppointmentQueryParams
  ): Promise<PaginatedResponse<Appointment>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<Appointment>>(
        `/appointment/student/${studentId}`,
        params
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appointments by counselor ID
   */
  static async getAppointmentsByCounselorId(
    counselorId: string,
    params?: AppointmentQueryParams
  ): Promise<PaginatedResponse<Appointment>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<Appointment>>(
        `/appointment/counselor/${counselorId}`,
        params
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await HttpClient.post<Appointment>("/appointment", appointmentData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(
    id: string,
    appointmentData: UpdateAppointmentRequest
  ): Promise<Appointment> {
    try {
      const response = await HttpClient.patch<Appointment>(`/appointment/${id}`, appointmentData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete appointment (soft delete)
   */
  static async deleteAppointment(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/appointment/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get status display info with colors
   */
  static getStatusDisplayInfo(status: string): { label: string; color: string; bgColor: string } {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "text-yellow-700",
          bgColor: "bg-yellow-100",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          color: "text-blue-700",
          bgColor: "bg-blue-100",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "text-red-700",
          bgColor: "bg-red-100",
        };
      case "completed":
        return {
          label: "Completed",
          color: "text-green-700",
          bgColor: "bg-green-100",
        };
      case "no_show":
        return {
          label: "No Show",
          color: "text-gray-700",
          bgColor: "bg-gray-100",
        };
      case "rescheduled":
        return {
          label: "Rescheduled",
          color: "text-purple-700",
          bgColor: "bg-purple-100",
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: "text-gray-700",
          bgColor: "bg-gray-100",
        };
    }
  }

  /**
   * Get priority display info with colors
   */
  static getPriorityDisplayInfo(priority: string): {
    label: string;
    color: string;
    bgColor: string;
  } {
    switch (priority) {
      case "low":
        return {
          label: "Low",
          color: "text-green-700",
          bgColor: "bg-green-100",
        };
      case "normal":
        return {
          label: "Normal",
          color: "text-blue-700",
          bgColor: "bg-blue-100",
        };
      case "high":
        return {
          label: "High",
          color: "text-orange-700",
          bgColor: "bg-orange-100",
        };
      case "urgent":
        return {
          label: "Urgent",
          color: "text-red-700",
          bgColor: "bg-red-100",
        };
      default:
        return {
          label: priority.charAt(0).toUpperCase() + priority.slice(1),
          color: "text-gray-700",
          bgColor: "bg-gray-100",
        };
    }
  }

  /**
   * Get appointment type display info
   */
  static getTypeDisplayInfo(type: string): { label: string; icon: string } {
    switch (type) {
      case "consultation":
        return { label: "Consultation", icon: "💬" };
      case "counseling":
        return { label: "Counseling", icon: "🗣️" };
      case "follow_up":
        return { label: "Follow Up", icon: "📋" };
      case "emergency":
        return { label: "Emergency", icon: "🚨" };
      case "group_session":
        return { label: "Group Session", icon: "👥" };
      default:
        return { label: type.charAt(0).toUpperCase() + type.slice(1), icon: "📅" };
    }
  }

  /**
   * Format date for display
   */
  static formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Check if appointment can be cancelled
   */
  static canCancelAppointment(appointment: Appointment): boolean {
    const isNotCompleted = !["completed", "cancelled", "no_show"].includes(appointment.status);
    const appointmentDate = new Date(appointment.requestedDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can cancel if at least 2 hours before appointment
    return isNotCompleted && hoursUntilAppointment > 2;
  }

  /**
   * Check if appointment can be rescheduled
   */
  static canRescheduleAppointment(appointment: Appointment): boolean {
    const isNotCompleted = !["completed", "cancelled", "no_show"].includes(appointment.status);
    const appointmentDate = new Date(appointment.requestedDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can reschedule if at least 4 hours before appointment
    return isNotCompleted && hoursUntilAppointment > 4;
  }
}
