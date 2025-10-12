import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, AlertCircle, Loader2, Edit, Trash2, Plus } from "lucide-react";
import { Avatar } from "@/components/atoms";
import { ConfirmationModal } from "./ConfirmationModal";
import { Button } from "@/components/ui";
import { useStudents } from "@/hooks";
import type { Student } from "@/services/student.service";

interface StudentTableData {
  id: string;
  studentName: string;
  program: string;
  year: string;
  email: string;
  contactNumber: string;
  gender: string;
  avatar?: string;
  createdAt: string;
  notes?: Array<{
    title?: string;
    content?: string;
    isMinimized?: boolean;
  }>;
  latestAssessment?: {
    type: "stress" | "anxiety" | "depression" | "suicide";
    severityLevel?:
      | "low"
      | "moderate"
      | "high"
      | "minimal"
      | "mild"
      | "severe"
      | "moderately_severe";
    riskLevel?: "low" | "moderate" | "high"; // For suicide assessments
    assessmentDate: string;
    totalScore?: number;
  } | null;
}

interface StudentsTableProps {
  students?: Student[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onView?: (student: Student) => void;
  onCreate?: () => void;
  onDeleteConfirm?: (id: string) => Promise<void>;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students: propStudents,
  loading: propLoading,
  error: propError,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onDeleteConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Use prop data if provided, otherwise fall back to hook
  const {
    students: hookStudents,
    loading: hookLoading,
    error: hookError,
    fetchStudents,
    deleteStudent,
  } = useStudents();

  const apiStudents = propStudents || hookStudents;
  const loading = propLoading !== undefined ? propLoading : hookLoading;
  const error = propError !== undefined ? propError : hookError;

  // Fetch students on component mount only if no prop data is provided
  useEffect(() => {
    if (!propStudents) {
      fetchStudents({
        limit: 100,
        fields:
          "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender,person.users.id,person.users.avatar,person.users.anxietyAssessments,person.users.depressionAssessments,person.users.stressAssessments,person.users.suicideAssessments",
      }).catch(console.error);
    }
  }, [propStudents]);

  // Transform API data to table format
  const allStudents: StudentTableData[] = useMemo(() => {
    return apiStudents.map((student: Student) => {
      const person = student.person;

      // Find the latest assessment from all assessment types
      const getLatestAssessment = (person: any) => {
        if (!person?.users?.[0]) return null;

        const user = person.users[0]; // Assuming first user for now
        const allAssessments = [];

        // Collect all assessments with their types
        if (user.anxietyAssessments?.[0]) {
          allAssessments.push({
            type: "anxiety" as const,
            severityLevel: user.anxietyAssessments[0].severityLevel,
            assessmentDate: user.anxietyAssessments[0].assessmentDate,
            totalScore: user.anxietyAssessments[0].totalScore,
          });
        }

        if (user.depressionAssessments?.[0]) {
          allAssessments.push({
            type: "depression" as const,
            severityLevel: user.depressionAssessments[0].severityLevel,
            assessmentDate: user.depressionAssessments[0].assessmentDate,
            totalScore: user.depressionAssessments[0].totalScore,
          });
        }

        if (user.stressAssessments?.[0]) {
          allAssessments.push({
            type: "stress" as const,
            severityLevel: user.stressAssessments[0].severityLevel,
            assessmentDate: user.stressAssessments[0].assessmentDate,
            totalScore: user.stressAssessments[0].totalScore,
          });
        }

        if (user.suicideAssessments?.[0]) {
          allAssessments.push({
            type: "suicide" as const,
            riskLevel: user.suicideAssessments[0].riskLevel,
            assessmentDate: user.suicideAssessments[0].assessmentDate,
          });
        }

        // Find the most recent assessment
        if (allAssessments.length === 0) return null;

        return allAssessments.reduce((latest, current) => {
          const latestDate = new Date(latest.assessmentDate);
          const currentDate = new Date(current.assessmentDate);
          return currentDate > latestDate ? current : latest;
        });
      };

      return {
        id: student.id,
        studentName: person ? `${person.firstName} ${person.lastName}` : "Unknown Student",
        program: student.program,
        year: student.year,
        email: person?.email || "N/A",
        contactNumber: person?.contactNumber || "N/A",
        gender: person?.gender || "N/A",
        avatar: person?.users?.[0]?.avatar, // Get avatar from user account
        notes: student.notes || [],
        createdAt: student.createdAt,
        latestAssessment: getLatestAssessment(person),
      };
    });
  }, [apiStudents]);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents;
    return allStudents.filter((student) => {
      const searchLower = searchTerm.toLowerCase();

      // Basic student info search
      const basicMatch =
        student.studentName.toLowerCase().includes(searchLower) ||
        student.program.toLowerCase().includes(searchLower) ||
        student.year.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower);

      // Assessment search
      const assessmentMatch =
        student.latestAssessment &&
        (student.latestAssessment.type.toLowerCase().includes(searchLower) ||
          (student.latestAssessment.severityLevel &&
            student.latestAssessment.severityLevel.toLowerCase().includes(searchLower)) ||
          (student.latestAssessment.riskLevel &&
            student.latestAssessment.riskLevel.toLowerCase().includes(searchLower)));

      // Consultant Records search
      const notesMatch =
        student.notes &&
        student.notes.some(
          (note) =>
            (note.title && note.title.toLowerCase().includes(searchLower)) ||
            (note.content && note.content.toLowerCase().includes(searchLower))
        );

      return basicMatch || assessmentMatch || notesMatch;
    });
  }, [searchTerm, allStudents]);

  // Get students to display (limited by displayCount)
  const students = useMemo(() => {
    return filteredStudents.slice(0, displayCount);
  }, [filteredStudents, displayCount]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (displayCount < filteredStudents.length) {
        setDisplayCount((prev) => Math.min(prev + 10, filteredStudents.length));
      }
    }
  };

  // Reset display count when search term changes
  useEffect(() => {
    setDisplayCount(10);
  }, [searchTerm]);

  const handleEdit = (studentData: StudentTableData) => {
    const originalStudent = apiStudents.find((s) => s.id === studentData.id);
    if (originalStudent && onEdit) {
      onEdit(originalStudent);
    }
  };

  const handleView = (studentData: StudentTableData) => {
    const originalStudent = apiStudents.find((s) => s.id === studentData.id);
    if (originalStudent && onView) {
      onView(originalStudent);
    }
  };

  const handleDeleteClick = (studentData: StudentTableData) => {
    const originalStudent = apiStudents.find((s) => s.id === studentData.id);
    if (originalStudent) {
      setDeletingStudent(originalStudent);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;

    setDeleteLoading(true);
    try {
      if (onDeleteConfirm) {
        await onDeleteConfirm(deletingStudent.id);
      } else {
        await deleteStudent(deletingStudent.id);
      }
      setDeletingStudent(null);
      if (onDelete) {
        onDelete(deletingStudent);
      }
    } catch (error) {
      console.error("Failed to delete student:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderAssessmentInfo = (assessment: StudentTableData["latestAssessment"]) => {
    if (!assessment) {
      return <div className="text-sm text-gray-400">No assessment</div>;
    }

    // Get the severity/risk level - suicide uses riskLevel, others use severityLevel
    const level = assessment.type === "suicide" ? assessment.riskLevel : assessment.severityLevel;

    if (!level) {
      return <div className="text-sm text-gray-400">Assessment incomplete</div>;
    }

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        // Low risk/severity levels
        case "low":
        case "minimal":
          return "text-green-600 bg-green-50 border-green-200";
        // Mild levels
        case "mild":
          return "text-blue-600 bg-blue-50 border-blue-200";
        // Moderate levels
        case "moderate":
          return "text-yellow-600 bg-yellow-50 border-yellow-200";
        // High severity levels
        case "moderately_severe":
          return "text-orange-600 bg-orange-50 border-orange-200";
        case "high":
        case "severe":
          return "text-red-600 bg-red-50 border-red-200";
        default:
          return "text-gray-600 bg-gray-50 border-gray-200";
      }
    };
    // Tailwind safelist: text-orange-600 bg-orange-50 border-orange-200

    const getTypeColor = (type: string) => {
      switch (type) {
        case "stress":
          return "text-blue-600";
        case "anxiety":
          return "text-purple-600";
        case "depression":
          return "text-indigo-600";
        case "suicide":
          return "text-red-800";
        default:
          return "text-gray-600";
      }
    };

    const formatSeverityLabel = (severity: string) => {
      switch (severity) {
        case "moderately_severe":
          return "Moderately Severe";
        default:
          return severity.charAt(0).toUpperCase() + severity.slice(1);
      }
    };

    return (
      <div className="space-y-1">
        <div className={`text-xs font-medium ${getTypeColor(assessment.type)} capitalize`}>
          {assessment.type === "suicide" ? "Suicide Risk" : assessment.type}
        </div>
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
            level
          )}`}
        >
          {formatSeverityLabel(level)}
        </div>
        <div className="text-xs text-gray-500">{formatDate(assessment.assessmentDate)}</div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Students</h2>
              <p className="text-sm text-gray-500">
                {loading
                  ? "Loading students..."
                  : `Showing ${students.length} of ${filteredStudents.length} students`}
              </p>
            </div>
            {onCreate && (
              <Button
                onClick={onCreate}
                className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 justify-center md:justify-start w-full md:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="md:inline">Add Student</span>
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, program, year, email, notes, or assessment..."
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
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading students...</span>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <p className="text-sm">No students found</p>
                {searchTerm && <p className="text-xs mt-1">Try adjusting your search terms</p>}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout - visible on small screens */}
              <div className="block md:hidden divide-y divide-gray-200">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 hover:bg-[#fdf2f6] transition-colors touch-manipulation"
                    onClick={() => handleView(student)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Avatar
                          src={student.avatar}
                          fallback={student.studentName.charAt(0)}
                          className="flex-shrink-0 w-10 h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {student.studentName}
                          </h3>
                          <p className="text-sm text-gray-500">{student.program}</p>
                          <p className="text-xs text-gray-400">{student.year}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(student);
                            }}
                            className="text-primary-600 hover:text-primary-900 hover:bg-primary-50 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(student);
                            }}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-3">
                      {/* Contact Info */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="mr-2">📱</span>
                          {student.contactNumber}
                        </div>
                        <div className="text-xs text-gray-400">
                          Gender: {student.gender} • Added: {formatDate(student.createdAt)}
                        </div>
                      </div>

                      {/* Latest Assessment */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Latest Assessment
                        </div>
                        {renderAssessmentInfo(student.latestAssessment)}
                      </div>

                      {/* Consultant Records */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-600">Consultant Records</div>
                        {student.notes && student.notes.length > 0 ? (
                          <>
                            {student.notes.length === 1 ? (
                              <div className="bg-primary-50 border border-primary-200 rounded-md px-2 py-1">
                                {student.notes[0].title ? (
                                  <div className="text-xs font-medium text-primary-900 truncate">
                                    {student.notes[0].title}
                                  </div>
                                ) : (
                                  <div className="text-xs text-primary-700 italic">
                                    Untitled consultant record
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-primary-50 border border-primary-200 rounded-md text-center py-1">
                                <div className="text-xs font-medium text-primary-900 truncate">
                                  {student.notes.length} consultant records
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-400">No consultant records</div>
                        )}
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
                        Program & Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latest Assessment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consultant Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-[#fdf2f6] transition-colors cursor-pointer group relative"
                        onClick={() => handleView(student)}
                        title="Click to view student details"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar
                              src={student.avatar}
                              fallback={student.studentName.charAt(0)}
                              className="w-8 h-8 mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.studentName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.program}</div>
                          <div className="text-sm text-gray-500">{student.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          <div className="text-sm text-gray-500">{student.contactNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderAssessmentInfo(student.latestAssessment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1 max-w-xs">
                            {student.notes && student.notes.length > 0 ? (
                              <>
                                {student.notes.length === 1 ? (
                                  // Single note: show the title
                                  <div className="bg-primary-50 border border-primary-200 rounded-md px-2 py-1">
                                    {student.notes[0].title ? (
                                      <div className="text-xs font-medium text-primary-900 truncate">
                                        {student.notes[0].title}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-primary-700 italic">
                                        Untitled consultant record
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // Multiple notes: show highlighted count
                                  <div className="bg-primary-50 border border-primary-200 rounded-md text-center py-1">
                                    <div className="text-xs font-medium text-primary-900 truncate">
                                      {student.notes.length} consultant records
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-gray-400">No consultant records</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(student);
                                }}
                                className="text-primary-600 hover:text-primary-900 hover:bg-primary-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(student);
                                }}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message={`Are you sure you want to delete ${deletingStudent?.person?.firstName} ${deletingStudent?.person?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={deleteLoading}
      />
    </>
  );
};
