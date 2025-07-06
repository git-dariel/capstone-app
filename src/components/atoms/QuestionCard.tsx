import React from "react";
import { cn } from "@/lib/utils";

interface AnswerChoice {
  value: number;
  label: string;
}

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  choices: AnswerChoice[];
  selectedValue?: number;
  onSelect: (value: number) => void;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  question,
  choices,
  selectedValue,
  onSelect,
  className,
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {questionNumber}. {question}
        </h3>
      </div>

      <div className="space-y-3">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 hover:border-primary-300 hover:bg-primary-50"
          >
            <input
              type="radio"
              name={`question-${questionNumber}`}
              value={choice.value}
              checked={selectedValue === choice.value}
              onChange={() => onSelect(choice.value)}
              className="w-4 h-4 text-primary-700 border-gray-300 focus:ring-primary-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">{choice.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
