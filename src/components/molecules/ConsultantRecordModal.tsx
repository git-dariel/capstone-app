import React, { useState, useEffect, useRef } from "react";
import { Modal, FormField } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Save, FileText, Search, ChevronDown } from "lucide-react";
import type { Student } from "@/services/student.service";
import type { ConsultantRecord } from "@/types/consultant-record.types";

interface ConsultantRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; studentId: string }) => Promise<void>;
  students: Student[];
  record?: ConsultantRecord | null;
  preSelectedStudentId?: string;
  loading?: boolean;
}

interface FormData {
  title: string;
  content: string;
  studentId: string;
}

export const ConsultantRecordModal: React.FC<ConsultantRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  record,
  preSelectedStudentId,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    studentId: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!record;

  // Initialize form data when modal opens or record changes
  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          title: record.title,
          content: record.content,
          studentId: record.studentId,
        });
      } else {
        setFormData({
          title: "",
          content: "",
          studentId: preSelectedStudentId || (students.length > 0 ? students[0].id : ""),
        });
      }
      setErrors({});
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  }, [isOpen, record, students, preSelectedStudentId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.studentId) {
      newErrors.studentId = "Please select a student";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        title: formData.title.trim(),
        content: formData.content.trim(),
        studentId: formData.studentId,
      });
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: "", content: "", studentId: "" });
      setErrors({});
      setSearchTerm("");
      setIsDropdownOpen(false);
      onClose();
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setFormData((prev) => ({ ...prev, studentId }));
    setIsDropdownOpen(false);
    setSearchTerm("");

    // Clear error when user selects a student
    if (errors.studentId) {
      setErrors((prev) => ({ ...prev, studentId: undefined }));
    }
  };

  const isFormValid = formData.title.trim() && formData.content.trim() && formData.studentId;

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.person?.firstName || ""} ${
      student.person?.lastName || ""
    }`.toLowerCase();
    const program = student.program?.toLowerCase() || "";
    const year = student.year?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || program.includes(search) || year.includes(search);
  });

  // Get selected student info
  const selectedStudent = students.find((student) => student.id === formData.studentId);
  const selectedStudentLabel = selectedStudent
    ? `${selectedStudent.person?.firstName} ${selectedStudent.person?.lastName} - ${selectedStudent.program} (Year ${selectedStudent.year})`
    : "Select a student";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Consultant Record" size="lg">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Consultant Record" : "Create Consultant Record"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {isEditMode
                ? "Update the consultation notes"
                : "Add new consultation notes for a student"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Student Selection */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Custom Searchable Dropdown */}
              <button
                type="button"
                onClick={() =>
                  !loading &&
                  !isEditMode &&
                  !preSelectedStudentId &&
                  setIsDropdownOpen(!isDropdownOpen)
                }
                disabled={loading || isEditMode || !!preSelectedStudentId}
                className={`w-full h-10 px-3 py-2 text-left bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 flex items-center justify-between text-sm ${
                  errors.studentId
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              >
                <span className="truncate">{selectedStudentLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && !isEditMode && !preSelectedStudentId && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => handleStudentSelect(student.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {student.person?.firstName} {student.person?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.program} (Year {student.year})
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No students found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
            {(isEditMode || preSelectedStudentId) && (
              <p className="text-xs text-gray-500 mt-1">
                {isEditMode
                  ? "Student cannot be changed when editing a record"
                  : "Student is pre-selected for this new record"}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <FormField
              id="title"
              label="Record Title *"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Initial Consultation, Follow-up Session, Crisis Intervention"
              disabled={loading}
              required
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Notes *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Enter detailed consultation notes, observations, recommendations, and follow-up actions..."
              disabled={loading}
              rows={6}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 sm:rows-8 ${
                errors.content
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              required
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Include key observations, student responses, recommendations, and any follow-up
              actions needed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:min-w-[100px] order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full sm:min-w-[120px] bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? "Update Record" : "Create Record"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
