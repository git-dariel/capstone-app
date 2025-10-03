import React, { useState } from "react";
import { ConsultantRecordCard } from "./ConsultantRecordCard";
import type { ConsultantRecord } from "@/types/consultant-record.types";

interface StackedConsultantCardsProps {
  records: ConsultantRecord[];
  onEdit: (record: ConsultantRecord) => void;
  onCreateNew: (studentId: string) => void;
  onDelete: (record: ConsultantRecord) => void;
  onViewAll: (studentId: string) => void;
  formatDate: (dateString: string) => string;
}

export const StackedConsultantCards: React.FC<StackedConsultantCardsProps> = ({
  records,
  onEdit,
  onCreateNew,
  onDelete,
  onViewAll,
  formatDate,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (records.length === 0) return null;

  const topRecord = records[0];
  const remainingRecords = records.slice(1);

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
    <div
      className="relative group stacked-cards-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stacked Cards Container */}
      <div className="relative">
        {/* Background Cards (Stacked Effect) */}
        {remainingRecords.map((_, index) => (
          <div
            key={`background-${index}`}
            className={`absolute inset-0 rounded-lg shadow-sm border-2 transition-all duration-300 ease-out ${
              isHovered ? "opacity-50" : "opacity-30"
            } ${getStickyNoteColor(index + 1)}`}
            style={{
              zIndex: records.length - index - 1,
              transform: isHovered
                ? `translate(${(index + 1) * 4}px, ${(index + 1) * 4}px) rotate(${
                    (index + 1) * 0.5
                  }deg)`
                : `translate(${(index + 1) * 2}px, ${(index + 1) * 2}px) rotate(${
                    (index + 1) * 0.25
                  }deg)`,
            }}
          />
        ))}

        {/* Top Card (Main Card) */}
        <div className="relative z-10">
          <ConsultantRecordCard
            record={topRecord}
            onEdit={onEdit}
            onCreateNew={onCreateNew}
            onDelete={onDelete}
            onViewAll={records.length > 1 ? onViewAll : undefined}
            formatDate={formatDate}
            totalRecordsForStudent={records.length}
          />
        </div>
      </div>
    </div>
  );
};
