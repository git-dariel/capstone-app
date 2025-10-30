import React from "react";
import { FormField } from "@/components/atoms";
import { FormSelect } from "@/components/atoms/FormSelect";
import { relationshipOptions } from "@/config/constants";

interface GuardianInfoStepProps {
  formData: {
    guardian: {
      name: string;
      contactNumber: string;
      relationship: string;
    };
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const GuardianInfoStep: React.FC<GuardianInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const handleGuardianChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(`guardian.${field}`, e.target.value);
  };

  const handleRelationshipChange = (value: string) => {
    onFieldChange("guardian.relationship", value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Guardian Information</h2>
        <p className="text-sm text-gray-600">Emergency contact and guardian details</p>
      </div>

      <FormField
        id="guardian.name"
        label="Guardian Full Name"
        value={formData.guardian.name}
        onChange={handleGuardianChange("name")}
        required
        disabled={disabled}
        placeholder="First and Last name of guardian"
      />

      <FormField
        id="guardian.contactNumber"
        label="Guardian Contact Number"
        type="tel"
        value={formData.guardian.contactNumber}
        onChange={handleGuardianChange("contactNumber")}
        required
        disabled={disabled}
        placeholder="Guardian's phone number"
      />

      <FormSelect
        id="guardian.relationship"
        label="Relationship to Guardian"
        value={formData.guardian.relationship}
        onChange={handleRelationshipChange}
        options={relationshipOptions}
        placeholder="Select your relationship"
        disabled={disabled}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Guardian information will be used for emergency contacts and important communications.
        </p>
      </div>
    </div>
  );
};