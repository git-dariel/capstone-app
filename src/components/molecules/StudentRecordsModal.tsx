import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { ConfirmationModal } from "@/components/molecules";
import { LoadingScreen } from "@/components/atoms";
import type { Student } from "@/services/student.service";
import type { ConsultantRecord } from "@/types/consultant-record.types";
import {
  Calendar,
  Edit,
  FileText,
  Plus,
  Trash2,
  User,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface StudentRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  records: ConsultantRecord[];
  onEdit: (record: ConsultantRecord) => void;
  onCreateNew: (studentId: string) => void;
  onDelete: (record: ConsultantRecord) => void;
  formatDate: (dateString: string) => string;
  onModalInteraction?: () => void;
}

export const StudentRecordsModal: React.FC<StudentRecordsModalProps> = ({
  isOpen,
  onClose,
  student,
  records,
  onEdit,
  onCreateNew,
  onDelete,
  formatDate,
  onModalInteraction,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ConsultantRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(searchLower) ||
          record.content.toLowerCase().includes(searchLower),
      );
    }

    return filtered.sort((a, b) => {
      const aDate = new Date(a.consultationDate || a.createdAt).getTime();
      const bDate = new Date(b.consultationDate || b.createdAt).getTime();
      return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
    });
  }, [records, searchTerm, sortOrder]);

  if (!student) return null;

  const studentName = `${student.person?.firstName} ${student.person?.lastName}`;
  const studentInfo = `${student.program} (Year ${student.year})`;

  const handleDelete = (record: ConsultantRecord) => {
    setRecordToDelete(record);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(recordToDelete);
      setShowConfirmDelete(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setRecordToDelete(null);
  };

  const handleCreateNew = () => {
    if (onModalInteraction) {
      onModalInteraction();
    }
    onCreateNew(student.id);
  };

  const handleEdit = (record: ConsultantRecord) => {
    if (onModalInteraction) {
      onModalInteraction();
    }
    onEdit(record);
  };

  const getStickyNoteColor = (index: number) => {
    const colors = [
      "bg-yellow-50 border-yellow-200", // Yellow
      "bg-pink-50 border-pink-200", // Pink
      "bg-blue-50 border-blue-200", // Blue
      "bg-green-50 border-green-200", // Green
      "bg-purple-50 border-purple-200", // Purple
      "bg-orange-50 border-orange-200", // Orange
    ];
    return colors[index % colors.length];
  };

  const toggleExpanded = (recordId: string) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
        <LoadingScreen isLoading={isDeleting} message="Deleting consultation record...">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{studentName}</h1>
                  <p className="text-sm sm:text-base text-gray-600">{studentInfo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {records.length} consultation record{records.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-primary-700 bg-primary-50 border border-primary-200 rounded-full px-2 py-0.5">
                      Notes
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  onClick={handleCreateNew}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Record</span>
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {records.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No consultation records
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                    This student doesn't have any consultation records yet.
                  </p>
                  <Button
                    onClick={handleCreateNew}
                    className="bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Record</span>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search notes by title or content..."
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                          value={sortOrder}
                          onChange={(event) =>
                            setSortOrder(event.target.value as "newest" | "oldest")
                          }
                          className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">No records match your search.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRecords.map((record, index) => {
                        const isExpanded = expandedRecords[record.id];
                        return (
                          <div
                            key={record.id}
                            className={`rounded-lg border shadow-sm ${getStickyNoteColor(index)}`}
                          >
                            <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {record.title}
                                  </h3>
                                  <span className="text-[10px] text-gray-500 bg-white/70 border border-gray-200 rounded-full px-2 py-0.5">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(record.consultationDate)}
                                  </span>
                                  <span>Updated: {formatDate(record.updatedAt)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpanded(record.id)}
                                  className="text-gray-600 hover:text-primary-600"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      View
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  className="text-gray-600 hover:text-primary-600"
                                  title="Edit record"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(record)}
                                  disabled={isDeleting}
                                  className="text-gray-600 hover:text-red-600"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-gray-200 bg-white/70 px-3 sm:px-4 py-3">
                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {record.content}
                                </div>
                                <div className="mt-3 text-xs text-gray-500">
                                  Created: {formatDate(record.createdAt)}
                                  {record.updatedAt !== record.createdAt && (
                                    <span className="ml-2">
                                      • Updated: {formatDate(record.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </LoadingScreen>
      </Modal>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Consultation Record"
        message={`Are you sure you want to delete "${recordToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={false}
      />
    </>
  );
};
