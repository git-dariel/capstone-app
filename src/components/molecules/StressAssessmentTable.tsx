import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/atoms";
import { cn } from "@/lib/utils";

type StressSeverityLevel = "low" | "moderate" | "high";

interface StressAssessment {
  id: string;
  studentName: string;
  score: number;
  severityLevel: StressSeverityLevel;
  date: string;
  avatar?: string;
}

export const StressAssessmentTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);

  const allAssessments: StressAssessment[] = [
    {
      id: "1",
      studentName: "Sarah Williams",
      score: 89,
      severityLevel: "high",
      date: "Oct 24, 2024",
    },
    {
      id: "2",
      studentName: "Daniel Kim",
      score: 67,
      severityLevel: "moderate",
      date: "Oct 23, 2024",
    },
    {
      id: "3",
      studentName: "Ashley Miller",
      score: 92,
      severityLevel: "high",
      date: "Oct 22, 2024",
    },
    {
      id: "4",
      studentName: "Brandon Lee",
      score: 28,
      severityLevel: "low",
      date: "Oct 21, 2024",
    },
    {
      id: "5",
      studentName: "Rachel Green",
      score: 55,
      severityLevel: "moderate",
      date: "Oct 20, 2024",
    },
    {
      id: "6",
      studentName: "Tyler Johnson",
      score: 84,
      severityLevel: "high",
      date: "Oct 19, 2024",
    },
    {
      id: "7",
      studentName: "Megan White",
      score: 31,
      severityLevel: "low",
      date: "Oct 18, 2024",
    },
    {
      id: "8",
      studentName: "Jake Thompson",
      score: 76,
      severityLevel: "high",
      date: "Oct 17, 2024",
    },
    {
      id: "9",
      studentName: "Aria Chen",
      score: 41,
      severityLevel: "moderate",
      date: "Oct 16, 2024",
    },
    {
      id: "10",
      studentName: "Carlos Rodriguez",
      score: 22,
      severityLevel: "low",
      date: "Oct 15, 2024",
    },
    {
      id: "11",
      studentName: "Maya Patel",
      score: 88,
      severityLevel: "high",
      date: "Oct 14, 2024",
    },
    {
      id: "12",
      studentName: "Lucas Garcia",
      score: 59,
      severityLevel: "moderate",
      date: "Oct 13, 2024",
    },
    {
      id: "13",
      studentName: "Zoe Anderson",
      score: 95,
      severityLevel: "high",
      date: "Oct 12, 2024",
    },
    {
      id: "14",
      studentName: "Owen Martinez",
      score: 35,
      severityLevel: "low",
      date: "Oct 11, 2024",
    },
    {
      id: "15",
      studentName: "Lily Wilson",
      score: 63,
      severityLevel: "moderate",
      date: "Oct 10, 2024",
    },
    {
      id: "16",
      studentName: "Hunter Davis",
      score: 81,
      severityLevel: "high",
      date: "Oct 9, 2024",
    },
    {
      id: "17",
      studentName: "Stella Brown",
      score: 26,
      severityLevel: "low",
      date: "Oct 8, 2024",
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

  const getSeverityColor = (severityLevel: StressSeverityLevel) => {
    switch (severityLevel) {
      case "high":
        return "bg-red-100 text-red-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "low":
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

  const formatSeverityLevel = (severityLevel: StressSeverityLevel) => {
    return severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Stress Assessment Reports</h2>
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
