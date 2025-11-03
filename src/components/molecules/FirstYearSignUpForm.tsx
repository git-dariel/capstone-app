import React, { useState } from "react";
import { FullScreenLoading, FormField } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Stepper, ProgressIndicator } from "@/components/ui/stepper";
import { FormSelect } from "@/components/atoms/FormSelect";
import { programOptions, yearOptions } from "@/config/constants";
import {
  PersonalInfoStep,
  AddressInfoStep,
} from "@/components/organisms/MultiStepForm";

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

interface FirstYearSignUpFormProps {
  onSubmit: (data: FirstYearSignUpFormData) => void;
  loading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

const STEPS = [
  { id: 1, title: "Personal", description: "Basic info" },
  { id: 2, title: "Academic", description: "Student details" },
  { id: 3, title: "Account", description: "Login credentials" },
  { id: 4, title: "Address", description: "Location info" },
  { id: 5, title: "Guardian", description: "Emergency contact" },
];

export const FirstYearSignUpForm: React.FC<FirstYearSignUpFormProps> = ({
  onSubmit,
  loading = false,
  error,
  onErrorClear,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FirstYearSignUpFormData>({
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
      firstName: "",
      lastName: "",
      contactNumber: "",
      relationship: "",
    },
  });

  const handleFieldChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (error && onErrorClear) {
      onErrorClear();
    }

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
          formData.password.length >= 6 &&
          !formData.email.endsWith("@iskolarngbayan.pup.edu.ph") // Ensure it's NOT a PUP email
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
          formData.guardian.firstName.trim() &&
          formData.guardian.lastName.trim() &&
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
          <FirstYearAcademicInfoStep
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
          <FirstYearAccountInfoStep
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
          <FirstYearGuardianInfoStep
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
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">Registration Error</div>
                <div className="mt-1">{error}</div>
              </div>
              {onErrorClear && (
                <button
                  onClick={onErrorClear}
                  className="flex-shrink-0 ml-2 text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Close error"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
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
          <div className="min-h-[400px]">{renderCurrentStep()}</div>

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

// Specialized Academic Info Step for First Year Students
interface FirstYearAcademicInfoStepProps {
  formData: {
    studentNumber: string;
    program: string;
    year: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const FirstYearAcademicInfoStep: React.FC<FirstYearAcademicInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field, e.target.value);
  };

  const handleProgramChange = (value: string) => {
    onFieldChange("program", value);
  };

  const handleYearChange = (value: string) => {
    onFieldChange("year", value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Academic Information</h2>
        <p className="text-sm text-gray-600">Tell us about your academic details</p>
      </div>

      <FormField
        id="studentNumber"
        label="Student Number"
        value={formData.studentNumber}
        onChange={handleChange("studentNumber")}
        required
        disabled={disabled}
        placeholder="e.g., 2025-00320-LQ-0"
      />

      <FormSelect
        id="program"
        label="Program"
        value={formData.program}
        onChange={handleProgramChange}
        options={programOptions}
        placeholder="Select your program"
        disabled={disabled}
      />

      <FormSelect
        id="year"
        label="Year Level"
        value={formData.year}
        onChange={handleYearChange}
        options={yearOptions}
        placeholder="Select your year level"
        disabled={disabled}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Your student number will be validated against our database. Make sure to enter it correctly.
        </p>
      </div>
    </div>
  );
};

// Specialized Account Info Step for First Year Students (allows non-PUP emails)
interface FirstYearAccountInfoStepProps {
  formData: {
    email: string;
    password: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const FirstYearAccountInfoStep: React.FC<FirstYearAccountInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const [showPasswordError, setShowPasswordError] = React.useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFieldChange(field, value);

    // Check for PUP email
    if (field === "email" && value.endsWith("@iskolarngbayan.pup.edu.ph")) {
      setShowPasswordError(true);
    } else {
      setShowPasswordError(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Information</h2>
        <p className="text-sm text-gray-600">Create your login credentials</p>
      </div>

      <FormField
        id="email"
        label="Email address"
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        required
        disabled={disabled}
        placeholder="e.g., your.email@gmail.com"
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        required
        disabled={disabled}
        placeholder="Enter a secure password"
      />

      {showPasswordError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-800">
            <strong>Error:</strong> Please use a non-PUP email address (Gmail, Yahoo, etc.). If you have a PUP email, please use the regular registration.
          </p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs text-green-800">
          <strong>✓ This registration accepts non-PUP emails:</strong> Gmail, Yahoo, Outlook, or any other email provider is welcome!
        </p>
      </div>
    </div>
  );
};

// Specialized Guardian Info Step for First Year Students
interface FirstYearGuardianInfoStepProps {
  formData: {
    guardian: {
      firstName: string;
      lastName: string;
      contactNumber: string;
      relationship: string;
    };
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const FirstYearGuardianInfoStep: React.FC<FirstYearGuardianInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const relationshipOptions = [
    { value: "father", label: "Father" },
    { value: "mother", label: "Mother" },
    { value: "brother", label: "Brother" },
    { value: "sister", label: "Sister" },
    { value: "grandfather", label: "Grandfather" },
    { value: "grandmother", label: "Grandmother" },
    { value: "aunt", label: "Aunt" },
    { value: "uncle", label: "Uncle" },
    { value: "cousin", label: "Cousin" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Guardian Information</h2>
        <p className="text-sm text-gray-600">Emergency contact and guardian details</p>
      </div>

      <FormField
        id="guardian.firstName"
        label="Guardian First Name"
        value={formData.guardian.firstName}
        onChange={handleChange("guardian.firstName")}
        required
        disabled={disabled}
        placeholder="First name"
      />

      <FormField
        id="guardian.lastName"
        label="Guardian Last Name"
        value={formData.guardian.lastName}
        onChange={handleChange("guardian.lastName")}
        required
        disabled={disabled}
        placeholder="Last name"
      />

      <FormField
        id="guardian.contactNumber"
        label="Guardian Contact Number"
        type="tel"
        value={formData.guardian.contactNumber}
        onChange={handleChange("guardian.contactNumber")}
        required
        disabled={disabled}
        placeholder="09XXXXXXXXX"
      />

      <FormSelect
        id="guardian.relationship"
        label="Relationship to Guardian"
        value={formData.guardian.relationship}
        onChange={(value) => onFieldChange("guardian.relationship", value)}
        options={relationshipOptions}
        placeholder="Select your relationship"
        required
        disabled={disabled}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Guardian information will be used for emergency contacts and important communications.
        </p>
      </div>
    </div>
  );
};
