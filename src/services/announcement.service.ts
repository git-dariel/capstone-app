import type { QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  status: "academic" | "career" | "wellness";
  attachement?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  status?: "academic" | "career" | "wellness";
  attachement?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  description?: string;
  status?: "academic" | "career" | "wellness";
  attachement?: string;
}

export interface AnnouncementPaginatedResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  totalPages: number;
}

export class AnnouncementService {
  static async getAllAnnouncements(params?: QueryParams): Promise<AnnouncementPaginatedResponse> {
    try {
      const response = await HttpClient.get<AnnouncementPaginatedResponse>("/announcement", params);
      return response as unknown as AnnouncementPaginatedResponse;
    } catch (error) {
      throw error;
    }
  }

  static async getAnnouncementById(id: string, params?: QueryParams): Promise<Announcement> {
    try {
      const response = await HttpClient.get<Announcement>(`/announcement/${id}`, params);
      return response as unknown as Announcement;
    } catch (error) {
      throw error;
    }
  }

  static async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      const response = await HttpClient.post<Announcement>("/announcement", data);
      return response as unknown as Announcement;
    } catch (error) {
      throw error;
    }
  }

  static async updateAnnouncement(
    id: string,
    data: UpdateAnnouncementRequest
  ): Promise<Announcement> {
    try {
      const response = await HttpClient.patch<Announcement>(`/announcement/${id}`, data);
      return response as unknown as Announcement;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAnnouncement(id: string): Promise<{ message: string }> {
    try {
      const response = await HttpClient.delete<{ message: string }>(`/announcement/${id}`);
      return response as unknown as { message: string };
    } catch (error) {
      throw error;
    }
  }
}
