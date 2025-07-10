import React, { useEffect, useMemo } from "react";
import { Avatar } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { useAnxiety, useDepression, useStress } from "@/hooks";
import { Loader2 } from "lucide-react";

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
  program: string;
  year: string;
  contactNumber: string;
  avatar?: string;
  createdAt: string; // for sorting
}

export const RecentActivitiesTable: React.FC = () => {
  const {
    assessments: anxietyAssessments,
    loading: anxietyLoading,
    fetchAssessments: fetchAnxiety,
  } = useAnxiety();
  const {
    assessments: depressionAssessments,
    loading: depressionLoading,
    fetchAssessments: fetchDepression,
  } = useDepression();
  const {
    assessments: stressAssessments,
    loading: stressLoading,
    fetchAssessments: fetchStress,
  } = useStress();

  // Fetch recent assessments on component mount
  useEffect(() => {
    const fetchRecentAssessments = async () => {
      try {
        const fetchPromises = [
          fetchAnxiety({
            limit: 10,
            order: "desc",
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
          fetchDepression({
            limit: 10,
            order: "desc",
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
          fetchStress({
            limit: 10,
            order: "desc",
            fields:
              "id,userId,totalScore,severityLevel,assessmentDate,createdAt,updatedAt,user.person.firstName,user.person.lastName,user.person.contactNumber,user.person.students.program,user.person.students.year",
          }),
        ];

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    fetchRecentAssessments();
  }, []);

  // Combine and transform all assessments into activities
  const activities: Activity[] = useMemo(() => {
    const allActivities: Activity[] = [];

    // Add anxiety assessments
    anxietyAssessments.forEach((assessment) => {
      if (assessment.user && assessment.user.person) {
        // Type assertion to access additional fields from API response
        const person = assessment.user.person as any;
        const student = (person as any).students?.[0];
        allActivities.push({
          id: `anxiety-${assessment.id}`,
          studentName: `${person.firstName} ${person.lastName}`,
          assessmentType: "Anxiety Assessment",
          score: assessment.totalScore,
          severityLevel: assessment.severityLevel as SeverityLevel,
          date: new Date(assessment.assessmentDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          program: student?.program || "N/A",
          year: student?.year || "N/A",
          contactNumber: (person as any).contactNumber || "N/A",
          createdAt: assessment.createdAt,
        });
      }
    });

    // Add depression assessments
    depressionAssessments.forEach((assessment) => {
      if (assessment.user && assessment.user.person) {
        // Type assertion to access additional fields from API response
        const person = assessment.user.person as any;
        const student = (person as any).students?.[0];
        allActivities.push({
          id: `depression-${assessment.id}`,
          studentName: `${person.firstName} ${person.lastName}`,
          assessmentType: "Depression Screening",
          score: assessment.totalScore,
          severityLevel: assessment.severityLevel as SeverityLevel,
          date: new Date(assessment.assessmentDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          program: student?.program || "N/A",
          year: student?.year || "N/A",
          contactNumber: (person as any).contactNumber || "N/A",
          createdAt: assessment.createdAt,
        });
      }
    });

    // Add stress assessments
    stressAssessments.forEach((assessment) => {
      if (assessment.user && assessment.user.person) {
        // Type assertion to access additional fields from API response
        const person = assessment.user.person as any;
        const student = (person as any).students?.[0];
        allActivities.push({
          id: `stress-${assessment.id}`,
          studentName: `${person.firstName} ${person.lastName}`,
          assessmentType: "Stress Evaluation",
          score: assessment.totalScore,
          severityLevel: assessment.severityLevel as SeverityLevel,
          date: new Date(assessment.assessmentDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          program: student?.program || "N/A",
          year: student?.year || "N/A",
          contactNumber: (person as any).contactNumber || "N/A",
          createdAt: assessment.createdAt,
        });
      }
    });

    // Sort by creation date (most recent first) and limit to 10
    return allActivities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [anxietyAssessments, depressionAssessments, stressAssessments]);

  const isLoading = anxietyLoading || depressionLoading || stressLoading;

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
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Activities</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          {isLoading
            ? "Loading recent assessment activities..."
            : `Recent assessment submissions and evaluations${
                activities.length > 0 ? ` (${activities.length})` : ""
              }`}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading recent activities...</span>
          </div>
        </div>
      ) : activities.length === 0 ? (
        /* Empty State */
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <p className="text-sm">No recent assessment activities found</p>
            <p className="text-xs mt-1">
              Assessment activities will appear here once students complete evaluations
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View - Card Layout */}
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Avatar
                      src={activity.avatar}
                      fallback={activity.studentName.charAt(0)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.studentName}
                        </p>
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            getSeverityColor(activity.severityLevel)
                          )}
                        >
                          {formatSeverityLevel(activity.severityLevel)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{activity.assessmentType}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">
                          {activity.program} • {activity.year} Year
                        </span>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            getScoreColor(activity.score, activity.severityLevel)
                          )}
                        >
                          Score: {activity.severityLevel === "pending" ? "-" : `${activity.score}`}
                        </div>
                        <span className="text-xs text-gray-600">{activity.contactNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop/Tablet View - Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
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
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Number
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
                      <div className="text-sm text-gray-900">{activity.program}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{activity.year} Year</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{activity.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={cn(
                          "text-sm",
                          getScoreColor(activity.score, activity.severityLevel)
                        )}
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
        </>
      )}
    </div>
  );
};
