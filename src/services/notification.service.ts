import { HttpClient } from "./api.config";

export interface Notification {
  id: string;
  type: "activity" | "audit" | "notification";
  action: string;
  title: string;
  message?: string;
  userId: string;
  entityType?: string;
  entityId?: string;
  data?: any;
  status: "pending" | "success" | "failed" | "read" | "unread";
  severity: "critical" | "high" | "medium" | "low" | "info";
  readAt?: string;
  createdAt: string;
  user?: {
    id: string;
    userName: string;
    person?: {
      firstName: string;
      lastName: string;
      students?: Array<{
        id: string;
        program: string;
        year: string;
      }>;
    };
  };
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  query?: string;
  order?: "asc" | "desc";
  status?: "pending" | "success" | "failed" | "read" | "unread";
  type?: "activity" | "audit" | "notification";
  severity?: "critical" | "high" | "medium" | "low" | "info";
}

export interface NotificationPaginatedResponse {
  logs: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UpdateNotificationRequest {
  status?: "pending" | "success" | "failed" | "read" | "unread";
  readAt?: string;
}

export class NotificationService {
  /**
   * Get all notifications for the authenticated user
   */
  static async getAllNotifications(
    params?: NotificationQueryParams
  ): Promise<NotificationPaginatedResponse> {
    try {
      const queryParams: any = {
        type: "notification", // Only fetch notification type logs
        fields: "id,type,action,title,message,userId,entityType,entityId,data,status,severity,readAt,createdAt,user.id,user.userName,user.person.firstName,user.person.lastName,user.person.students.id,user.person.students.program,user.person.students.year",
        ...params,
      };

      const response = await HttpClient.get<NotificationPaginatedResponse>(
        "/loggings",
        queryParams
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(
    id: string,
    params?: { fields?: string }
  ): Promise<Notification> {
    try {
      const response = await HttpClient.get<Notification>(`/loggings/${id}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await HttpClient.patch<Notification>(`/loggings/${id}/read`, {});
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update notification
   */
  static async updateNotification(
    id: string,
    data: UpdateNotificationRequest
  ): Promise<Notification> {
    try {
      const response = await HttpClient.patch<Notification>(`/loggings/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete notification (admin only)
   */
  static async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/loggings/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await this.getAllNotifications({
        status: "unread",
        limit: 1,
      });
      return { count: response.total };
    } catch (error) {
      console.error("Error getting unread count:", error);
      return { count: 0 };
    }
  }

  /**
   * Get notifications filtered by user role
   * For students: only assessments, messages, and appointments
   * For guidance: all notifications
   */
  static async getNotificationsByRole(
    userType: "student" | "guidance",
    params?: NotificationQueryParams
  ): Promise<NotificationPaginatedResponse> {
    try {
      let queryParams: NotificationQueryParams = {
        type: "notification",
        ...params,
      };

      // If student, filter by specific actions
      if (userType === "student") {
        // We'll filter on the frontend since the API doesn't support action filtering
        const response = await this.getAllNotifications(queryParams);

        // Filter notifications for student-relevant actions
        const studentRelevantActions = [
          // Assessment notifications
          "ANXIETY_ASSESSMENT_CREATED",
          "ANXIETY_ASSESSMENT_UPDATED",
          "DEPRESSION_ASSESSMENT_CREATED",
          "DEPRESSION_ASSESSMENT_UPDATED",
          "STRESS_ASSESSMENT_CREATED",
          "STRESS_ASSESSMENT_UPDATED",
          "SUICIDE_ASSESSMENT_CREATED",
          "SUICIDE_ASSESSMENT_UPDATED",
          // Message notifications
          "MESSAGE_SENT",
          "MESSAGE_RECEIVED",
          "MESSAGE_READ",
          // Appointment notifications
          "APPOINTMENT_CREATED",
          "APPOINTMENT_UPDATED",
          "APPOINTMENT_CANCELLED",
          "APPOINTMENT_CONFIRMED",
          "APPOINTMENT_COMPLETED",
        ];

        const filteredLogs = response.logs.filter((log) =>
          studentRelevantActions.includes(log.action)
        );

        return {
          ...response,
          logs: filteredLogs,
          total: filteredLogs.length,
        };
      }

      // For guidance users, return all notifications
      return await this.getAllNotifications(queryParams);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(ids: string[]): Promise<void> {
    try {
      await Promise.all(ids.map((id) => this.markAsRead(id)));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(userType?: "student" | "guidance"): Promise<{
    total: number;
    unread: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  }> {
    try {
      // Fetch a large slice; API is already scoped by authenticated user on the server
      const allNotifications = await this.getAllNotifications({ limit: 1000 });

      // If student, apply the same action filter used in list fetches
      let logs = allNotifications.logs;
      if (userType === "student") {
        const studentRelevantActions = [
          "ANXIETY_ASSESSMENT_CREATED",
          "ANXIETY_ASSESSMENT_UPDATED",
          "DEPRESSION_ASSESSMENT_CREATED",
          "DEPRESSION_ASSESSMENT_UPDATED",
          "STRESS_ASSESSMENT_CREATED",
          "STRESS_ASSESSMENT_UPDATED",
          "SUICIDE_ASSESSMENT_CREATED",
          "SUICIDE_ASSESSMENT_UPDATED",
          "MESSAGE_SENT",
          "MESSAGE_RECEIVED",
          "MESSAGE_READ",
          "APPOINTMENT_CREATED",
          "APPOINTMENT_UPDATED",
          "APPOINTMENT_CANCELLED",
          "APPOINTMENT_CONFIRMED",
          "APPOINTMENT_COMPLETED",
        ];

        logs = logs.filter((log) => studentRelevantActions.includes(log.action));
      }

      const bySeverity: Record<string, number> = {};
      const byType: Record<string, number> = {};

      logs.forEach((notification) => {
        // Count by severity
        bySeverity[notification.severity] = (bySeverity[notification.severity] || 0) + 1;

        // Count by action type (extract base type from action)
        const baseType = notification.action.split("_")[0].toLowerCase();
        byType[baseType] = (byType[baseType] || 0) + 1;
      });

      return {
        total: logs.length,
        unread: logs.filter((n) => n.status === "unread").length,
        bySeverity,
        byType,
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return {
        total: 0,
        unread: 0,
        bySeverity: {},
        byType: {},
      };
    }
  }
}
