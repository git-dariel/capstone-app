import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms/Modal";
import { OTPInput } from "@/components/atoms/OTPInput";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onSuccessNavigation: () => void;
  email: string;
  loading?: boolean;
  resendLoading?: boolean;
  error?: string | null;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  onSuccessNavigation,
  email: _email,
  loading = false,
  resendLoading = false,
  error,
}) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setCountdown(60);
      setCanResend(false);
      setIsSuccess(false);
      setSuccessCountdown(3);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  // Handle success countdown and auto-navigation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && successCountdown > 0) {
      timer = setTimeout(() => {
        setSuccessCountdown(successCountdown - 1);
      }, 1000);
    } else if (isSuccess && successCountdown === 0) {
      // Auto-navigate after 3 seconds
      onSuccessNavigation();
    }
    return () => clearTimeout(timer);
  }, [isSuccess, successCountdown, onSuccessNavigation]);

  const handleVerify = async () => {
    if (otp.length === 6) {
      await onVerify(otp);
      // Success/error handling is now entirely managed by parent component
      // The modal will be closed by parent on success
    }
  };

  const handleResend = async () => {
    await onResend();
    setCountdown(60);
    setCanResend(false);
    setOtp("");
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify" size="md">
      <div className="text-center py-2">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isSuccess ? "bg-green-100" : "bg-primary-100"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <Mail className="w-8 h-8 text-primary-600" />
            )}
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isSuccess ? "Verification Successful!" : "Verify"}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {isSuccess
            ? `Your email has been verified successfully. Redirecting to sign-in in ${successCountdown} seconds...`
            : "Your code was sent to you via email"}
        </p>

        {/* Show content only if not in success state */}
        {!isSuccess && (
          <>
            {/* OTP Input */}
            <div className="mb-6">
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
                error={!!error}
                className="mb-1"
              />
              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify"
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-primary-600 hover:text-primary-700 font-medium underline disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Request again"}
                  </button>
                ) : (
                  <span className="text-gray-500">
                    Request again in {formatCountdown(countdown)}
                  </span>
                )}
              </p>
            </div>

            {/* Additional Help Text */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800 space-y-1">
                <p className="font-medium">💡 Can't find your code?</p>
                <p>
                  • Check your email{" "}
                  <span className="font-semibold text-blue-900 bg-blue-100 px-1 py-0.5 rounded">
                    inbox
                  </span>
                  ,{" "}
                  <span className="font-semibold text-orange-700 bg-orange-100 px-1 py-0.5 rounded">
                    spam
                  </span>
                  , or{" "}
                  <span className="font-semibold text-red-700 bg-red-100 px-1 py-0.5 rounded">
                    junk
                  </span>{" "}
                  folder
                </p>
                <p>• The verification code expires in 10 minutes</p>
              </div>
            </div>
          </>
        )}

        {/* Success state - show loading spinner */}
        {isSuccess && (
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
