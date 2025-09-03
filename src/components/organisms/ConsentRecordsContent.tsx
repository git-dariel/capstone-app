import React, { useState, useEffect } from "react";
import { ConsentRecordsTable, ViewConsentDrawer } from "@/components/molecules";
import { useConsent, useAuth } from "@/hooks";
import type { GetConsentResponse } from "@/services/consent.service";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

// Constants for consistent data fetching
const CONSENT_FIELDS =
  "id,studentId,referred,with_whom_do_you_live,financial_status,what_brings_you_to_guidance,physical_problem,physical_symptoms,concerns,services,sleep_duration,stress_level,academic_performance_change,createdAt,updatedAt,isDeleted,student.id,student.studentNumber,student.program,student.year,student.person.firstName,student.person.lastName,student.person.email,student.person.gender,student.person.age";

export const ConsentRecordsContent: React.FC = () => {
  const { user, student } = useAuth();
  const {
    consents,
    totalConsents,
    currentPage,
    totalPages,
    loading,
    error,
    fetchConsents,
    getConsentByStudentId,
    clearError,
  } = useConsent();

  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [viewingConsent, setViewingConsent] = useState<GetConsentResponse | null>(null);
  const [currentPageState, setCurrentPageState] = useState(1);

  const isGuidanceUser = user?.type === "guidance";
  const isStudentUser = user?.type === "student";

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isGuidanceUser) {
          // Guidance users can see all consents
          await fetchConsents({
            page: currentPageState,
            limit: 20,
            fields: CONSENT_FIELDS,
            order: "desc",
          });
        } else if (isStudentUser && student?.id) {
          // Students can only see their own consent
          const consent = await getConsentByStudentId(student.id);
          // For students, we'll store their consent but not auto-open the drawer
          if (consent) {
            setViewingConsent(consent);
          }
        }
      } catch (error) {
        console.error("Error loading consent data:", error);
      }
    };

    loadData();
  }, [currentPageState, isGuidanceUser, isStudentUser, student?.id]);

  const handleViewConsent = (consent: GetConsentResponse) => {
    setViewingConsent(consent);
    setIsViewDrawerOpen(true);
  };

  const handleCloseViewDrawer = () => {
    setIsViewDrawerOpen(false);
    // Don't clear viewingConsent for students so table data persists
    if (isGuidanceUser) {
      setViewingConsent(null);
    }
  };

  const handleRefresh = async () => {
    clearError();
    if (isGuidanceUser) {
      await fetchConsents({
        page: currentPageState,
        limit: 20,
        fields: CONSENT_FIELDS,
        order: "desc",
      });
    } else if (isStudentUser && student?.id) {
      const consent = await getConsentByStudentId(student.id);
      if (consent) {
        setViewingConsent(consent);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPageState(page);
  };

  // Student view - show their own consent
  if (isStudentUser) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="mb-4 md:mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">My Consent Record</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                View your consent form submission
              </p>
            </div>
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

        {/* Show table with student's consent record */}
        <div className="bg-white rounded-lg shadow-sm">
          <ConsentRecordsTable
            consents={viewingConsent ? [viewingConsent] : []}
            loading={loading}
            error={error}
            onView={handleViewConsent}
          />
        </div>

        <ViewConsentDrawer
          isOpen={isViewDrawerOpen}
          onClose={handleCloseViewDrawer}
          consent={viewingConsent}
        />
      </div>
    );
  }

  // Guidance user view - show all consents
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Student Consent Records
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              View and manage all student consent form submissions
            </p>
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

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={consents.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{totalConsents}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">High Stress</h3>
          <p className="text-2xl font-semibold text-red-600 mt-1">
            {consents.filter((c) => c.stress_level === "high").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Declined Performance</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-1">
            {consents.filter((c) => c.academic_performance_change === "declined").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-semibold text-blue-600 mt-1">
            {
              consents.filter((c) => {
                const created = new Date(c.createdAt);
                const now = new Date();
                return (
                  created.getMonth() === now.getMonth() &&
                  created.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ConsentRecordsTable
          consents={consents}
          loading={loading}
          error={error}
          onView={handleViewConsent}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({totalConsents} total records)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <ViewConsentDrawer
        isOpen={isViewDrawerOpen}
        onClose={handleCloseViewDrawer}
        consent={viewingConsent}
      />
    </div>
  );
};
