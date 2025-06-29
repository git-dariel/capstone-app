import React from "react";
import { Logo } from "@/components/atoms/Logo";
import { SignUpForm } from "@/components/molecules/SignUpForm";
import { useAuth } from "@/hooks";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  email: string;
  password: string;
}

export const SignUpCard: React.FC = () => {
  const { signUp, loading, error, clearError } = useAuth();

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      // Clear any previous errors
      clearError();

      // Attempt registration
      await signUp(data);

      // Success handling is done in the hook (navigation)
      console.log("Registration successful!");
    } catch (error: any) {
      // Error handling is done in the hook (setting error state)
      console.error("Registration failed:", error.message);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <Logo className="justify-center mb-3 scale-75 sm:scale-90" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Welcome to Bloom!</h1>
        <p className="text-xs sm:text-sm text-gray-600">Lets create your account.</p>
      </div>

      <SignUpForm onSubmit={handleSignUp} loading={loading} error={error} />
    </div>
  );
};
