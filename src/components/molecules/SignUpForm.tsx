import React, { useState } from "react";
import { FormField } from "@/components/atoms/FormField";
import { FormSelect } from "@/components/atoms/FormSelect";
import { Button } from "@/components/ui/button";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  email: string;
  password: string;
}

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  loading?: boolean;
  error?: string | null;
}

const programOptions = [
  { value: "therapy", label: "BSIT" },
  { value: "counseling", label: "BSHM" },
  { value: "psychology", label: "BSND" },
  { value: "psychiatry", label: "DIT" },
  { value: "social-work", label: "DCPET" },
];

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, loading = false, error }) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    program: "",
    email: "",
    password: "",
  });

  const handleChange =
    (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleProgramChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      program: value,
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
    formData.email.trim() &&
    formData.password.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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

      <div className="text-xs text-gray-500 mt-3">
        By tapping "Sign Up" you agree to Bloom's{" "}
        <a href="#" className="text-teal-500 hover:text-teal-600">
          Terms and Conditions
        </a>{" "}
        and{" "}
        <a href="#" className="text-teal-500 hover:text-teal-600">
          Privacy Policy
        </a>
        .
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>

      <div className="text-center text-xs text-gray-600 mt-3">
        Already have an account?{" "}
        <a href="/signin" className="text-teal-500 hover:text-teal-600 font-medium">
          Sign in
        </a>
      </div>
    </form>
  );
};
