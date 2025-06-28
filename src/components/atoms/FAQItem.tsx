import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  className?: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-medium text-gray-900 pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-600 leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
