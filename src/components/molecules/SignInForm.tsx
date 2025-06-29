import React, { useState } from "react";
import { FormField } from "@/components/atoms/FormField";
import { Button } from "@/components/ui/button";

interface SignInFormData {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => void;
  loading?: boolean;
  error?: string | null;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, loading = false, error }) => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (name: keyof SignInFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <FormField
        id="email"
        label="Email address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
        disabled={loading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        required
        disabled={loading}
      />

      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <div className="text-center text-xs text-gray-600 mt-3">
        Don't have an account?{" "}
        <a href="/signup" className="text-teal-500 hover:text-teal-600 font-medium">
          Sign up
        </a>
      </div>
    </form>
  );
};
