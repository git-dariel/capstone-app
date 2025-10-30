import React from "react";
import { Modal } from "@/components/atoms/Modal";
import { Button } from "@/components/ui/button";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms and Conditions" size="lg">
      <div className="space-y-4 sm:space-y-6 max-h-80 sm:max-h-96 overflow-y-auto">
        {/* Data Collection and Use */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Personal Information Collection and Use</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>
              By submitting this consent form, you agree to the collection and use of your personal information by the
              Office of Guidance and Counseling Services (OGCS) for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4">
              <li>Conducting preliminary mental health assessments and screenings</li>
              <li>Providing personalized counseling and support services</li>
              <li>Maintaining confidential student records for ongoing care</li>
              <li>Generating anonymous statistical reports for service improvement</li>
              <li>Coordinating with qualified mental health professionals when necessary</li>
            </ul>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Data Security and Privacy Protection</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>Your personal information and mental health data are protected by:</p>
            <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4">
              <li>Industry-standard encryption and secure data storage systems</li>
              <li>Strict access controls limited to authorized OGCS staff only</li>
              <li>Regular security audits and compliance monitoring</li>
              <li>Adherence to university privacy policies and applicable laws</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>
          </div>
        </section>

        {/* Confidentiality */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Confidentiality and Information Sharing</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>Your information will remain confidential and will only be shared in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4">
              <li>With your explicit written consent</li>
              <li>When required by law or court order</li>
              <li>In cases of immediate safety concerns or risk of harm to self or others</li>
              <li>For consultation with other qualified mental health professionals within OGCS</li>
              <li>For emergency medical situations</li>
            </ul>
          </div>
        </section>

        {/* Assessment Limitations */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            Assessment Limitations and Professional Disclaimer
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>You understand and acknowledge that:</p>
            <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4">
              <li>
                Initial assessments are for screening purposes only and do not constitute a professional diagnosis
              </li>
              <li>Comprehensive mental health evaluation requires consultation with licensed professionals</li>
              <li>OGCS services supplement but do not replace professional psychiatric or psychological treatment</li>
              <li>You are encouraged to seek additional professional help when recommended</li>
            </ul>
          </div>
        </section>

        {/* Data Retention */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Data Retention and Deletion</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>Your personal information will be:</p>
            <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4">
              <li>Retained for the duration of your enrollment at the university</li>
              <li>Maintained for up to 7 years after graduation for follow-up services</li>
              <li>Securely deleted upon your written request (except where retention is legally required)</li>
              <li>Anonymized for research purposes when personally identifiable information is no longer needed</li>
            </ul>
          </div>
        </section>

        {/* Rights */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Your Rights</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4">
              <li>Access and review your personal information held by OGCS</li>
              <li>Request corrections to any inaccurate information</li>
              <li>Withdraw your consent at any time (subject to legal and safety considerations)</li>
              <li>File a complaint regarding data handling practices</li>
              <li>Request a copy of your records for personal use or transfer to another provider</li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Contact Information</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>
              For questions about these terms, your privacy rights, or data handling practices, please contact the
              Office of Guidance and Counseling Services:
            </p>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg mt-2">
              <p className="text-xs sm:text-sm">
                <strong>Email:</strong> codotado@pup.edu.ph
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Contact Number:</strong> 0928-832-7363
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Office:</strong> Educ Building 2nd Floor Guidance Office
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 mt-4 sm:mt-6">
        <Button onClick={onClose} variant="outline" className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm sm:text-base">
          Cancel
        </Button>
        <Button onClick={handleAccept} variant="default" className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm sm:text-base">
          I Understand and Agree
        </Button>
      </div>
    </Modal>
  );
};
