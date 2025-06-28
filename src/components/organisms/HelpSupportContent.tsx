import React, { useState } from "react";
import {
  CrisisResourcesSection,
  FAQSection,
  SupportOptionsSection,
  ContactSupportForm,
} from "@/components/molecules";

type HelpView = "main" | "contact";

export const HelpSupportContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<HelpView>("main");

  const handleContactSupport = () => {
    setCurrentView("contact");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {currentView === "main" && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
              <p className="text-gray-600 mt-1">
                Find answers, get support, and access resources to help you succeed with Bloom.
              </p>
            </div>

            {/* Crisis Resources - Always visible at top */}
            <div className="mb-12">
              <CrisisResourcesSection />
            </div>

            {/* Support Options */}
            <div className="mb-12">
              <SupportOptionsSection onContactSupport={handleContactSupport} />
            </div>

            {/* FAQ Section */}
            <div className="mb-8">
              <FAQSection />
            </div>

            {/* Additional Resources */}
            <div className="bg-teal-50 rounded-lg p-6 mt-12">
              <h3 className="text-lg font-semibold text-teal-900 mb-2">🌟 Additional Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-teal-800 mb-2">Campus Resources</h4>
                  <ul className="space-y-1 text-teal-700">
                    <li>• Student Health Center</li>
                    <li>• Academic Support Center</li>
                    <li>• Campus Recreation & Wellness</li>
                    <li>• Student Affairs Office</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-teal-800 mb-2">Online Resources</h4>
                  <ul className="space-y-1 text-teal-700">
                    <li>• Mental Health First Aid Training</li>
                    <li>• Mindfulness & Meditation Apps</li>
                    <li>• Study Skills & Time Management</li>
                    <li>• Stress Reduction Techniques</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === "contact" && <ContactSupportForm onBack={handleBackToMain} />}
      </div>
    </main>
  );
};
