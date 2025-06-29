import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  AnxietyAssessmentTable,
  DepressionAssessmentTable,
  StressAssessmentTable,
} from "@/components/molecules";
import { useAnxiety, useDepression, useStress } from "@/hooks";

export const ReportsContent: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { fetchAssessments: fetchAnxiety } = useAnxiety();
  const { fetchAssessments: fetchDepression } = useDepression();
  const { fetchAssessments: fetchStress } = useStress();

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      const refreshPromises = [
        fetchAnxiety({
          limit: 100,
          fields:
            "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName",
        }),
        fetchDepression({
          limit: 100,
          fields:
            "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName",
        }),
        fetchStress({
          limit: 100,
          fields:
            "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName",
        }),
      ];

      await Promise.all(refreshPromises);
    } catch (error) {
      console.error("Error refreshing assessments:", error);
    } finally {
      setRefreshing(false);
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
            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh All"}</span>
            </button>
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
