import React from "react";
import { Avatar } from "@/components/atoms";
import { cn } from "@/lib/utils";

type DepressionSeverityLevel = "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
type AnxietySeverityLevel = "minimal" | "mild" | "moderate" | "severe";
type StressSeverityLevel = "low" | "moderate" | "high";
type SeverityLevel =
  | DepressionSeverityLevel
  | AnxietySeverityLevel
  | StressSeverityLevel
  | "pending";

interface Activity {
  id: string;
  studentName: string;
  assessmentType: string;
  score: number;
  severityLevel: SeverityLevel;
  date: string;
  avatar?: string;
}

export const RecentActivitiesTable: React.FC = () => {
  const activities: Activity[] = [
    {
      id: "1",
      studentName: "Alice Johnson",
      assessmentType: "Anxiety Assessment",
      score: 72,
      severityLevel: "severe",
      date: "Oct 25, 2024",
    },
    {
      id: "2",
      studentName: "Michael Chen",
      assessmentType: "Depression Screening",
      score: 45,
      severityLevel: "moderate",
      date: "Oct 25, 2024",
    },
    {
      id: "3",
      studentName: "Sarah Williams",
      assessmentType: "Stress Evaluation",
      score: 89,
      severityLevel: "high",
      date: "Oct 24, 2024",
    },
    {
      id: "4",
      studentName: "David Rodriguez",
      assessmentType: "Anxiety Assessment",
      score: 34,
      severityLevel: "mild",
      date: "Oct 24, 2024",
    },
    {
      id: "5",
      studentName: "Emma Davis",
      assessmentType: "Depression Screening",
      score: 10,
      severityLevel: "mild",
      date: "Oct 23, 2024",
    },
  ];

  const getSeverityColor = (severityLevel: SeverityLevel) => {
    switch (severityLevel) {
      case "severe":
      case "moderately_severe":
      case "high":
        return "bg-red-100 text-red-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "mild":
      case "low":
        return "bg-orange-100 text-orange-800";
      case "minimal":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number, severityLevel: SeverityLevel) => {
    if (severityLevel === "pending") return "text-gray-400";
    if (score >= 70) return "text-red-600 font-semibold";
    if (score >= 50) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const formatSeverityLevel = (severityLevel: SeverityLevel) => {
    if (severityLevel === "moderately_severe") return "Moderately Severe";
    return severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        <p className="text-sm text-gray-500">Assessment submissions and evaluations</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      src={activity.avatar}
                      fallback={activity.studentName.charAt(0)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.studentName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{activity.assessmentType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={cn("text-sm", getScoreColor(activity.score, activity.severityLevel))}
                  >
                    {activity.severityLevel === "pending" ? "-" : `${activity.score}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      getSeverityColor(activity.severityLevel)
                    )}
                  >
                    {formatSeverityLevel(activity.severityLevel)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
