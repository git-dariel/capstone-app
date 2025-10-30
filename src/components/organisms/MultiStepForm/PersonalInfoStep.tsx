import React from "react";
import { FormField } from "@/components/atoms";
import { FormSelect } from "@/components/atoms/FormSelect";
import { genderOptions } from "@/config/constants";

interface PersonalInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    gender: string;
    contactNumber: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field, e.target.value);
  };

  const handleGenderChange = (value: string) => {
    onFieldChange("gender", value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-sm text-gray-600">Let's start with your basic information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="firstName"
          label="First name"
          value={formData.firstName}
          onChange={handleChange("firstName")}
          required
          disabled={disabled}
        />

        <FormField
          id="lastName"
          label="Last name"
          value={formData.lastName}
          onChange={handleChange("lastName")}
          required
          disabled={disabled}
        />
      </div>

      <FormSelect
        id="gender"
        label="Gender"
        value={formData.gender}
        onChange={handleGenderChange}
        options={genderOptions}
        placeholder="Select your gender"
        disabled={disabled}
      />

      <FormField
        id="contactNumber"
        label="Contact Number"
        type="tel"
        value={formData.contactNumber}
        onChange={handleChange("contactNumber")}
        required
        disabled={disabled}
      />
    </div>
  );
};