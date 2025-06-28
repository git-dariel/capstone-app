import { HelpCard } from "@/components/atoms";
import { BookOpen, Calendar, Headphones, MessageSquare, UserCheck } from "lucide-react";
import React from "react";

interface SupportOptionsSectionProps {
  onContactSupport?: () => void;
}

export const SupportOptionsSection: React.FC<SupportOptionsSectionProps> = ({
  onContactSupport,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🤝 How We Can Help</h2>
        <p className="text-gray-600">
          Choose the type of support that best fits your needs. We're here to help you succeed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HelpCard
          title="Technical Support"
          description="Having trouble with the platform? Get help with login issues, assessment problems, or other technical difficulties."
          icon={<Headphones className="w-6 h-6" />}
          onClick={onContactSupport}
        >
          <div className="text-sm text-teal-600 font-medium">Email • Live Chat • FAQ</div>
        </HelpCard>

        <HelpCard
          title="Getting Started Guide"
          description="New to Bloom? Learn how to navigate the platform, take assessments, and understand your results."
          icon={<BookOpen className="w-6 h-6" />}
        >
          <div className="text-sm text-teal-600 font-medium">Interactive Tutorial</div>
        </HelpCard>

        <HelpCard
          title="Schedule Counseling"
          description="Book an appointment with our licensed counselors for professional mental health support."
          icon={<Calendar className="w-6 h-6" />}
        >
          <div className="text-sm text-teal-600 font-medium">Free for Students</div>
        </HelpCard>

        <HelpCard
          title="Peer Support Groups"
          description="Connect with other students in facilitated support groups focused on anxiety, depression, and stress management."
          icon={<UserCheck className="w-6 h-6" />}
        >
          <div className="text-sm text-teal-600 font-medium">Weekly Sessions</div>
        </HelpCard>

        <HelpCard
          title="Mental Health Resources"
          description="Access educational materials, coping strategies, and self-help tools to support your mental wellness journey."
          icon={<BookOpen className="w-6 h-6" />}
        >
          <div className="text-sm text-teal-600 font-medium">Articles • Videos • Tools</div>
        </HelpCard>

        <HelpCard
          title="Contact Support Team"
          description="Have a specific question or need personalized assistance? Reach out to our dedicated support team."
          icon={<MessageSquare className="w-6 h-6" />}
          onClick={onContactSupport}
        >
          <div className="text-sm text-teal-600 font-medium">24-48 hour response</div>
        </HelpCard>
      </div>
    </div>
  );
};
