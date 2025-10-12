import React from "react";
import { Drawer } from "@/components/atoms";
import { Avatar } from "@/components/atoms";
import {
  Calendar,
  Mail,
  User,
  GraduationCap,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { GetInventoryResponse } from "@/services/inventory.service";

interface ViewInventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory?: GetInventoryResponse | null;
}

export const ViewInventoryDrawer: React.FC<ViewInventoryDrawerProps> = ({
  isOpen,
  onClose,
  inventory,
}) => {
  if (!isOpen || !inventory) {
    return null;
  }

  const getPerformanceIcon = (outlook?: "improved" | "same" | "declined") => {
    switch (outlook) {
      case "improved":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declined":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "same":
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRiskLevelColor = (level?: "low" | "moderate" | "high" | "critical") => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const studentName = inventory.student?.person
    ? `${inventory.student.person.firstName || ""} ${
        inventory.student.person.lastName || ""
      }`.trim()
    : "Unknown Student";
  
  const studentAvatar = inventory.student?.person?.users?.[0]?.avatar; // Get avatar from user account

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Inventory Details" size="xl">
      <div className="space-y-6 antialiased">
        {/* Student Header */}
        <div className="bg-primary-100 border border-primary-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <Avatar src={studentAvatar} fallback={studentName.charAt(0)} className="w-16 h-16 text-lg" />
            <div>
              <h2 className="text-2xl font-bold text-primary-900">{studentName}</h2>
              <div className="flex items-center space-x-4 mt-2 text-primary-700">
                <div className="flex items-center space-x-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{inventory.student?.program || "N/A"}</span>
                </div>
                <div className="text-sm">Year {inventory.student?.year || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Student Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>Student Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {studentName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Number</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {inventory.student?.studentNumber || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {inventory.student?.program || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {inventory.student?.year || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{inventory.student?.person?.email || "N/A"}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {inventory.student?.person?.gender || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Physical Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>Physical Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {inventory.height}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {inventory.weight}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complexion</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                {inventory.coplexion}
              </div>
            </div>
          </div>
        </div>

        {/* Mental Health Prediction */}
        {inventory.predictionGenerated && inventory.mentalHealthPrediction && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary-600" />
              <span>Mental Health Prediction</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Performance Outlook
                  </label>
                  <div className="flex items-center space-x-2">
                    {getPerformanceIcon(
                      inventory.mentalHealthPrediction.academicPerformanceOutlook
                    )}
                    <span className="text-sm text-gray-900 capitalize">
                      {inventory.mentalHealthPrediction.academicPerformanceOutlook}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confidence</label>
                  <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                    {(inventory.mentalHealthPrediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <span
                    className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg capitalize ${getRiskLevelColor(
                      inventory.mentalHealthPrediction.mentalHealthRisk.level
                    )}`}
                  >
                    {inventory.mentalHealthPrediction.mentalHealthRisk.level}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Needs Attention
                  </label>
                  <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                    {inventory.mentalHealthPrediction.mentalHealthRisk.needsAttention ? (
                      <span className="text-orange-600 font-medium">⚠️ Yes</span>
                    ) : (
                      "No"
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Description
                </label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {inventory.mentalHealthPrediction.mentalHealthRisk.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Summary
                </label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {inventory.mentalHealthPrediction.mentalHealthRisk.assessmentSummary}
                </div>
              </div>

              {inventory.mentalHealthPrediction.riskFactors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Factors
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <ul className="list-disc list-inside space-y-1">
                      {inventory.mentalHealthPrediction.riskFactors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-900">
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {inventory.mentalHealthPrediction.recommendations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations
                  </label>
                  <div className="bg-primary-50 rounded-lg p-3">
                    <ul className="list-disc list-inside space-y-1">
                      {inventory.mentalHealthPrediction.recommendations.map(
                        (recommendation, index) => (
                          <li key={index} className="text-sm text-primary-800">
                            {recommendation}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  {inventory.mentalHealthPrediction.mentalHealthRisk.disclaimer}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Record Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>Record Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatDate(inventory.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatDate(inventory.updatedAt)}
              </div>
            </div>
            {inventory.predictionUpdatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prediction Updated
                </label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {formatDate(inventory.predictionUpdatedAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
