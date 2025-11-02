import React, { useState, useEffect } from "react";
import {
  ConsultantRecordModal,
  StackedConsultantCards,
  StudentRecordsModal,
  ConfirmationModal,
} from "@/components/molecules";
import { useStudents, useAuth } from "@/hooks";
import type { ConsultantRecord } from "@/types/consultant-record.types";
import { StudentService } from "@/services/student.service";
import { Plus, Search, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui";
import { LoadingScreen } from "@/components/atoms";

export const ConsultantRecordsContent: React.FC = () => {
  const { user } = useAuth();
  const { students, loading: studentsLoading, fetchStudents } = useStudents();

  const [records, setRecords] = useState<ConsultantRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ConsultantRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
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

  // Fetch students on component mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        await fetchStudents({
          limit: 100,
          fields:
            "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender,person.users.id,person.users.avatar",
        });
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };

    if (isGuidanceUser) {
      loadStudents();
    }
  }, [isGuidanceUser]);

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
        (a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
      );

      setRecords(extractedRecords);
    }
  }, [students]);

  // Filter records based on search and student selection
  useEffect(() => {
    let filtered = records;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(searchLower) ||
          record.content.toLowerCase().includes(searchLower) ||
          (record.student &&
            `${record.student.person?.firstName} ${record.student.person?.lastName}`
              .toLowerCase()
              .includes(searchLower))
      );
    }

    // Filter by selected student
    if (selectedStudent !== "all") {
      filtered = filtered.filter((record) => record.studentId === selectedStudent);
    }

    // Filter by date range
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

    setFilteredRecords(filtered);
  }, [records, searchTerm, selectedStudent, startDate, endDate]);

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setSelectedStudentForNewRecord("");
    setIsModalOpen(true);
  };

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
            : note
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

  // Group records by student
  const groupedRecords = React.useMemo(() => {
    const groups: { [studentId: string]: ConsultantRecord[] } = {};

    filteredRecords.forEach((record) => {
      if (!groups[record.studentId]) {
        groups[record.studentId] = [];
      }
      groups[record.studentId].push(record);
    });

    // Sort records within each group by creation date (newest first)
    Object.keys(groups).forEach((studentId) => {
      groups[studentId].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return groups;
  }, [filteredRecords]);

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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchStudents({
        limit: 100,
        fields:
          "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button
                onClick={handleCreateRecord}
                className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Records</h3>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900 mt-1">{records.length}</p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Active Students</h3>
            <p className="text-lg sm:text-2xl font-semibold text-blue-600 mt-1">
              {new Set(records.map((r) => r.studentId)).size}
            </p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">This Month</h3>
            <p className="text-lg sm:text-2xl font-semibold text-green-600 mt-1">
              {
                records.filter((r) => {
                  const consultDate = new Date(r.consultationDate);
                  const now = new Date();
                  return (
                    consultDate.getMonth() === now.getMonth() &&
                    consultDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Filtered Results</h3>
            <p className="text-lg sm:text-2xl font-semibold text-purple-600 mt-1">
              {filteredRecords.length}
            </p>
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

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* First Row: Search and Student Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* Student Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 w-full sm:min-w-[200px]"
                >
                  <option value="all">All Students</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.person?.firstName} {student.person?.lastName} ({student.program})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second Row: Date Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  From:
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  To:
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
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
            </div>
          </div>
        </div>

        {/* Records Grid */}
        {studentsLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading consultant records...</span>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
              <p className="text-sm mb-4">
                {searchTerm || selectedStudent !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by creating your first consultant record"}
              </p>
              {!searchTerm && selectedStudent === "all" && (
                <Button
                  onClick={handleCreateRecord}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Record
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(groupedRecords).map(([studentId, studentRecords]) => (
              <StackedConsultantCards
                key={studentId}
                records={studentRecords}
                onEdit={handleEditRecord}
                onCreateNew={handleCreateRecordForStudent}
                onDelete={handleDeleteRecord}
                onViewAll={handleViewAllRecords}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

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
