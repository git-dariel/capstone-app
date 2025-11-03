import React from "react";
import { Modal } from "@/components/atoms/Modal";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FirstYearStudentChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstYearStudentChoiceModal: React.FC<FirstYearStudentChoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleFirstYearSignUp = () => {
    onClose();
    navigate("/signup/first-year");
  };

  const handleRegularSignUp = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Registration Type" size="md">
      <div className="space-y-4">
        {/* Description */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Are you a first-year student? Choose the appropriate registration path:
          </p>
        </div>

        {/* Option 1: Regular Student */}
        <button
          onClick={handleRegularSignUp}
          className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-900">
                Regular Registration
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-blue-700">
                I have a PUP Iskolar ng Bayan email address
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2 transition-colors" />
          </div>
        </button>

        {/* Option 2: First-Year Student */}
        <button
          onClick={handleFirstYearSignUp}
          className="w-full text-left border-2 border-green-500 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1 group-hover:text-green-950">
                First-Year Registration
              </h3>
              <p className="text-sm text-green-700 group-hover:text-green-800">
                I don't have a PUP Iskolar ng Bayan email yet
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-green-600 group-hover:text-green-700 flex-shrink-0 ml-2 transition-colors" />
          </div>
        </button>

        {/* Close hint */}
        <p className="text-xs text-gray-400 text-center mt-6">
          You can also close this modal to continue with regular registration
        </p>
      </div>
    </Modal>
  );
};
