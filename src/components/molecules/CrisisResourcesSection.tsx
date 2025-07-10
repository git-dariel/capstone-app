import React from "react";
import { Phone, MessageCircle, Heart, Users } from "lucide-react";
import { ContactCard } from "@/components/atoms";

export const CrisisResourcesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-red-900 mb-2">🚨 Crisis Resources</h2>
        <p className="text-red-700">
          If you're having thoughts of self-harm or suicide, please reach out immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactCard
          title="Municipal Disaster Risk Reduction and Management Office"
          description="It is a local government unit in the Philippines responsible for disaster risk reduction and management at the municipal level."
          contactInfo="042.717.4364/0909-341-0636"
          availability="24/7"
          urgent={true}
          icon={<Phone className="w-6 h-6" />}
        />

        <ContactCard
          title="Philippine National Police"
          description="It is the national police force of the country, responsible for maintaining peace and order, enforcing laws, and ensuring public safety."
          contactInfo="042.236.1269/0947-998-7085/0908-489-8919"
          availability="24/7"
          urgent={true}
          icon={<MessageCircle className="w-6 h-6" />}
        />

        <ContactCard
          title="National Emergency Hotline in the Philippines"
          description=" It is managed by the Emergency 911 National Office and serves as a single number for police, fire, medical, and other emergency services."
          contactInfo="911"
          availability="24/7"
          urgent={false}
          icon={<Heart className="w-6 h-6" />}
        />

        <ContactCard
          title="Student Counseling Center"
          description="Professional counseling services specifically for students. Free and confidential."
          contactInfo="0928-832-7363/codotado@pup.edu.ph"
          availability="Mon-Fri, 8am-8pm"
          urgent={false}
          icon={<Users className="w-6 h-6" />}
        />
      </div>

      <div className="bg-red-100 border border-red-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Emergency Situations</h3>
        <p className="text-red-800 text-sm leading-relaxed">
          If you or someone you know is in immediate danger, call <strong>911</strong> or go to your
          nearest emergency room. Don't wait - your safety is the top priority.
        </p>
      </div>
    </div>
  );
};
