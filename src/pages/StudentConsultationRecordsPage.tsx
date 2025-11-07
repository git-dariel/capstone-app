import React from "react";
import { MainLayout } from "@/components";
import { StudentConsultationRecordsContent } from "@/components/organisms";

export const StudentConsultationRecordsPage: React.FC = () => {
  return (
    <MainLayout>
      <StudentConsultationRecordsContent />
    </MainLayout>
  );
};
