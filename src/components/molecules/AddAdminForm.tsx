import React, { useState } from "react";
import { FormField } from "@/components/atoms/FormField";
import { FormSelect } from "@/components/atoms/FormSelect";
import { Button } from "@/components/ui/button";
import { AuthService, type RegisterAdminRequest } from "@/services/auth.service";
import { genderOptions } from "@/config/constants";

interface AddAdminFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddAdminForm: React.FC<AddAdminFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<RegisterAdminRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    contactNumber: "",
    gender: "",
  });

  const handleChange =
    (field: keyof RegisterAdminRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.registerAdmin(formData);
      setSuccess(true);

      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.password.trim();

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Admin User Created Successfully!
          </h3>
          <p className="text-gray-600">
            The new admin user has been created and can now log in to the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First name"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            required
            disabled={loading}
          />

          <FormField
            id="lastName"
            label="Last name"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            required
            disabled={loading}
          />

          <FormField
            id="middleName"
            label="Middle name"
            value={formData.middleName || ""}
            onChange={handleChange("middleName")}
            disabled={loading}
          />

          <FormSelect
            id="gender"
            label="Gender"
            value={formData.gender || ""}
            onChange={handleGenderChange}
            options={genderOptions}
            placeholder="Select gender"
            disabled={loading}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            required
            disabled={loading}
          />

          <FormField
            id="contactNumber"
            label="Contact Number"
            type="tel"
            value={formData.contactNumber || ""}
            onChange={handleChange("contactNumber")}
            disabled={loading}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-sm font-medium text-gray-900">Account Information</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange("password")}
            required
            disabled={loading}
            placeholder="Minimum 6 characters"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid || loading}>
          {loading ? "Creating..." : "Create Admin User"}
        </Button>
      </div>
    </form>
  );
};
