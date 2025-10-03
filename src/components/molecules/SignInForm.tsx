import React, { useState } from "react";
import { FormField, FullScreenLoading } from "@/components/atoms";
import { Button } from "@/components/ui";

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
    <>
      <FullScreenLoading isLoading={loading} message="Signing you in..." />
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
          variant="primary"
          className="w-full font-medium py-2 rounded-full mt-3"
        >
          Sign In
        </Button>

        <div className="text-center text-xs text-gray-600 mt-3">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary-700 hover:text-primary-800 font-medium">
            Sign up
          </a>
        </div>

        <div className="text-center text-xs text-gray-600 mt-3">
          Go back to landing page?{" "}
          <a href="/" className="text-primary-700 hover:text-primary-800 font-medium">
            Landing page
          </a>
        </div>
      </form>
    </>
  );
};
