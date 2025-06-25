import React from "react";
import { Logo } from "@/components/atoms";
import { SignInForm } from "@/components/molecules";
import { Button } from "@/components/ui/button";
import { HeartHandshake, GraduationCap } from "lucide-react";

interface SignInFormData {
  email: string;
  password: string;
  userType: "guidance" | "student";
}

interface SignInCardProps {
  onSignIn?: (data: SignInFormData) => void;
}

export const SignInCard: React.FC<SignInCardProps> = ({ onSignIn }) => {
  const [userType, setUserType] = React.useState<"guidance" | "student">("guidance");

  const handleSignIn = (data: Omit<SignInFormData, "userType">) => {
    console.log("Sign in data:", { ...data, userType });
    if (onSignIn) {
      onSignIn({ ...data, userType });
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <Logo className="justify-center mb-3 scale-75 sm:scale-90" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Welcome to Bloom!</h1>
        <p className="text-xs sm:text-sm text-gray-600">Lets sign in to your account.</p>
      </div>

      {/* User Type Selection */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => setUserType("guidance")}
          className={`flex-1 py-3 gap-2 ${
            userType === "guidance"
              ? "bg-teal-500 hover:bg-teal-600 text-white"
              : "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <HeartHandshake className="w-5 h-5" />
          Guidance
        </Button>
        <Button
          onClick={() => setUserType("student")}
          className={`flex-1 py-3 gap-2 ${
            userType === "student"
              ? "bg-teal-500 hover:bg-teal-600 text-white"
              : "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          Student
        </Button>
      </div>

      <SignInForm onSubmit={handleSignIn} />
    </div>
  );
};
