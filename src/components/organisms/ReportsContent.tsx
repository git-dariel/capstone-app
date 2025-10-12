import React, { useEffect, useState } from "react";
import {
  AnxietyAssessmentTable,
  DepressionAssessmentTable,
  StressAssessmentTable,
  ExportFilterDropdown,
  StudentProgressTable,
} from "@/components/molecules";
import { useAnxiety, useDepression, useStress } from "@/hooks";
import { UserService } from "@/services";
import type { ExportFilters } from "@/services";

export const ReportsContent: React.FC = () => {
  const { fetchAssessments: fetchAnxiety } = useAnxiety();
  const { fetchAssessments: fetchDepression } = useDepression();
  const { fetchAssessments: fetchStress } = useStress();
  const [isExporting, setIsExporting] = useState(false);

  // Automatically fetch all assessments when component mounts
  useEffect(() => {
    const fetchAllAssessments = async () => {
      try {
        const fetchPromises = [
          fetchAnxiety({
            limit: 100,
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.avatar,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
          fetchDepression({
            limit: 100,
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.avatar,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
          fetchStress({
            limit: 100,
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.avatar,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
        ];

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchAllAssessments();
  }, []); // Empty dependency array to run only once on mount

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
        </div>
      </div>
    </main>
  );
};
