import React from "react";
import { FAQItem } from "@/components/atoms";

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How do I take a mental health assessment?",
      answer:
        "Go to the Resources page and select the assessment you'd like to take. Choose from anxiety (GAD-7), depression (PHQ-9), or stress assessments. Each takes just 2-3 minutes to complete and provides immediate results with your severity level.",
    },
    {
      question: "Are my assessment results confidential?",
      answer:
        "Yes, your privacy is our top priority. All assessment results are stored securely and only accessible to you and authorized mental health professionals if you choose to share them. We follow HIPAA guidelines to protect your information.",
    },
    {
      question: "What do my assessment scores mean?",
      answer:
        "Assessment scores are categorized into severity levels (minimal, mild, moderate, severe) to help you understand your current mental health status. These are screening tools, not diagnostic instruments. If you have concerns about your results, please consult with a mental health professional.",
    },
    {
      question: "How often should I take assessments?",
      answer:
        "You can take assessments as often as you'd like to track your mental health over time. Many people find it helpful to take them weekly or monthly. Consistent tracking can help you identify patterns and monitor your progress.",
    },
    {
      question: "What should I do if my results show high severity?",
      answer:
        "If your results indicate moderate to severe symptoms, we strongly encourage you to reach out to a mental health professional. You can contact our Student Counseling Center or use the crisis resources provided. Remember, seeking help is a sign of strength.",
    },
    {
      question: "Can I share my results with my counselor?",
      answer:
        "Absolutely! You can print or screenshot your results to share with your therapist, counselor, or doctor. This can help them understand your current symptoms and track your progress over time.",
    },
    {
      question: "Is this platform a replacement for therapy?",
      answer:
        "No, this platform is a screening and tracking tool to complement professional mental health care. It cannot replace therapy, counseling, or medical treatment. Please consult with qualified mental health professionals for diagnosis and treatment.",
    },
    {
      question: "How do I access counseling services?",
      answer:
        "Our Student Counseling Center offers free, confidential counseling services. You can call (555) 123-HELP to schedule an appointment or visit our campus wellness center. Emergency services are available 24/7.",
    },
    {
      question: "What if I'm having technical issues with the platform?",
      answer:
        "If you experience any technical problems, please contact our support team at support@bloomhealth.edu or use the contact form below. We typically respond within 24 hours during business days.",
    },
    {
      question: "Can I retake assessments if I made a mistake?",
      answer:
        "Yes, you can retake any assessment at any time. Your most recent results will be saved, and you can track changes over time. There's no limit to how many times you can use the assessments.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">💬 Frequently Asked Questions</h2>
        <p className="text-gray-600">
          Find answers to common questions about using Bloom and mental health resources.
        </p>
      </div>

      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};
