import type { PaginatedResponse, QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  timestamp: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogRequest {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  source?: string;
}

export class LoggingService {
  static async getAllLogs(params?: QueryParams): Promise<PaginatedResponse<LogEntry>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<LogEntry>>("/loggings", params);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async getLogById(id: string, params?: QueryParams): Promise<LogEntry> {
    try {
      const response = await HttpClient.get<LogEntry>(`/loggings/${id}`, params);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  static async createLog(data: CreateLogRequest): Promise<LogEntry> {
    try {
      const response = await HttpClient.post<LogEntry>("/loggings", data);
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods for different log levels
  static async logInfo(
    message: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<LogEntry> {
    return this.createLog({
      level: "info",
      message,
      metadata,
      userId,
      source: "frontend",
    });
  }

  static async logWarning(
    message: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<LogEntry> {
    return this.createLog({
      level: "warn",
      message,
      metadata,
      userId,
      source: "frontend",
    });
  }

  static async logError(
    message: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<LogEntry> {
    return this.createLog({
      level: "error",
      message,
      metadata,
      userId,
      source: "frontend",
    });
  }

  static async logDebug(
    message: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<LogEntry> {
    return this.createLog({
      level: "debug",
      message,
      metadata,
      userId,
      source: "frontend",
    });
  }
}
