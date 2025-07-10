import React, { useState, useEffect } from "react";
import { Users, Brain, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/atoms";
import { MetricsService } from "@/services";

interface DashboardStats {
  totalStudents: number;
  totalAnxiety: number;
  totalDepression: number;
  totalStress: number;
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

      // Fetch total counts for each assessment type
      const [anxietyCount, depressionCount, stressCount] = await Promise.all([
        MetricsService.getTotalCount("anxiety"),
        MetricsService.getTotalCount("depression"),
        MetricsService.getTotalCount("stress"),
      ]);

      // For total students, we'll use a placeholder for now since the API structure would need adjustment
      const totalStudents = anxietyCount + depressionCount + stressCount; // Approximate

      setStats({
        totalStudents,
        totalAnxiety: anxietyCount,
        totalDepression: depressionCount,
        totalStress: stressCount,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
    },
    {
      title: "Anxiety Assessments",
      value: stats?.totalAnxiety.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Brain className="w-6 h-6" />,
      color: "yellow" as const,
      type: "anxiety",
    },
    {
      title: "Depression Assessments",
      value: stats?.totalDepression.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Heart className="w-6 h-6" />,
      color: "red" as const,
      type: "depression",
    },
    {
      title: "Stress Assessments",
      value: stats?.totalStress.toLocaleString() || "0",
      subtitle: "Students assessed",
      icon: <Zap className="w-6 h-6" />,
      color: "purple" as const,
      type: "stress",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {dashboardStats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          clickable={stat.type !== undefined}
          onClick={stat.type ? () => handleStatClick(stat.type) : undefined}
        />
      ))}
    </div>
  );
};
