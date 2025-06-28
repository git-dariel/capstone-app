import React from "react";
import { Phone, MessageCircle, Heart, Users } from "lucide-react";
import { ContactCard } from "@/components/atoms";

export const CrisisResourcesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-red-900 mb-2">🚨 Crisis Resources</h2>
        <p className="text-red-700">
          If you're having thoughts of self-harm or suicide, please reach out immediately. Help is
          available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactCard
          title="National Suicide Prevention Lifeline"
          description="Free and confidential emotional support for people in suicidal crisis or emotional distress."
          contactInfo="988"
          availability="24/7/365"
          urgent={true}
          icon={<Phone className="w-6 h-6" />}
        />

        <ContactCard
          title="Crisis Text Line"
          description="Text with a trained crisis counselor who can provide support and information."
          contactInfo="Text HOME to 741741"
          availability="24/7/365"
          urgent={true}
          icon={<MessageCircle className="w-6 h-6" />}
        />

        <ContactCard
          title="NAMI HelpLine"
          description="Information, resource referrals and support for people living with mental health conditions."
          contactInfo="1-800-950-NAMI (6264)"
          availability="Mon-Fri, 10am-10pm ET"
          urgent={false}
          icon={<Heart className="w-6 h-6" />}
        />

        <ContactCard
          title="Student Counseling Center"
          description="Professional counseling services specifically for students. Free and confidential."
          contactInfo="(555) 123-HELP"
          availability="Mon-Fri, 8am-5pm"
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
