import React, { useState, useEffect } from "react";
import { Users, GraduationCap, BookOpen } from "lucide-react";
import { StatCard } from "@/components/atoms";
import { MetricsService } from "@/services";

interface StudentStatsData {
  totalStudents: number;
  totalPrograms: number;
  totalYearLevels: number;
}

export const StudentStatsCards: React.FC = () => {
  const [stats, setStats] = useState<StudentStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [totalStudents, programData, yearData] = await Promise.all([
        MetricsService.getTotalStudentCount(),
        MetricsService.getStudentsByProgram(),
        MetricsService.getStudentsByYear(),
      ]);

      setStats({
        totalStudents,
        totalPrograms: programData.length,
        totalYearLevels: yearData.length,
      });
    } catch (error: any) {
      console.error("Error fetching student stats:", error);
      setError("Failed to load student statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border shadow-sm p-4 sm:p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to Load Statistics</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button
            onClick={fetchStudentStats}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const studentStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents.toLocaleString() || "0",
      subtitle: "Enrolled students",
      icon: <Users className="w-6 h-6" />,
      color: "blue" as const,
      clickable: false,
    },
    {
      title: "Academic Programs",
      value: stats?.totalPrograms.toLocaleString() || "0",
      subtitle: "Available programs",
      icon: <BookOpen className="w-6 h-6" />,
      color: "green" as const,
      clickable: false,
    },
    {
      title: "Year Levels",
      value: stats?.totalYearLevels.toLocaleString() || "0",
      subtitle: "Active year levels",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "purple" as const,
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
      {studentStats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          clickable={stat.clickable}
        />
      ))}
    </div>
  );
};
