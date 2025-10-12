import React from "react";
import { Drawer } from "@/components/atoms";
import { Avatar } from "@/components/atoms";
import type { Student } from "@/services/student.service";
import { Calendar, Mail, Phone, User, GraduationCap, FileText, Activity } from "lucide-react";

interface ViewStudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

export const ViewStudentDrawer: React.FC<ViewStudentDrawerProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!student) return null;

  const person = student.person;
  const studentName = person ? `${person.firstName} ${person.lastName}` : "Unknown Student";
  const studentAvatar = person?.users?.[0]?.avatar; // Get avatar from user account

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLatestAssessment = (person: any) => {
    if (!person?.users?.[0]) return null;

    const user = person.users[0];
    const allAssessments = [];

    // Collect all assessments with their types
    if (user.anxietyAssessments?.[0]) {
      allAssessments.push({
        type: "anxiety" as const,
        severityLevel: user.anxietyAssessments[0].severityLevel,
        assessmentDate: user.anxietyAssessments[0].assessmentDate,
        totalScore: user.anxietyAssessments[0].totalScore,
      });
    }

    if (user.depressionAssessments?.[0]) {
      allAssessments.push({
        type: "depression" as const,
        severityLevel: user.depressionAssessments[0].severityLevel,
        assessmentDate: user.depressionAssessments[0].assessmentDate,
        totalScore: user.depressionAssessments[0].totalScore,
      });
    }

    if (user.stressAssessments?.[0]) {
      allAssessments.push({
        type: "stress" as const,
        severityLevel: user.stressAssessments[0].severityLevel,
        assessmentDate: user.stressAssessments[0].assessmentDate,
        totalScore: user.stressAssessments[0].totalScore,
      });
    }

    if (user.suicideAssessments?.[0]) {
      allAssessments.push({
        type: "suicide" as const,
        riskLevel: user.suicideAssessments[0].riskLevel,
        assessmentDate: user.suicideAssessments[0].assessmentDate,
      });
    }

    // Find the most recent assessment
    if (allAssessments.length === 0) return null;

    return allAssessments.reduce((latest, current) => {
      const latestDate = new Date(latest.assessmentDate);
      const currentDate = new Date(current.assessmentDate);
      return currentDate > latestDate ? current : latest;
    });
  };

  const latestAssessment = getLatestAssessment(person);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
      case "minimal":
        return "text-green-700 bg-green-100 border-green-300";
      case "mild":
        return "text-blue-700 bg-blue-100 border-blue-300";
      case "moderate":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "moderately_severe":
        return "text-orange-700 bg-orange-100 border-orange-300";
      case "high":
      case "severe":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "stress":
        return "text-blue-700 bg-blue-50";
      case "anxiety":
        return "text-purple-700 bg-purple-50";
      case "depression":
        return "text-indigo-700 bg-indigo-50";
      case "suicide":
        return "text-red-800 bg-red-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  const formatSeverityLabel = (severity: string) => {
    switch (severity) {
      case "moderately_severe":
        return "Moderately Severe";
      default:
        return severity.charAt(0).toUpperCase() + severity.slice(1);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Student Details" size="xl">
      <div className="space-y-6">
        {/* Student Header */}
        <div className="bg-primary-100 border border-primary-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <Avatar src={studentAvatar} fallback={studentName.charAt(0)} className="w-16 h-16 text-lg" />
            <div>
              <h2 className="text-2xl font-bold text-primary-900">{studentName}</h2>
              <div className="flex items-center space-x-4 mt-2 text-primary-700">
                <div className="flex items-center space-x-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{student.program}</span>
                </div>
                <div className="text-sm">Year {student.year}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>Personal Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.firstName || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.lastName || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.middleName || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.gender || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(person?.birthDate)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.age || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.religion || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {person?.civilStatus || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary-600" />
            <span>Contact Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{person?.email || "N/A"}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{person?.contactNumber || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Assessment */}
        {latestAssessment && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary-600" />
              <span>Latest Mental Health Assessment</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Type
                </label>
                <div
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getTypeColor(
                    latestAssessment.type
                  )}`}
                >
                  {latestAssessment.type === "suicide"
                    ? "Suicide Risk"
                    : latestAssessment.type.charAt(0).toUpperCase() +
                      latestAssessment.type.slice(1)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {latestAssessment.type === "suicide" ? "Risk Level" : "Severity Level"}
                </label>
                <div
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${getSeverityColor(
                    latestAssessment.type === "suicide"
                      ? latestAssessment.riskLevel!
                      : latestAssessment.severityLevel!
                  )}`}
                >
                  {formatSeverityLabel(
                    latestAssessment.type === "suicide"
                      ? latestAssessment.riskLevel!
                      : latestAssessment.severityLevel!
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Date
                </label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {formatDate(latestAssessment.assessmentDate)}
                </div>
              </div>
              {latestAssessment.totalScore && (
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Score
                  </label>
                  <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                    {latestAssessment.totalScore}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <span>Consultant Records ({student.notes?.length || 0})</span>
          </h3>
          <div className="space-y-3">
            {student.notes && student.notes.length > 0 ? (
              student.notes.map((note, index) => (
                <div key={index} className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-primary-900">
                      {note.title || `Consultant Record ${index + 1}`}
                    </h4>
                    <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                      Consultant Record #{index + 1}
                    </span>
                  </div>
                  {note.content && (
                    <div className="text-sm text-primary-800 whitespace-pre-wrap">
                      {note.content}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No consultant records available for this student
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>Record Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatDate(student.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatDate(student.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
