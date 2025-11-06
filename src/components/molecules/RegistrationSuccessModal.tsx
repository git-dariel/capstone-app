import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleNavigateToSignIn = () => {
    onClose();
    navigate("/signin", { replace: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="text-center py-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-full bg-green-100 flex items-center justify-center transition-all duration-500 transform ${
              isAnimating ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Registering!</h2>

        {/* Description */}
        <p className="text-gray-600 text-base mb-8 leading-relaxed">
          Your account has been successfully created. You can now sign in and access all the
          features of the Office of Guidance and Counseling Services.
        </p>

        {/* Sign In Button */}
        <Button
          onClick={handleNavigateToSignIn}
          variant="primary"
          className="w-full font-medium py-3 rounded-lg"
        >
          Go to Sign In
        </Button>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mt-6">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </Modal>
  );
};
