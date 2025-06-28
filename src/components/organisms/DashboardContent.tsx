import React from "react";
import { StatsGrid, RecentActivitiesTable } from "@/components/molecules";

export const DashboardContent: React.FC = () => {
  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of student mental health assessments</p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Recent Activities Table */}
        <RecentActivitiesTable />
      </div>
    </main>
  );
};
