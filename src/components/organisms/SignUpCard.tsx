import React from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/atoms/Logo";
import { SignUpForm } from "@/components/molecules/SignUpForm";
import { useAuth } from "@/hooks";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  year: string;
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

export const SignUpCard: React.FC = () => {
  const { signUp, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      // Clear any previous errors
      clearError();

      // Attempt registration
      await signUp(data);

      // After successful registration, navigate to sign-in page
      console.log("Registration successful! Navigating to sign-in page...");
      navigate("/signin", { replace: true });
    } catch (error: any) {
      // Error handling is done in the hook (setting error state)
      console.error("Registration failed:", error.message);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-1.5">
        <Logo className="justify-center mb-1 scale-75 sm:scale-90" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5">Welcome to Bloom!</h1>
        <p className="text-xs sm:text-sm text-gray-600">Lets create your account.</p>
      </div>

      <SignUpForm onSubmit={handleSignUp} loading={loading} error={error} />
    </div>
  );
};
