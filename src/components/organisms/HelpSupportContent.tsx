import { ContactSupportForm, CrisisResourcesSection, FAQSection } from "@/components/molecules";
import React, { useState } from "react";

type HelpView = "main" | "contact";

export const HelpSupportContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<HelpView>("main");

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
                Find answers, get support, and access resources to help you succeed with Office of Guidance and
                Counseling Services.
              </p>
            </div>

            {/* Crisis Resources - Always visible at top */}
            <div className="mb-12">
              <CrisisResourcesSection />
            </div>

            {/* FAQ Section */}
            <div className="mb-8">
              <FAQSection />
            </div>
          </>
        )}

        {currentView === "contact" && <ContactSupportForm onBack={handleBackToMain} />}
      </div>
    </main>
  );
};
