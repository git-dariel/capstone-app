import React from "react";
import { Logo } from "@/components/atoms/Logo";
import { SignUpForm } from "@/components/molecules/SignUpForm";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  email: string;
  password: string;
}

interface SignUpCardProps {
  onSignUp?: (data: SignUpFormData) => void;
}

export const SignUpCard: React.FC<SignUpCardProps> = ({ onSignUp }) => {
  const handleSignUp = (data: SignUpFormData) => {
    console.log("Sign up data:", data);
    if (onSignUp) {
      onSignUp(data);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <Logo className="justify-center mb-3 scale-75 sm:scale-90" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Welcome to Bloom!</h1>
        <p className="text-xs sm:text-sm text-gray-600">Lets create your account.</p>
      </div>

      <SignUpForm onSubmit={handleSignUp} />
    </div>
  );
};
