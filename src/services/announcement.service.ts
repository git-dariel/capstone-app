import type { QueryParams } from "./api.config";
import { HttpClient } from "./api.config";

export interface AnnouncementFile {
  name: string;
  url: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  status: "academic" | "career" | "wellness";
  attachement?: AnnouncementFile[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  status?: "academic" | "career" | "wellness";
  attachement?: File[];
}

export interface UpdateAnnouncementRequest {
  title?: string;
  description?: string;
  status?: "academic" | "career" | "wellness";
  attachement?: File[];
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
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.status) {
        formData.append('status', data.status);
      }
      
      // Add files if any
      if (data.attachement && data.attachement.length > 0) {
        data.attachement.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await HttpClient.postFormData<Announcement>("/announcement", formData);
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
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add text fields
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.status) formData.append('status', data.status);
      
      // Add files if any
      if (data.attachement && data.attachement.length > 0) {
        data.attachement.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await HttpClient.patchFormData<Announcement>(`/announcement/${id}`, formData);
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
