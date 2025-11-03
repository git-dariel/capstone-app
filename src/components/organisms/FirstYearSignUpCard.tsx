import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/atoms/Logo";
import { ToastContainer } from "@/components/atoms";
import { FirstYearSignUpForm } from "@/components/molecules/FirstYearSignUpForm";
import { OTPVerificationModal } from "@/components/molecules/OTPVerificationModal";
import { useAuth, useToast } from "@/hooks";
import { AuthService } from "@/services/auth.service";

interface FirstYearSignUpFormData {
  firstName: string;
  lastName: string;
  studentNumber: string;
  program: string;
  year: string;
  gender: string;
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
    firstName: string;
    lastName: string;
    contactNumber: string;
    relationship: string;
  };
}

export const FirstYearSignUpCard: React.FC = () => {
  const { clearError } = useAuth();
  const { success: showSuccessToast, toasts, removeToast } = useToast();
  const navigate = useNavigate();

  // Local error state for first-year registration
  const [firstYearLoading, setFirstYearLoading] = useState(false);
  const [firstYearError, setFirstYearError] = useState<string | null>(null);

  // OTP Modal state
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSignUp = async (data: FirstYearSignUpFormData) => {
    try {
      // Clear any previous errors
      clearError();
      setFirstYearError(null);
      setOtpError(null);
      setFirstYearLoading(true);

      // Attempt registration using the first-year endpoint
      const response = await AuthService.registerFirstYearStudent(data);

      setFirstYearLoading(false);

      // Check if email verification is required
      if (response?.emailVerificationRequired && response?.otpSent) {
        console.log("First-year registration successful! OTP sent to email for verification.");
        setUserEmail(data.email);
        setIsOTPModalOpen(true);
      } else {
        // Fallback: navigate to sign-in page if no OTP verification required
        console.log("Registration successful! Navigating to sign-in page...");
        navigate("/signin", { replace: true });
      }
    } catch (error: any) {
      setFirstYearLoading(false);
      const errorMessage = error.message || "Registration failed. Please try again.";
      setFirstYearError(errorMessage);
      console.error("First-year registration failed:", errorMessage);
    }
  };

  // Function to clear first-year errors
  const clearFirstYearError = () => {
    setFirstYearError(null);
  };

  const handleOTPVerify = async (otp: string) => {
    setOtpLoading(true);
    setOtpError(null);

    try {
      const response = await AuthService.verifyEmail({
        email: userEmail,
        otp: otp,
      });

      if (response.verified) {
        console.log("Email verification successful!");

        // Show success toast
        showSuccessToast(
          "Account Verified!",
          "Your account has been successfully verified. You can now sign in.",
          5000 // Show for 5 seconds
        );

        // Add 2-second delay before closing modal and navigating
        setTimeout(() => {
          // Close modal
          setIsOTPModalOpen(false);
          setOtpLoading(false);

          // Navigate to sign-in page
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 500);
        }, 2000); // 2-second delay
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error.message);
      setOtpError(error.message || "Verification failed. Please try again.");
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
        showSuccessToast(
          "OTP Resent",
          "A new verification code has been sent to your email.",
          3000
        );
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
    // Optionally navigate to sign-in or stay on current page
    navigate("/signin", { replace: true });
  };

  const handleSuccessNavigation = () => {
    // This function is now just a fallback - the main success handling is done in handleOTPVerify
    setIsOTPModalOpen(false);
    setOtpLoading(false);
    navigate("/signin", {
      replace: true,
      state: { message: "Registration completed successfully! Please sign in." },
    });
  };

  return (
    <div className="w-full">
      <div className="text-center mb-1.5">
        <Logo className="justify-center mb-1 scale-75 sm:scale-90" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5">
          First-Year Student Registration
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Register with your student number and non-PUP email
        </p>
      </div>

      <FirstYearSignUpForm 
        onSubmit={handleSignUp} 
        loading={firstYearLoading} 
        error={firstYearError}
        onErrorClear={clearFirstYearError}
      />

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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
