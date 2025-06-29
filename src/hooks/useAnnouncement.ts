import { useState } from "react";
import { AnnouncementService } from "@/services";
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementPaginatedResponse,
  QueryParams,
} from "@/services";

interface AnnouncementState {
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useAnnouncement = () => {
  const [state, setState] = useState<AnnouncementState>({
    announcements: [],
    currentAnnouncement: null,
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

  const fetchAnnouncements = async (params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response: AnnouncementPaginatedResponse = await AnnouncementService.getAllAnnouncements(
        params
      );

      setState((prev) => ({
        ...prev,
        announcements: response.announcements || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch announcements";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchAnnouncementById = async (id: string, params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const announcement = await AnnouncementService.getAnnouncementById(id, params);

      setState((prev) => ({
        ...prev,
        currentAnnouncement: announcement,
        loading: false,
      }));

      return announcement;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch announcement";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createAnnouncement = async (data: CreateAnnouncementRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newAnnouncement = await AnnouncementService.createAnnouncement(data);

      setState((prev) => ({
        ...prev,
        announcements: [newAnnouncement, ...prev.announcements],
        total: prev.total + 1,
        loading: false,
      }));

      return newAnnouncement;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create announcement";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateAnnouncement = async (id: string, data: UpdateAnnouncementRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAnnouncement = await AnnouncementService.updateAnnouncement(id, data);

      setState((prev) => ({
        ...prev,
        announcements: prev.announcements.map((announcement) =>
          announcement.id === id ? updatedAnnouncement : announcement
        ),
        currentAnnouncement:
          prev.currentAnnouncement?.id === id ? updatedAnnouncement : prev.currentAnnouncement,
        loading: false,
      }));

      return updatedAnnouncement;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update announcement";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AnnouncementService.deleteAnnouncement(id);

      setState((prev) => ({
        ...prev,
        announcements: prev.announcements.filter((announcement) => announcement.id !== id),
        currentAnnouncement: prev.currentAnnouncement?.id === id ? null : prev.currentAnnouncement,
        total: Math.max(0, prev.total - 1),
        loading: false,
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete announcement";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const refreshAnnouncements = async (params?: QueryParams) => {
    return await fetchAnnouncements(params);
  };

  return {
    // State
    announcements: state.announcements,
    currentAnnouncement: state.currentAnnouncement,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    fetchAnnouncements,
    fetchAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshAnnouncements,
    clearError,
  };
};
