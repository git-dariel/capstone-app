import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { Avatar } from "@/components/atoms";
import type { Student } from "@/services/student.service";
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
} from "lucide-react";
import { InventoryService, ConsentService } from "@/services";

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
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    studentDetails: true,
    personDetails: true,
    userDetails: true,
    inventoryDetails: false,
    assessmentHistory: false,
    consultationDetails: false,
    consentDetails: false,
  });

  const [inventoryData, setInventoryData] = useState<GetInventoryResponse | null>(null);
  const [consentData, setConsentData] = useState<GetConsentResponse | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!student) return null;

  const person = student.person;
  const studentName = person ? `${person.firstName} ${person.lastName}` : "Unknown Student";
  const studentAvatar = person?.users?.[0]?.avatar;

  const consultationNotes = student.notes || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 h-full overflow-y-auto px-6 py-4">
        {/* Student Header Card - Improved for Desktop */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Avatar and Basic Info */}
            <div className="flex items-center space-x-4 flex-1">
              <Avatar
                src={studentAvatar}
                fallback={studentName.charAt(0)}
                className="w-24 h-24 text-2xl flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary-900">{studentName}</h2>
                <p className="text-primary-600 text-sm font-medium mt-1">
                  ID: {student.studentNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              <div className="bg-white bg-opacity-70 rounded-lg p-3 lg:p-4 border border-primary-200 border-opacity-50">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  Program
                </p>
                <p className="text-lg lg:text-xl font-bold text-primary-900 truncate">
                  {student.program}
                </p>
              </div>
              <div className="bg-white bg-opacity-70 rounded-lg p-3 lg:p-4 border border-primary-200 border-opacity-50">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  Year Level
                </p>
                <p className="text-lg lg:text-xl font-bold text-primary-900">Year {student.year}</p>
              </div>
              <div className="bg-white bg-opacity-70 rounded-lg p-3 lg:p-4 border border-primary-200 border-opacity-50">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  Assessments
                </p>
                <p className="text-lg lg:text-xl font-bold text-primary-900">
                  {assessmentHistory.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading student information...</span>
            </div>
          </div>
        )}

        {/* Expandable Sections - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - 4 Sections */}
          <div className="space-y-4">
            {/* Student Details Section */}
            <CollapsibleSection
              title="Student Details"
              icon={<GraduationCap className="w-5 h-5" />}
              isExpanded={expandedSections.studentDetails}
              onToggle={() => toggleSection("studentDetails")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Student Number" value={student.studentNumber || "N/A"} />
                <InfoField label="Program" value={student.program || "N/A"} />
                <InfoField label="Year Level" value={student.year || "N/A"} />
                <InfoField label="Date Created" value={formatDate(student.createdAt)} />
                <InfoField label="Last Updated" value={formatDate(student.updatedAt)} />
              </div>
            </CollapsibleSection>

            {/* Person Details Section */}
            <CollapsibleSection
              title="Person Details"
              icon={<User className="w-5 h-5" />}
              isExpanded={expandedSections.personDetails}
              onToggle={() => toggleSection("personDetails")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              icon={<User className="w-5 h-5" />}
              isExpanded={expandedSections.userDetails}
              onToggle={() => toggleSection("userDetails")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                  label="Email"
                  value={person?.email || "N/A"}
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoField
                  label="Contact Number"
                  value={person?.contactNumber || "N/A"}
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
            </CollapsibleSection>

            {/* Inventory Details Section */}
            {inventoryData && (
              <CollapsibleSection
                title="Inventory Details"
                icon={<BarChart3 className="w-5 h-5" />}
                isExpanded={expandedSections.inventoryDetails}
                onToggle={() => toggleSection("inventoryDetails")}
              >
                <div className="space-y-6">
                  {/* Physical Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">
                      Physical Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      <InfoField label="Height" value={inventoryData.height || "N/A"} />
                      <InfoField label="Weight" value={inventoryData.weight || "N/A"} />
                      <InfoField label="Complexion" value={inventoryData.coplexion || "N/A"} />
                    </div>
                  </div>

                  {/* Person to be Contacted */}
                  {inventoryData.person_to_be_contacted_in_case_of_accident_or_illness && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-3 text-base">
                        Emergency Contact
                      </h4>
                      <div className="space-y-2 text-base">
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
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-3 text-base">
                        Educational Background
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
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
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-900 mb-3 text-base">
                        Nature of Schooling
                      </h4>
                      <div className="space-y-2 text-base">
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
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 mb-3 text-base">
                        Home & Family Background
                      </h4>
                      <div className="space-y-3 text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3 text-base">
                        Health Information
                      </h4>
                      <div className="space-y-3 text-base">
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 text-base">
                        Interest & Hobbies
                      </h4>
                      <div className="space-y-3 text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-900 mb-3 text-base">Test Results</h4>
                      <div className="space-y-2 text-base">
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

                  {/* Mental Health Prediction */}
                  {inventoryData.mentalHealthPrediction && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 text-base flex items-center space-x-2">
                        <Heart className="w-5 h-5" />
                        <span>Mental Health Prediction</span>
                      </h4>
                      <div className="space-y-3 text-base">
                        {/* Risk Level */}
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800 font-medium">Risk Level:</span>
                          <span
                            className={`font-semibold px-3 py-1 rounded-full text-sm ${
                              inventoryData.mentalHealthPrediction.mentalHealthRisk.level === "low"
                                ? "bg-green-100 text-green-800"
                                : inventoryData.mentalHealthPrediction.mentalHealthRisk.level ===
                                  "moderate"
                                ? "bg-yellow-100 text-yellow-800"
                                : inventoryData.mentalHealthPrediction.mentalHealthRisk.level ===
                                  "high"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inventoryData.mentalHealthPrediction.mentalHealthRisk.level.toUpperCase()}
                          </span>
                        </div>

                        {/* Urgency */}
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800 font-medium">Urgency:</span>
                          <span className="text-blue-700 capitalize">
                            {inventoryData.mentalHealthPrediction.mentalHealthRisk.urgency}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="text-blue-700">
                          <p className="text-sm font-medium text-blue-800 mb-1">Description:</p>
                          <p className="text-sm">
                            {inventoryData.mentalHealthPrediction.mentalHealthRisk.description}
                          </p>
                        </div>

                        {/* Assessment Summary */}
                        <div className="text-blue-700 border-t border-blue-200 pt-2">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Assessment Summary:
                          </p>
                          <p className="text-sm">
                            {
                              inventoryData.mentalHealthPrediction.mentalHealthRisk
                                .assessmentSummary
                            }
                          </p>
                        </div>

                        {/* Confidence & Accuracy */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200">
                          <div>
                            <p className="text-sm font-medium text-blue-800">Confidence</p>
                            <p className="text-sm text-blue-700">
                              {(inventoryData.mentalHealthPrediction.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Decision Tree</p>
                            <p className="text-sm text-blue-700">
                              {(
                                inventoryData.mentalHealthPrediction.modelAccuracy.decisionTree *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Random Forest</p>
                            <p className="text-sm text-blue-700">
                              {(
                                inventoryData.mentalHealthPrediction.modelAccuracy.randomForest *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>

                        {/* Academic Performance Outlook */}
                        <div className="text-blue-700 border-t border-blue-200 pt-2">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Academic Outlook:
                          </p>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium capitalize">
                            {inventoryData.mentalHealthPrediction.academicPerformanceOutlook}
                          </span>
                        </div>

                        {/* Risk Factors */}
                        {inventoryData.mentalHealthPrediction.riskFactors &&
                          inventoryData.mentalHealthPrediction.riskFactors.length > 0 && (
                            <div className="text-blue-700 border-t border-blue-200 pt-2">
                              <p className="text-sm font-medium text-blue-800 mb-2">
                                Risk Factors:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {inventoryData.mentalHealthPrediction.riskFactors.map(
                                  (factor, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                    >
                                      {factor}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Recommendations */}
                        {inventoryData.mentalHealthPrediction.recommendations &&
                          inventoryData.mentalHealthPrediction.recommendations.length > 0 && (
                            <div className="text-blue-700 border-t border-blue-200 pt-2">
                              <p className="text-sm font-medium text-blue-800 mb-2">
                                Recommendations:
                              </p>
                              <ul className="space-y-1 text-sm">
                                {inventoryData.mentalHealthPrediction.recommendations.map(
                                  (rec, idx) => (
                                    <li key={idx} className="flex items-start space-x-2">
                                      <span className="text-blue-600 font-bold">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {/* Prediction Date */}
                        <div className="text-blue-700 border-t border-blue-200 pt-2 text-sm">
                          <span className="font-medium text-blue-800">Prediction Date:</span>{" "}
                          {formatDate(inventoryData.mentalHealthPrediction.predictionDate)}
                        </div>

                        {/* Disclaimer */}
                        <div className="text-blue-700 border-t border-blue-200 pt-2 italic text-sm bg-blue-100 p-2 rounded">
                          <p>{inventoryData.mentalHealthPrediction.mentalHealthRisk.disclaimer}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <InfoField label="Created" value={formatDate(inventoryData.createdAt)} />
                    <InfoField label="Last Updated" value={formatDate(inventoryData.updatedAt)} />
                  </div>

                  {/* Prediction Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
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
          <div className="space-y-4">
            {/* Assessment History Section */}
            {assessmentHistory.length > 0 && (
              <CollapsibleSection
                title={`Assessment History (${assessmentHistory.length})`}
                icon={<Activity className="w-5 h-5" />}
                isExpanded={expandedSections.assessmentHistory}
                onToggle={() => toggleSection("assessmentHistory")}
              >
                <div className="space-y-3">
                  {assessmentHistory.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getAssessmentTypeIcon(assessment.type)}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {assessment.type === "checklist"
                                ? "Personal Problems"
                                : assessment.type}{" "}
                              Assessment
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(assessment.assessmentDate)}
                              {" at "}
                              {formatTime(assessment.assessmentDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assessment.totalScore !== undefined && (
                            <div className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                              Score: {assessment.totalScore}
                            </div>
                          )}
                          {assessment.severityLevel || assessment.riskLevel ? (
                            <span
                              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
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

            {/* Consultation Details Section */}
            <CollapsibleSection
              title={`Consultation Details (${consultationNotes.length})`}
              icon={<FileText className="w-5 h-5" />}
              isExpanded={expandedSections.consultationDetails}
              onToggle={() => toggleSection("consultationDetails")}
            >
              {consultationNotes.length > 0 ? (
                <div className="space-y-3">
                  {consultationNotes.map((note, index) => (
                    <div
                      key={index}
                      className="bg-primary-50 border border-primary-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-primary-900">
                          {note.title || `Consultation Record ${index + 1}`}
                        </h4>
                        <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                          Record #{index + 1}
                        </span>
                      </div>
                      {note.content && (
                        <div className="text-sm text-primary-800 whitespace-pre-wrap">
                          {note.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No consultation records available</p>
                </div>
              )}
            </CollapsibleSection>

            {/* Consent Details Section */}
            {consentData && (
              <CollapsibleSection
                title="Consent Details"
                icon={<Shield className="w-5 h-5" />}
                isExpanded={expandedSections.consentDetails}
                onToggle={() => toggleSection("consentDetails")}
              >
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 text-base">
                        Reason for Guidance
                      </h4>
                      <p className="text-base text-blue-800 whitespace-pre-wrap">
                        {consentData.what_brings_you_to_guidance}
                      </p>
                    </div>
                  )}

                  {/* Physical Symptoms */}
                  {consentData.physical_symptoms && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3 text-base flex items-center space-x-2">
                        <Heart className="w-5 h-5" />
                        <span>Physical Symptoms</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(consentData.physical_symptoms) ? (
                          consentData.physical_symptoms.map((symptom: string) => (
                            <span
                              key={symptom}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full"
                            >
                              {String(symptom).replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-base text-red-700 bg-red-100 px-3 py-1 rounded-full">
                            {String(consentData.physical_symptoms).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Present Concerns */}
                  {consentData.concerns && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-3 text-base">
                        Present Concerns
                      </h4>
                      <div className="space-y-2 text-sm">
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 text-base">
                        Services Interested
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(consentData.services) ? (
                          consentData.services.map((service: string) => (
                            <span
                              key={service}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full"
                            >
                              {String(service).replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                            {String(consentData.services).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="text-primary-600 flex-shrink-0">{icon}</div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-gray-400 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">{children}</div>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2 text-sm text-gray-900 py-2 px-3 bg-white rounded-md border border-gray-200">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};
