import { StudentService } from "@/services";
import type {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "@/services/student.service";
import type { PaginatedResponse, QueryParams } from "@/services/api.config";
import { useState } from "react";

interface StudentsState {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export const useStudents = () => {
  const [state, setState] = useState<StudentsState>({
    students: [],
    currentStudent: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const fetchStudents = async (params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Student> = await StudentService.getAllStudents(params);

      setState((prev) => ({
        ...prev,
        students: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        loading: false,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch students";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const fetchStudentById = async (id: string, params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const student = await StudentService.getStudentById(id, params);

      setState((prev) => ({
        ...prev,
        currentStudent: student,
        loading: false,
      }));

      return student;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch student";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const createStudent = async (data: CreateStudentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const student = await StudentService.createStudent(data);

      setState((prev) => ({
        ...prev,
        students: [student, ...prev.students],
        total: prev.total + 1,
        loading: false,
      }));

      return student;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create student";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const updateStudent = async (id: string, data: UpdateStudentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedStudent = await StudentService.updateStudent(id, data);

      setState((prev) => ({
        ...prev,
        students: prev.students.map((student) => (student.id === id ? updatedStudent : student)),
        currentStudent: prev.currentStudent?.id === id ? updatedStudent : prev.currentStudent,
        loading: false,
      }));

      return updatedStudent;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update student";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await StudentService.deleteStudent(id);

      setState((prev) => ({
        ...prev,
        students: prev.students.filter((student) => student.id !== id),
        total: prev.total - 1,
        currentStudent: prev.currentStudent?.id === id ? null : prev.currentStudent,
        loading: false,
      }));

      return { message: "Student deleted successfully" };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete student";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const refreshStudents = async (params?: QueryParams) => {
    return await fetchStudents(params);
  };

  const resetState = () => {
    setState({
      students: [],
      currentStudent: null,
      loading: false,
      error: null,
      total: 0,
      page: 1,
      totalPages: 0,
    });
  };

  return {
    // State
    students: state.students,
    currentStudent: state.currentStudent,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,

    // Actions
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    refreshStudents,
    resetState,
    clearError,
  };
};
