import React, { useState, useEffect } from "react";
import { Users, Brain, Heart, Zap, Shield, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/atoms";
import { MetricsService } from "@/services";

interface DashboardStats {
  totalStudents: number;
  totalAnxiety: number;
  totalDepression: number;
  totalStress: number;
  totalSuicide: number;
  totalChecklist: number;
}

export const StatsGrid: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleStatClick = (type: string) => {
    navigate(`/insights/${type}`);
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total counts for each assessment type and unique student count
      const [totalStudents, anxietyCount, depressionCount, stressCount, suicideCount, checklistCount] = await Promise.all([
        MetricsService.getTotalStudentCount(),
        MetricsService.getTotalCount("anxiety"),
        MetricsService.getTotalCount("depression"),
        MetricsService.getTotalCount("stress"),
        MetricsService.getTotalCount("suicide"),
        MetricsService.getTotalCount("checklist"),
      ]);

      setStats({
        totalStudents,
        totalAnxiety: anxietyCount,
        totalDepression: depressionCount,
        totalStress: stressCount,
        totalSuicide: suicideCount,
        totalChecklist: checklistCount,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border shadow-sm p-4 sm:p-5 animate-pulse min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents.toLocaleString() || "0",
      subtitle: "Total assessments",
      icon: <Users className="w-6 h-6" />,
      color: "blue" as const,
      clickable: false,
      description: "View all student records",
    },
    {
      title: "Anxiety",
      value: stats?.totalAnxiety.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Brain className="w-6 h-6" />,
      color: "yellow" as const,
      type: "anxiety",
      clickable: true,
      description: "Click to view detailed insights",
    },
    {
      title: "Depression",
      value: stats?.totalDepression.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Heart className="w-6 h-6" />,
      color: "red" as const,
      type: "depression",
      clickable: true,
      description: "Click to view detailed insights",
    },
    {
      title: "Stress",
      value: stats?.totalStress.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Zap className="w-6 h-6" />,
      color: "purple" as const,
      type: "stress",
      clickable: true,
      description: "Click to view detailed insights",
    },
    {
      title: "Suicide Risk",
      value: stats?.totalSuicide.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Shield className="w-6 h-6" />,
      color: "red" as const,
      type: "suicide",
      clickable: true,
      description: "Click to view detailed insights",
    },
    {
      title: "Personal Problems",
      value: stats?.totalChecklist.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <ClipboardList className="w-6 h-6" />,
      color: "green" as const,
      type: "checklist",
      clickable: true,
      description: "Click to view detailed insights",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {dashboardStats.map((stat, index) => (
        <div key={index} className="relative mb-8">
          <StatCard
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            clickable={stat.clickable}
            onClick={stat.type ? () => handleStatClick(stat.type) : undefined}
          />
          {stat.clickable && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full shadow-sm">
                🖱️ {stat.description}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
