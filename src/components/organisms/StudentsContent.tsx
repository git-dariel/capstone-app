import React, { useState, useEffect } from "react";
import { StudentsTable, StudentDrawer } from "@/components/molecules";
import { useStudents, useAuth, useToast } from "@/hooks";
import { StudentService } from "@/services/student.service";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { ToastContainer } from "@/components/atoms";
import type {
  CreateStudentRequest,
  UpdateStudentRequest,
  Student,
} from "@/services/student.service";

// Constants for consistent data fetching
const STUDENT_FIELDS =
  "id,studentNumber,program,year,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender,person.users.id,person.users.avatar,person.users.anxietyAssessments,person.users.depressionAssessments,person.users.stressAssessments,person.users.suicideAssessments";

export const StudentsContent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isUpdatingYearLevels, setIsUpdatingYearLevels] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { user } = useAuth();
  const { success, error: toastError, toasts, removeToast } = useToast();
  const isGuidance = user?.type === "guidance";

  const {
    students,
    createStudent,
    updateStudent,
    deleteStudent,
    loading,
    error,
    clearError,
    fetchStudents,
  } = useStudents();

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents({
      limit: 100,
      fields: STUDENT_FIELDS,
    }).catch(console.error);
  }, []);

  const handleCreateStudent = async (data: CreateStudentRequest) => {
    setModalError(null);
    try {
      await createStudent(data);

      // Refetch all students with full assessment data to ensure the table shows correct information
      await fetchStudents({
        limit: 100,
        fields: STUDENT_FIELDS,
      });

      setIsModalOpen(false);
      clearError(); // Clear any previous errors
    } catch (error: any) {
      setModalError(error.message || "Failed to create student");
    }
  };

  const handleUpdateStudent = async (id: string, data: UpdateStudentRequest) => {
    setModalError(null);
    try {
      await updateStudent(id, data);

      // Refetch all students with full assessment data to ensure the table shows correct information
      await fetchStudents({
        limit: 100,
        fields: STUDENT_FIELDS,
      });

      setIsModalOpen(false);
      setEditingStudent(null);
      clearError(); // Clear any previous errors
    } catch (error: any) {
      setModalError(error.message || "Failed to update student");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      setIsModalOpen(false);
      setEditingStudent(null);
      clearError(); // Clear any previous errors
    } catch (error: any) {
      setModalError(error.message || "Failed to delete student");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setModalError(null);
    clearError();
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setModalError(null);
    clearError();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setModalError(null);
    clearError();
  };

  const handleDeleteFromTable = (student: Student) => {
    // Optional: show a toast or notification when student is deleted from table
    console.log("Student deleted:", student.person?.firstName, student.person?.lastName);
  };

  const handleUpdateYearLevels = async () => {
    setIsUpdatingYearLevels(true);
    try {
      const result = await StudentService.updateYearLevels();

      success(
        "Year Levels Updated",
        `Successfully updated ${result.updated} student(s). ${result.skipped} student(s) were already up to date.`
      );

      // Refresh student list to show updated year levels
      await fetchStudents({
        limit: 100,
        fields: STUDENT_FIELDS,
      });
    } catch (error: any) {
      toastError(
        "Update Failed",
        error.message || "Failed to update student year levels. Please try again."
      );
    } finally {
      setIsUpdatingYearLevels(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Student Records</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Comprehensive view of all student records
            </p>
            {isGuidance && (
              <p className="text-xs text-gray-500 mt-1">
                Year levels are automatically updated monthly. You can manually trigger an update if
                needed.
              </p>
            )}
          </div>
          {isGuidance && (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isUpdatingYearLevels}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingYearLevels ? "animate-spin" : ""}`} />
              <span>Update Year Levels</span>
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Update Year Levels</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will update all student year levels based on their enrollment year (extracted
              from student numbers). Year levels are already updated automatically on the 1st of
              each month. Do you want to proceed with a manual update now?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isUpdatingYearLevels}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateYearLevels}
                disabled={isUpdatingYearLevels}
                className="bg-primary-700 hover:bg-primary-800"
              >
                {isUpdatingYearLevels ? "Updating..." : "Update Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm">
        <StudentsTable
          students={students}
          loading={loading}
          error={error}
          onEdit={handleEditStudent}
          onDelete={handleDeleteFromTable}
          onCreate={handleOpenCreateModal}
          onDeleteConfirm={handleDeleteStudent}
        />
      </div>

      <StudentDrawer
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateStudent}
        onUpdate={handleUpdateStudent}
        onDelete={handleDeleteStudent}
        student={editingStudent}
        loading={loading}
        error={modalError || error}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
