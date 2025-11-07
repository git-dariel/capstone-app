import { Avatar, FormField, FormSelect, FullScreenLoading } from "@/components/atoms";
import { Button } from "@/components/ui";
import { InventoryReminderModal } from "@/components/molecules";
import { useAuth, useInventoryReminder } from "@/hooks";
import { InventoryService, type GetInventoryResponse } from "@/services";
import {
  Activity,
  AlertCircle,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Edit2,
  FileText,
  Heart,
  Home,
  Loader2,
  Plus,
  Save,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export const StudentInventoryContent: React.FC = () => {
  const { student } = useAuth();
  const [inventory, setInventory] = useState<GetInventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [selectedPredictionIndex, setSelectedPredictionIndex] = useState<number>(0);
  const [isPredictionDropdownOpen, setIsPredictionDropdownOpen] = useState(false);

  // Inventory reminder hook
  const { reminderInfo, showReminder, dismissReminder, refreshReminder } = useInventoryReminder();

  // Fetch student's inventory
  useEffect(() => {
    const fetchInventory = async () => {
      if (!student?.id) {
        setError("Student ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await InventoryService.getInventoryByStudentId(student.id);
        if (!data) {
          setError("No inventory found. Please complete your inventory first.");
          setInventory(null);
        } else {
          setInventory(data);
          setEditData({
            height: data.height,
            weight: data.weight,
            coplexion: data.coplexion,
          });
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load inventory");
        setInventory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [student?.id]);

  // Always reset to show the latest prediction when inventory changes
  useEffect(() => {
    if (inventory?.mentalHealthPredictions && inventory.mentalHealthPredictions.length > 0) {
      setSelectedPredictionIndex(0); // Always show the latest (first after sorting) prediction
      setIsPredictionDropdownOpen(false); // Close dropdown
    }
  }, [inventory?.mentalHealthPredictions]);

  // Helper function to get sorted predictions (latest first by timestamp)
  const getSortedPredictions = () => {
    if (!inventory?.mentalHealthPredictions) return [];

    return [...inventory.mentalHealthPredictions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleEditClick = (section: string) => {
    setEditingSection(section);
    // Initialize edit data from current inventory
    if (inventory) {
      if (section === "physical") {
        setEditData({
          height: inventory.height,
          weight: inventory.weight,
          coplexion: inventory.coplexion,
        });
      } else if (section === "emergency") {
        setEditData({
          person_to_be_contacted_in_case_of_accident_or_illness:
            inventory.person_to_be_contacted_in_case_of_accident_or_illness || {},
        });
      } else if (section === "educational") {
        setEditData({
          educational_background: inventory.educational_background || {},
        });
      } else if (section === "schooling") {
        setEditData({
          nature_of_schooling: inventory.nature_of_schooling || {},
        });
      } else if (section === "family") {
        setEditData({
          home_and_family_background: inventory.home_and_family_background || {},
        });
      } else if (section === "health") {
        setEditData({
          health: inventory.health || {},
        });
      } else if (section === "hobbies") {
        setEditData({
          interest_and_hobbies: inventory.interest_and_hobbies || {},
        });
      } else if (section === "testresults") {
        setEditData({
          test_results: inventory.test_results || {},
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!inventory?.id || !student?.id) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update the inventory with edited data
      await InventoryService.updateInventory(inventory.id, editData);

      // Fetch the latest inventory data from server (to get updated prediction and all fields)
      const updated = await InventoryService.getInventoryByStudentId(student.id);
      if (updated) {
        setInventory(updated);
        setEditingSection(null);
        setEditData({});
        // Refresh reminder after update
        refreshReminder();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update inventory");
    } finally {
      setIsSaving(false);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  // Error state - no inventory found
  if (!inventory && error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Inventory</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!inventory) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Inventory</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Found</h3>
            <p className="text-gray-600">
              Please complete your inventory assessment to view and manage your data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const studentName = inventory.student?.person
    ? `${inventory.student.person.firstName || ""} ${
        inventory.student.person.lastName || ""
      }`.trim()
    : "Unknown Student";

  const studentAvatar = inventory.student?.person?.users?.[0]?.avatar;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Full Screen Loading Indicator */}
      <FullScreenLoading
        isLoading={isSaving}
        message="Updating your inventory information..."
        size="lg"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Inventory</h1>
          <p className="text-gray-600 mt-1">View and update your personal inventory information</p>
        </div>

        {/* Update Reminder Info */}
        {reminderInfo && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            {reminderInfo.needsUpdate && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{reminderInfo.isOverdue ? "Update Overdue" : "Update Due Soon"}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Student Header Card */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <Avatar
            src={studentAvatar}
            fallback={studentName.charAt(0)}
            className="w-16 h-16 text-lg"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-900">{studentName}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-primary-700">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  📚 {inventory.student?.program || "N/A"}
                </span>
              </div>
              <div className="text-sm font-medium">Year {inventory.student?.year || "N/A"}</div>
              {inventory.student?.studentNumber && (
                <div className="text-sm font-medium">ID: {inventory.student.studentNumber}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Physical Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary-600" />
              <span>Physical Information</span>
            </h3>
            {editingSection !== "physical" && (
              <Button
                onClick={() => handleEditClick("physical")}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            )}
          </div>

          {editingSection === "physical" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  id="height-input"
                  label="Height"
                  placeholder="e.g., 5'10"
                  value={editData.height || ""}
                  onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                />
                <FormField
                  id="weight-input"
                  label="Weight"
                  placeholder="e.g., 70 kg"
                  value={editData.weight || ""}
                  onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                />
                <FormSelect
                  id="complexion-select"
                  label="Complexion"
                  value={editData.coplexion || ""}
                  onChange={(value) => setEditData({ ...editData, coplexion: value })}
                  options={[
                    { label: "Fair", value: "fair" },
                    { label: "Medium", value: "medium" },
                    { label: "Dark", value: "dark" },
                    { label: "Very Fair", value: "very fair" },
                    { label: "Very Dark", value: "very dark" },
                  ]}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  loading={isSaving}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {!isSaving && <Check className="h-4 w-4" />}
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {inventory.height}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {inventory.weight}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complexion</label>
                <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                  {inventory.coplexion}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Person to be Contacted Section */}
      {inventory.person_to_be_contacted_in_case_of_accident_or_illness && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Emergency Contact</span>
              </h3>
              {editingSection !== "emergency" && (
                <Button
                  onClick={() => handleEditClick("emergency")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {editingSection === "emergency" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="ec-firstName"
                    label="First Name"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.firstName ||
                      ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          firstName: e.target.value,
                        },
                      })
                    }
                  />
                  <FormField
                    id="ec-lastName"
                    label="Last Name"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.lastName || ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          lastName: e.target.value,
                        },
                      })
                    }
                  />
                  <FormField
                    id="ec-middleName"
                    label="Middle Name (Optional)"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.middleName ||
                      ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          middleName: e.target.value,
                        },
                      })
                    }
                  />
                  <FormSelect
                    id="ec-relationship"
                    label="Relationship"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness
                        ?.relationship || ""
                    }
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          relationship: value,
                        },
                      })
                    }
                    options={[
                      { label: "Parent", value: "parent" },
                      { label: "Child", value: "child" },
                      { label: "Sibling", value: "sibling" },
                      { label: "Spouse", value: "spouse" },
                      { label: "Grandparent", value: "granparent" },
                      { label: "Cousin", value: "cousin" },
                      { label: "Partner", value: "partner" },
                      { label: "Classmate", value: "classmate" },
                    ]}
                  />
                  <FormField
                    id="ec-street"
                    label="Street"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.address
                        ?.street || ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          address: {
                            ...editData.person_to_be_contacted_in_case_of_accident_or_illness
                              ?.address,
                            street: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <FormField
                    id="ec-city"
                    label="City"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.address
                        ?.city || ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          address: {
                            ...editData.person_to_be_contacted_in_case_of_accident_or_illness
                              ?.address,
                            city: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <FormField
                    id="ec-province"
                    label="Province"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.address
                        ?.province || ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          address: {
                            ...editData.person_to_be_contacted_in_case_of_accident_or_illness
                              ?.address,
                            province: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <FormField
                    id="ec-barangay"
                    label="Barangay"
                    value={
                      editData.person_to_be_contacted_in_case_of_accident_or_illness?.address
                        ?.barangay || ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        person_to_be_contacted_in_case_of_accident_or_illness: {
                          ...editData.person_to_be_contacted_in_case_of_accident_or_illness,
                          address: {
                            ...editData.person_to_be_contacted_in_case_of_accident_or_illness
                              ?.address,
                            barangay: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    loading={isSaving}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    {!isSaving && <Check className="h-4 w-4" />}
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const contact = inventory.person_to_be_contacted_in_case_of_accident_or_illness;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                          {contact.firstName} {contact.middleName ? contact.middleName + " " : ""}
                          {contact.lastName}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship
                        </label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                          {contact.relationship}
                        </div>
                      </div>
                      {contact.address && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Street
                            </label>
                            <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                              {contact.address.street || "N/A"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                              {contact.address.city || "N/A"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Province
                            </label>
                            <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                              {contact.address.province || "N/A"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Barangay
                            </label>
                            <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                              {contact.address.barangay || "N/A"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Background Section */}
      {inventory.educational_background && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Educational Background</span>
              </h3>
              {editingSection !== "educational" && (
                <Button
                  onClick={() => handleEditClick("educational")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {editingSection === "educational" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    id="edu-level"
                    label="Education Level"
                    value={editData.educational_background?.level || ""}
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          level: value,
                        },
                      })
                    }
                    options={[
                      { label: "Pre-Elementary", value: "pre_elementary" },
                      { label: "Elementary", value: "elementary" },
                      { label: "High School", value: "high_school" },
                      { label: "Vocational", value: "vocational" },
                      { label: "College (If Any)", value: "college_if_any" },
                    ]}
                  />
                  <FormSelect
                    id="edu-status"
                    label="School Status"
                    value={editData.educational_background?.status || ""}
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          status: value,
                        },
                      })
                    }
                    options={[
                      { label: "Public", value: "public" },
                      { label: "Private", value: "private" },
                    ]}
                  />
                  <FormField
                    id="edu-graduation"
                    label="School Graduation Year"
                    placeholder="e.g., 2020"
                    value={editData.educational_background?.school_graduation || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          school_graduation: e.target.value,
                        },
                      })
                    }
                  />
                  <FormField
                    id="edu-attendance"
                    label="Dates of Attendance"
                    type="date"
                    value={editData.educational_background?.dates_of_attendance || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          dates_of_attendance: e.target.value,
                        },
                      })
                    }
                  />
                  <FormField
                    id="edu-honors"
                    label="Honors Received"
                    placeholder="e.g., Dean's List, Cum Laude"
                    value={editData.educational_background?.honors_received || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          honors_received: e.target.value,
                        },
                      })
                    }
                  />
                  <FormField
                    id="edu-school-city"
                    label="School City"
                    value={editData.educational_background?.school_address?.city || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          school_address: {
                            ...editData.educational_background?.school_address,
                            city: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <FormField
                    id="edu-school-province"
                    label="School Province"
                    value={editData.educational_background?.school_address?.province || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        educational_background: {
                          ...editData.educational_background,
                          school_address: {
                            ...editData.educational_background?.school_address,
                            province: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    loading={isSaving}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    {!isSaving && <Check className="h-4 w-4" />}
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const edu = inventory.educational_background;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Education Level
                        </label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                          {edu.level?.replace(/_/g, " ")}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School Status
                        </label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                          {edu.status}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School Graduation Year
                        </label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                          {edu.school_graduation}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dates of Attendance
                        </label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                          {formatDate(edu.dates_of_attendance)}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Honors Received
                        </label>
                        <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                          {edu.honors_received || "None"}
                        </div>
                      </div>
                      {edu.school_address && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              School City
                            </label>
                            <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                              {edu.school_address.city || "N/A"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              School Province
                            </label>
                            <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                              {edu.school_address.province || "N/A"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nature of Schooling */}
      {inventory.nature_of_schooling && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nature of Schooling</h3>
              {editingSection !== "schooling" && (
                <Button
                  onClick={() => handleEditClick("schooling")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {editingSection === "schooling" ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="nature-of-schooling"
                      checked={
                        editData.nature_of_schooling?.continuous === true &&
                        editData.nature_of_schooling?.interrupted === false
                      }
                      onChange={() =>
                        setEditData({
                          ...editData,
                          nature_of_schooling: {
                            ...editData.nature_of_schooling,
                            continuous: true,
                            interrupted: false,
                            exaplain_why: null,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Continuous</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="nature-of-schooling"
                      checked={editData.nature_of_schooling?.interrupted === true}
                      onChange={() =>
                        setEditData({
                          ...editData,
                          nature_of_schooling: {
                            ...editData.nature_of_schooling,
                            continuous: false,
                            interrupted: true,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Interrupted</span>
                  </label>
                </div>

                {editData.nature_of_schooling?.interrupted && (
                  <FormField
                    id="schooling-explain"
                    label="If interrupted, please explain:"
                    placeholder="Explain why schooling was interrupted"
                    value={editData.nature_of_schooling?.exaplain_why || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        nature_of_schooling: {
                          ...editData.nature_of_schooling,
                          exaplain_why: e.target.value,
                        },
                      })
                    }
                  />
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    loading={isSaving}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    {!isSaving && <Check className="h-4 w-4" />}
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const schooling = inventory.nature_of_schooling;
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 w-40">Nature:</span>
                        <span className="text-sm text-gray-900">
                          {schooling.continuous ? "Continuous" : "Interrupted"}
                        </span>
                      </div>
                      {schooling.exaplain_why && (
                        <div className="flex items-start">
                          <span className="text-sm font-medium text-gray-700 w-40">
                            Explanation:
                          </span>
                          <span className="text-sm text-gray-900">{schooling.exaplain_why}</span>
                        </div>
                      )}
                      {schooling.exaplain_why && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Explanation:</span>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                            {schooling.exaplain_why}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Home and Family Background */}
      {inventory.home_and_family_background && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Home className="w-5 h-5 text-green-600" />
                <span>Home & Family Background</span>
              </h3>
              {editingSection !== "family" && (
                <Button
                  onClick={() => handleEditClick("family")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {editingSection === "family" ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ Edit family information below. All fields can be modified directly.
                  </p>
                </div>

                {/* Father Information */}
                {editData.home_and_family_background?.father && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900">Father Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        id="father-firstName"
                        label="First Name"
                        value={editData.home_and_family_background.father.firstName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              father: {
                                ...editData.home_and_family_background.father,
                                firstName: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <FormField
                        id="father-lastName"
                        label="Last Name"
                        value={editData.home_and_family_background.father.lastName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              father: {
                                ...editData.home_and_family_background.father,
                                lastName: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <FormField
                        id="father-age"
                        label="Age"
                        type="number"
                        value={editData.home_and_family_background.father.age?.toString() || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              father: {
                                ...editData.home_and_family_background.father,
                                age: parseInt(e.target.value) || 0,
                              },
                            },
                          })
                        }
                      />
                      <FormSelect
                        id="father-status"
                        label="Status"
                        value={editData.home_and_family_background.father.status || ""}
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              father: {
                                ...editData.home_and_family_background.father,
                                status: value,
                              },
                            },
                          })
                        }
                        options={[
                          { label: "Living", value: "living" },
                          { label: "Deceased", value: "deceased" },
                        ]}
                      />
                      <FormSelect
                        id="father-education"
                        label="Educational Attainment"
                        value={
                          editData.home_and_family_background.father.educational_attainment || ""
                        }
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              father: {
                                ...editData.home_and_family_background.father,
                                educational_attainment: value,
                              },
                            },
                          })
                        }
                        options={[
                          { label: "None", value: "none" },
                          { label: "Elementary", value: "elementary" },
                          { label: "High School", value: "high_school" },
                          { label: "Senior High School", value: "senior_high_school" },
                          { label: "Bachelor's Degree", value: "bachelors_degree" },
                          { label: "Vocational", value: "vocational" },
                        ]}
                      />
                      <FormField
                        id="father-occupation"
                        label="Occupation"
                        value={editData.home_and_family_background.father.occupation || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              father: {
                                ...editData.home_and_family_background.father,
                                occupation: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Mother Information */}
                {editData.home_and_family_background?.mother && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900">Mother Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        id="mother-firstName"
                        label="First Name"
                        value={editData.home_and_family_background.mother.firstName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              mother: {
                                ...editData.home_and_family_background.mother,
                                firstName: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <FormField
                        id="mother-lastName"
                        label="Last Name"
                        value={editData.home_and_family_background.mother.lastName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              mother: {
                                ...editData.home_and_family_background.mother,
                                lastName: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <FormField
                        id="mother-age"
                        label="Age"
                        type="number"
                        value={editData.home_and_family_background.mother.age?.toString() || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              mother: {
                                ...editData.home_and_family_background.mother,
                                age: parseInt(e.target.value) || 0,
                              },
                            },
                          })
                        }
                      />
                      <FormSelect
                        id="mother-status"
                        label="Status"
                        value={editData.home_and_family_background.mother.status || ""}
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              mother: {
                                ...editData.home_and_family_background.mother,
                                status: value,
                              },
                            },
                          })
                        }
                        options={[
                          { label: "Living", value: "living" },
                          { label: "Deceased", value: "deceased" },
                        ]}
                      />
                      <FormSelect
                        id="mother-education"
                        label="Educational Attainment"
                        value={
                          editData.home_and_family_background.mother.educational_attainment || ""
                        }
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              mother: {
                                ...editData.home_and_family_background.mother,
                                educational_attainment: value,
                              },
                            },
                          })
                        }
                        options={[
                          { label: "None", value: "none" },
                          { label: "Elementary", value: "elementary" },
                          { label: "High School", value: "high_school" },
                          { label: "Senior High School", value: "senior_high_school" },
                          { label: "Bachelor's Degree", value: "bachelors_degree" },
                          { label: "Vocational", value: "vocational" },
                        ]}
                      />
                      <FormField
                        id="mother-occupation"
                        label="Occupation"
                        value={editData.home_and_family_background.mother.occupation || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            home_and_family_background: {
                              ...editData.home_and_family_background,
                              mother: {
                                ...editData.home_and_family_background.mother,
                                occupation: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Family Statistics */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900">Family Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      id="total-children"
                      label="Total Children (Including You)"
                      type="number"
                      value={
                        editData.home_and_family_background?.number_of_children_in_the_family_including_yourself?.toString() ||
                        ""
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          home_and_family_background: {
                            ...editData.home_and_family_background,
                            number_of_children_in_the_family_including_yourself:
                              parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <FormField
                      id="brothers"
                      label="Number of Brothers"
                      type="number"
                      value={
                        editData.home_and_family_background?.number_of_brothers?.toString() || ""
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          home_and_family_background: {
                            ...editData.home_and_family_background,
                            number_of_brothers: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <FormField
                      id="sisters"
                      label="Number of Sisters"
                      type="number"
                      value={
                        editData.home_and_family_background?.number_of_sisters?.toString() || ""
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          home_and_family_background: {
                            ...editData.home_and_family_background,
                            number_of_sisters: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Parents Marital Relationship */}
                <div className="space-y-4 border-t pt-4">
                  <FormSelect
                    id="parents-relationship"
                    label="Parents Marital Relationship"
                    value={editData.home_and_family_background?.parents_martial_relationship || ""}
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        home_and_family_background: {
                          ...editData.home_and_family_background,
                          parents_martial_relationship: value,
                        },
                      })
                    }
                    options={[
                      { label: "Single Parent", value: "single_parent" },
                      {
                        label: "Married and Staying Together",
                        value: "married_and_staying_together",
                      },
                      { label: "Married But Separated", value: "married_but_separated" },
                      {
                        label: "Not Married But Living Together",
                        value: "not_married_but_living_together",
                      },
                      { label: "Others", value: "others" },
                    ]}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    loading={isSaving}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    {!isSaving && <Check className="h-4 w-4" />}
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const family = inventory.home_and_family_background;
                  return (
                    <div className="space-y-6">
                      {/* Father Information */}
                      {family.father && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Father</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700">Name</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {family.father.firstName} {family.father.lastName}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Age</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {family.father.age}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Status</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded capitalize">
                                {family.father.status}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                Educational Attainment
                              </label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded capitalize">
                                {family.father.educational_attainment?.replace(/_/g, " ")}
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-medium text-gray-700">
                                Occupation
                              </label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {family.father.occupation}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mother Information */}
                      {family.mother && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Mother</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700">Name</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {family.mother.firstName} {family.mother.lastName}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Age</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {family.mother.age}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Status</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded capitalize">
                                {family.mother.status}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                Educational Attainment
                              </label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded capitalize">
                                {family.mother.educational_attainment?.replace(/_/g, " ")}
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-medium text-gray-700">
                                Occupation
                              </label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {family.mother.occupation}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Family Statistics */}
                      <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700">
                            Total Children
                          </label>
                          <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                            {family.number_of_children_in_the_family_including_yourself}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Brothers</label>
                          <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                            {family.number_of_brothers}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Sisters</label>
                          <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                            {family.number_of_sisters}
                          </div>
                        </div>
                      </div>

                      {/* Parents Income */}
                      {family.parents_total_montly_income && (
                        <div className="border-t pt-4">
                          <label className="text-sm font-medium text-gray-700">
                            Parents Total Monthly Income
                          </label>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-2 capitalize">
                            {family.parents_total_montly_income.income?.replace(/_/g, " ")}
                          </div>
                        </div>
                      )}

                      {/* Parental Relationship */}
                      {family.parents_martial_relationship && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Parents Marital Relationship
                          </label>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-2 capitalize">
                            {family.parents_martial_relationship?.replace(/_/g, " ")}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Information */}
      {inventory.health && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>Health Information</span>
              </h3>
              {editingSection !== "health" && (
                <Button
                  onClick={() => handleEditClick("health")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {editingSection === "health" ? (
              <div className="space-y-6">
                {/* Physical Health Section */}
                <div className="space-y-4 border-b pb-6">
                  <h4 className="font-medium text-gray-900">Physical Health</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="physical-vision"
                        checked={editData.health?.physical?.your_vision || false}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            health: {
                              ...editData.health,
                              physical: {
                                ...editData.health?.physical,
                                your_vision: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor="physical-vision"
                        className="text-sm font-medium text-gray-700"
                      >
                        Vision - Normal
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="physical-hearing"
                        checked={editData.health?.physical?.your_hearing || false}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            health: {
                              ...editData.health,
                              physical: {
                                ...editData.health?.physical,
                                your_hearing: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor="physical-hearing"
                        className="text-sm font-medium text-gray-700"
                      >
                        Hearing - Normal
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="physical-speech"
                        checked={editData.health?.physical?.your_speech || false}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            health: {
                              ...editData.health,
                              physical: {
                                ...editData.health?.physical,
                                your_speech: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor="physical-speech"
                        className="text-sm font-medium text-gray-700"
                      >
                        Speech - Normal
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="physical-general"
                        checked={editData.health?.physical?.your_general_health || false}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            health: {
                              ...editData.health,
                              physical: {
                                ...editData.health?.physical,
                                your_general_health: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor="physical-general"
                        className="text-sm font-medium text-gray-700"
                      >
                        General Health - Good
                      </label>
                    </div>
                    <FormField
                      id="physical-specify"
                      label="If Yes, Please Specify"
                      type="textarea"
                      value={editData.health?.physical?.if_yes_please_specify || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          health: {
                            ...editData.health,
                            physical: {
                              ...editData.health?.physical,
                              if_yes_please_specify: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Describe any health issues or conditions"
                    />
                  </div>
                </div>

                {/* Psychological Health Section */}
                <div className="space-y-4 border-b pb-6">
                  <h4 className="font-medium text-gray-900">Psychological Health</h4>
                  <FormSelect
                    id="psychological-consulted"
                    label="Consulted Professional"
                    value={editData.health?.psychological?.consulted || ""}
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        health: {
                          ...editData.health,
                          psychological: {
                            ...editData.health?.psychological,
                            consulted: value,
                          },
                        },
                      })
                    }
                    options={[
                      { label: "Psychiatrist", value: "psychiatrist" },
                      { label: "Psychologist", value: "psychologist" },
                      { label: "Counselor", value: "councelor" },
                    ]}
                  />
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="psychological-status"
                      checked={editData.health?.psychological?.status === "yes"}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          health: {
                            ...editData.health,
                            psychological: {
                              ...editData.health?.psychological,
                              status: e.target.checked ? "yes" : "no",
                            },
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="psychological-status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Consulted - Yes
                    </label>
                  </div>
                  {editData.health?.psychological?.status === "yes" && (
                    <>
                      <FormField
                        id="psychological-when"
                        label="When"
                        type="date"
                        value={
                          editData.health?.psychological?.when
                            ? new Date(editData.health.psychological.when)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            health: {
                              ...editData.health,
                              psychological: {
                                ...editData.health?.psychological,
                                when: e.target.value ? new Date(e.target.value) : null,
                              },
                            },
                          })
                        }
                      />
                      <FormField
                        id="psychological-for-what"
                        label="For What"
                        type="textarea"
                        value={editData.health?.psychological?.for_what || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            health: {
                              ...editData.health,
                              psychological: {
                                ...editData.health?.psychological,
                                for_what: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Describe the reason for consultation"
                      />
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const health = inventory.health;
                  return (
                    <div className="space-y-4">
                      {health.physical && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Physical Health</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700">Vision</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {health.physical.your_vision ? "✓ Normal" : "✗ Has Issues"}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Hearing</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {health.physical.your_hearing ? "✓ Normal" : "✗ Has Issues"}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Speech</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {health.physical.your_speech ? "✓ Normal" : "✗ Has Issues"}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                General Health
                              </label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {health.physical.your_general_health ? "✓ Good" : "✗ Has Issues"}
                              </div>
                            </div>
                            {health.physical.if_yes_please_specify && (
                              <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-700">Details</label>
                                <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                  {health.physical.if_yes_please_specify}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {health.psychological && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Psychological Health</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                Consulted Professional
                              </label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded capitalize">
                                {health.psychological.consulted?.replace(/_/g, " ")}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Status</label>
                              <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                {health.psychological.status === "yes" ? "✓ Yes" : "✗ No"}
                              </div>
                            </div>
                            {health.psychological.when && (
                              <div>
                                <label className="text-xs font-medium text-gray-700">When</label>
                                <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                  {formatDate(health.psychological.when)}
                                </div>
                              </div>
                            )}
                            {health.psychological.for_what && (
                              <div>
                                <label className="text-xs font-medium text-gray-700">Reason</label>
                                <div className="text-sm text-gray-900 py-1 px-2 bg-gray-50 rounded">
                                  {health.psychological.for_what}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interest and Hobbies */}
      {inventory.interest_and_hobbies && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span>Interest & Hobbies</span>
              </h3>
              {editingSection !== "hobbies" && (
                <Button
                  onClick={() => handleEditClick("hobbies")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {editingSection === "hobbies" ? (
              <div className="space-y-6">
                {/* Favorite Subjects Section */}
                <div className="space-y-4 border-b pb-6">
                  <h4 className="font-medium text-gray-900">Favorite Subjects</h4>
                  <FormField
                    id="favorite-subject"
                    label="Favorite Subject"
                    value={editData.interest_and_hobbies?.favorite_subject || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        interest_and_hobbies: {
                          ...editData.interest_and_hobbies,
                          favorite_subject: e.target.value,
                        },
                      })
                    }
                  />
                  <FormField
                    id="least-favorite-subject"
                    label="Least Favorite Subject"
                    value={editData.interest_and_hobbies?.favorite_least_subject || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        interest_and_hobbies: {
                          ...editData.interest_and_hobbies,
                          favorite_least_subject: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                {/* Organizations Section */}
                <div className="space-y-4 border-b pb-6">
                  <h4 className="font-medium text-gray-900">Organizations</h4>
                  <FormSelect
                    id="academic-club"
                    label="Academic Club"
                    value={editData.interest_and_hobbies?.academic || ""}
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        interest_and_hobbies: {
                          ...editData.interest_and_hobbies,
                          academic: value,
                        },
                      })
                    }
                    options={[
                      { label: "Match Club", value: "match_club" },
                      { label: "Debating Club", value: "debating_club" },
                      { label: "Science Club", value: "science_club" },
                      { label: "Quizzers Club", value: "quizzers_club" },
                    ]}
                  />
                  <FormSelect
                    id="occupational-position"
                    label="Position in Organization"
                    value={editData.interest_and_hobbies?.occupational_position_organization || ""}
                    onChange={(value) =>
                      setEditData({
                        ...editData,
                        interest_and_hobbies: {
                          ...editData.interest_and_hobbies,
                          occupational_position_organization: value,
                        },
                      })
                    }
                    options={[
                      { label: "Officer", value: "officer" },
                      { label: "Member", value: "member" },
                      { label: "Others", value: "others" },
                    ]}
                  />
                </div>

                {/* Hobbies Section */}
                <div className="space-y-4 border-b pb-6">
                  <h4 className="font-medium text-gray-900">Hobbies</h4>
                  <FormField
                    id="hobbies"
                    label="Hobbies (comma-separated)"
                    type="textarea"
                    value={(editData.interest_and_hobbies?.what_are_your_hobbies || []).join(", ")}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        interest_and_hobbies: {
                          ...editData.interest_and_hobbies,
                          what_are_your_hobbies: e.target.value
                            .split(",")
                            .map((h) => h.trim())
                            .filter((h) => h.length > 0),
                        },
                      })
                    }
                    placeholder="Enter hobbies separated by commas (e.g., Reading, Gaming, Sports)"
                  />
                  {editData.interest_and_hobbies?.what_are_your_hobbies &&
                    editData.interest_and_hobbies.what_are_your_hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editData.interest_and_hobbies.what_are_your_hobbies.map(
                          (hobby: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                            >
                              {hobby}
                            </span>
                          )
                        )}
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const interests = inventory.interest_and_hobbies;
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Favorite Subject
                          </label>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                            {interests.favorite_subject}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Least Favorite Subject
                          </label>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                            {interests.favorite_least_subject}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Academic Club</label>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1 capitalize">
                            {interests.academic?.replace(/_/g, " ")}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Organization Position
                          </label>
                          <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1 capitalize">
                            {interests.occupational_position_organization?.replace(/_/g, " ")}
                          </div>
                        </div>
                      </div>
                      {interests.what_are_your_hobbies &&
                        interests.what_are_your_hobbies.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Hobbies</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {interests.what_are_your_hobbies.map((hobby, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                >
                                  {hobby}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <span>Test Results</span>
            </h3>
            {editingSection !== "testresults" && (
              <Button
                onClick={() => handleEditClick("testresults")}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            )}
          </div>

          {editingSection === "testresults" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="test-name"
                  label="Test Name"
                  value={editData.test_results?.name_of_test || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      test_results: {
                        ...editData.test_results,
                        name_of_test: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter test name"
                />
                <FormField
                  id="test-date"
                  label="Date"
                  type="date"
                  value={
                    editData.test_results?.date
                      ? new Date(editData.test_results.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      test_results: {
                        ...editData.test_results,
                        date: e.target.value ? e.target.value : null,
                      },
                    })
                  }
                />
                <FormField
                  id="test-rs-score"
                  label="RS Score"
                  value={editData.test_results?.rs || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      test_results: {
                        ...editData.test_results,
                        rs: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter RS score"
                />
                <FormField
                  id="test-pr-score"
                  label="PR Score"
                  value={editData.test_results?.pr || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      test_results: {
                        ...editData.test_results,
                        pr: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter PR score"
                />
              </div>
              <FormField
                id="test-description"
                label="Description"
                type="textarea"
                value={editData.test_results?.description || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    test_results: {
                      ...editData.test_results,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="Enter test description or additional notes"
              />

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  loading={isSaving}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {!isSaving && <Check className="h-4 w-4" />}
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {inventory.test_results ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Test Name</label>
                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                      {inventory.test_results.name_of_test || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                      {inventory.test_results.date
                        ? formatDate(inventory.test_results.date)
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">RS Score</label>
                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                      {inventory.test_results.rs || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">PR Score</label>
                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                      {inventory.test_results.pr || "N/A"}
                    </div>
                  </div>
                  {inventory.test_results.description && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md mt-1">
                        {inventory.test_results.description}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm mb-2">No test results available yet</div>
                  <div className="text-xs text-gray-500 mb-4">
                    Test results will appear here once administered and recorded.
                  </div>
                  <Button
                    onClick={() => handleEditClick("testresults")}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Test Results</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Significant Notes Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>Counselor Notes ({inventory.significantNotes?.length || 0})</span>
          </h3>

          {inventory.significantNotes && inventory.significantNotes.length > 0 ? (
            <div className="space-y-4">
              {inventory.significantNotes.map((note, index) => (
                <div key={note.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Note #{index + 1}
                      </span>
                      {note.date && (
                        <span className="text-sm text-amber-600">{formatDate(note.date)}</span>
                      )}
                    </div>
                    <span className="text-xs text-amber-500">
                      Added: {formatDate(note.createdAt)}
                    </span>
                  </div>

                  {note.incident && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-amber-800 mb-1">
                        Incident/Observation
                      </label>
                      <div className="text-sm text-amber-900 bg-amber-100 rounded-md p-3">
                        {note.incident}
                      </div>
                    </div>
                  )}

                  {note.remarks && (
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-1">
                        Counselor Remarks
                      </label>
                      <div className="text-sm text-amber-900 bg-amber-100 rounded-md p-3">
                        {note.remarks}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-amber-600 text-sm mb-2">No counselor notes recorded yet</div>
              <div className="text-xs text-amber-500">
                Notes and observations from counselors and mental health professionals will appear
                here when available.
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> These records are maintained by counselors and mental health
              professionals for tracking your progress and providing appropriate support.
            </p>
          </div>
        </div>
      </div>

      {/* Mental Health Predictions Card */}
      {inventory.predictionGenerated &&
        inventory.mentalHealthPredictions &&
        inventory.mentalHealthPredictions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {(() => {
                const sortedPredictions = getSortedPredictions();
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-primary-600" />
                        <span>Mental Health Assessments ({sortedPredictions.length})</span>
                      </h3>

                      {/* Prediction Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsPredictionDropdownOpen(!isPredictionDropdownOpen)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span>
                            {selectedPredictionIndex === 0
                              ? "Latest Prediction"
                              : `Prediction #${selectedPredictionIndex + 1}`}
                          </span>
                          {isPredictionDropdownOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {isPredictionDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="py-1">
                              {sortedPredictions.map((prediction, index) => (
                                <button
                                  key={prediction.id}
                                  onClick={() => {
                                    setSelectedPredictionIndex(index);
                                    setIsPredictionDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                    selectedPredictionIndex === index
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>
                                      {index === 0
                                        ? "🟢 Latest Prediction"
                                        : `Prediction #${index + 1}`}
                                    </span>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500">
                                        {formatDate(prediction.createdAt)}
                                      </div>
                                      {index === 0 && (
                                        <div className="text-xs text-green-600 font-medium">
                                          Most Recent
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xs mt-1">
                                    <span
                                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                                        prediction.mentalHealthRisk.level
                                      )}`}
                                    >
                                      {prediction.mentalHealthRisk.level}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Display Selected Prediction (sorted by timestamp, latest first) */}
                    {(() => {
                      const selectedPrediction = sortedPredictions[selectedPredictionIndex];
                      if (!selectedPrediction) return null;

                      return (
                        <>
                          {/* Prediction Metadata */}
                          <div
                            className={`rounded-lg p-4 mb-6 border ${
                              selectedPredictionIndex === 0
                                ? "bg-green-50 border-green-200"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            {selectedPredictionIndex === 0 && (
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="text-green-700 font-semibold text-sm">
                                  🟢 Latest Assessment
                                </span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  Most Recent
                                </span>
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label
                                  className={`text-sm font-medium block mb-1 ${
                                    selectedPredictionIndex === 0
                                      ? "text-green-700"
                                      : "text-blue-700"
                                  }`}
                                >
                                  Generated On
                                </label>
                                <p
                                  className={`text-sm ${
                                    selectedPredictionIndex === 0
                                      ? "text-green-900"
                                      : "text-blue-900"
                                  }`}
                                >
                                  {formatDate(selectedPrediction.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Assessment Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Risk Level
                              </label>
                              <span
                                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-lg capitalize ${getRiskLevelColor(
                                  selectedPrediction.mentalHealthRisk.level
                                )}`}
                              >
                                {selectedPrediction.mentalHealthRisk.level}
                              </span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Needs Attention
                              </label>
                              {selectedPrediction.mentalHealthRisk.needsAttention ? (
                                <span className="text-orange-600 font-medium text-lg">⚠️ Yes</span>
                              ) : (
                                <span className="text-green-600 font-medium text-lg">✓ No</span>
                              )}
                            </div>
                          </div>

                          {/* Risk Description */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Risk Description
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                              {selectedPrediction.mentalHealthRisk.description}
                            </div>
                          </div>

                          {/* Assessment Summary */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assessment Summary
                            </label>
                            <div className="bg-primary-50 rounded-lg p-4 text-sm text-primary-800 leading-relaxed border border-primary-200">
                              {selectedPrediction.mentalHealthRisk.assessmentSummary}
                            </div>
                          </div>

                          {/* Risk Factors */}
                          {selectedPrediction.riskFactors &&
                            selectedPrediction.riskFactors.length > 0 && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Risk Factors ({selectedPrediction.riskFactors.length})
                                </label>
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                  <ul className="list-disc list-inside space-y-1">
                                    {selectedPrediction.riskFactors.map((factor, index) => (
                                      <li key={index} className="text-sm text-yellow-900">
                                        {factor}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                          {/* Recommendations */}
                          {selectedPrediction.recommendations &&
                            selectedPrediction.recommendations.length > 0 && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Recommendations ({selectedPrediction.recommendations.length})
                                </label>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                  <ul className="list-disc list-inside space-y-1">
                                    {selectedPrediction.recommendations.map(
                                      (recommendation, index) => (
                                        <li key={index} className="text-sm text-green-900">
                                          {recommendation}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}

                          {/* Disclaimer */}
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs text-orange-800">
                              <span className="font-semibold">⚠️ Disclaimer:</span>{" "}
                              {selectedPrediction.mentalHealthRisk.disclaimer}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>
        )}

      {/* Student Signature */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Signature</h3>
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
            <p className="text-center text-lg font-semibold text-gray-900">
              {inventory.student_signature}
            </p>
          </div>
        </div>
      </div>

      {/* Record Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>Record Information</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Created</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatDate(inventory.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                {formatDate(inventory.updatedAt)}
              </div>
            </div>
            {inventory.predictionUpdatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

      {/* Inventory Reminder Modal */}
      {reminderInfo && (
        <InventoryReminderModal
          isOpen={showReminder}
          onClose={() => {}} // Empty function since we want to handle dismissal through other actions
          reminderInfo={reminderInfo}
          onUpdateNow={() => {
            // Modal will navigate to inventory page and refresh
            refreshReminder();
          }}
          onDismiss={dismissReminder}
        />
      )}
    </div>
  );
};
