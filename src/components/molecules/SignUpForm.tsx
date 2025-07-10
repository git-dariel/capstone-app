import React, { useState } from "react";
import { FormField } from "@/components/atoms/FormField";
import { FormSelect } from "@/components/atoms/FormSelect";
import { Button } from "@/components/ui/button";
import {
  programOptions,
  relationshipOptions,
  yearOptions,
  genderOptions,
} from "@/config/constants";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  year: string;
  gender: string;
  email: string;
  password: string;
  contactNumber: string;
  address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  guardian: {
    name: string;
    contactNumber: string;
    relationship: string;
  };
}

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  loading?: boolean;
  error?: string | null;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, loading = false, error }) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    program: "",
    year: "",
    gender: "",
    email: "",
    password: "",
    contactNumber: "",
    address: {
      street: "",
      city: "",
      province: "",
      zipCode: "",
    },
    guardian: {
      name: "",
      contactNumber: "",
      relationship: "",
    },
  });

  const handleChange =
    (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleAddressChange =
    (field: keyof SignUpFormData["address"]) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: e.target.value,
        },
      }));
    };

  const handleGuardianChange =
    (field: keyof SignUpFormData["guardian"]) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [field]: e.target.value,
        },
      }));
    };

  const handleProgramChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      program: value,
    }));
  };

  const handleYearChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      year: value,
    }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleRelationshipChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        relationship: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.program &&
    formData.year &&
    formData.gender &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.contactNumber.trim() &&
    formData.address.street.trim() &&
    formData.address.city.trim() &&
    formData.address.province.trim() &&
    formData.address.zipCode.trim() &&
    formData.guardian.name.trim() &&
    formData.guardian.contactNumber.trim() &&
    formData.guardian.relationship.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-2 py-1.5 rounded-lg text-xs col-span-2">
          {error}
        </div>
      )}

      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left Column - Personal Information */}
        <div className="space-y-1.5">
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

          <FormSelect
            id="program"
            label="Program"
            value={formData.program}
            onChange={handleProgramChange}
            options={programOptions}
            placeholder="Select your program"
            disabled={loading}
          />

          <FormSelect
            id="year"
            label="Year"
            value={formData.year}
            onChange={handleYearChange}
            options={yearOptions}
            placeholder="Select year"
            disabled={loading}
          />

          <FormField
            id="contactNumber"
            label="Contact Number"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange("contactNumber")}
            required
            disabled={loading}
          />

          <FormField
            id="email"
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            required
            disabled={loading}
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange("password")}
            required
            disabled={loading}
          />
        </div>

        {/* Right Column - Address & Guardian Information */}
        <div className="space-y-1.5">
          {/* Address Section */}
          <div className="space-y-1.5">
            <FormSelect
              id="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleGenderChange}
              options={genderOptions}
              placeholder="Select gender"
              disabled={loading}
            />

            <FormField
              id="address.street"
              label="Street Address"
              value={formData.address.street}
              onChange={handleAddressChange("street")}
              required
              disabled={loading}
            />

            <div className="grid grid-cols-2 gap-1.5">
              <FormField
                id="address.city"
                label="City"
                value={formData.address.city}
                onChange={handleAddressChange("city")}
                required
                disabled={loading}
              />

              <FormField
                id="address.zipCode"
                label="ZIP Code"
                value={formData.address.zipCode}
                onChange={handleAddressChange("zipCode")}
                required
                disabled={loading}
              />
            </div>

            <FormField
              id="address.province"
              label="Province"
              value={formData.address.province}
              onChange={handleAddressChange("province")}
              required
              disabled={loading}
            />
          </div>

          {/* Guardian Section */}
          <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
            <FormField
              id="guardian.name"
              label="Guardian Full Name"
              value={formData.guardian.name}
              onChange={handleGuardianChange("name")}
              required
              disabled={loading}
            />

            <FormField
              id="guardian.contactNumber"
              label="Guardian Contact Number"
              type="tel"
              value={formData.guardian.contactNumber}
              onChange={handleGuardianChange("contactNumber")}
              required
              disabled={loading}
            />

            <FormSelect
              id="guardian.relationship"
              label="Relationship"
              value={formData.guardian.relationship}
              onChange={handleRelationshipChange}
              options={relationshipOptions}
              placeholder="Select relationship"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2 pt-1.5 border-t border-gray-50">
        By tapping "Sign Up" you agree to Office of Guidance and Counseling Services{" "}
        <a href="#" className="text-primary-700 hover:text-primary-800">
          Terms and Conditions
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary-700 hover:text-primary-800">
          Privacy Policy
        </a>
        .
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 rounded-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>

      <div className="text-center text-xs text-gray-600 mt-1.5">
        Already have an account?{" "}
        <a href="/signin" className="text-primary-700 hover:text-primary-800 font-medium">
          Sign in
        </a>
      </div>
    </form>
  );
};
