import React, { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { FormField, FormSelect } from "@/components/atoms";

interface ContactSupportFormProps {
  onBack?: () => void;
}

export const ContactSupportForm: React.FC<ContactSupportFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "normal",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate form submission
    alert(
      `Support request submitted successfully!\n\nThank you, ${formData.name}. We'll respond to ${formData.email} within 24-48 hours.\n\nTicket Category: ${formData.category}\nSubject: ${formData.subject}`
    );

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
      priority: "normal",
    });

    if (onBack) onBack();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const categories = [
    { value: "technical", label: "Technical Issues" },
    { value: "assessments", label: "Assessment Questions" },
    { value: "account", label: "Account Problems" },
    { value: "counseling", label: "Counseling Services" },
    { value: "privacy", label: "Privacy Concerns" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "other", label: "Other" },
  ];

  const priorities = [
    { value: "low", label: "Low Priority" },
    { value: "normal", label: "Normal Priority" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent" },
  ];

  const isFormValid =
    formData.name && formData.email && formData.subject && formData.category && formData.message;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Support Options</span>
          </button>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📧 Contact Support</h2>
          <p className="text-gray-600">
            Fill out the form below and we'll get back to you within 24-48 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="contact-name"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
            />

            <FormField
              id="contact-email"
              label="Email Address"
              type="email"
              placeholder="your.email@student.edu"
              value={formData.email}
              onChange={handleInputChange("email")}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              id="contact-category"
              label="Category"
              options={categories}
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              placeholder="Select a category"
            />

            <FormSelect
              id="contact-priority"
              label="Priority Level"
              options={priorities}
              value={formData.priority}
              onChange={(value) => handleChange("priority", value)}
            />
          </div>

          <FormField
            id="contact-subject"
            label="Subject"
            type="text"
            placeholder="Brief description of your issue"
            value={formData.subject}
            onChange={handleInputChange("subject")}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              rows={6}
              placeholder="Please describe your issue or question in detail..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              required
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-sm leading-relaxed">
              <strong>Note:</strong> For urgent mental health concerns or crisis situations, please
              use the crisis resources above or call 988 (Suicide & Crisis Lifeline) immediately.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="px-8 py-3 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
