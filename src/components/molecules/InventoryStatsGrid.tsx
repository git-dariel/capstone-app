import React, { useEffect, useState } from "react";
import { TrendingUp, Users, BarChart3, Activity } from "lucide-react";
import { MetricsService } from "@/services";

export const InventoryStatsGrid: React.FC = () => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    highRiskCount: 0,
    completionRate: 0,
    avgBmi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await MetricsService.getInventoryStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch inventory stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Total Records",
      value: loading ? "..." : stats.totalRecords.toString(),
      subtitle: "Completed inventories",
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "High Risk",
      value: loading ? "..." : stats.highRiskCount.toString(),
      subtitle: "Mental health concerns",
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Completion Rate",
      value: loading ? "..." : `${stats.completionRate}%`,
      subtitle: "Assessment completion",
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Average BMI",
      value: loading ? "..." : stats.avgBmi.toFixed(1),
      subtitle: "Body mass index",
      icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {stat.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{stat.subtitle}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${stat.color} ${stat.bgColor} rounded-lg flex-shrink-0`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};