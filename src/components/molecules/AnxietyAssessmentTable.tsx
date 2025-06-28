import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/atoms";
import { cn } from "@/lib/utils";

type AnxietySeverityLevel = "minimal" | "mild" | "moderate" | "severe";

interface AnxietyAssessment {
  id: string;
  studentName: string;
  score: number;
  severityLevel: AnxietySeverityLevel;
  date: string;
  avatar?: string;
}

export const AnxietyAssessmentTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);

  const allAssessments: AnxietyAssessment[] = [
    {
      id: "1",
      studentName: "Alice Johnson",
      score: 72,
      severityLevel: "severe",
      date: "Oct 25, 2024",
    },
    {
      id: "2",
      studentName: "David Rodriguez",
      score: 34,
      severityLevel: "mild",
      date: "Oct 24, 2024",
    },
    {
      id: "3",
      studentName: "Jennifer Martinez",
      score: 56,
      severityLevel: "moderate",
      date: "Oct 23, 2024",
    },
    {
      id: "4",
      studentName: "Kevin Park",
      score: 18,
      severityLevel: "minimal",
      date: "Oct 22, 2024",
    },
    {
      id: "5",
      studentName: "Lisa Thompson",
      score: 65,
      severityLevel: "moderate",
      date: "Oct 21, 2024",
    },
    {
      id: "6",
      studentName: "Marcus Brown",
      score: 81,
      severityLevel: "severe",
      date: "Oct 20, 2024",
    },
    {
      id: "7",
      studentName: "Amanda Wilson",
      score: 42,
      severityLevel: "mild",
      date: "Oct 19, 2024",
    },
    {
      id: "8",
      studentName: "Ryan Cooper",
      score: 89,
      severityLevel: "severe",
      date: "Oct 18, 2024",
    },
    {
      id: "9",
      studentName: "Michelle Adams",
      score: 23,
      severityLevel: "minimal",
      date: "Oct 17, 2024",
    },
    {
      id: "10",
      studentName: "Christopher Lee",
      score: 59,
      severityLevel: "moderate",
      date: "Oct 16, 2024",
    },
    {
      id: "11",
      studentName: "Jessica Brown",
      score: 75,
      severityLevel: "severe",
      date: "Oct 15, 2024",
    },
    {
      id: "12",
      studentName: "Andrew Davis",
      score: 31,
      severityLevel: "mild",
      date: "Oct 14, 2024",
    },
    {
      id: "13",
      studentName: "Nicole Taylor",
      score: 67,
      severityLevel: "moderate",
      date: "Oct 13, 2024",
    },
    {
      id: "14",
      studentName: "Matthew Garcia",
      score: 15,
      severityLevel: "minimal",
      date: "Oct 12, 2024",
    },
    {
      id: "15",
      studentName: "Samantha Miller",
      score: 83,
      severityLevel: "severe",
      date: "Oct 11, 2024",
    },
  ];

  // Filter assessments based on search term
  const filteredAssessments = useMemo(() => {
    if (!searchTerm) return allAssessments;
    return allAssessments.filter(
      (assessment) =>
        assessment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.severityLevel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Get assessments to display (limited by displayCount)
  const assessments = useMemo(() => {
    return filteredAssessments.slice(0, displayCount);
  }, [filteredAssessments, displayCount]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (displayCount < filteredAssessments.length) {
        setDisplayCount((prev) => Math.min(prev + 10, filteredAssessments.length));
      }
    }
  };

  // Reset display count when search term changes
  useEffect(() => {
    setDisplayCount(10);
  }, [searchTerm]);

  const getSeverityColor = (severityLevel: AnxietySeverityLevel) => {
    switch (severityLevel) {
      case "severe":
        return "bg-red-100 text-red-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "mild":
        return "bg-orange-100 text-orange-800";
      case "minimal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600 font-semibold";
    if (score >= 50) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const formatSeverityLevel = (severityLevel: AnxietySeverityLevel) => {
    return severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Anxiety Assessment Reports</h2>
            <p className="text-sm text-gray-500">
              Showing {assessments.length} of {filteredAssessments.length} students
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students or severity level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
          />
        </div>
      </div>

      <div
        ref={tableRef}
        className="overflow-x-auto max-h-96 overflow-y-auto"
        onScroll={handleScroll}
      >
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
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
            {assessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      src={assessment.avatar}
                      fallback={assessment.studentName.charAt(0)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.studentName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={cn("text-sm", getScoreColor(assessment.score))}>
                    {assessment.score}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      getSeverityColor(assessment.severityLevel)
                    )}
                  >
                    {formatSeverityLevel(assessment.severityLevel)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assessment.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
