import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { StudentService } from "@/services/student.service";
import type { Student } from "@/services/student.service";
import {
  FileText,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui";
import { LoadingScreen } from "@/components/atoms";

interface ConsultationRecord {
  id: string;
  title: string;
  content: string;
  consultationDate: string;
  createdAt?: string;
}

interface GroupedRecords {
  [year: string]: {
    [month: string]: ConsultationRecord[];
  };
}

export const StudentConsultationRecordsContent: React.FC = () => {
  const { student: authStudent } = useAuth();

  const [studentData, setStudentData] = useState<Student | null>(null);
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch student consultation records
  useEffect(() => {
    const fetchStudentRecords = async () => {
      if (!authStudent?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch fresh student data with notes
        const freshStudent = await StudentService.getStudentById(authStudent.id, {
          fields:
            "id,studentNumber,program,year,status,notes,createdAt,updatedAt,person.id,person.firstName,person.lastName,person.middleName,person.suffix,person.email,person.contactNumber,person.gender,person.birthDate,person.birthPlace,person.age,person.religion,person.civilStatus",
        });

        if (freshStudent) {
          setStudentData(freshStudent);

          // Extract consultation records from student notes
          const consultationRecords: ConsultationRecord[] = [];

          if (freshStudent.notes && freshStudent.notes.length > 0) {
            freshStudent.notes.forEach((note, index) => {
              if (note.title || note.content) {
                consultationRecords.push({
                  id: `${freshStudent.id}-${index}`,
                  title: note.title || `Consultation Record ${index + 1}`,
                  content: note.content || "",
                  consultationDate: note.createdAt || new Date().toISOString(),
                  createdAt: note.createdAt,
                });
              }
            });
          }

          // Sort records by date
          consultationRecords.sort((a, b) => {
            const dateA = new Date(a.consultationDate).getTime();
            const dateB = new Date(b.consultationDate).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
          });

          setRecords(consultationRecords);
        }
      } catch (err: any) {
        console.error("Error fetching student records:", err);
        setError(err.message || "Failed to load consultation records");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentRecords();
  }, [authStudent?.id, sortOrder]);

  // Filter records based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = records.filter(
      (record) =>
        record.title.toLowerCase().includes(searchLower) ||
        record.content.toLowerCase().includes(searchLower)
    );

    setFilteredRecords(filtered);
  }, [records, searchTerm]);

  // Group records by year and month
  const groupedRecords: GroupedRecords = React.useMemo(() => {
    const groups: GroupedRecords = {};

    filteredRecords.forEach((record) => {
      const date = new Date(record.consultationDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString("en-US", { month: "long" });

      if (!groups[year]) {
        groups[year] = {};
      }

      if (!groups[year][month]) {
        groups[year][month] = [];
      }

      groups[year][month].push(record);
    });

    return groups;
  }, [filteredRecords]);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleRefresh = async () => {
    if (!authStudent?.id) return;

    setLoading(true);
    try {
      const freshStudent = await StudentService.getStudentById(authStudent.id, {
        fields:
          "id,studentNumber,program,year,status,notes,createdAt,updatedAt,person.id,person.firstName,person.lastName,person.middleName,person.suffix,person.email,person.contactNumber,person.gender,person.birthDate,person.birthPlace,person.age,person.religion,person.civilStatus",
      });

      if (freshStudent) {
        setStudentData(freshStudent);

        const consultationRecords: ConsultationRecord[] = [];

        if (freshStudent.notes && freshStudent.notes.length > 0) {
          freshStudent.notes.forEach((note, index) => {
            if (note.title || note.content) {
              consultationRecords.push({
                id: `${freshStudent.id}-${index}`,
                title: note.title || `Consultation Record ${index + 1}`,
                content: note.content || "",
                consultationDate: note.createdAt || new Date().toISOString(),
                createdAt: note.createdAt,
              });
            }
          });
        }

        consultationRecords.sort((a, b) => {
          const dateA = new Date(a.consultationDate).getTime();
          const dateB = new Date(b.consultationDate).getTime();
          return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        setRecords(consultationRecords);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRecordsSummary = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const thisMonthCount = records.filter((record) => {
      const recordDate = new Date(record.consultationDate);
      return recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth;
    }).length;

    const thisYearCount = records.filter((record) => {
      const recordDate = new Date(record.consultationDate);
      return recordDate.getFullYear() === currentYear;
    }).length;

    return { total: records.length, thisMonth: thisMonthCount, thisYear: thisYearCount };
  };

  const summary = getRecordsSummary();

  if (!authStudent) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to view your consultation records.</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingScreen isLoading={loading} message="Loading consultation records...">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-4 md:mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                My Consultation Records
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                View your consultation history and notes from guidance sessions
              </p>
              {studentData && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    {studentData.person?.firstName} {studentData.person?.lastName}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{studentData.program}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Year {studentData.year}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Records</h3>
            </div>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900 mt-1">{summary.total}</p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">This Year</h3>
            </div>
            <p className="text-lg sm:text-2xl font-semibold text-green-600 mt-1">
              {summary.thisYear}
            </p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">This Month</h3>
            </div>
            <p className="text-lg sm:text-2xl font-semibold text-purple-600 mt-1">
              {summary.thisMonth}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search consultation records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 min-w-[140px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Display */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
              <p className="text-sm">
                {searchTerm
                  ? "No consultation records match your search criteria"
                  : "You don't have any consultation records yet. Records will appear here after guidance sessions."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedRecords)
              .sort(([a], [b]) =>
                sortOrder === "newest" ? parseInt(b) - parseInt(a) : parseInt(a) - parseInt(b)
              )
              .map(([year, months]) => (
                <div key={year} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div
                    onClick={() => toggleSection(year)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{year}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {Object.values(months).reduce(
                          (total, records) => total + records.length,
                          0
                        )}{" "}
                        records
                      </span>
                    </div>
                    {expandedSections[year] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {expandedSections[year] && (
                    <div className="border-t border-gray-200">
                      {Object.entries(months)
                        .sort(([a], [b]) => {
                          const monthA = new Date(`${a} 1, ${year}`).getMonth();
                          const monthB = new Date(`${b} 1, ${year}`).getMonth();
                          return sortOrder === "newest" ? monthB - monthA : monthA - monthB;
                        })
                        .map(([month, monthRecords]) => (
                          <div key={month} className="border-b border-gray-100 last:border-b-0">
                            <div
                              onClick={() => toggleSection(`${year}-${month}`)}
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-600 rounded-full ml-2"></div>
                                <h4 className="font-medium text-gray-800">{month}</h4>
                                <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                                  {monthRecords.length}{" "}
                                  {monthRecords.length === 1 ? "record" : "records"}
                                </span>
                              </div>
                              {expandedSections[`${year}-${month}`] ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>

                            {expandedSections[`${year}-${month}`] && (
                              <div className="pb-2">
                                {monthRecords
                                  .sort((a, b) => {
                                    const dateA = new Date(a.consultationDate).getTime();
                                    const dateB = new Date(b.consultationDate).getTime();
                                    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
                                  })
                                  .map((record) => (
                                    <div
                                      key={record.id}
                                      className="mx-4 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-4"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-blue-900 mb-1">
                                            {record.title}
                                          </h5>
                                          <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(record.consultationDate)}</span>
                                            <Clock className="w-4 h-4 ml-2" />
                                            <span>{formatTime(record.consultationDate)}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {record.content && (
                                        <div className="mt-3 p-3 bg-white border border-blue-200 rounded-md">
                                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {record.content}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Info Note */}
        {records.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  About Your Consultation Records
                </h4>
                <p className="text-sm text-blue-700">
                  These records contain notes and observations from your guidance sessions. They
                  help track your progress and ensure you receive the best support. If you have
                  questions about any record, please discuss them during your next session.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingScreen>
  );
};
