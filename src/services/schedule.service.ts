import type { QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface Schedule {
  id: string;
  counselorId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringType: "none" | "daily" | "weekly" | "monthly";
  maxSlots: number;
  bookedSlots: number;
  status: "available" | "booked" | "unavailable" | "cancelled";
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;

  // Populated relationships
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
}

export interface CreateScheduleRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  recurringType?: "none" | "daily" | "weekly" | "monthly";
  maxSlots?: number;
  location?: string;
  notes?: string;
}

export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: "available" | "booked" | "unavailable" | "cancelled";
  isRecurring?: boolean;
  recurringType?: "none" | "daily" | "weekly" | "monthly";
  maxSlots?: number;
  location?: string;
  notes?: string;
}

export interface ScheduleQueryParams extends QueryParams {
  counselorId?: string;
  status?: string;
  from?: string;
  to?: string;
  query?: string;
}

export interface ScheduleApiResponse {
  schedules: Schedule[];
  total: number;
  page: number;
  totalPages: number;
}

export class ScheduleService {
  /**
   * Get all schedules with pagination and filtering
   */
  static async getAllSchedules(params?: ScheduleQueryParams): Promise<ScheduleApiResponse> {
    try {
      const response = await HttpClient.get<ScheduleApiResponse>("/schedule", params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available schedules for booking
   */
  static async getAvailableSchedules(params?: ScheduleQueryParams): Promise<Schedule[]> {
    try {
      // Include counselor information for display
      const queryParams = {
        ...params,
        fields:
          "id,counselorId,title,description,startTime,endTime,status,isRecurring,recurringType,maxSlots,bookedSlots,location,notes,createdAt,updatedAt,isDeleted,counselor.id,counselor.person.firstName,counselor.person.lastName,counselor.person.email",
      };
      const response = await HttpClient.get<Schedule[]>("/schedule/available", queryParams);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get schedule by ID
   */
  static async getScheduleById(id: string, params?: QueryParams): Promise<Schedule> {
    try {
      const response = await HttpClient.get<Schedule>(`/schedule/${id}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new schedule
   */
  static async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
    try {
      const response = await HttpClient.post<Schedule>("/schedule", scheduleData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update schedule
   */
  static async updateSchedule(id: string, scheduleData: UpdateScheduleRequest): Promise<Schedule> {
    try {
      const response = await HttpClient.patch<Schedule>(`/schedule/${id}`, scheduleData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete schedule (soft delete)
   */
  static async deleteSchedule(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/schedule/${id}`);
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
      case "available":
        return {
          label: "Available",
          color: "text-green-700",
          bgColor: "bg-green-100",
        };
      case "booked":
        return {
          label: "Booked",
          color: "text-blue-700",
          bgColor: "bg-blue-100",
        };
      case "unavailable":
        return {
          label: "Unavailable",
          color: "text-gray-700",
          bgColor: "bg-gray-100",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "text-red-700",
          bgColor: "bg-red-100",
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
   * Format schedule time for display
   */
  static formatScheduleTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    // Same day
    if (start.toDateString() === end.toDateString()) {
      return `${formatDate(start)} ${formatTime(start)} - ${formatTime(end)}`;
    }

    // Different days
    return `${formatDate(start)} ${formatTime(start)} - ${formatDate(end)} ${formatTime(end)}`;
  }

  /**
   * Check if schedule is in the future
   */
  static isFutureSchedule(schedule: Schedule): boolean {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    return startTime > now;
  }

  /**
   * Check if schedule can be booked
   */
  static canBookSchedule(schedule: Schedule): boolean {
    return (
      schedule.status === "available" &&
      schedule.bookedSlots < schedule.maxSlots &&
      this.isFutureSchedule(schedule)
    );
  }

  /**
   * Get availability percentage
   */
  static getAvailabilityPercentage(schedule: Schedule): number {
    if (schedule.maxSlots === 0) return 0;
    return Math.round(((schedule.maxSlots - schedule.bookedSlots) / schedule.maxSlots) * 100);
  }

  /**
   * Get recurring type display
   */
  static getRecurringTypeDisplay(type: string): string {
    switch (type) {
      case "daily":
        return "Every Day";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "none":
      default:
        return "One Time";
    }
  }

  /**
   * Calculate duration in minutes
   */
  static getDurationInMinutes(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Group schedules by date
   */
  static groupSchedulesByDate(schedules: Schedule[]): Record<string, Schedule[]> {
    return schedules.reduce((groups, schedule) => {
      const date = new Date(schedule.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(schedule);
      return groups;
    }, {} as Record<string, Schedule[]>);
  }
}
