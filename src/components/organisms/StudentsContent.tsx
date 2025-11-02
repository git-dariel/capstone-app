import React, { useState, useEffect } from "react";
import { StudentsTable, StudentDrawer } from "@/components/molecules";
import { useStudents } from "@/hooks";
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

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Student Records</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Comprehensive view of all student records
            </p>
          </div>
        </div>
      </div>
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
    </div>
  );
};
