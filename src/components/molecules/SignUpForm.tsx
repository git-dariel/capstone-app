import React, { useState } from "react";
import { FullScreenLoading } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Stepper, ProgressIndicator } from "@/components/ui/stepper";
import {
  PersonalInfoStep,
  AcademicInfoStep,
  AccountInfoStep,
  AddressInfoStep,
  GuardianInfoStep,
} from "@/components/organisms/MultiStepForm";

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

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  loading?: boolean;
  error?: string | null;
}

const STEPS = [
  { id: 1, title: "Personal", description: "Basic info" },
  { id: 2, title: "Academic", description: "Student details" },
  { id: 3, title: "Account", description: "Login credentials" },
  { id: 4, title: "Address", description: "Location info" },
  { id: 5, title: "Guardian", description: "Emergency contact" },
];

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, loading = false, error }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    studentNumber: "",
    program: "",
    year: "",
    gender: "",
    email: "",
    password: "",
    contactNumber: "",
    address: {
      street: "",
      city: "",
      province: "",
      zipCode: "",
    },
    guardian: {
      name: "",
      contactNumber: "",
      relationship: "",
    },
  });

  const handleFieldChange = (field: string, value: string) => {
    if (field.includes(".")) {
      // Handle nested fields like address.street, guardian.name
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Personal Info
        return !!(
          formData.firstName.trim() &&
          formData.lastName.trim() &&
          formData.gender &&
          formData.contactNumber.trim()
        );
      case 2: // Academic Info
        return !!(
          formData.studentNumber.trim() &&
          formData.program &&
          formData.year
        );
      case 3: // Account Info
        return !!(
          formData.email.trim() &&
          formData.password.trim() &&
          formData.password.length >= 6
        );
      case 4: // Address Info
        return !!(
          formData.address.street.trim() &&
          formData.address.city.trim() &&
          formData.address.province.trim() &&
          formData.address.zipCode.trim()
        );
      case 5: // Guardian Info
        return !!(
          formData.guardian.name.trim() &&
          formData.guardian.contactNumber.trim() &&
          formData.guardian.relationship
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === STEPS.length && validateCurrentStep()) {
      onSubmit(formData);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              gender: formData.gender,
              contactNumber: formData.contactNumber,
            }}
            onFieldChange={handleFieldChange}
            disabled={loading}
          />
        );
      case 2:
        return (
          <AcademicInfoStep
            formData={{
              studentNumber: formData.studentNumber,
              program: formData.program,
              year: formData.year,
            }}
            onFieldChange={handleFieldChange}
            disabled={loading}
          />
        );
      case 3:
        return (
          <AccountInfoStep
            formData={{
              email: formData.email,
              password: formData.password,
            }}
            onFieldChange={handleFieldChange}
            disabled={loading}
          />
        );
      case 4:
        return (
          <AddressInfoStep
            formData={{ address: formData.address }}
            onFieldChange={handleFieldChange}
            disabled={loading}
          />
        );
      case 5:
        return (
          <GuardianInfoStep
            formData={{ guardian: formData.guardian }}
            onFieldChange={handleFieldChange}
            disabled={loading}
          />
        );
      default:
        return null;
    }
  };

  const isCurrentStepValid = validateCurrentStep();
  const isLastStep = currentStep === STEPS.length;

  return (
    <>
      <FullScreenLoading isLoading={loading} message="Creating your account..." />
      
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Progress Indicator for Mobile */}
        <div className="block md:hidden">
          <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />
        </div>

        {/* Stepper for Desktop */}
        <div className="hidden md:block">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="px-6"
            >
              Previous
            </Button>

            {!isLastStep ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={!isCurrentStepValid || loading}
                className="px-8"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={!isCurrentStepValid || loading}
                className="px-8 font-medium"
              >
                Complete Registration
              </Button>
            )}
          </div>
        </form>

        {/* Terms and Sign In Link */}
        <div className="space-y-3 pt-4 border-t border-gray-50">
          <div className="text-xs text-gray-500 text-center">
            By completing registration you agree to Office of Guidance and Counseling Services{" "}
            <a href="#" className="text-primary-700 hover:text-primary-800">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-700 hover:text-primary-800">
              Privacy Policy
            </a>
            .
          </div>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/signin" className="text-primary-700 hover:text-primary-800 font-medium">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
