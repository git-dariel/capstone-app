import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { QuestionCard, FullScreenLoading } from "@/components/atoms";
import { Button } from "@/components/ui";

interface StressQuestionnaireProps {
  onBack: () => void;
  onSubmit: (responses: Record<number, number>) => void;
  loading?: boolean;
}

export const StressQuestionnaire: React.FC<StressQuestionnaireProps> = ({ onBack, onSubmit, loading = false }) => {
  const [responses, setResponses] = useState<Record<number, number>>({});

  const questions = [
    "How often have you been upset because of something that happened unexpectedly?",
    "How often have you felt that you were unable to control the important things in your life?",
    "How often have you felt nervous and stressed?",
    "How often have you felt confident about your ability to handle your personal problems?",
    "How often have you felt that things were going your way?",
    "How often have you found that you could not cope with all the things that you had to do?",
    "How often have you been able to control irritations in your life?",
    "How often have you felt that you were on top of things?",
    "How often have you been angered because of things that happened that were outside of your control?",
    "How often have you felt difficulties were piling up so high that you could not overcome them?",
  ];

  const answerChoices = [
    { value: 0, label: "Never" },
    { value: 1, label: "Almost never" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Fairly often" },
    { value: 4, label: "Very often" },
  ];

  // Questions 4, 5, 7, and 8 are reverse scored
  const reverseScoreQuestions = [3, 4, 6, 7];

  const handleAnswerSelect = (questionIndex: number, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  const isComplete = Object.keys(responses).length === questions.length;

  const calculateScore = () => {
    let total = 0;
    Object.entries(responses).forEach(([questionIndex, value]) => {
      const index = parseInt(questionIndex);
      if (reverseScoreQuestions.includes(index)) {
        // Reverse score these items
        total += 4 - value;
      } else {
        total += value;
      }
    });
    return total;
  };

  const totalScore = calculateScore();

  const getScoreInterpretation = (score: number) => {
    if (score <= 13) return { level: "Low", color: "text-green-600", bg: "bg-green-50" };
    if (score <= 26) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "High", color: "text-red-600", bg: "bg-red-50" };
  };

  const interpretation = getScoreInterpretation(totalScore);

  return (
    <>
      <FullScreenLoading isLoading={loading} message="Submitting your stress assessment..." />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perceived Stress Scale</h1>
          <p className="text-gray-600 mb-4">
            The questions in this scale ask you about your feelings and thoughts during the{" "}
            <strong>last month</strong>.
          </p>

          {isComplete && (
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg ${interpretation.bg} ${interpretation.color} font-medium`}
            >
              Current Score: {totalScore}/40 - {interpretation.level} Stress
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
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          variant="primary"
          className="px-8 py-3"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Assessment
        </Button>
      </div>
    </div>
    </>
  );
};
