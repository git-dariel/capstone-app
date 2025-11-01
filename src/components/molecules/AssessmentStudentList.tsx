import React from "react";
import type { StudentDetails } from "@/types/insights";

interface AssessmentStudentListProps {
  students: StudentDetails[];
  loading?: boolean;
  title?: string;
}

export const AssessmentStudentList: React.FC<AssessmentStudentListProps> = ({
  students,
  loading = false,
  title = "Student List",
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "minimal":
      case "low":
        return "bg-green-100 text-green-800";
      case "mild":
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "moderate-severe":
      case "moderately severe":
      case "high":
        return "bg-orange-100 text-orange-800";
      case "severe":
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {students.length} student{students.length !== 1 ? "s" : ""} found matching your criteria
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year Level
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{student.studentNumber}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{student.email}</div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.program.toUpperCase()}</div>
                  <div className="text-xs text-gray-500 sm:hidden">{student.year}</div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.year}
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {student.gender}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                      student.severity
                    )}`}
                  >
                    {student.severity || "N/A"}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.score !== undefined ? student.score : "N/A"}
                </td>
                <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.assessmentDate ? new Date(student.assessmentDate).toLocaleDateString() : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500">No students found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
