import { FormField, FormSelect, Drawer } from "@/components/atoms";
import { Button } from "@/components/ui";
import { civilStatusOptions, genderOptions, programOptions, yearOptions } from "@/config/constants";
import type {
  CreateStudentRequest,
  Student,
  UpdateStudentRequest,
} from "@/services/student.service";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

interface StudentFormData {
  program: string;
  year: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  contactNumber: string;
  gender: string;
  birthDate?: string;
  age?: number;
  religion?: string;
  civilStatus?: string;
  notes: Array<{
    title?: string;
    content?: string;
    isMinimized?: boolean;
  }>;
}

interface StudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentRequest) => void;
  onUpdate?: (id: string, data: UpdateStudentRequest) => void;
  onDelete?: (id: string) => void;
  student?: Student | null; // For edit mode
  loading?: boolean;
  error?: string | null;
}

export const StudentDrawer: React.FC<StudentDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  student,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    program: "",
    year: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    contactNumber: "",
    gender: "",
    birthDate: "",
    age: undefined,
    religion: "",
    civilStatus: "",
    notes: [],
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const isEditMode = !!student;

  // Initialize form data when student prop changes
  useEffect(() => {
    if (student) {
      const person = student.person;
      setFormData({
        program: student.program || "",
        year: student.year || "",
        firstName: person?.firstName || "",
        lastName: person?.lastName || "",
        middleName: person?.middleName || "",
        email: person?.email || "",
        contactNumber: person?.contactNumber || "",
        gender: person?.gender || "",
        birthDate: person?.birthDate || "",
        age: person?.age || undefined,
        religion: person?.religion || "",
        civilStatus: person?.civilStatus || "",
        notes: student.notes
          ? student.notes.map((note) => ({
              ...note,
              isMinimized: note.isMinimized || false,
            }))
          : [],
      });
    } else {
      // Reset form for create mode
      setFormData({
        program: "",
        year: "",
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        contactNumber: "",
        gender: "",
        birthDate: "",
        age: undefined,
        religion: "",
        civilStatus: "",
        notes: [],
      });
    }
  }, [student]);

  // Validate form
  useEffect(() => {
    const requiredFields = ["program", "year", "firstName", "lastName", "email"];
    const isValid = requiredFields.every((field) => {
      const value = formData[field as keyof StudentFormData];
      return value && value.toString().trim() !== "";
    });
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "age" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleAddNote = () => {
    setFormData((prev) => ({
      ...prev,
      notes: [...prev.notes, { title: "", content: "", isMinimized: false }],
    }));
  };

  const handleToggleMinimize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.map((note, i) =>
        i === index ? { ...note, isMinimized: !note.isMinimized } : note
      ),
    }));
  };

  const handleRemoveNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
  };

  const handleNoteChange = (index: number, field: "title" | "content", value: string) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.map((note, i) => (i === index ? { ...note, [field]: value } : note)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    if (isEditMode && student && onUpdate) {
      const updateData: UpdateStudentRequest = {
        program: formData.program,
        year: formData.year,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        birthDate: formData.birthDate,
        age: formData.age,
        religion: formData.religion,
        civilStatus: formData.civilStatus,
        notes: formData.notes.map(({ isMinimized, ...note }) => note),
      };
      onUpdate(student.id, updateData);
    } else {
      const createData: CreateStudentRequest = {
        program: formData.program,
        year: formData.year,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        birthDate: formData.birthDate,
        age: formData.age,
        religion: formData.religion,
        civilStatus: formData.civilStatus,
        notes: formData.notes.map(({ isMinimized, ...note }) => note),
      };
      onSubmit(createData);
    }
  };

  const handleDelete = () => {
    if (student && onDelete) {
      onDelete(student.id);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? "Edit Student" : "Add New Student"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Academic Information Section */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FormSelect
                id="program"
                label="Program *"
                value={formData.program}
                onChange={(value) => handleChange("program", value)}
                options={programOptions}
                placeholder="Select program"
                disabled={loading}
                required
              />

              <FormSelect
                id="year"
                label="Year Level *"
                value={formData.year}
                onChange={(value) => handleChange("year", value)}
                options={yearOptions}
                placeholder="Select year"
                disabled={loading}
                required
              />

              <FormSelect
                id="gender"
                label="Gender"
                value={formData.gender}
                onChange={(value) => handleChange("gender", value)}
                options={genderOptions}
                placeholder="Select gender"
                disabled={loading}
              />
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                id="firstName"
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Enter first name"
                disabled={loading}
                required
              />

              <FormField
                id="lastName"
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Enter last name"
                disabled={loading}
                required
              />

              <FormField
                id="middleName"
                label="Middle Name"
                value={formData.middleName || ""}
                onChange={(e) => handleChange("middleName", e.target.value)}
                placeholder="Enter middle name"
                disabled={loading}
              />

              <FormField
                id="email"
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={loading}
                required
              />

              <FormField
                id="contactNumber"
                label="Contact Number"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                placeholder="Enter contact number"
                disabled={loading}
              />

              <FormField
                id="birthDate"
                label="Birth Date"
                type="date"
                value={formData.birthDate || ""}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                disabled={loading}
              />

              <FormField
                id="age"
                label="Age"
                type="number"
                value={formData.age?.toString() || ""}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Enter age"
                disabled={loading}
              />

              <FormField
                id="religion"
                label="Religion"
                value={formData.religion || ""}
                onChange={(e) => handleChange("religion", e.target.value)}
                placeholder="Enter religion"
                disabled={loading}
              />

              <FormSelect
                id="civilStatus"
                label="Civil Status"
                value={formData.civilStatus || ""}
                onChange={(value) => handleChange("civilStatus", value)}
                options={civilStatusOptions}
                placeholder="Select civil status"
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Guidance Consultant Records
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Add consultation consultant records, recommendations, or observations for the
                student.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNote}
                disabled={loading}
                className="text-primary-600 border-primary-600 hover:bg-primary-50 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <Plus className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-90" />
                Add Record
              </Button>
            </div>

            {formData.notes.length === 0 ? (
              <div className="text-sm text-primary-600 italic bg-primary-50 p-4 rounded-md border border-primary-200 transition-all duration-500 opacity-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                  <span className="text-primary-800">
                    No guidance consultant records yet. Add consultant records about consultations,
                    recommendations, or observations.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.notes.map((note, index) => (
                  <div
                    key={index}
                    className="border border-primary-200 rounded-md p-4 bg-primary-50 hover:bg-primary-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md opacity-100"
                    style={{
                      transitionDelay: `${index * 100}ms`,
                      transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-primary-800">
                        Consultant Record {index + 1}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMinimize(index)}
                          disabled={loading}
                          className="text-primary-600 hover:text-primary-800 hover:bg-primary-200 transition-all duration-200 hover:scale-110"
                          title={
                            note.isMinimized
                              ? "Expand consultant record"
                              : "Minimize consultant record"
                          }
                        >
                          {note.isMinimized ? (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                          ) : (
                            <Minus className="w-4 h-4 transition-transform duration-200" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNote(index)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                          title="Delete consultant record"
                        >
                          <X className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                        </Button>
                      </div>
                    </div>

                    {!note.isMinimized && (
                      <div
                        className="space-y-3 transition-all duration-300 opacity-100 max-h-full overflow-hidden"
                        style={{
                          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: "translateY(0)",
                        }}
                      >
                        <FormField
                          id={`note-title-${index}`}
                          label="Title"
                          value={note.title || ""}
                          onChange={(e) => handleNoteChange(index, "title", e.target.value)}
                          placeholder="Enter consultant record title (e.g., Consultation, Follow-up)"
                          disabled={loading}
                        />

                        <div>
                          <label className="block text-sm font-medium text-primary-800 mb-1">
                            Content
                          </label>
                          <textarea
                            id={`note-content-${index}`}
                            value={note.content || ""}
                            onChange={(e) => handleNoteChange(index, "content", e.target.value)}
                            placeholder="Enter detailed consultant record content..."
                            disabled={loading}
                            rows={3}
                            className="w-full rounded-md border border-primary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-primary-50 disabled:text-primary-600 transition-all duration-200 focus:scale-[1.01]"
                          />
                        </div>
                      </div>
                    )}

                    {note.isMinimized && (note.title || note.content) && (
                      <div
                        className="text-sm text-primary-700 bg-white p-2 rounded border border-primary-200 transition-all duration-200 opacity-100"
                        style={{
                          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: "translateY(0)",
                        }}
                      >
                        {note.title && (
                          <div className="font-medium text-primary-800 truncate">{note.title}</div>
                        )}
                        {note.content && (
                          <div className="text-primary-600 truncate mt-1">{note.content}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white pt-6 mt-8 border-t border-gray-200 -mx-6 px-6 -mb-6">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-3 lg:gap-4 pb-6">
              {/* Left side - Delete button (edit mode only) */}
              {isEditMode && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={loading}
                  className="text-red-600 border-red-600 hover:bg-red-50 order-2 lg:order-1"
                >
                  Delete Student
                </Button>
              )}

              {/* Right side - Cancel and Submit buttons */}
              <div className="flex flex-col sm:flex-row gap-3 order-1 lg:order-2 lg:ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto min-w-[140px]"
                >
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Update Student"
                    : "Create Student"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${formData.firstName} ${formData.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={loading}
      />
    </>
  );
};
