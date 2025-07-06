import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { QuestionCard } from "@/components/atoms";
import { Button } from "@/components/ui";

interface DepressionQuestionnaireProps {
  onBack: () => void;
  onSubmit: (responses: Record<number, number>) => void;
}

export const DepressionQuestionnaire: React.FC<DepressionQuestionnaireProps> = ({
  onBack,
  onSubmit,
}) => {
  const [responses, setResponses] = useState<Record<number, number>>({});

  const questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
  ];

  const difficultyQuestion =
    "If you checked any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?";

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

  // Check if user has any symptoms (any question > 0)
  const hasSymptoms = Object.keys(responses).some((key) => {
    const index = parseInt(key);
    return index < questions.length && responses[index] > 0;
  });

  // Check if all required questions are answered
  const mainQuestionsComplete = Object.keys(responses).length >= questions.length;
  const difficultyAnswered = hasSymptoms ? responses[questions.length] !== undefined : true;
  const isComplete = mainQuestionsComplete && difficultyAnswered;

  // Calculate score (only main questions, not difficulty)
  const totalScore = Object.keys(responses)
    .filter((key) => parseInt(key) < questions.length)
    .reduce((sum, key) => sum + responses[parseInt(key)], 0);

  const getScoreInterpretation = (score: number) => {
    if (score <= 4) return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" };
    if (score <= 9) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (score <= 14) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" };
    if (score <= 19) return { level: "Moderately Severe", color: "text-red-600", bg: "bg-red-50" };
    return { level: "Severe", color: "text-red-700", bg: "bg-red-100" };
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PHQ-9 Depression Assessment</h1>
          <p className="text-gray-600 mb-4">
            Over the last <strong>2 weeks</strong>, how often have you been bothered by any of the
            following problems?
          </p>

          {isComplete && (
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg ${interpretation.bg} ${interpretation.color} font-medium`}
            >
              Current Score: {totalScore}/27 - {interpretation.level} Depression
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

        {/* Difficulty Question - Only show if user has symptoms */}
        {hasSymptoms && (
          <QuestionCard
            key={questions.length}
            questionNumber={questions.length + 1}
            question={difficultyQuestion}
            choices={difficultyChoices}
            selectedValue={responses[questions.length]}
            onSelect={(value) => handleAnswerSelect(questions.length, value)}
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
