import React, { useState } from "react";
import {
  AnxietyAssessmentTable,
  DepressionAssessmentTable,
  StressAssessmentTable,
  SuicideAssessmentTable,
  ChecklistAssessmentTable,
  ExportFilterDropdown,
  StudentProgressTable,
} from "@/components/molecules";
import { UserService } from "@/services";
import type { ExportFilters } from "@/services";

export const ReportsContent: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async (filters: ExportFilters) => {
    setIsExporting(true);
    try {
      await UserService.exportStudentDataCsv(filters);
      // Show success message (you could add a toast notification here)
      console.log("CSV export successful");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      // Show error message (you could add a toast notification here)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to export CSV data. Please try again.";
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                Assessment Reports
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Comprehensive view of all student mental health assessments
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <ExportFilterDropdown onExport={handleExportCsv} isExporting={isExporting} />
            </div>
          </div>
        </div>

        {/* Assessment Tables */}
        <div className="space-y-6 md:space-y-8">
          {/* Student Progress Overview Table */}
          <StudentProgressTable />

          {/* Anxiety Assessment Table */}
          <AnxietyAssessmentTable />

          {/* Depression Assessment Table */}
          <DepressionAssessmentTable />

          {/* Stress Assessment Table */}
          <StressAssessmentTable />

          {/* Suicide Assessment Table */}
          <SuicideAssessmentTable />

          {/* Personal Checklist Problems Table */}
          <ChecklistAssessmentTable />
        </div>
      </div>
    </main>
  );
};
