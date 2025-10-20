import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Avatar, LoadingScreen } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { useChecklist } from "@/hooks";
import type { PersonalProblemsChecklist as ApiChecklistAssessment } from "@/services";

type ChecklistRiskLevel = "low" | "moderate" | "high" | "critical";

interface ChecklistAssessment {
  id: string;
  studentName: string;
  riskLevel: ChecklistRiskLevel;
  totalProblems: number;
  date: string;
  program: string;
  year: string;
  contactNumber: string;
  avatar?: string;
}

export const ChecklistAssessmentTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);

  // Use the checklist hook to fetch data
  const { checklists: apiAssessments, loading, error, fetchChecklists } = useChecklist();

  // Fetch assessments on component mount
  useEffect(() => {
    fetchChecklists({
      limit: 100,
      fields:
        "id,userId,checklist_analysis.riskLevel,checklist_analysis.totalProblemsChecked,date_completed,createdAt,updatedAt,user.avatar,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
    }).catch(console.error);
  }, []);

  // Transform API data to table format
  const allAssessments: ChecklistAssessment[] = useMemo(() => {
    return apiAssessments.map((assessment: ApiChecklistAssessment) => {
      // Type assertion to access additional fields from API response
      const person = assessment.user?.person as any;
      const student = (person as any)?.students?.[0];

      return {
        id: assessment.id,
        studentName: assessment.user ? `${person.firstName} ${person.lastName}` : "Unknown Student",
        avatar: (assessment.user as any)?.avatar, // Get avatar from user account
        riskLevel: assessment.checklist_analysis?.riskLevel || "low",
        totalProblems: assessment.checklist_analysis?.totalProblemsChecked || 0,
        date: new Date(assessment.date_completed).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        program: student?.program || "N/A",
        year: student?.year || "N/A",
        contactNumber: (person as any)?.contactNumber || "N/A",
      };
    });
  }, [apiAssessments]);

  // Filter assessments based on search term
  const filteredAssessments = useMemo(() => {
    if (!searchTerm) return allAssessments;
    return allAssessments.filter(
      (assessment) =>
        assessment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.riskLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.year.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allAssessments]);

  // Get assessments to display (limited by displayCount)
  const assessments = useMemo(() => {
    return filteredAssessments.slice(0, displayCount);
  }, [filteredAssessments, displayCount]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (displayCount < filteredAssessments.length) {
        setDisplayCount((prev) => Math.min(prev + 10, filteredAssessments.length));
      }
    }
  };

  // Reset display count when search term changes
  useEffect(() => {
    setDisplayCount(10);
  }, [searchTerm]);

  const getRiskColor = (riskLevel: ChecklistRiskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRiskLevel = (riskLevel: ChecklistRiskLevel) => {
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Personal Checklist Problems Reports</h2>
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading assessments..."
                : `Showing ${assessments.length} of ${filteredAssessments.length} students`}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students, program, year, or risk level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 touch-manipulation"
            disabled={loading}
          />
        </div>
      </div>

      <div
        ref={tableRef}
        className="overflow-x-auto max-h-96 overflow-y-auto"
        onScroll={handleScroll}
      >
        {error ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : loading ? (
          <LoadingScreen 
            isLoading={true} 
            message="Loading checklist assessments..." 
            size="md"
            className="py-8"
          />
        ) : assessments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <p className="text-sm">No checklist assessments found</p>
              {searchTerm && <p className="text-xs mt-1">Try adjusting your search terms</p>}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout - visible on small screens */}
            <div className="block md:hidden divide-y divide-gray-200">
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <Avatar
                        src={assessment.avatar}
                        fallback={assessment.studentName.charAt(0)}
                        className="flex-shrink-0 w-10 h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {assessment.studentName}
                        </h3>
                        <p className="text-sm text-gray-500">{assessment.program}</p>
                        <p className="text-xs text-gray-400">{assessment.year}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2",
                        getRiskColor(assessment.riskLevel)
                      )}
                    >
                      {formatRiskLevel(assessment.riskLevel)}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Problems:</span>
                      <span className="text-sm text-gray-900">{assessment.totalProblems}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="text-sm text-gray-900">{assessment.date}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contact:</span>
                      <span className="text-sm text-gray-900">{assessment.contactNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout - hidden on small screens */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problems
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Number
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={assessment.avatar}
                            fallback={assessment.studentName.charAt(0)}
                            className="w-8 h-8 mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.studentName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            getRiskColor(assessment.riskLevel)
                          )}
                        >
                          {formatRiskLevel(assessment.riskLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.totalProblems}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.program}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.contactNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
