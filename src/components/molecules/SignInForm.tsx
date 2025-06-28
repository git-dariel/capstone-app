import React from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/atoms/FormField";
import { Button } from "@/components/ui/button";

interface SignInFormData {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<SignInFormData>({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Navigate to home page after sign in
    navigate("/home");
  };

  const handleChange = (name: keyof SignInFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <FormField
        id="email"
        label="Email address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        required
      />

      <Button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-full mt-3"
      >
        Sign In
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
