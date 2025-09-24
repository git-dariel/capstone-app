import React, { useState } from "react";
import { Logo } from "@/components/atoms";
import { SignInForm } from "@/components/molecules";
import { OTPVerificationModal } from "@/components/molecules/OTPVerificationModal";
import { Button } from "@/components/ui/button";
import { HeartHandshake, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks";
import { AuthService } from "@/services/auth.service";
import type { AuthResponse } from "@/services/auth.service";

interface SignInFormData {
  email: string;
  password: string;
}

export const SignInCard: React.FC = () => {
  const { signIn, loading, error, clearError, completeSignInAfterVerification } = useAuth();
  const [userType, setUserType] = useState<"guidance" | "student">("student");

  // OTP Modal state
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [pendingAuthData, setPendingAuthData] = useState<AuthResponse | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
    type: "guidance" | "student";
  } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSignIn = async (data: SignInFormData) => {
    try {
      // Clear any previous errors
      clearError();
      setOtpError(null);

      // Attempt login with selected user type
      const response = await signIn({
        email: data.email,
        password: data.password,
        type: userType,
      });

      // Check if email verification is required
      if (response?.emailVerificationRequired && response?.otpSent) {
        console.log("Login requires email verification. OTP sent to email.");
        setUserEmail(data.email);
        setPendingAuthData(response);
        setPendingCredentials({ email: data.email, password: data.password, type: userType });
        setIsOTPModalOpen(true);
      } else {
        // Success handling is done in the hook (navigation)
        console.log("Login successful!");
      }
    } catch (error: any) {
      // Error handling is done in the hook (setting error state)
      console.error("Login failed:", error.message);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setOtpLoading(true);
    setOtpError(null);

    try {
      const response = await AuthService.verifyEmail({
        email: userEmail,
        otp: otp,
      });

      // Backend returns { emailVerified: true } when successful
      const isVerified = response.emailVerified ?? response.verified;
      if (isVerified) {
        console.log("Email verification successful! Completing sign-in...");
        // Re-attempt login with original credentials to establish session/cookie
        if (pendingCredentials) {
          await signIn(pendingCredentials);
        }
        setPendingAuthData(null);
        setPendingCredentials(null);
        setIsOTPModalOpen(false);
      } else {
        // This shouldn't happen if backend is working correctly
        setOtpError("Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error.message);
      setOtpError(error.message || "Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPResend = async () => {
    setResendLoading(true);
    setOtpError(null);

    try {
      const response = await AuthService.resendOTP({
        email: userEmail,
      });

      if (response.otpSent) {
        console.log("New OTP sent successfully!");
      }
    } catch (error: any) {
      console.error("Failed to resend OTP:", error.message);
      setOtpError(error.message || "Failed to resend verification code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOTPModalClose = () => {
    setIsOTPModalOpen(false);
    setOtpError(null);
    setPendingAuthData(null);
    // Stay on sign-in page when modal is closed manually
  };

  const handleSuccessNavigation = async () => {
    // This will be called by the modal after showing success for 3 seconds
    setIsOTPModalOpen(false);
    setOtpLoading(false);
    setPendingAuthData(null);

    if (pendingAuthData) {
      // Complete the sign-in process
      await completeSignInAfterVerification(pendingAuthData);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <Logo className="justify-center mb-3 scale-75 sm:scale-90" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
          Welcome to Office of Guidance and Counseling Services!
        </h1>
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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={handleOTPModalClose}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onSuccessNavigation={handleSuccessNavigation}
        email={userEmail}
        loading={otpLoading}
        resendLoading={resendLoading}
        error={otpError}
      />
    </div>
  );
};
