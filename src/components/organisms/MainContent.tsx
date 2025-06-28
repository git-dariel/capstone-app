import React from "react";
import { Plus } from "lucide-react";
import { AnnouncementCard } from "@/components/molecules";
import { Button } from "@/components/ui";

export const MainContent: React.FC = () => {
  const announcements = [
    {
      title: "Understanding Your Academic Advising Report",
      description:
        "Good morning! Darrel, hope you're feeling well this morning! We understand that some students have questions about their report cards, and let's get on track...",
      date: "October 25, 2024",
      category: "Academic",
      categoryColor: "blue" as const,
    },
    {
      title: "Career Fair: Explore Internship Opportunities",
      description:
        "Mark your calendars, students. Join the Scholarship search to land students for internships and full-time positions. Bring your resume.",
      date: "October 24, 2024",
      category: "Career",
      categoryColor: "green" as const,
    },
    {
      title: "Stress Management Techniques for Students",
      description:
        "Join our mental strategies to manage academic stress and wellness best during midterms. Lack of the Campus Counseling Center.",
      date: "October 22, 2024",
      category: "Wellness",
      categoryColor: "purple" as const,
    },
    {
      title: "New Peer Tutoring Program Launched",
      description:
        "Looking for help with a challenging course? Our new peer tutoring programs connects you with experienced students for personalized support.",
      date: "October 19, 2024",
      category: "Academic",
      categoryColor: "blue" as const,
    },
    {
      title: "Student Health Services Flu Shot Clinic",
      description:
        "Protect yourself and the campus community. Free flu shots are available for all enrolled students.",
      date: "October 18, 2024",
      category: "Wellness",
      categoryColor: "purple" as const,
    },
  ];

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Good Morning, Dariel!</h1>
          <Button className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </Button>
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
            {announcements.map((announcement, index) => (
              <AnnouncementCard key={index} {...announcement} />
            ))}
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
    </main>
  );
};
