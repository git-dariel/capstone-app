import React from "react";
import {
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Heart,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Drawer, Avatar } from "@/components/atoms";
import type { GetConsentResponse } from "@/services/consent.service";

interface ViewConsentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  consent: GetConsentResponse | null;
}

const formatLabel = (value: string) => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ViewConsentDrawer: React.FC<ViewConsentDrawerProps> = ({
  isOpen,
  onClose,
  consent,
}) => {
  if (!consent) return null;

  const studentName = consent.student
    ? `${consent.student.person.firstName} ${consent.student.person.lastName}`
    : "Unknown Student";
    
  const studentAvatar = consent.student?.person?.users?.[0]?.avatar;

  const renderConcerns = (concerns: any) => {
    if (!concerns || typeof concerns !== "object") {
      return (
        <div className="text-sm text-gray-500 py-2 px-3 bg-gray-50 rounded-md">
          No concerns data available
        </div>
      );
    }

    const concernLevels: Record<string, string> = {
      not_applicable: "N/A",
      leat_important: "Least Important",
      somewhat_important: "Somewhat Important",
      important: "Important",
      very_important: "Very Important",
      most_important: "Most Important",
    };

    const activeConcerns = Object.entries(concerns).filter(
      ([_, value]) => value && value !== "not_applicable"
    );

    if (activeConcerns.length === 0) {
      return (
        <div className="text-sm text-gray-500 py-2 px-3 bg-gray-50 rounded-md">
          No active concerns
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3">
        {activeConcerns.map(([key, value]) => {
          const valueStr = String(value);
          const level = concernLevels[valueStr] || valueStr;
          const concernName = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
            >
              <span className="text-sm text-gray-900 font-medium">{concernName}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  value === "most_important"
                    ? "bg-red-100 text-red-800"
                    : value === "very_important"
                    ? "bg-orange-100 text-orange-800"
                    : value === "important"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {level}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Consent Record Details" size="xl">
      <div className="space-y-6">
        {/* Student Header */}
        {consent.student && (
          <div className="bg-primary-100 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Avatar
                src={studentAvatar}
                fallback={`${consent.student.person.firstName.charAt(
                  0
                )}${consent.student.person.lastName.charAt(0)}`}
                className="w-16 h-16 text-lg"
              />
              <div>
                <h2 className="text-2xl font-bold text-primary-900">{studentName}</h2>
                <div className="flex items-center space-x-4 mt-2 text-primary-700">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-sm">{consent.student.program}</span>
                  </div>
                  <div className="text-sm">Year {consent.student.year}</div>
                  <div className="text-sm">{consent.student.studentNumber}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Student Information */}
        {consent.student && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-primary-600" />
              <span>Student Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {consent.student.person.email || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {formatLabel(consent.student.person.gender) || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {consent.student.person.age ? `${consent.student.person.age} years old` : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consent Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <span>Consent Details</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatLabel(consent.referred) || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Services Needed
              </label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatLabel(consent.services) || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Living Situation
              </label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatLabel(consent.with_whom_do_you_live) || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Status
              </label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatLabel(consent.financial_status) || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Date
              </label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(consent.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health & Wellness */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-primary-600" />
            <span>Health & Wellness</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Problems
              </label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {consent.physical_problem === "yes" ? "Yes" : "No"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Symptoms
              </label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatLabel(consent.physical_symptoms) || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Areas of Concern */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-primary-600" />
            <span>Areas of Concern</span>
          </h3>
          {renderConcerns(consent.concerns)}
        </div>

        {/* Guidance Information */}
        {consent.what_brings_you_to_guidance && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-primary-600" />
              <span>What Brings You to Guidance</span>
            </h3>
            <div className="text-sm text-gray-900 py-3 px-4 bg-gray-50 rounded-md leading-relaxed">
              {consent.what_brings_you_to_guidance}
            </div>
          </div>
        )}

        {/* Record Metadata */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>Record Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Record ID</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md font-mono">
                {consent.id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(consent.createdAt)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(consent.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
