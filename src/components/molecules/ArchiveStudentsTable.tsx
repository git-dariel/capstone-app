import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Archive,
  Calendar,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import type { Student } from "@/services/student.service";
import { StudentDetailsModal } from "./StudentDetailsModal";
import { Avatar } from "@/components/atoms";
import { UserService } from "@/services";
import { useToast } from "@/hooks";

interface ArchiveStudentsTableProps {
  students: Student[];
  loading: boolean;
  error: string | null;
}

export const ArchiveStudentsTable: React.FC<ArchiveStudentsTableProps> = ({
  students,
  loading,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { addToast } = useToast();
  const studentsPerPage = 10;

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.studentNumber.toLowerCase().includes(query) ||
      student.person?.firstName?.toLowerCase().includes(query) ||
      student.person?.lastName?.toLowerCase().includes(query) ||
      student.person?.email?.toLowerCase().includes(query) ||
      student.program.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
    setIsDetailsModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailsModalOpen(false);
    setViewingStudent(null);
  };

  const handleExportCsv = async () => {
    try {
      setExportLoading(true);

      // Export only graduated students
      await UserService.exportStudentDataCsv({ year: "graduated" });

      addToast({
        title: "Export Successful",
        message: "Archived student data has been exported to CSV",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      addToast({
        title: "Export Failed",
        message: error.message || "Failed to export archived student data",
        type: "error",
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <Archive className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Archived Students ({filteredStudents.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportCsv}
              disabled={exportLoading || filteredStudents.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className={`w-4 h-4 ${exportLoading ? "animate-spin" : ""}`} />
              <span>{exportLoading ? "Exporting..." : "Export CSV"}</span>
            </Button>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, student number, or program..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table with Mobile/Desktop Responsive Design */}
        {paginatedStudents.length > 0 ? (
          <>
            {/* Mobile Card Layout - visible on small screens */}
            <div className="block md:hidden divide-y divide-gray-200">
              {paginatedStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 hover:bg-[#fdf2f6] transition-colors touch-manipulation"
                  onClick={() => handleView(student)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <Avatar
                        src={student.person?.users?.[0]?.avatar}
                        fallback={`${student.person?.firstName?.charAt(0) || ""}${
                          student.person?.lastName?.charAt(0) || ""
                        }`}
                        className="flex-shrink-0 w-10 h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {student.person?.firstName} {student.person?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{student.program}</p>
                        <p className="text-xs text-gray-400">{student.studentNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {student.person?.email || "No email"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="mr-2">📱</span>
                        {student.person?.contactNumber || "No contact"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Status: {student.status} • Archived:{" "}
                        {new Date(student.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Consultation Records */}
                    {student.notes && student.notes.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-600">
                          Consultation Records
                        </div>
                        {student.notes.length === 1 ? (
                          <div className="bg-primary-50 border border-primary-200 rounded-md px-2 py-1">
                            {student.notes[0].title ? (
                              <div className="text-xs font-medium text-primary-900 truncate">
                                {student.notes[0].title}
                              </div>
                            ) : (
                              <div className="text-xs text-primary-700 italic">
                                Untitled consultation record
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-primary-50 border border-primary-200 rounded-md text-center py-1">
                            <div className="text-xs font-medium text-primary-900 truncate">
                              {student.notes.length} consultation records
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout - hidden on small screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archived Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-[#fdf2f6] transition-colors cursor-pointer group relative"
                      onClick={() => handleView(student)}
                      title="Click to view student details"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={student.person?.users?.[0]?.avatar}
                            fallback={`${student.person?.firstName?.charAt(0) || ""}${
                              student.person?.lastName?.charAt(0) || ""
                            }`}
                            className="w-8 h-8 mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.person?.firstName} {student.person?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.studentNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{student.program}</div>
                            <div className="text-sm text-gray-500">
                              Status: {student.status || "Not specified"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.person?.email || "No email"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.person?.contactNumber || "No contact"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(student.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + studentsPerPage, filteredStudents.length)} of{" "}
                  {filteredStudents.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No students found" : "No archived students"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Students will appear here when they graduate"}
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeModal}
        student={viewingStudent}
      />
    </>
  );
};
