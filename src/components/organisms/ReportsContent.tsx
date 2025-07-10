import React, { useEffect } from "react";
import {
  AnxietyAssessmentTable,
  DepressionAssessmentTable,
  StressAssessmentTable,
} from "@/components/molecules";
import { useAnxiety, useDepression, useStress } from "@/hooks";

export const ReportsContent: React.FC = () => {
  const { fetchAssessments: fetchAnxiety } = useAnxiety();
  const { fetchAssessments: fetchDepression } = useDepression();
  const { fetchAssessments: fetchStress } = useStress();

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

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Assessment Reports</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive view of all student mental health assessments
            </p>
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
