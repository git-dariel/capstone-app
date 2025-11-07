import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { Avatar } from "@/components/atoms";
import type { Student } from "@/services/student.service";
import { StudentService } from "@/services/student.service";
import type { GetInventoryResponse } from "@/services/inventory.service";
import type { GetConsentResponse } from "@/services/consent.service";
import {
  Mail,
  Phone,
  User,
  GraduationCap,
  FileText,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  Heart,
  BarChart3,
  Shield,
  Download,
  Brain,
  StickyNote,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
} from "lucide-react";
import { InventoryService, ConsentService, UserService } from "@/services";
import { useToast } from "@/hooks";
import { Button } from "@/components/ui";

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

interface ExpandedSections {
  [key: string]: boolean;
}

interface AssessmentHistory {
  id: string;
  type: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  severityLevel?: string;
  riskLevel?: string;
  assessmentDate: string;
  totalScore?: number;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { addToast } = useToast();

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    studentDetails: true,
    personDetails: true,
    userDetails: true,
    inventoryDetails: false,
    assessmentHistory: false,
    mentalHealthPredictions: false,
    consultationDetails: false,
    consentDetails: false,
    significantNotes: false,
  });

  const [inventoryData, setInventoryData] = useState<GetInventoryResponse | null>(null);
  const [consentData, setConsentData] = useState<GetConsentResponse | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Local student state for real-time updates
  const [currentStudentData, setCurrentStudentData] = useState<Student | null>(student || null);

  // Significant notes management
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteData, setNewNoteData] = useState({
    date: new Date().toISOString().split("T")[0],
    incident: "",
    remarks: "",
  });

  // Consultation notes management
  const [isAddingConsultationNote, setIsAddingConsultationNote] = useState(false);
  const [editingConsultationNoteIndex, setEditingConsultationNoteIndex] = useState<number | null>(
    null
  );
  const [newConsultationNoteData, setNewConsultationNoteData] = useState({
    title: "",
    content: "",
  });

  // Sync current student data when student prop changes
  useEffect(() => {
    setCurrentStudentData(student || null);
  }, [student]);

  // Fetch inventory and consent data when modal opens and student changes
  useEffect(() => {
    if (!isOpen || !student?.id) {
      setInventoryData(null);
      setConsentData(null);
      setAssessmentHistory([]);
      return;
    }

    const fetchAdditionalData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [inventory, consent] = await Promise.all([
          InventoryService.getInventoryByStudentId(student.id).catch(() => null),
          ConsentService.getConsentByStudentId(student.id).catch(() => null),
        ]);

        setInventoryData(inventory);
        setConsentData(consent);

        // Extract assessment history from student data
        const assessments: AssessmentHistory[] = [];

        if (student.person?.users?.[0]) {
          const user = student.person.users[0];

          // Collect all assessments
          user.anxietyAssessments?.forEach((a) => {
            assessments.push({
              id: a.id,
              type: "anxiety",
              severityLevel: a.severityLevel,
              assessmentDate: a.assessmentDate,
              totalScore: a.totalScore,
            });
          });

          user.depressionAssessments?.forEach((a) => {
            assessments.push({
              id: a.id,
              type: "depression",
              severityLevel: a.severityLevel,
              assessmentDate: a.assessmentDate,
              totalScore: a.totalScore,
            });
          });

          user.stressAssessments?.forEach((a) => {
            assessments.push({
              id: a.id,
              type: "stress",
              severityLevel: a.severityLevel,
              assessmentDate: a.assessmentDate,
              totalScore: a.totalScore,
            });
          });

          user.suicideAssessments?.forEach((a) => {
            assessments.push({
              id: a.id,
              type: "suicide",
              riskLevel: a.riskLevel,
              assessmentDate: a.assessmentDate,
            });
          });
        }

        // Sort by date descending
        assessments.sort(
          (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
        );
        setAssessmentHistory(assessments);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load additional student information");
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalData();
  }, [isOpen, student?.id]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return "text-gray-700 bg-gray-100 border-gray-300";
    const lower = severity.toLowerCase();
    if (lower.includes("minimal") || lower.includes("low")) {
      return "text-green-700 bg-green-100 border-green-300";
    }
    if (lower.includes("mild")) {
      return "text-blue-700 bg-blue-100 border-blue-300";
    }
    if (lower.includes("moderate")) {
      return "text-yellow-700 bg-yellow-100 border-yellow-300";
    }
    if (lower.includes("moderately_severe") || lower.includes("moderately severe")) {
      return "text-orange-700 bg-orange-100 border-orange-300";
    }
    if (lower.includes("severe") || lower.includes("high")) {
      return "text-red-700 bg-red-100 border-red-300";
    }
    return "text-gray-700 bg-gray-100 border-gray-300";
  };

  const getRiskLevelColor = (level?: string) => {
    if (!level) return "text-gray-700 bg-gray-100 border-gray-300";
    const lower = level.toLowerCase();
    switch (lower) {
      case "low":
        return "text-green-700 bg-green-100 border-green-300";
      case "moderate":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "high":
        return "text-orange-700 bg-orange-100 border-orange-300";
      case "critical":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case "anxiety":
        return "🧠";
      case "depression":
        return "💭";
      case "stress":
        return "⚡";
      case "suicide":
        return "🛡️";
      case "checklist":
        return "📝";
      default:
        return "📊";
    }
  };

  const formatSeverityLabel = (severity: string) => {
    if (severity === "moderately_severe") return "Moderately Severe";
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const handleGenerateReport = async () => {
    if (!student?.id) {
      setError("Student ID is required to generate report");
      addToast({
        type: "error",
        title: "Error",
        message: "Student ID is required to generate report",
      });
      return;
    }

    setGeneratingReport(true);
    setError(null);

    try {
      await UserService.exportMentalHealthAssessment(student.id);
      addToast({
        type: "success",
        title: "Report Generated",
        message: "Mental health assessment report has been generated and downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error generating mental health assessment report:", error);
      const errorMessage = error.message || "Failed to generate mental health assessment report";
      setError(errorMessage);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: errorMessage,
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Significant Notes Management Functions
  const handleAddNote = async () => {
    if (!inventoryData?.id || !newNoteData.incident.trim()) {
      addToast({
        type: "error",
        title: "Error",
        message: "Incident description is required",
      });
      return;
    }

    try {
      setLoading(true);

      const newNote = {
        date: newNoteData.date,
        incident: newNoteData.incident.trim(),
        remarks: newNoteData.remarks.trim(),
      };

      const updatedNotesArray = [...(inventoryData.significantNotes || []), newNote];

      // Update inventory with new significant note
      const updatedInventory = await InventoryService.updateInventory(inventoryData.id, {
        significantNotes: updatedNotesArray,
      });

      // Fetch fresh inventory data to get the latest notes with proper IDs and timestamps
      if (student?.id) {
        const freshInventory = await InventoryService.getInventoryByStudentId(student.id);
        if (freshInventory) {
          setInventoryData(freshInventory);
        } else {
          // Fallback to the updated inventory from the update call
          setInventoryData(updatedInventory);
        }
      } else {
        setInventoryData(updatedInventory);
      }

      setNewNoteData({
        date: new Date().toISOString().split("T")[0],
        incident: "",
        remarks: "",
      });
      setIsAddingNote(false);
      addToast({
        type: "success",
        title: "Success",
        message: "Note added successfully",
      });
    } catch (error: any) {
      console.error("Error adding note:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to add note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async (
    noteId: string,
    updatedData: { date?: string; incident?: string; remarks?: string }
  ) => {
    if (!inventoryData?.id || !updatedData.incident?.trim()) {
      addToast({
        type: "error",
        title: "Error",
        message: "Incident description is required",
      });
      return;
    }

    try {
      setLoading(true);

      const updatedNotes =
        inventoryData.significantNotes?.map((note) =>
          note.id === noteId ? { ...note, ...updatedData } : note
        ) || [];

      const updatedInventory = await InventoryService.updateInventory(inventoryData.id, {
        significantNotes: updatedNotes,
      });

      // Fetch fresh inventory data to get the latest notes with proper IDs and timestamps
      if (student?.id) {
        const freshInventory = await InventoryService.getInventoryByStudentId(student.id);
        if (freshInventory) {
          setInventoryData(freshInventory);
        } else {
          setInventoryData(updatedInventory);
        }
      } else {
        setInventoryData(updatedInventory);
      }

      setEditingNoteId(null);
      addToast({
        type: "success",
        title: "Success",
        message: "Note updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating note:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!inventoryData?.id) return;

    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      setLoading(true);

      const updatedNotes =
        inventoryData.significantNotes?.filter((note) => note.id !== noteId) || [];

      const updatedInventory = await InventoryService.updateInventory(inventoryData.id, {
        significantNotes: updatedNotes,
      });

      // Fetch fresh inventory data to get the latest notes
      if (student?.id) {
        const freshInventory = await InventoryService.getInventoryByStudentId(student.id);
        if (freshInventory) {
          setInventoryData(freshInventory);
        } else {
          setInventoryData(updatedInventory);
        }
      } else {
        setInventoryData(updatedInventory);
      }

      addToast({
        type: "success",
        title: "Success",
        message: "Note deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to delete note",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh student data for real-time updates
  const refreshStudentData = async () => {
    if (!student?.id) return;

    try {
      const freshStudent = await StudentService.getStudentById(student.id, {
        fields:
          "id,studentNumber,program,year,status,notes,createdAt,updatedAt,person.id,person.firstName,person.lastName,person.middleName,person.suffix,person.email,person.contactNumber,person.gender,person.birthDate,person.birthPlace,person.age,person.religion,person.civilStatus",
      });

      if (freshStudent) {
        setCurrentStudentData(freshStudent);
      }
    } catch (error) {
      console.error("Error refreshing student data:", error);
    }
  };

  // Consultation Notes Management Functions
  const handleAddConsultationNote = async () => {
    if (!currentStudentData?.id || !newConsultationNoteData.title.trim()) {
      addToast({
        type: "error",
        title: "Error",
        message: "Please provide a title for the consultation note",
      });
      return;
    }

    setLoading(true);

    try {
      const currentNotes = currentStudentData.notes || [];
      const newNote = {
        title: newConsultationNoteData.title.trim(),
        content: newConsultationNoteData.content.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...currentNotes, newNote];

      await StudentService.updateStudent(currentStudentData.id, {
        notes: updatedNotes,
      });

      // Reset form and close
      setNewConsultationNoteData({ title: "", content: "" });
      setIsAddingConsultationNote(false);

      // Refresh student data to get real-time updates
      await refreshStudentData();

      addToast({
        type: "success",
        title: "Success",
        message: "Consultation note added successfully",
      });
    } catch (error: any) {
      console.error("Error adding consultation note:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to add consultation note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditConsultationNote = async (
    noteIndex: number,
    updatedData: { title?: string; content?: string }
  ) => {
    if (!currentStudentData?.id) return;

    setLoading(true);

    try {
      const currentNotes = [...(currentStudentData.notes || [])];

      if (noteIndex < 0 || noteIndex >= currentNotes.length) {
        throw new Error("Invalid note index");
      }

      // Update the specific note
      currentNotes[noteIndex] = {
        ...currentNotes[noteIndex],
        ...updatedData,
      };

      await StudentService.updateStudent(currentStudentData.id, {
        notes: currentNotes,
      });

      setEditingConsultationNoteIndex(null);

      // Refresh student data to get real-time updates
      await refreshStudentData();

      addToast({
        type: "success",
        title: "Success",
        message: "Consultation note updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating consultation note:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update consultation note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsultationNote = async (noteIndex: number) => {
    if (!currentStudentData?.id) return;

    setLoading(true);

    try {
      const currentNotes = [...(currentStudentData.notes || [])];

      if (noteIndex < 0 || noteIndex >= currentNotes.length) {
        throw new Error("Invalid note index");
      }

      // Remove the note at the specified index
      currentNotes.splice(noteIndex, 1);

      await StudentService.updateStudent(currentStudentData.id, {
        notes: currentNotes,
      });

      // Refresh student data to get real-time updates
      await refreshStudentData();

      addToast({
        type: "success",
        title: "Success",
        message: "Consultation note deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting consultation note:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to delete consultation note",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  // Use current student data for real-time updates, fallback to original student prop
  const activeStudent = currentStudentData || student;
  const person = activeStudent.person;
  const studentName = person ? `${person.firstName} ${person.lastName}` : "Unknown Student";
  const studentAvatar = person?.users?.[0]?.avatar;

  const consultationNotes = activeStudent.notes || [];

  // Get latest mental health prediction
  const getLatestMentalHealthPrediction = () => {
    if (
      !inventoryData?.mentalHealthPredictions ||
      inventoryData.mentalHealthPredictions.length === 0
    ) {
      return null;
    }

    // Sort by createdAt date (most recent first) and return the first one
    const sortedPredictions = [...inventoryData.mentalHealthPredictions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedPredictions[0];
  };

  const latestPrediction = getLatestMentalHealthPrediction();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 h-full overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Student Header Card - Mobile Responsive */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5 md:gap-6">
            {/* Left: Avatar and Basic Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
              <Avatar
                src={studentAvatar}
                fallback={studentName.charAt(0)}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-xl sm:text-2xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-900 truncate">
                  {studentName}
                </h2>
                <p className="text-primary-600 text-xs sm:text-sm font-medium mt-1 truncate">
                  ID: {activeStudent.studentNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats Grid + Generate Report Button - Mobile Optimized */}
            <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-white bg-opacity-70 rounded-lg p-2 sm:p-3 lg:p-4 border border-primary-200 border-opacity-50">
                  <p className="text-[10px] sm:text-xs font-semibold text-primary-600 uppercase tracking-wide truncate">
                    Program
                  </p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-primary-900 truncate">
                    {activeStudent.program}
                  </p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-lg p-2 sm:p-3 lg:p-4 border border-primary-200 border-opacity-50">
                  <p className="text-[10px] sm:text-xs font-semibold text-primary-600 uppercase tracking-wide truncate">
                    Year Level
                  </p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-primary-900">
                    Year {activeStudent.year}
                  </p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-lg p-2 sm:p-3 lg:p-4 border border-primary-200 border-opacity-50">
                  <p className="text-[10px] sm:text-xs font-semibold text-primary-600 uppercase tracking-wide truncate">
                    Assessments
                  </p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-primary-900">
                    {assessmentHistory.length}
                  </p>
                </div>
                <div
                  className={`bg-white bg-opacity-70 rounded-lg p-2 sm:p-3 lg:p-4 border border-opacity-50 ${
                    latestPrediction?.mentalHealthRisk?.level
                      ? getRiskLevelColor(latestPrediction.mentalHealthRisk.level)
                          .replace("text-", "border-")
                          .replace("bg-", "border-")
                          .split(" ")[2]
                      : "border-gray-300"
                  }`}
                >
                  <p className="text-[10px] sm:text-xs font-semibold text-primary-600 uppercase tracking-wide truncate">
                    Risk Level
                  </p>
                  <p
                    className={`text-sm sm:text-lg lg:text-xl font-bold truncate ${
                      latestPrediction?.mentalHealthRisk?.level
                        ? getRiskLevelColor(latestPrediction.mentalHealthRisk.level).split(" ")[0]
                        : "text-gray-900"
                    }`}
                  >
                    {latestPrediction?.mentalHealthRisk?.level
                      ? latestPrediction.mentalHealthRisk.level.toUpperCase()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Generate Report Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleGenerateReport}
                  disabled={!student?.id || generatingReport}
                  className="w-full lg:w-auto flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 space-x-2 shadow-sm hover:shadow-md disabled:shadow-none text-xs sm:text-sm"
                >
                  {generatingReport ? (
                    <>
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Gen...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Generate Report</span>
                      <span className="sm:hidden">Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span className="text-xs sm:text-sm">Loading student information...</span>
            </div>
          </div>
        )}

        {/* Expandable Sections - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* LEFT COLUMN - 4 Sections */}
          <div className="space-y-3 sm:space-y-4">
            {/* Student Details Section */}
            <CollapsibleSection
              title="Student Details"
              icon={<GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />}
              isExpanded={expandedSections.studentDetails}
              onToggle={() => toggleSection("studentDetails")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <InfoField label="Student Number" value={activeStudent.studentNumber || "N/A"} />
                <InfoField label="Program" value={activeStudent.program || "N/A"} />
                <InfoField label="Year Level" value={activeStudent.year || "N/A"} />
                <InfoField label="Date Created" value={formatDate(activeStudent.createdAt)} />
                <InfoField label="Last Updated" value={formatDate(activeStudent.updatedAt)} />
              </div>
            </CollapsibleSection>

            {/* Person Details Section */}
            <CollapsibleSection
              title="Person Details"
              icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
              isExpanded={expandedSections.personDetails}
              onToggle={() => toggleSection("personDetails")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <InfoField label="First Name" value={person?.firstName || "N/A"} />
                <InfoField label="Last Name" value={person?.lastName || "N/A"} />
                <InfoField label="Middle Name" value={person?.middleName || "N/A"} />
                <InfoField label="Gender" value={person?.gender || "N/A"} />
                <InfoField label="Birth Date" value={formatDate(person?.birthDate)} />
                <InfoField label="Age" value={person?.age?.toString() || "N/A"} />
                <InfoField label="Religion" value={person?.religion || "N/A"} />
                <InfoField label="Civil Status" value={person?.civilStatus || "N/A"} />
              </div>
            </CollapsibleSection>

            {/* User Details Section */}
            <CollapsibleSection
              title="User Details"
              icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
              isExpanded={expandedSections.userDetails}
              onToggle={() => toggleSection("userDetails")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <InfoField
                  label="Email"
                  value={person?.email || "N/A"}
                  icon={<Mail className="w-3 h-3 sm:w-4 sm:h-4" />}
                />
                <InfoField
                  label="Contact Number"
                  value={person?.contactNumber || "N/A"}
                  icon={<Phone className="w-3 h-3 sm:w-4 sm:h-4" />}
                />
              </div>
            </CollapsibleSection>

            {/* Inventory Details Section */}
            {inventoryData && (
              <CollapsibleSection
                title="Inventory Details"
                icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />}
                isExpanded={expandedSections.inventoryDetails}
                onToggle={() => toggleSection("inventoryDetails")}
              >
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Physical Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Physical Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <InfoField label="Height" value={inventoryData.height || "N/A"} />
                      <InfoField label="Weight" value={inventoryData.weight || "N/A"} />
                      <InfoField label="Complexion" value={inventoryData.coplexion || "N/A"} />
                    </div>
                  </div>

                  {/* Person to be Contacted */}
                  {inventoryData.person_to_be_contacted_in_case_of_accident_or_illness && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-purple-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Emergency Contact
                      </h4>
                      <div className="space-y-2 text-sm sm:text-base">
                        <InfoField
                          label="Name"
                          value={`${inventoryData.person_to_be_contacted_in_case_of_accident_or_illness.firstName} ${inventoryData.person_to_be_contacted_in_case_of_accident_or_illness.lastName}`}
                        />
                        <InfoField
                          label="Relationship"
                          value={
                            inventoryData.person_to_be_contacted_in_case_of_accident_or_illness
                              .relationship || "N/A"
                          }
                        />
                        {inventoryData.person_to_be_contacted_in_case_of_accident_or_illness
                          .address && (
                          <InfoField
                            label="Address"
                            value={`${inventoryData.person_to_be_contacted_in_case_of_accident_or_illness.address.houseNo} ${inventoryData.person_to_be_contacted_in_case_of_accident_or_illness.address.street}, ${inventoryData.person_to_be_contacted_in_case_of_accident_or_illness.address.barangay}, ${inventoryData.person_to_be_contacted_in_case_of_accident_or_illness.address.city}`}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Educational Background */}
                  {inventoryData.educational_background && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Educational Background
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                        <InfoField
                          label="Level"
                          value={inventoryData.educational_background.level || "N/A"}
                        />
                        <InfoField
                          label="Status"
                          value={inventoryData.educational_background.status || "N/A"}
                        />
                        <InfoField
                          label="Graduation"
                          value={inventoryData.educational_background.school_graduation || "N/A"}
                        />
                        <InfoField
                          label="Honors"
                          value={inventoryData.educational_background.honors_received || "N/A"}
                        />
                      </div>
                    </div>
                  )}

                  {/* Nature of Schooling */}
                  {inventoryData.nature_of_schooling && (
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-cyan-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Nature of Schooling
                      </h4>
                      <div className="space-y-2 text-sm sm:text-base">
                        <div className="flex justify-between">
                          <span className="text-cyan-800">Continuous:</span>
                          <span className="font-medium text-cyan-900">
                            {inventoryData.nature_of_schooling.continuous ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-800">Interrupted:</span>
                          <span className="font-medium text-cyan-900">
                            {inventoryData.nature_of_schooling.interrupted ? "Yes" : "No"}
                          </span>
                        </div>
                        {inventoryData.nature_of_schooling.exaplain_why && (
                          <div className="text-cyan-700 border-t border-cyan-200 pt-2">
                            <p className="text-sm font-medium text-cyan-800 mb-1">Explanation:</p>
                            <p className="text-sm">
                              {inventoryData.nature_of_schooling.exaplain_why}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Home and Family Background */}
                  {inventoryData.home_and_family_background && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-amber-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Home & Family Background
                      </h4>
                      <div className="space-y-3 text-sm sm:text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <InfoField
                            label="Marital Relationship"
                            value={
                              inventoryData.home_and_family_background
                                .parents_martial_relationship || "N/A"
                            }
                          />
                          <InfoField
                            label="Ordinal Position"
                            value={
                              inventoryData.home_and_family_background.ordinal_position || "N/A"
                            }
                          />
                          <InfoField
                            label="Children in Family"
                            value={
                              inventoryData.home_and_family_background.number_of_children_in_the_family_including_yourself?.toString() ||
                              "N/A"
                            }
                          />
                          <InfoField
                            label="Brothers"
                            value={
                              inventoryData.home_and_family_background.number_of_brothers?.toString() ||
                              "N/A"
                            }
                          />
                          <InfoField
                            label="Sisters"
                            value={
                              inventoryData.home_and_family_background.number_of_sisters?.toString() ||
                              "N/A"
                            }
                          />
                          <InfoField
                            label="Employed Siblings"
                            value={
                              inventoryData.home_and_family_background.number_of_brothers_or_sisters_employed?.toString() ||
                              "N/A"
                            }
                          />
                          <InfoField
                            label="Finances Schooling"
                            value={
                              inventoryData.home_and_family_background
                                .who_finances_your_schooling || "N/A"
                            }
                          />
                          <InfoField
                            label="Weekly Allowance"
                            value={
                              inventoryData.home_and_family_background.how_much_is_your_weekly_allowance?.toString() ||
                              "N/A"
                            }
                          />
                          <InfoField
                            label="Quiet Place to Study"
                            value={
                              inventoryData.home_and_family_background
                                .do_you_have_quiet_place_to_study || "N/A"
                            }
                          />
                          <InfoField
                            label="Residence Type"
                            value={
                              inventoryData.home_and_family_background
                                .nature_of_residence_while_attending_school || "N/A"
                            }
                          />
                        </div>
                        {inventoryData.home_and_family_background
                          .do_you_share_your_room_with_anyone && (
                          <div className="border-t border-amber-200 pt-2">
                            <p className="text-sm font-medium text-amber-800 mb-1">Room Sharing:</p>
                            <p className="text-sm text-amber-900">
                              {inventoryData.home_and_family_background
                                .do_you_share_your_room_with_anyone.status === "yes"
                                ? `Yes - ${inventoryData.home_and_family_background.do_you_share_your_room_with_anyone.if_yes_with_whom}`
                                : "No"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Health Information */}
                  {inventoryData.health && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-red-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Health Information
                      </h4>
                      <div className="space-y-3 text-sm sm:text-base">
                        {inventoryData.health.physical && (
                          <div>
                            <p className="text-sm font-medium text-red-800 mb-2">
                              Physical Health:
                            </p>
                            <div className="grid grid-cols-2 gap-2 ml-2">
                              <div className="flex justify-between">
                                <span>Vision:</span>
                                <span className="font-medium">
                                  {inventoryData.health.physical.your_vision ? "Yes" : "No"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hearing:</span>
                                <span className="font-medium">
                                  {inventoryData.health.physical.your_hearing ? "Yes" : "No"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Speech:</span>
                                <span className="font-medium">
                                  {inventoryData.health.physical.your_speech ? "Yes" : "No"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>General Health:</span>
                                <span className="font-medium">
                                  {inventoryData.health.physical.your_general_health ? "Yes" : "No"}
                                </span>
                              </div>
                            </div>
                            {inventoryData.health.physical.if_yes_please_specify && (
                              <div className="text-sm text-red-700 mt-2 border-t border-red-200 pt-2">
                                <p className="font-medium mb-1">Specifications:</p>
                                <p>{inventoryData.health.physical.if_yes_please_specify}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {inventoryData.health.psychological && (
                          <div className="border-t border-red-200 pt-2">
                            <p className="text-sm font-medium text-red-800 mb-2">Psychological:</p>
                            <div className="space-y-1 ml-2 text-sm">
                              <div className="flex justify-between">
                                <span>Consulted:</span>
                                <span className="font-medium capitalize">
                                  {inventoryData.health.psychological.consulted}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className="font-medium capitalize">
                                  {inventoryData.health.psychological.status}
                                </span>
                              </div>
                              {inventoryData.health.psychological.when && (
                                <div>
                                  <span className="font-medium">When:</span>{" "}
                                  {formatDate(inventoryData.health.psychological.when)}
                                </div>
                              )}
                              {inventoryData.health.psychological.for_what && (
                                <div>
                                  <span className="font-medium">Reason:</span>{" "}
                                  {inventoryData.health.psychological.for_what}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interest and Hobbies */}
                  {inventoryData.interest_and_hobbies && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-green-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Interest & Hobbies
                      </h4>
                      <div className="space-y-3 text-sm sm:text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <InfoField
                            label="Academic Club"
                            value={inventoryData.interest_and_hobbies.academic || "N/A"}
                          />
                          <InfoField
                            label="Organization"
                            value={
                              inventoryData.interest_and_hobbies.organizations_participated || "N/A"
                            }
                          />
                          <InfoField
                            label="Position"
                            value={
                              inventoryData.interest_and_hobbies
                                .occupational_position_organization || "N/A"
                            }
                          />
                          <InfoField
                            label="Favorite Subject"
                            value={inventoryData.interest_and_hobbies.favorite_subject || "N/A"}
                          />
                          <InfoField
                            label="Least Favorite"
                            value={
                              inventoryData.interest_and_hobbies.favorite_least_subject || "N/A"
                            }
                          />
                        </div>
                        {inventoryData.interest_and_hobbies.what_are_your_hobbies &&
                          inventoryData.interest_and_hobbies.what_are_your_hobbies.length > 0 && (
                            <div className="border-t border-green-200 pt-2">
                              <p className="text-sm font-medium text-green-800 mb-2">Hobbies:</p>
                              <div className="flex flex-wrap gap-2">
                                {inventoryData.interest_and_hobbies.what_are_your_hobbies.map(
                                  (hobby, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                                    >
                                      {hobby}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Test Results */}
                  {inventoryData.test_results && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-rose-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Test Results
                      </h4>
                      <div className="space-y-2 text-sm sm:text-base">
                        <InfoField
                          label="Test Name"
                          value={inventoryData.test_results.name_of_test || "N/A"}
                        />
                        <InfoField
                          label="Date"
                          value={
                            inventoryData.test_results.date
                              ? formatDate(inventoryData.test_results.date)
                              : "N/A"
                          }
                        />
                        <InfoField
                          label="Raw Score (RS)"
                          value={inventoryData.test_results.rs || "N/A"}
                        />
                        <InfoField
                          label="Percentile Rank (PR)"
                          value={inventoryData.test_results.pr || "N/A"}
                        />
                        {inventoryData.test_results.description && (
                          <div className="border-t border-rose-200 pt-2">
                            <p className="text-sm font-medium text-rose-800 mb-1">Description:</p>
                            <p className="text-sm text-rose-900">
                              {inventoryData.test_results.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <InfoField label="Created" value={formatDate(inventoryData.createdAt)} />
                    <InfoField label="Last Updated" value={formatDate(inventoryData.updatedAt)} />
                  </div>

                  {/* Prediction Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Prediction Generated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryData.predictionGenerated ? "Yes" : "No"}
                      </p>
                    </div>
                    {inventoryData.predictionUpdatedAt && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Prediction Updated</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(inventoryData.predictionUpdatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleSection>
            )}
          </div>

          {/* RIGHT COLUMN - 3 Sections */}
          <div className="space-y-3 sm:space-y-4">
            {/* Assessment History Section */}
            {assessmentHistory.length > 0 && (
              <CollapsibleSection
                title={`Assessment History (${assessmentHistory.length})`}
                icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
                isExpanded={expandedSections.assessmentHistory}
                onToggle={() => toggleSection("assessmentHistory")}
              >
                <div className="space-y-3">
                  {assessmentHistory.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-base sm:text-xl">
                            {getAssessmentTypeIcon(assessment.type)}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize text-sm sm:text-base">
                              {assessment.type === "checklist"
                                ? "Personal Problems"
                                : assessment.type}{" "}
                              Assessment
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {formatDate(assessment.assessmentDate)}
                              {" at "}
                              {formatTime(assessment.assessmentDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                          {assessment.totalScore !== undefined && (
                            <div className="text-xs sm:text-sm font-semibold text-gray-900 bg-gray-100 px-2 sm:px-3 py-1 rounded-full border border-gray-300">
                              Score: {assessment.totalScore}
                            </div>
                          )}
                          {assessment.severityLevel || assessment.riskLevel ? (
                            <span
                              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getSeverityColor(
                                assessment.severityLevel || assessment.riskLevel
                              )}`}
                            >
                              {formatSeverityLabel(
                                assessment.severityLevel || assessment.riskLevel || "Unknown"
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Mental Health Predictions Section */}
            {inventoryData?.mentalHealthPredictions &&
              inventoryData.mentalHealthPredictions.length > 0 && (
                <CollapsibleSection
                  title={`Mental Health Predictions (${inventoryData.mentalHealthPredictions.length})`}
                  icon={<Brain className="w-4 h-4 sm:w-5 sm:h-5" />}
                  isExpanded={expandedSections.mentalHealthPredictions}
                  onToggle={() => toggleSection("mentalHealthPredictions")}
                >
                  <div className="space-y-4">
                    {[...inventoryData.mentalHealthPredictions]
                      .sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )
                      .map((prediction, index) => (
                        <div
                          key={prediction.id}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4"
                        >
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-blue-900 text-sm sm:text-base">
                                  Prediction #{index + 1}
                                </h4>
                                {index === 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 border border-green-300">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-blue-600">
                                Generated: {formatDate(prediction.createdAt)}
                                {" at "}
                                {formatTime(prediction.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                              <span
                                className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getRiskLevelColor(
                                  prediction.mentalHealthRisk?.level
                                )}`}
                              >
                                {prediction.mentalHealthRisk?.level?.toUpperCase() || "UNKNOWN"}
                              </span>
                              {prediction.mentalHealthRisk?.needsAttention && (
                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                                  ⚠️ Needs Attention
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Academic Performance Outlook */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-[10px] sm:text-xs font-medium text-blue-700 mb-1">
                                Confidence Level
                              </label>
                              <div className="bg-blue-100 rounded-md p-2 text-[10px] sm:text-xs text-blue-900 font-medium">
                                {prediction.confidence
                                  ? `${(prediction.confidence * 100).toFixed(1)}%`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>

                          {/* Risk Description */}
                          {prediction.mentalHealthRisk?.description && (
                            <div className="mb-3">
                              <label className="block text-[10px] sm:text-xs font-medium text-blue-700 mb-1">
                                Risk Assessment
                              </label>
                              <div className="bg-blue-100 rounded-md p-2 text-[10px] sm:text-xs text-blue-900">
                                {prediction.mentalHealthRisk.description}
                              </div>
                            </div>
                          )}

                          {/* Risk Factors */}
                          {prediction.riskFactors && prediction.riskFactors.length > 0 && (
                            <div className="mb-3">
                              <label className="block text-[10px] sm:text-xs font-medium text-blue-700 mb-2">
                                Risk Factors ({prediction.riskFactors.length})
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {prediction.riskFactors.map((factor, factorIndex) => (
                                  <span
                                    key={factorIndex}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {prediction.recommendations && prediction.recommendations.length > 0 && (
                            <div className="mb-3">
                              <label className="block text-[10px] sm:text-xs font-medium text-blue-700 mb-2">
                                Recommendations ({prediction.recommendations.length})
                              </label>
                              <div className="bg-green-50 border border-green-200 rounded-md p-2">
                                <ul className="space-y-1">
                                  {prediction.recommendations.map((rec, recIndex) => (
                                    <li
                                      key={recIndex}
                                      className="text-[10px] sm:text-xs text-green-800 flex items-start"
                                    >
                                      <span className="text-green-600 mr-1 flex-shrink-0">•</span>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Assessment Summary */}
                          {prediction.mentalHealthRisk?.assessmentSummary && (
                            <div className="mt-3 p-2 bg-blue-100 border-l-4 border-blue-500 rounded">
                              <p className="text-[10px] sm:text-xs text-blue-900 font-medium">
                                <strong>Summary:</strong>{" "}
                                {prediction.mentalHealthRisk.assessmentSummary}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Disclaimer */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-[10px] sm:text-xs text-orange-800">
                        <strong>Disclaimer:</strong> These predictions are machine learning
                        assessments based on available data and should not replace professional
                        medical advice. Always consult with qualified mental health professionals
                        for accurate diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

            {/* Consultation Details Section */}
            <CollapsibleSection
              title={`Consultation Details (${consultationNotes.length})`}
              icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
              isExpanded={expandedSections.consultationDetails}
              onToggle={() => toggleSection("consultationDetails")}
            >
              <div className="space-y-3">
                {/* Add New Consultation Note Form */}
                {isAddingConsultationNote && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">
                      Add New Consultation Note
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={newConsultationNoteData.title}
                          onChange={(e) =>
                            setNewConsultationNoteData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter consultation title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={newConsultationNoteData.content}
                          onChange={(e) =>
                            setNewConsultationNoteData((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter consultation details..."
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          onClick={() => setIsAddingConsultationNote(false)}
                          variant="ghost"
                          size="sm"
                          className="px-3 py-2 text-primary-700 hover:bg-primary-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddConsultationNote}
                          disabled={loading || !newConsultationNoteData.title.trim()}
                          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Note Button */}
                {!isAddingConsultationNote && (
                  <Button
                    onClick={() => setIsAddingConsultationNote(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Consultation Note
                  </Button>
                )}

                {/* Notes List */}
                {consultationNotes.length > 0 ? (
                  <div className="space-y-3">
                    {consultationNotes.map((note, index) => (
                      <div
                        key={index}
                        className="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4"
                      >
                        {editingConsultationNoteIndex === index ? (
                          <EditConsultationNoteForm
                            note={note}
                            onSave={(updatedData) => handleEditConsultationNote(index, updatedData)}
                            onCancel={() => setEditingConsultationNoteIndex(null)}
                            loading={loading}
                          />
                        ) : (
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-primary-600" />
                                <h4 className="font-semibold text-primary-900 text-sm sm:text-base">
                                  {note.title || `Consultation Record ${index + 1}`}
                                </h4>
                                <span className="text-[10px] sm:text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                  Record #{index + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => setEditingConsultationNoteIndex(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6 text-primary-600 hover:bg-primary-100"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteConsultationNote(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6 text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {note.content && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-primary-800 mb-1">
                                  Details:
                                </p>
                                <div className="text-xs sm:text-sm text-primary-800 whitespace-pre-wrap">
                                  {note.content}
                                </div>
                              </div>
                            )}

                            {note.createdAt && (
                              <div className="text-xs text-primary-600 pt-2 border-t border-primary-200">
                                Created: {formatDate(note.createdAt)} at{" "}
                                {formatTime(note.createdAt)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  !isAddingConsultationNote && (
                    <div className="text-center py-4 sm:py-6 text-gray-500">
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm">No consultation records available</p>
                    </div>
                  )
                )}
              </div>
            </CollapsibleSection>

            {/* Significant Notes Section */}
            {inventoryData && (
              <CollapsibleSection
                title={`Significant Notes for IIF Results (${
                  inventoryData.significantNotes?.length || 0
                })`}
                icon={<StickyNote className="w-4 h-4 sm:w-5 sm:h-5" />}
                isExpanded={expandedSections.significantNotes}
                onToggle={() => toggleSection("significantNotes")}
              >
                <div className="space-y-3">
                  {/* Add New Note Form */}
                  {isAddingNote && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 text-sm">Add New Note</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={newNoteData.date}
                            onChange={(e) =>
                              setNewNoteData((prev) => ({ ...prev, date: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Incident Description *
                          </label>
                          <textarea
                            value={newNoteData.incident}
                            onChange={(e) =>
                              setNewNoteData((prev) => ({ ...prev, incident: e.target.value }))
                            }
                            placeholder="Describe the incident or observation..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Remarks
                          </label>
                          <textarea
                            value={newNoteData.remarks}
                            onChange={(e) =>
                              setNewNoteData((prev) => ({ ...prev, remarks: e.target.value }))
                            }
                            placeholder="Additional remarks or follow-up actions..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAddNote}
                            disabled={loading || !newNoteData.incident.trim()}
                            className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            Save Note
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAddingNote(false);
                              setNewNoteData({
                                date: new Date().toISOString().split("T")[0],
                                incident: "",
                                remarks: "",
                              });
                            }}
                            variant="ghost"
                            className="flex items-center gap-1 px-3 py-1 text-gray-600 text-xs rounded hover:bg-gray-100"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Note Button */}
                  {!isAddingNote && (
                    <Button
                      onClick={() => setIsAddingNote(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Significant Note
                    </Button>
                  )}

                  {/* Notes List */}
                  {inventoryData.significantNotes && inventoryData.significantNotes.length > 0 ? (
                    <div className="space-y-3">
                      {inventoryData.significantNotes.map((note, index) => (
                        <div
                          key={note.id}
                          className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                        >
                          {editingNoteId === note.id ? (
                            <EditNoteForm
                              note={note}
                              onSave={(updatedData) => handleEditNote(note.id, updatedData)}
                              onCancel={() => setEditingNoteId(null)}
                              loading={loading}
                            />
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs text-yellow-700 font-medium">
                                    {note.date ? formatDate(note.date) : "No date specified"}
                                  </span>
                                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                    Note #{inventoryData.significantNotes!.length - index}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={() => setEditingNoteId(note.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-6 w-6 text-yellow-600 hover:bg-yellow-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteNote(note.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-6 w-6 text-red-600 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {note.incident && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-yellow-800 mb-1">
                                    Incident:
                                  </p>
                                  <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                                    {note.incident}
                                  </p>
                                </div>
                              )}

                              {note.remarks && (
                                <div className="border-t border-yellow-200 pt-2">
                                  <p className="text-xs font-medium text-yellow-800 mb-1">
                                    Remarks:
                                  </p>
                                  <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                                    {note.remarks}
                                  </p>
                                </div>
                              )}

                              <div className="text-xs text-yellow-600 mt-2 pt-2 border-t border-yellow-200">
                                Created: {formatDate(note.createdAt)} at{" "}
                                {formatTime(note.createdAt)}
                                {note.updatedAt !== note.createdAt && (
                                  <span className="ml-2">
                                    • Updated: {formatDate(note.updatedAt)} at{" "}
                                    {formatTime(note.updatedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isAddingNote && (
                      <div className="text-center py-6 text-gray-500">
                        <StickyNote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No significant notes recorded</p>
                      </div>
                    )
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Consent Details Section */}
            {consentData && (
              <CollapsibleSection
                title="Consent Details"
                icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
                isExpanded={expandedSections.consentDetails}
                onToggle={() => toggleSection("consentDetails")}
              >
                <div className="space-y-3 sm:space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <InfoField label="Referred By" value={consentData.referred || "N/A"} />
                    <InfoField
                      label="Living With"
                      value={consentData.with_whom_do_you_live || "N/A"}
                    />
                    <InfoField
                      label="Financial Status"
                      value={consentData.financial_status || "N/A"}
                    />
                    <InfoField
                      label="Physical Problem"
                      value={consentData.physical_problem === "yes" ? "Yes" : "No"}
                    />
                  </div>

                  {/* Reason for Guidance */}
                  {consentData.what_brings_you_to_guidance && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                        Reason for Guidance
                      </h4>
                      <p className="text-sm sm:text-base text-blue-800 whitespace-pre-wrap">
                        {consentData.what_brings_you_to_guidance}
                      </p>
                    </div>
                  )}

                  {/* Physical Symptoms */}
                  {consentData.physical_symptoms && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-red-900 mb-2 sm:mb-3 text-sm sm:text-base flex items-center space-x-2">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Physical Symptoms</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(consentData.physical_symptoms) ? (
                          consentData.physical_symptoms.map((symptom: string) => (
                            <span
                              key={symptom}
                              className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-red-100 text-red-700 rounded-full"
                            >
                              {String(symptom).replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs sm:text-base text-red-700 bg-red-100 px-2 sm:px-3 py-1 rounded-full">
                            {String(consentData.physical_symptoms).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Present Concerns */}
                  {consentData.concerns && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Present Concerns
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {Object.entries(consentData.concerns).map(([key, value]: [string, any]) => {
                          const displayKey = String(key)
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase());
                          return (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-indigo-800 font-medium">{displayKey}:</span>
                              <span className="text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                {String(value).replace(/_/g, " ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {consentData.services && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-green-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Services Interested
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(consentData.services) ? (
                          consentData.services.map((service: string) => (
                            <span
                              key={service}
                              className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-green-100 text-green-700 rounded-full"
                            >
                              {String(service).replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-green-100 text-green-700 rounded-full">
                            {String(consentData.services).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <InfoField label="Created" value={formatDate(consentData.createdAt)} />
                    <InfoField label="Last Updated" value={formatDate(consentData.updatedAt)} />
                  </div>
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Helper component for collapsible section
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="text-primary-600 flex-shrink-0">{icon}</div>
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
        </div>
        <div className="text-gray-400 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

// Helper component for info fields
interface InfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, icon }) => {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-900 py-1.5 sm:py-2 px-2 sm:px-3 bg-white rounded-md border border-gray-200">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
};

// Helper component for editing notes
interface EditNoteFormProps {
  note: {
    id: string;
    date?: string;
    incident?: string;
    remarks?: string;
  };
  onSave: (updatedData: { date?: string; incident?: string; remarks?: string }) => void;
  onCancel: () => void;
  loading: boolean;
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({ note, onSave, onCancel, loading }) => {
  const [editData, setEditData] = useState({
    date: note.date || new Date().toISOString().split("T")[0],
    incident: note.incident || "",
    remarks: note.remarks || "",
  });

  const handleSave = () => {
    if (!editData.incident.trim()) return;
    onSave(editData);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={editData.date}
          onChange={(e) => setEditData((prev) => ({ ...prev, date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Incident Description *
        </label>
        <textarea
          value={editData.incident}
          onChange={(e) => setEditData((prev) => ({ ...prev, incident: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          value={editData.remarks}
          onChange={(e) => setEditData((prev) => ({ ...prev, remarks: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading || !editData.incident.trim()}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-3 h-3" />
          Save Changes
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="flex items-center gap-1 px-3 py-1 text-gray-600 text-xs rounded hover:bg-gray-100"
        >
          <X className="w-3 h-3" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Helper component for editing consultation notes
interface EditConsultationNoteFormProps {
  note: {
    title?: string;
    content?: string;
    createdAt?: string;
  };
  onSave: (updatedData: { title?: string; content?: string }) => void;
  onCancel: () => void;
  loading: boolean;
}

const EditConsultationNoteForm: React.FC<EditConsultationNoteFormProps> = ({
  note,
  onSave,
  onCancel,
  loading,
}) => {
  const [editData, setEditData] = useState({
    title: note.title || "",
    content: note.content || "",
  });

  const handleSave = () => {
    if (!editData.title.trim()) return;
    onSave(editData);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter consultation title"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={editData.content}
          onChange={(e) => setEditData((prev) => ({ ...prev, content: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter consultation details..."
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading || !editData.title.trim()}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-3 h-3" />
          Save Changes
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="flex items-center gap-1 px-3 py-1 text-gray-600 text-xs rounded hover:bg-gray-100"
        >
          <X className="w-3 h-3" />
          Cancel
        </Button>
      </div>
    </div>
  );
};
