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
    total,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAnnouncements,
    clearError,
  } = useAnnouncement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

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
    // Start with limited view - show only 3 announcements
    fetchAnnouncements({ page: 1, limit: 3 });
  }, []);

  const handleViewAllAnnouncements = async () => {
    try {
      setShowAllAnnouncements(true);
      // Fetch more announcements with larger limit
      await fetchAnnouncements({ page: 1, limit: 20 });
    } catch (error) {
      console.error("Failed to fetch all announcements:", error);
    }
  };

  const handleViewLessAnnouncements = async () => {
    try {
      setShowAllAnnouncements(false);
      // Fetch back to normal limited view
      await fetchAnnouncements({ page: 1, limit: 3 });
    } catch (error) {
      console.error("Failed to fetch limited announcements:", error);
    }
  };

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
      authorName: "Guidance Counselor",
      authorInitials: "GC",
      showEditOption: isGuidance,
      attachement: announcement.attachement,
    };
  };

  return (
    <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {getGreeting()}, {firstName}!
          </h1>
          {/* Only show New Announcement button for guidance counselors */}
          {isGuidance && (
            <Button
              onClick={handleOpenCreateModal}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
              loading={loading}
              loadingText="Loading..."
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm sm:text-base">New Announcement</span>
            </Button>
          )}
        </div>

        {/* Guidance Counselor Announcements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">
                  Guidance Counselor Announcements
                </h2>
                {total > 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Showing {announcements.length} of {total} announcements
                  </p>
                )}
              </div>
              {total > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-700 hover:text-primary-800 text-sm w-full sm:w-auto"
                  onClick={
                    showAllAnnouncements ? handleViewLessAnnouncements : handleViewAllAnnouncements
                  }
                  loading={loading}
                  loadingText="Loading..."
                >
                  {showAllAnnouncements ? "View Less" : `View All (${total})`}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <AnnouncementCard
                    key={announcement.id || index}
                    {...mapAnnouncementToCard(announcement)}
                    onClick={() => handleOpenViewModal(announcement)}
                    onEdit={() => handleOpenViewModal(announcement)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center text-gray-500">
                <div className="max-w-md mx-auto px-4">
                  {loading ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
                      <p className="text-sm sm:text-base">Loading announcements...</p>
                    </div>
                  ) : isGuidance ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        No announcements yet
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Create your first announcement to get started!
                      </p>
                      <Button
                        onClick={handleOpenCreateModal}
                        className="mt-4 bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto"
                        loading={loading}
                        loadingText="Loading..."
                      >
                        Create Announcement
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl sm:text-2xl">📢</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        No announcements available
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Check back later for updates from your guidance counselor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
