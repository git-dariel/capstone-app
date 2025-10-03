import React from "react";
import { Edit, Calendar, User, Plus, Trash2, Eye } from "lucide-react";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui";
import type { ConsultantRecord } from "@/types/consultant-record.types";

interface ConsultantRecordCardProps {
  record: ConsultantRecord;
  onEdit: (record: ConsultantRecord) => void;
  onCreateNew: (studentId: string) => void;
  onDelete: (record: ConsultantRecord) => void;
  onViewAll?: (studentId: string) => void;
  formatDate: (dateString: string) => string;
  totalRecordsForStudent?: number;
}

export const ConsultantRecordCard: React.FC<ConsultantRecordCardProps> = ({
  record,
  onEdit,
  onCreateNew,
  onDelete,
  onViewAll,
  formatDate,
  totalRecordsForStudent = 1,
}) => {
  const studentName = record.student?.person
    ? `${record.student.person.firstName} ${record.student.person.lastName}`
    : "Unknown Student";

  const getStickyNoteColor = (index: number) => {
    const colors = [
      "bg-yellow-100 border-yellow-300 shadow-yellow-200",
      "bg-pink-100 border-pink-300 shadow-pink-200",
      "bg-blue-100 border-blue-300 shadow-blue-200",
      "bg-green-100 border-green-300 shadow-green-200",
      "bg-purple-100 border-purple-300 shadow-purple-200",
      "bg-orange-100 border-orange-300 shadow-orange-200",
      "bg-cyan-100 border-cyan-300 shadow-cyan-200",
      "bg-rose-100 border-rose-300 shadow-rose-200",
    ];
    return colors[index % colors.length];
  };

  const colorClass = getStickyNoteColor(parseInt(record.id.split("-").pop() || "0"));

  return (
    <div
      className={`
        relative p-3 sm:p-4 rounded-lg border-2 shadow-lg hover:shadow-xl transition-all duration-300 
        transform hover:-translate-y-1 hover:scale-105 cursor-pointer group
        ${colorClass}
        before:absolute before:top-0 before:right-0 before:w-6 before:h-6 sm:before:w-8 sm:before:h-8 
        before:bg-gradient-to-br before:from-transparent before:to-black/5 
        before:rounded-bl-lg before:pointer-events-none
      `}
      onClick={() => onEdit(record)}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Sticky note corner fold effect */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-t-[16px] sm:border-t-[20px] border-t-black/10"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Avatar
            fallback={studentName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
            className="w-6 h-6 sm:w-8 sm:h-8 text-xs flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate group-hover:text-gray-700 transition-colors">
              {record.title}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-600 truncate">{studentName}</p>
              {totalRecordsForStudent > 1 && (
                <span className="text-xs bg-primary-200 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-md font-medium border border-gray-200">
                  +{totalRecordsForStudent - 1}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-0.5 sm:space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCreateNew(record.studentId);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 h-5 w-5 sm:h-6 sm:w-6 hover:bg-black/10"
            title="Add new record for this student"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 h-5 w-5 sm:h-6 sm:w-6 hover:bg-black/10"
            title="Edit this record"
          >
            <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 h-5 w-5 sm:h-6 sm:w-6 hover:bg-red-50 hover:text-red-600"
            title="Delete this record"
          >
            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-2 sm:mb-3">
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-4">
          {record.content || <span className="italic text-gray-500">No content available</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 pt-2 border-t border-black/10 space-y-1 sm:space-y-0">
        <div className="flex items-center space-x-1">
          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{formatDate(record.createdAt)}</span>
        </div>

        <div className="flex items-center justify-end space-x-2">
          {record.student && (
            <div className="flex items-center space-x-1">
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="truncate max-w-[60px] sm:max-w-[80px]">
                {record.student.program}
              </span>
            </div>
          )}

          {onViewAll && totalRecordsForStudent > 1 && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewAll(record.studentId);
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-2 py-0.5 h-5 flex items-center space-x-1"
              title="View all records for this student"
            >
              <Eye className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};
