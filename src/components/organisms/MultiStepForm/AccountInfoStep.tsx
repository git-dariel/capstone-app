import React from "react";
import { FormField } from "@/components/atoms";

interface AccountInfoStepProps {
  formData: {
    email: string;
    password: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const AccountInfoStep: React.FC<AccountInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Information</h2>
        <p className="text-sm text-gray-600">Create your login credentials</p>
      </div>

      <FormField
        id="email"
        label="Email address"
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        required
        disabled={disabled}
        placeholder="your.email@iskolarngbayan.pup.edu.ph"
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        required
        disabled={disabled}
        placeholder="Enter a secure password"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Please use your official PUP email address (@iskolarngbayan.pup.edu.ph) for registration.
        </p>
      </div>
    </div>
  );
};