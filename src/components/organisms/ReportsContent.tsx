import React from "react";
import {
  AnxietyAssessmentTable,
  DepressionAssessmentTable,
  StressAssessmentTable,
} from "@/components/molecules";

export const ReportsContent: React.FC = () => {
  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Assessment Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of all student mental health assessments
          </p>
        </div>

        {/* Assessment Tables */}
        <div className="space-y-8">
          {/* Anxiety Assessment Table */}
          <AnxietyAssessmentTable />

          {/* Depression Assessment Table */}
          <DepressionAssessmentTable />

          {/* Stress Assessment Table */}
          <StressAssessmentTable />
        </div>
      </div>
    </main>
  );
};
