import React, { useState, useEffect } from "react";
import { ArchiveStudentsTable } from "@/components/molecules";
import { useAuth, useToast } from "@/hooks";
import { StudentService, UserService } from "@/services";
import { Button } from "@/components/ui/button";
import { RefreshCw, Archive, Download } from "lucide-react";
import { ToastContainer } from "@/components/atoms";
import type { Student } from "@/services/student.service";

// Constants for consistent data fetching
const ARCHIVE_STUDENT_FIELDS =
  "id,studentNumber,program,year,status,notes,createdAt,updatedAt,person.firstName,person.lastName,person.email,person.contactNumber,person.gender";

export const ArchiveStudentsContent: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const { user } = useAuth();
  const { toasts, removeToast, addToast } = useToast();
  const isGuidance = user?.type === "guidance";

  // Fetch graduated students
  const fetchArchivedStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await StudentService.getAllStudents({
        limit: 1000, // Get all graduated students
        fields: ARCHIVE_STUDENT_FIELDS,
        query: "graduated", // Filter by year = "graduated"
      });

      // Filter for graduated students on frontend as additional safety
      const graduatedStudents = response.data.filter(
        (student: Student) => student.year === "graduated"
      );

      setStudents(graduatedStudents);
    } catch (err: any) {
      setError(err.message || "Failed to fetch archived students");
      console.error("Error fetching archived students:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    if (isGuidance) {
      fetchArchivedStudents();
    }
  }, [isGuidance]);

  const handleRefresh = () => {
    if (isGuidance) {
      fetchArchivedStudents();
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportLoading(true);

      // Export only graduated students
      await UserService.exportStudentDataCsv({ year: "graduated" });

      addToast({
        title: "Export Successful",
        message: "Archived student data has been exported to CSV",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      addToast({
        title: "Export Failed",
        message: error.message || "Failed to export archived student data",
        type: "error",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Show access denied message for non-guidance users
  if (!isGuidance) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only guidance counselors can access archived student data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Archive className="h-6 w-6 text-gray-600" />
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Archived Student Data
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Students who have graduated from the system
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCsv}
              disabled={exportLoading || students.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className={`w-4 h-4 ${exportLoading ? "animate-spin" : ""}`} />
              <span>{exportLoading ? "Exporting..." : "Export CSV"}</span>
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Archive Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Archive className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Archived</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : students.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Archive className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Year</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading
                  ? "..."
                  : students.filter(
                      (s) => new Date(s.updatedAt).getFullYear() === new Date().getFullYear()
                    ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Archive className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading
                  ? "..."
                  : students.filter((s) => {
                      const updatedDate = new Date(s.updatedAt);
                      const now = new Date();
                      return (
                        updatedDate.getMonth() === now.getMonth() &&
                        updatedDate.getFullYear() === now.getFullYear()
                      );
                    }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Archive className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Programs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : new Set(students.map((s) => s.program)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ArchiveStudentsTable students={students} loading={loading} error={error} />
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
