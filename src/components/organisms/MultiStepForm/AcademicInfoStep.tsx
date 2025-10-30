import React from "react";
import { FormField } from "@/components/atoms";
import { FormSelect } from "@/components/atoms/FormSelect";
import { programOptions, yearOptions } from "@/config/constants";

interface AcademicInfoStepProps {
  formData: {
    studentNumber: string;
    program: string;
    year: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const AcademicInfoStep: React.FC<AcademicInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field, e.target.value);
  };

  const handleProgramChange = (value: string) => {
    onFieldChange("program", value);
  };

  const handleYearChange = (value: string) => {
    onFieldChange("year", value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Academic Information</h2>
        <p className="text-sm text-gray-600">Tell us about your academic details</p>
      </div>

      <FormField
        id="studentNumber"
        label="Student Number"
        value={formData.studentNumber}
        onChange={handleChange("studentNumber")}
        required
        disabled={disabled}
        placeholder="e.g., 2024-12345"
      />

      <FormSelect
        id="program"
        label="Program"
        value={formData.program}
        onChange={handleProgramChange}
        options={programOptions}
        placeholder="Select your program"
        disabled={disabled}
      />

      <FormSelect
        id="year"
        label="Year Level"
        value={formData.year}
        onChange={handleYearChange}
        options={yearOptions}
        placeholder="Select your year level"
        disabled={disabled}
      />
    </div>
  );
};