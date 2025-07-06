import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { QuestionCard } from "@/components/atoms";
import { Button } from "@/components/ui";

interface AnxietyQuestionnaireProps {
  onBack: () => void;
  onSubmit: (responses: Record<number, number>) => void;
}

export const AnxietyQuestionnaire: React.FC<AnxietyQuestionnaireProps> = ({ onBack, onSubmit }) => {
  const [responses, setResponses] = useState<Record<number, number>>({});

  const questions = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it's hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
  ];

  const difficultyQuestion =
    "If you checked any problems, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?";

  const answerChoices = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ];

  const difficultyChoices = [
    { value: 0, label: "Not difficult at all" },
    { value: 1, label: "Somewhat difficult" },
    { value: 2, label: "Very difficult" },
    { value: 3, label: "Extremely difficult" },
  ];

  const handleAnswerSelect = (questionIndex: number, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  // Check if any of the first 7 questions have symptoms (value > 0)
  const hasSymptoms = Object.entries(responses)
    .filter(([key]) => parseInt(key) < 7)
    .some(([, value]) => value > 0);

  // Total questions needed to complete (7 + difficulty question if has symptoms)
  const totalQuestionsNeeded = hasSymptoms ? questions.length + 1 : questions.length;

  const isComplete = Object.keys(responses).length === totalQuestionsNeeded;
  const totalScore = Object.entries(responses)
    .filter(([key]) => parseInt(key) < 7) // Only count first 7 questions for score
    .reduce((sum, [, value]) => sum + value, 0);

  const getScoreInterpretation = (score: number) => {
    if (score <= 4) return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" };
    if (score <= 9) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (score <= 14) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" };
    return { level: "Severe", color: "text-red-600", bg: "bg-red-50" };
  };

  const interpretation = getScoreInterpretation(totalScore);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Assessments</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">GAD-7 Anxiety Assessment</h1>
          <p className="text-gray-600 mb-4">
            Over the last <strong>2 weeks</strong>, how often have you been bothered by any of the
            following problems?
          </p>

          {isComplete && (
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg ${interpretation.bg} ${interpretation.color} font-medium`}
            >
              Current Score: {totalScore}/21 - {interpretation.level} Anxiety
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-6">
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            questionNumber={index + 1}
            question={question}
            choices={answerChoices}
            selectedValue={responses[index]}
            onSelect={(value) => handleAnswerSelect(index, value)}
          />
        ))}

        {/* Difficulty Question - only show if user has symptoms */}
        {hasSymptoms && (
          <QuestionCard
            key={7}
            questionNumber={8}
            question={difficultyQuestion}
            choices={difficultyChoices}
            selectedValue={responses[7]}
            onSelect={(value) => handleAnswerSelect(7, value)}
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="px-8 py-3 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Assessment
        </Button>
      </div>
    </div>
  );
};
