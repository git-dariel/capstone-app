import React, { useEffect, useState } from "react";
import {
  AnxietyAssessmentTable,
  DepressionAssessmentTable,
  StressAssessmentTable,
} from "@/components/molecules";
import { useAnxiety, useDepression, useStress } from "@/hooks";
import { Button } from "@/components/ui";
import { Download, Loader2 } from "lucide-react";
import { UserService } from "@/services";

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
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
          fetchDepression({
            limit: 100,
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
          fetchStress({
            limit: 100,
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
        ];

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchAllAssessments();
  }, []); // Empty dependency array to run only once on mount

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await UserService.exportStudentDataCsv();
      // Show success message (you could add a toast notification here)
      console.log("CSV export successful");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      // Show error message (you could add a toast notification here)
      alert("Failed to export CSV data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Assessment Reports</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive view of all student mental health assessments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleExportCsv}
                disabled={isExporting}
                variant="outline"
                size="default"
                className="flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </>
                )}
              </Button>
            </div>
          </div>
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
