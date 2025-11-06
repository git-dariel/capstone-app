import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/atoms/Logo";
import { ToastContainer } from "@/components/atoms";
import { SignUpForm } from "@/components/molecules/SignUpForm";
import { OTPVerificationModal } from "@/components/molecules/OTPVerificationModal";
import { FirstYearStudentChoiceModal } from "@/components/molecules/FirstYearStudentChoiceModal";
import { RegistrationSuccessModal } from "@/components/molecules/RegistrationSuccessModal";
import { useAuth, useToast } from "@/hooks";
import { AuthService } from "@/services/auth.service";

interface SignUpFormData {
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
    name: string;
    contactNumber: string;
    relationship: string;
  };
}

export const SignUpCard: React.FC = () => {
  const { signUp, loading, error, clearError } = useAuth();
  const { success: showSuccessToast, toasts, removeToast } = useToast();
  const navigate = useNavigate();

  // First-Year Student Choice Modal state
  const [isFirstYearModalOpen, setIsFirstYearModalOpen] = useState(true);

  // OTP Modal state
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Registration Success Modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Open first-year choice modal on component mount
  useEffect(() => {
    setIsFirstYearModalOpen(true);
  }, []);

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      // Clear any previous errors
      clearError();
      setOtpError(null);

      // Attempt registration
      const response = await signUp(data);

      // Check if email verification is required
      if (response?.emailVerificationRequired && response?.otpSent) {
        console.log("Registration successful! OTP sent to email for verification.");
        setUserEmail(data.email);
        setIsOTPModalOpen(true);
      } else {
        // Fallback: navigate to sign-in page if no OTP verification required
        console.log("Registration successful! Navigating to sign-in page...");
        navigate("/signin", { replace: true });
      }
    } catch (error: any) {
      // Error handling is done in the hook (setting error state)
      console.error("Registration failed:", error.message);
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

      if (response.verified) {
        console.log("Email verification successful!");

        // Show success toast
        showSuccessToast(
          "Account Verified!",
          "Your account has been successfully verified. You can now sign in.",
          5000 // Show for 5 seconds
        );

        // Add 2-second delay before closing OTP modal and showing success modal
        setTimeout(() => {
          // Close OTP modal
          setIsOTPModalOpen(false);
          setOtpLoading(false);

          // Show success modal
          setIsSuccessModalOpen(true);
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
          Welcome to Office of Guidance and Counseling Services!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">Lets create your account.</p>
      </div>

      <SignUpForm
        onSubmit={handleSignUp}
        loading={loading}
        error={error}
        onOpenFirstYearModal={() => setIsFirstYearModalOpen(true)}
      />

      {/* First-Year Student Choice Modal */}
      <FirstYearStudentChoiceModal
        isOpen={isFirstYearModalOpen}
        onClose={() => setIsFirstYearModalOpen(false)}
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

      {/* Registration Success Modal */}
      <RegistrationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
