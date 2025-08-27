import React, { useState } from "react";
import { AppointmentsContent } from "@/components/organisms";
import { MainLayout } from "@/components";

const AppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"appointments" | "schedules">("appointments");

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">
            Manage appointments and schedules for counseling sessions.
          </p>
        </div>

        <AppointmentsContent activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </MainLayout>
  );
};

export default AppointmentsPage;
