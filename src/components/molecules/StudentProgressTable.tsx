import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ChevronLeft,
  FileText,
} from "lucide-react";
import {
  GuidanceDashboardService,
  type StudentProgressInsight,
  type StudentProgressOverview,
} from "@/services/guidance-dashboard.service";
import { Button } from "@/components/ui";
import { AssessmentHistoryModal } from "./AssessmentHistoryModal";

interface StudentProgressTableProps {
  className?: string;
}

export const StudentProgressTable: React.FC<StudentProgressTableProps> = ({ className = "" }) => {
  const [students, setStudents] = useState<StudentProgressInsight[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgressInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [summary, setSummary] = useState<StudentProgressOverview['summary'] | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressInsight | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const STUDENTS_PER_PAGE = 10;

  const loadStudentProgress = async (page: number = 1) => {
    try {
      setLoading(true);
      const overview = await GuidanceDashboardService.getStudentProgressOverview(page, STUDENTS_PER_PAGE);
      setStudents(overview.students);
      setFilteredStudents(overview.students);
      setSummary(overview.summary);
      setCurrentPage(overview.pagination.page);
      setTotalPages(overview.pagination.totalPages);
      setTotalStudents(overview.pagination.total);
    } catch (error: any) {
      setError(error.message || "Failed to load student progress data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentProgress(1);
  }, []);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading) {
      loadStudentProgress(page);
      setExpandedRows(new Set()); // Clear expanded rows when changing pages
    }
  };

  // Filter students based on search term (client-side within current page)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.studentName.toLowerCase().includes(searchLower) ||
        student.studentNumber?.toLowerCase().includes(searchLower) ||
        student.program.toLowerCase().includes(searchLower) ||
        student.year.toString().toLowerCase().includes(searchLower) ||
        student.riskLevel.toLowerCase().includes(searchLower)
      );
    });

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const toggleRowExpansion = (studentId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(studentId)) {
      newExpandedRows.delete(studentId);
    } else {
      newExpandedRows.add(studentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "improvement":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "decline":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "stable":
        return <Minus className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewAssessmentHistory = (student: StudentProgressInsight, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Student Progress Overview</h2>
            {summary && (
              <p className="text-sm text-gray-500 mt-1">
                {totalStudents} total students • Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students on current page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-[500px]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program & Year
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessments
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Assessment
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents && filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <React.Fragment key={student.studentId}>
                    {/* Main Row */}
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRowExpansion(student.studentId)}
                    >
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {expandedRows.has(student.studentId) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.studentName}
                            </div>
                            <div className="md:hidden text-xs text-gray-400 mt-1">
                              {student.program} • Year {student.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.program}</div>
                        <div className="text-sm text-gray-500">Year {student.year}</div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.totalAssessments.overall} total
                        </div>
                        <div className="text-xs text-gray-500">
                          A:{student.totalAssessments.anxiety} S:{student.totalAssessments.stress}{" "}
                          D:{student.totalAssessments.depression} SU:{student.totalAssessments.suicide} PC:{student.totalAssessments.checklist || 0}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(
                            student.riskLevel
                          )}`}
                        >
                          {student.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.lastAssessmentDate
                          ? formatDate(student.lastAssessmentDate)
                          : "No assessments"}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleRowExpansion(student.studentId)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <span className="hidden md:inline">
                              {expandedRows.has(student.studentId) ? "Hide Details" : "View Details"}
                            </span>
                            <span className="md:hidden">
                              {expandedRows.has(student.studentId) ? "Hide" : "View"}
                            </span>
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={(e) => handleViewAssessmentHistory(student, e)}
                            className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="hidden md:inline">History</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows.has(student.studentId) && (
                      <tr>
                        <td colSpan={6} className="px-3 md:px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Assessment Overview */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Assessment Overview
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">Anxiety</div>
                                  <div className="text-sm font-medium">
                                    {student.latestAssessments.anxiety
                                      ? `${student.latestAssessments.anxiety.totalScore} (${student.latestAssessments.anxiety.severityLevel})`
                                      : "No assessment"}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">Stress</div>
                                  <div className="text-sm font-medium">
                                    {student.latestAssessments.stress
                                      ? `${student.latestAssessments.stress.totalScore} (${student.latestAssessments.stress.severityLevel})`
                                      : "No assessment"}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">Depression</div>
                                  <div className="text-sm font-medium">
                                    {student.latestAssessments.depression
                                      ? `${student.latestAssessments.depression.totalScore} (${student.latestAssessments.depression.severityLevel})`
                                      : "No assessment"}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">Suicide Risk</div>
                                  <div className="text-sm font-medium">
                                    {student.latestAssessments.suicide
                                      ? `${student.latestAssessments.suicide.riskLevel.toUpperCase()}`
                                      : "No assessment"}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">Personal Checklist</div>
                                  <div className="text-sm font-medium">
                                    {student.latestAssessments.checklist
                                      ? `${student.latestAssessments.checklist.riskLevel?.toUpperCase() || 'Unknown'}`
                                      : "No assessment"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Progress Insights */}
                            {student.progressInsights.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Progress Insights
                                </h4>
                                <div className="space-y-2">
                                  {student.progressInsights.map((insight, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-3 rounded border flex items-start space-x-3"
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getInsightIcon(insight.type)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="text-sm font-medium text-gray-900">
                                            {insight.assessmentType.charAt(0).toUpperCase() +
                                              insight.assessmentType.slice(1)}
                                          </span>
                                          <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadgeColor(
                                              insight.severity
                                            )}`}
                                          >
                                            {insight.severity}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-1">
                                          {insight.message}
                                        </p>
                                        {insight.recommendation && (
                                          <p className="text-xs text-gray-500">
                                            {insight.recommendation}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 md:px-6 py-8 text-center text-gray-500">
                    No student data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(!students || students.length === 0) && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No student progress data available</p>
          </div>
        )}

        {students && students.length > 0 && filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No students found matching your search</p>
            <p className="text-xs text-gray-400 mt-1">Search is limited to the current page</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              Showing {Math.min((currentPage - 1) * STUDENTS_PER_PAGE + 1, totalStudents)} to{" "}
              {Math.min(currentPage * STUDENTS_PER_PAGE, totalStudents)} of {totalStudents} students
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="flex items-center touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <span className="text-sm text-gray-700 px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="flex items-center touch-manipulation"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment History Modal */}
      <AssessmentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        student={selectedStudent}
      />
    </div>
  );
};
