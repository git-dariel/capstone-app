import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { ConfirmationModal } from "@/components/molecules";
import { LoadingScreen } from "@/components/atoms";
import type { Student } from "@/services/student.service";
import type { ConsultantRecord } from "@/types/consultant-record.types";
import { Calendar, Edit, FileText, Plus, Trash2, User } from "lucide-react";
import React, { useState } from "react";

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
                  <p className="text-xs sm:text-sm text-gray-500">
                    {records.length} consultation record{records.length !== 1 ? "s" : ""}
                  </p>
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {records.map((record, index) => (
                    <div
                      key={record.id}
                      className={`relative rounded-lg border-2 shadow-sm transition-all duration-200 hover:shadow-md ${getStickyNoteColor(
                        index
                      )}`}
                    >
                      {/* Card Header */}
                      <div className="p-3 sm:p-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate">
                              {record.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(record.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span>Record #{index + 1}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3 sm:p-4">
                        <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {record.content}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                          <div className="text-xs text-gray-500">
                            Created: {formatDate(record.createdAt)}
                            {record.updatedAt !== record.createdAt && (
                              <span className="ml-2">
                                • Updated: {formatDate(record.updatedAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="text-gray-600 hover:text-primary-600 p-1 h-8 w-8"
                              title="Edit record"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record)}
                              disabled={isDeleting}
                              className="text-gray-600 hover:text-red-600 p-1 h-8 w-8"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
