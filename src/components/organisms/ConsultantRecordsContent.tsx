import React, { useState, useEffect } from "react";
import {
  ConsultantRecordModal,
  StudentRecordsModal,
  ConfirmationModal,
} from "@/components/molecules";
import { useStudents, useAuth } from "@/hooks";
import type { ConsultantRecord } from "@/types/consultant-record.types";
import { StudentService } from "@/services/student.service";
import { Plus, Search, RefreshCw, FileText, User } from "lucide-react";
import { Button } from "@/components/ui";
import { LoadingScreen, Avatar } from "@/components/atoms";

export const ConsultantRecordsContent: React.FC = () => {
  const { user } = useAuth();
  const { students, loading: studentsLoading, fetchStudents } = useStudents();

  const [records, setRecords] = useState<ConsultantRecord[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [recordSearchTerm, setRecordSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConsultantRecord | null>(null);
  const [selectedStudentForNewRecord, setSelectedStudentForNewRecord] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStudentRecordsModalOpen, setIsStudentRecordsModalOpen] = useState(false);
  const [selectedStudentForViewAll, setSelectedStudentForViewAll] = useState<string>("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ConsultantRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isGuidanceUser = user?.type === "guidance";

  // Fetch students (server-side search)
  useEffect(() => {
    if (!isGuidanceUser) return;

    const timeout = setTimeout(async () => {
      try {
        await fetchStudents({
          limit: 10,
          fields:
            "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender,person.users.id,person.users.avatar",
          ...(studentSearchTerm.trim() ? { query: studentSearchTerm.trim() } : {}),
        });
      } catch (error) {
        console.error("Error loading students:", error);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [isGuidanceUser, studentSearchTerm]);

  // Extract consultant records from students
  useEffect(() => {
    if (students.length > 0) {
      const extractedRecords: ConsultantRecord[] = [];

      students.forEach((student) => {
        if (student.notes && student.notes.length > 0) {
          student.notes.forEach((note, index) => {
            if (note.title || note.content) {
              extractedRecords.push({
                id: `${student.id}-${index}`,
                studentId: student.id,
                title: note.title || `Consultant Record ${index + 1}`,
                content: note.content || "",
                consultationDate: note.createdAt || new Date().toISOString(), // Use note's createdAt or fallback
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
                student: student,
              });
            }
          });
        }
      });

      // Sort by consultation date (newest first)
      extractedRecords.sort(
        (a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime(),
      );

      setRecords(extractedRecords);
    }
  }, [students]);

  const filteredStudents = React.useMemo(() => students, [students]);

  const recordStatsByStudentId = React.useMemo(() => {
    const stats: Record<string, { count: number; latestDate?: string }> = {};
    records.forEach((record) => {
      const existing = stats[record.studentId];
      if (!existing) {
        stats[record.studentId] = { count: 1, latestDate: record.consultationDate };
        return;
      }
      existing.count += 1;
      if (
        record.consultationDate &&
        (!existing.latestDate ||
          new Date(record.consultationDate).getTime() > new Date(existing.latestDate).getTime())
      ) {
        existing.latestDate = record.consultationDate;
      }
    });
    return stats;
  }, [records]);

  const selectedStudentRecords = React.useMemo(() => {
    if (!selectedStudentId) return [];
    let filtered = records.filter((record) => record.studentId === selectedStudentId);

    if (recordSearchTerm) {
      const searchLower = recordSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(searchLower) ||
          record.content.toLowerCase().includes(searchLower),
      );
    }

    if (startDate) {
      const startDateTime = new Date(startDate).getTime();
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.consultationDate).getTime();
        return recordDate >= startDateTime;
      });
    }

    if (endDate) {
      const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.consultationDate).getTime();
        return recordDate <= endDateTime;
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime(),
    );
  }, [records, selectedStudentId, recordSearchTerm, startDate, endDate]);

  const handleCreateRecordForStudent = (studentId: string) => {
    setEditingRecord(null);
    setSelectedStudentForNewRecord(studentId);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: ConsultantRecord) => {
    setEditingRecord(record);
    setSelectedStudentForNewRecord("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setSelectedStudentForNewRecord("");
    setError(null);
  };

  const handleViewAllRecords = (studentId: string) => {
    setSelectedStudentForViewAll(studentId);
    setIsStudentRecordsModalOpen(true);
  };

  const handleCloseStudentRecordsModal = () => {
    setIsStudentRecordsModalOpen(false);
    setSelectedStudentForViewAll("");
  };

  const handleStudentRecordsModalInteraction = () => {
    // Close the student records modal when user wants to add/edit a record
    setIsStudentRecordsModalOpen(false);
    setSelectedStudentForViewAll("");
  };

  const handleSaveRecord = async (recordData: {
    title: string;
    content: string;
    studentId: string;
    consultationDate: string;
  }) => {
    setLoading(true);
    try {
      // Find the student to update
      const student = students.find((s) => s.id === recordData.studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      // Get existing notes or initialize empty array
      const existingNotes = student.notes || [];

      let updatedNotes;

      // Convert date string to ISO DateTime format
      const consultationDateTime = new Date(recordData.consultationDate).toISOString();

      if (editingRecord) {
        // Update existing record - find the note by its index in the original array
        const noteIndex = parseInt(editingRecord.id.split("-").pop() || "0");
        updatedNotes = existingNotes.map((note, index) =>
          index === noteIndex
            ? {
                title: recordData.title,
                content: recordData.content,
                createdAt: consultationDateTime,
              }
            : note,
        );
      } else {
        // Add new record
        updatedNotes = [
          ...existingNotes,
          {
            title: recordData.title,
            content: recordData.content,
            createdAt: consultationDateTime,
          },
        ];
      }

      // Update the student with the new notes array
      await StudentService.updateStudent(student.id, {
        notes: updatedNotes,
      });

      // Refresh students data to get updated records
      await fetchStudents({
        limit: 100,
        fields:
          "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender",
      });

      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error saving record:", error);
      setError("Failed to save record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = React.useMemo(() => {
    return students.find((student) => student.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const handleDeleteRecord = (record: ConsultantRecord) => {
    setRecordToDelete(record);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      // Find the student to update
      const student = students.find((s) => s.id === recordToDelete.studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      // Get existing notes
      const existingNotes = student.notes || [];

      // Find the note index to delete
      const noteIndex = parseInt(recordToDelete.id.split("-").pop() || "0");

      // Remove the note at the specified index
      const updatedNotes = existingNotes.filter((_, index) => index !== noteIndex);

      // Update the student with the new notes array
      await StudentService.updateStudent(student.id, {
        notes: updatedNotes,
      });

      // Refresh students data to get updated records
      await fetchStudents({
        limit: 100,
        fields:
          "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender",
      });

      setShowConfirmDelete(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Error deleting record:", error);
      setError("Failed to delete record. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setRecordToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setRecordSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  if (!isGuidanceUser) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600">Only guidance counselors can access consultant records.</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingScreen isLoading={isDeleting} message="Deleting consultation record...">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-4 md:mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                Consultation Records
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Manage consultation notes and records for students
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Student Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Students</h2>
                  <p className="text-xs text-gray-500">
                    Select a student to view consultation records
                  </p>
                </div>
                <div className="text-xs text-gray-500">{filteredStudents.length} found</div>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {studentsLoading ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Loading students...</span>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No students found</div>
              ) : (
                <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program & Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Records
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Latest
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredStudents.slice(0, 10).map((student) => {
                        const stats = recordStatsByStudentId[student.id];
                        const isSelected = selectedStudentId === student.id;
                        return (
                          <tr
                            key={student.id}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-primary-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleSelectStudent(student.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <Avatar
                                  src={student.person?.users?.[0]?.avatar}
                                  fallback={(student.person?.firstName || "S").charAt(0)}
                                  className="w-9 h-9"
                                />
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {student.person?.firstName} {student.person?.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{student.program}</div>
                              <div className="text-xs text-gray-500">Year {student.year}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{stats?.count ?? 0}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {stats?.latestDate ? formatDate(stats.latestDate) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-800 hover:bg-primary-50"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleSelectStudent(student.id);
                                }}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {selectedStudent
                        ? `${selectedStudent.person?.firstName} ${selectedStudent.person?.lastName}`
                        : "No student selected"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedStudent
                        ? `${selectedStudent.program} • Year ${selectedStudent.year}`
                        : "Select a student from the table to view records"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      selectedStudent && handleCreateRecordForStudent(selectedStudent.id)
                    }
                    className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
                    disabled={!selectedStudent}
                  >
                    <Plus className="w-4 h-4" />
                    Add Record
                  </Button>
                </div>
              </div>
            </div>

            {!selectedStudent ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a student</h3>
                  <p className="text-sm">
                    Consultation notes are hidden for privacy. Choose a student to view records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={recordSearchTerm}
                        onChange={(e) => setRecordSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="startDate"
                          className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                          From:
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={endDate || new Date().toISOString().split("T")[0]}
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="endDate"
                          className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                          To:
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate}
                          max={new Date().toISOString().split("T")[0]}
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>

                      {(startDate || endDate) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Clear Dates
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAllRecords(selectedStudent.id)}
                        className="text-primary-700 border-primary-200 hover:bg-primary-50"
                      >
                        View Notes
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedStudentRecords.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No consultation records found for this student.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Consultation Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Updated
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedStudentRecords.map((record) => (
                          <tr
                            key={record.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewAllRecords(record.studentId)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 truncate">
                                {record.title}
                              </div>
                              <div className="text-xs text-gray-500">Record ID: {record.id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatDate(record.consultationDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(record.updatedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleEditRecord(record);
                                  }}
                                  className="text-gray-600 hover:text-primary-600"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteRecord(record);
                                  }}
                                  className="text-gray-600 hover:text-red-600"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <ConsultantRecordModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRecord}
          students={students}
          record={editingRecord}
          preSelectedStudentId={selectedStudentForNewRecord}
          loading={loading}
        />

        {/* Student Records Modal */}
        <StudentRecordsModal
          isOpen={isStudentRecordsModalOpen}
          onClose={handleCloseStudentRecordsModal}
          student={students.find((s) => s.id === selectedStudentForViewAll) || null}
          records={records.filter((r) => r.studentId === selectedStudentForViewAll)}
          onEdit={handleEditRecord}
          onCreateNew={handleCreateRecordForStudent}
          onDelete={handleDeleteRecord}
          formatDate={formatDate}
          onModalInteraction={handleStudentRecordsModalInteraction}
        />

        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          isOpen={showConfirmDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Consultation Record"
          message={`Are you sure you want to delete "${recordToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          loading={false}
        />
      </div>
    </LoadingScreen>
  );
};
