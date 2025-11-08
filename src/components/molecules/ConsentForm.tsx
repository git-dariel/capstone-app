import React, { useState, useRef } from "react";
import { FormSelect } from "@/components/atoms/FormSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TermsAndConditionsModal } from "./TermsAndConditionsModal";
import type { ConsentFormData } from "@/services";

interface ConsentFormProps {
  studentId: string;
  onSubmit: (data: ConsentFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const referredOptions = [
  { value: "self", label: "Self" },
  { value: "family", label: "Family" },
  { value: "friend", label: "Friend" },
  { value: "faculty", label: "Faculty" },
  { value: "administrative_staff", label: "Administrative Staff" },
  { value: "others", label: "Others" },
];

const livingOptions = [
  { value: "alone", label: "Alone" },
  { value: "spouse", label: "Spouse" },
  { value: "partner", label: "Partner" },
  { value: "roommates", label: "Roommates" },
  { value: "children", label: "Children" },
  { value: "guardians", label: "Guardians" },
];

const financialStatusOptions = [
  { value: "never_stressful", label: "Never Stressful" },
  { value: "rarely_stressful", label: "Rarely Stressful" },
  { value: "sometimes_stressful", label: "Sometimes Stressful" },
  { value: "often_stressful", label: "Often Stressful" },
  { value: "always_stressful", label: "Always Stressful" },
];

const physicalSymptomsOptions = [
  { value: "none", label: "None" },
  { value: "shortness_of_breath", label: "Shortness of Breath" },
  { value: "racing_heart", label: "Racing Heart" },
  { value: "headaches", label: "Headaches" },
  { value: "insomnia", label: "Insomnia" },
  { value: "teeth_clenching", label: "Teeth Clenching" },
  { value: "cold_hands_and_feet", label: "Cold Hands and Feet" },
  { value: "high_blood_pressure", label: "High Blood Pressure" },
  { value: "muscle_tension", label: "Muscle Tension" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "stomach_discomfort", label: "Stomach Discomfort" },
];

const concernLevels = [
  { value: "not_applicable", label: "Not Applicable" },
  { value: "least_important", label: "Least Important" },
  { value: "somewhat_important", label: "Somewhat Important" },
  { value: "important", label: "Important" },
  { value: "very_important", label: "Very Important" },
  { value: "most_important", label: "Most Important" },
];

export const ConsentForm: React.FC<ConsentFormProps> = ({
  studentId,
  onSubmit,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<ConsentFormData>({
    studentId,
    referred: "self",
    with_whom_do_you_live: "guardians",
    financial_status: "never_stressful",
    what_brings_you_to_guidance: "",
    physical_problem: undefined,
    physical_symptoms: "muscle_tension",
    concerns: {
      personal_growth: undefined,
      depression: undefined,
      suicidal_thoughts: undefined,
      study_skills: undefined,
      family_concerns: undefined,
      sexual_concerns: undefined,
      educational_concerns: undefined,
      anxiety: undefined,
      drug_use: undefined,
      physical_concerns: undefined,
      self_concept: undefined,
      decision_making_about_leaving_pup: undefined,
      financial_concerns: undefined,
      relationship_with_others: undefined,
      spirituality: undefined,
      weight_eating_issues: undefined,
      career: undefined,
    },
    services: "general_information",
  });

  // State for Terms and Conditions
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // State for validation and scrolling
  const [concernErrors, setConcernErrors] = useState<string[]>([]);
  const [showConcernWarning, setShowConcernWarning] = useState(false);
  const concernsRef = useRef<HTMLDivElement>(null);

  // Define concern categories and their labels
  const concernCategories = {
    personal_growth: "Personal Growth",
    depression: "Depression",
    suicidal_thoughts: "Suicidal Thoughts",
    study_skills: "Study Skills",
    family_concerns: "Family Concerns",
    sexual_concerns: "Sexual Concerns",
    educational_concerns: "Educational Concerns",
    anxiety: "Anxiety",
    drug_use: "Drug Use",
    physical_concerns: "Physical Concerns",
    self_concept: "Self Concept",
    decision_making_about_leaving_pup: "Decision Making About Leaving PUP",
    financial_concerns: "Financial Concerns",
    relationship_with_others: "Relationship with Others",
    spirituality: "Spirituality",
    weight_eating_issues: "Weight/Eating Issues",
    career: "Career",
  };

  // Validation function for concerns
  const validateConcerns = () => {
    const unansweredConcerns: string[] = [];

    Object.entries(concernCategories).forEach(([key, label]) => {
      if (formData.concerns[key as keyof typeof formData.concerns] === undefined) {
        unansweredConcerns.push(label);
      }
    });

    setConcernErrors(unansweredConcerns);
    setShowConcernWarning(unansweredConcerns.length > 0);

    return unansweredConcerns.length === 0;
  };

  // Scroll to concerns section
  const scrollToConcerns = () => {
    if (concernsRef.current) {
      concernsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      // Optional: Add a slight delay then focus on the first unanswered concern
      setTimeout(() => {
        const firstErrorConcern = Object.keys(concernCategories).find(
          (key) => formData.concerns[key as keyof typeof formData.concerns] === undefined
        );

        if (firstErrorConcern) {
          const firstRadio = document.querySelector(
            `input[name="concern_${firstErrorConcern}"]`
          ) as HTMLInputElement;
          if (firstRadio) {
            firstRadio.focus();
          }
        }
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate concerns before submission
    const areConcernsValid = validateConcerns();

    if (!areConcernsValid) {
      scrollToConcerns();
      return;
    }

    // Clear any previous warnings
    setShowConcernWarning(false);
    setConcernErrors([]);

    await onSubmit(formData);
  };

  const handleFieldChange = (field: keyof ConsentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConcernChange = (concernType: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      concerns: {
        ...prev.concerns,
        [concernType]: value,
      },
    }));
  };

  const isFormValid =
    formData.financial_status &&
    formData.physical_problem &&
    formData.physical_symptoms &&
    formData.services &&
    // Check that ALL concerns are filled (all fields required)
    Object.values(formData.concerns).every((value) => value !== undefined) &&
    // Check that terms are accepted
    termsAccepted;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Referral Information */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Referral Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            id="referred"
            label="How were you referred to guidance?"
            value={formData.referred || ""}
            onChange={(value) => handleFieldChange("referred", value)}
            options={referredOptions}
            disabled={loading}
          />

          <FormSelect
            id="living"
            label="Who do you live with?"
            value={formData.with_whom_do_you_live || ""}
            onChange={(value) => handleFieldChange("with_whom_do_you_live", value)}
            options={livingOptions}
            disabled={loading}
          />
        </div>
      </div>

      {/* Financial and Personal Information */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Personal Information
        </h3>

        <div className="space-y-4">
          <FormSelect
            id="financial_status"
            label="How would you describe your financial situation? *"
            value={formData.financial_status}
            onChange={(value) => handleFieldChange("financial_status", value)}
            options={financialStatusOptions}
            required
            disabled={loading}
          />

          <div>
            <Label
              htmlFor="guidance_reason"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              What brings you to guidance counseling?
            </Label>
            <textarea
              id="guidance_reason"
              value={formData.what_brings_you_to_guidance || ""}
              onChange={(e) => handleFieldChange("what_brings_you_to_guidance", e.target.value)}
              placeholder="Please describe what brings you here..."
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400 disabled:opacity-50"
              disabled={loading}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Physical Health */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Physical Health</h3>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Are you experiencing any physical problems? *
            </Label>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="physical_problem"
                  value="yes"
                  checked={formData.physical_problem === "yes"}
                  onChange={(e) => handleFieldChange("physical_problem", e.target.value)}
                  disabled={loading}
                  className="w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="physical_problem"
                  value="no"
                  checked={formData.physical_problem === "no"}
                  onChange={(e) => handleFieldChange("physical_problem", e.target.value)}
                  disabled={loading}
                  className="w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <FormSelect
            id="physical_symptoms"
            label="What physical symptoms are you experiencing? *"
            value={formData.physical_symptoms}
            onChange={(value) => handleFieldChange("physical_symptoms", value)}
            options={physicalSymptomsOptions}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Concerns Assessment */}
      <div ref={concernsRef} className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Level of Concerns</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please rate your level of concern in each area (all fields are required):
        </p>

        {/* Helpful tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> If an area doesn't apply to you, please select "Not Applicable".
            All categories must be completed to proceed with your consent form.
          </p>
        </div>

        {/* Warning message for incomplete concerns */}
        {showConcernWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Please complete all concern level ratings
                </h4>
                <p className="text-sm text-red-700 mb-2">
                  The following areas still need your response:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {concernErrors.map((concern, index) => (
                    <li key={index}>{concern}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(concernCategories).map(([key, label]) => {
            const isUnanswered =
              formData.concerns[key as keyof typeof formData.concerns] === undefined;
            const hasError = showConcernWarning && isUnanswered;

            return (
              <div
                key={key}
                className={`${hasError ? "bg-red-50 border border-red-200 rounded-lg p-3" : ""}`}
              >
                <Label
                  className={`text-sm font-medium mb-2 block ${
                    hasError ? "text-red-800" : "text-gray-700"
                  }`}
                >
                  {label} {hasError && <span className="text-red-600">*</span>}
                </Label>
                <div className="flex gap-4 flex-wrap">
                  {concernLevels.map((level) => (
                    <label key={level.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`concern_${key}`}
                        value={level.value}
                        checked={
                          formData.concerns[key as keyof typeof formData.concerns] === level.value
                        }
                        onChange={(e) => {
                          handleConcernChange(key, e.target.value);
                          // Clear the warning when user starts answering
                          if (showConcernWarning) {
                            const updatedErrors = concernErrors.filter((error) => error !== label);
                            setConcernErrors(updatedErrors);
                            if (updatedErrors.length === 0) {
                              setShowConcernWarning(false);
                            }
                          }
                        }}
                        disabled={loading}
                        className="w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-700">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services and Support */}
      {/* <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Services and Support</h3>

        <FormSelect
          id="services"
          label="What type of service are you interested in? *"
          value={formData.services}
          onChange={(value) => handleFieldChange("services", value)}
          options={servicesOptions}
          required
          disabled={loading}
        />
      </div> */}

      {/* Disclaimer */}
      {/* <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Important:</strong> The information you provide will be used to create a preliminary mental health
          assessment. This is for screening purposes only and should not be considered a professional diagnosis. For
          comprehensive mental health evaluation, please consult with qualified mental health professionals.
        </p>
      </div> */}

      {/* Terms and Conditions */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          Terms and Conditions
        </h3>

        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
            <p className="text-xs sm:text-sm text-yellow-800">
              <strong>Data Privacy Notice:</strong> Your personal information will be securely
              stored and used exclusively for mental health assessments and counseling services. We
              ensure your privacy through encryption, strict access controls, and adherence to
              privacy laws.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                if (e.target.checked) {
                  // Open modal when checkbox is checked
                  setShowTermsModal(true);
                } else {
                  // Allow unchecking without modal
                  setTermsAccepted(false);
                }
              }}
              disabled={loading}
              className="mt-1 w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="terms-checkbox" className="text-sm text-gray-700 cursor-pointer">
              I acknowledge that I have read and agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-primary-700 hover:text-primary-800 underline font-medium"
                disabled={loading}
              >
                Terms and Conditions
              </button>{" "}
              regarding the collection, use, and protection of my personal information for mental
              health assessment and counseling purposes.
            </label>
          </div>

          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Checking the box above will open the Terms and Conditions for you
            to review. You must read and accept the terms to submit the consent form.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        {/* Progress indicator for concerns */}
        {(() => {
          const totalConcerns = Object.keys(concernCategories).length;
          const answeredConcerns = Object.values(formData.concerns).filter(
            (value) => value !== undefined
          ).length;
          const progressPercentage = (answeredConcerns / totalConcerns) * 100;

          if (answeredConcerns < totalConcerns) {
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Concerns Progress: {answeredConcerns} of {totalConcerns} completed
                  </span>
                  <span className="text-sm text-blue-600">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Please complete all concern level ratings to proceed.
                </p>
              </div>
            );
          }
          return null;
        })()}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Consent Form"}
          </Button>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setTermsAccepted(true)}
      />
    </form>
  );
};
