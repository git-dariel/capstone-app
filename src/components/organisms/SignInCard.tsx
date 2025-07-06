import React from "react";
import { Logo } from "@/components/atoms";
import { SignInForm } from "@/components/molecules";
import { Button } from "@/components/ui/button";
import { HeartHandshake, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks";

interface SignInFormData {
  email: string;
  password: string;
}

export const SignInCard: React.FC = () => {
  const { signIn, loading, error, clearError } = useAuth();
  const [userType, setUserType] = React.useState<"guidance" | "student">("student");

  const handleSignIn = async (data: SignInFormData) => {
    try {
      // Clear any previous errors
      clearError();

      // Attempt login with selected user type
      await signIn({
        email: data.email,
        password: data.password,
        type: userType,
      });

      // Success handling is done in the hook (navigation)
      console.log("Login successful!");
    } catch (error: any) {
      // Error handling is done in the hook (setting error state)
      console.error("Login failed:", error.message);
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
          disabled={loading}
          className={`flex-1 py-3 gap-2 ${
            userType === "guidance"
              ? "bg-primary-700 hover:bg-primary-800 text-white"
              : "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <HeartHandshake className="w-5 h-5" />
          Guidance
        </Button>
        <Button
          onClick={() => setUserType("student")}
          disabled={loading}
          className={`flex-1 py-3 gap-2 ${
            userType === "student"
              ? "bg-primary-700 hover:bg-primary-800 text-white"
              : "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          Student
        </Button>
      </div>

      <SignInForm onSubmit={handleSignIn} loading={loading} error={error} />
    </div>
  );
};
