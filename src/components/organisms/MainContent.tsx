import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { AnnouncementCard, AnnouncementModal } from "@/components/molecules";
import { Button } from "@/components/ui";
import { useAuth, useAnnouncement } from "@/hooks";
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  Announcement,
} from "@/services";

export const MainContent: React.FC = () => {
  const { user } = useAuth();
  const {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAnnouncements,
    clearError,
  } = useAnnouncement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Get the user's first name for personalized greeting
  const firstName = user?.person?.firstName || "User";

  // Check if user is guidance counselor (has access to all features)
  const isGuidance = user?.type === "guidance";

  // Generate time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(true);
    clearError();
  };

  const handleOpenViewModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
    clearError();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    clearError();
  };

  const handleAnnouncementSubmit = async (data: CreateAnnouncementRequest) => {
    try {
      await createAnnouncement(data);
      // Success - close modal
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
    } catch (err: any) {
      // Error is handled by the hook
      console.error("Failed to create announcement:", err);
    }
  };

  const handleAnnouncementUpdate = async (id: string, data: UpdateAnnouncementRequest) => {
    try {
      await updateAnnouncement(id, data);
      // Success - close modal
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
    } catch (err: any) {
      // Error is handled by the hook
      console.error("Failed to update announcement:", err);
    }
  };

  const handleAnnouncementDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      // Success - close modal
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
    } catch (err: any) {
      // Error is handled by the hook
      console.error("Failed to delete announcement:", err);
    }
  };

  // Helper function to map API announcement to AnnouncementCard props
  const mapAnnouncementToCard = (announcement: any) => {
    const statusColorMap = {
      academic: "blue" as const,
      career: "green" as const,
      wellness: "purple" as const,
    };

    return {
      title: announcement.title,
      description: announcement.description,
      date: new Date(announcement.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      category: announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1),
      categoryColor: statusColorMap[announcement.status as keyof typeof statusColorMap],
    };
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getGreeting()}, {firstName}!
          </h1>
          {/* Only show New Announcement button for guidance counselors */}
          {isGuidance && (
            <Button
              onClick={handleOpenCreateModal}
              className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Announcement</span>
            </Button>
          )}
        </div>

        {/* Guidance Counselor Announcements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Guidance Counselor Announcements
              </h2>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                View All →
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <AnnouncementCard
                  key={announcement.id || index}
                  {...mapAnnouncementToCard(announcement)}
                  onClick={() => handleOpenViewModal(announcement)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                {loading
                  ? "Loading announcements..."
                  : isGuidance
                  ? "No announcements yet. Create one to get started!"
                  : "No announcements available at the moment."}
              </div>
            )}
          </div>
        </div>

        {/* Campus News */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Campus News</h2>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                All News →
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  University Celebrates Record-Breaking Research Grants
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our faculty secured over $50 million in research funding this year, marking the
                  highest amount of innovative activity while supporting exceptional student
                  research opportunities across all disciplines.
                </p>
                <span className="text-xs text-gray-400">October 27, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAnnouncementSubmit}
        onUpdate={isGuidance ? handleAnnouncementUpdate : undefined}
        onDelete={isGuidance ? handleAnnouncementDelete : undefined}
        announcement={selectedAnnouncement}
        loading={loading}
        error={error}
      />
    </main>
  );
};
