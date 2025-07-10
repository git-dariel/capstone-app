import React, { useState } from "react";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import { QuestionCard } from "@/components/atoms";
import { Button } from "@/components/ui";

interface SuicideQuestionnaireProps {
  onBack: () => void;
  onSubmit: (responses: Record<number, number>) => void;
}

export const SuicideQuestionnaire: React.FC<SuicideQuestionnaireProps> = ({ onBack, onSubmit }) => {
  const [responses, setResponses] = useState<Record<number, number>>({});

  const baseQuestions = [
    "Have you wished you were dead or wished you could go to sleep and not wake up?",
    "Have you actually had any thoughts of killing yourself?",
  ];

  const followUpQuestions = [
    "Have you been thinking about how you might do this?",
    "Have you had these thoughts and had some intention of acting on them?",
    "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
    "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
  ];

  const timeframeQuestion = "When did this behavior occur?";

  const yesNoChoices = [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ];

  const timeframeChoices = [
    { value: 0, label: "Never" },
    { value: 1, label: "In lifetime, but not recent" },
    { value: 2, label: "Past three months" },
  ];

  const handleAnswerSelect = (questionIndex: number, value: number) => {
    setResponses((prev) => {
      const newResponses = { ...prev, [questionIndex]: value };

      // If question 1 (actually_had_thoughts_killing_self) is answered "No",
      // clear all subsequent responses
      if (questionIndex === 1 && value === 0) {
        const clearedResponses = { ...newResponses };
        [2, 3, 4, 5, 6].forEach((i) => delete clearedResponses[i]);
        return clearedResponses;
      }

      return newResponses;
    });
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  // Check if user answered "yes" to question 1 (actual suicidal thoughts)
  const hasActiveSuicidalThoughts = responses[1] === 1;

  // Determine which questions should be shown
  const shouldShowFollowUpQuestions = hasActiveSuicidalThoughts;

  // Calculate total required questions
  let totalQuestionsNeeded = 2; // Always need first 2 questions
  if (shouldShowFollowUpQuestions) {
    totalQuestionsNeeded += 4; // Questions 2-5 (follow-ups)

    // If user answered "yes" to question 5 (preparatory behavior), show timeframe
    if (responses[5] === 1) {
      totalQuestionsNeeded += 1; // Question 6 (timeframe)
    }
  }

  // Check if assessment is complete
  const isComplete = (() => {
    if (!shouldShowFollowUpQuestions) {
      return Object.keys(responses).length >= 2; // Just need first 2 questions
    }

    // If follow-up questions should be shown
    const hasRequiredFollowUps = [2, 3, 4, 5].every((i) => responses[i] !== undefined);

    if (responses[5] === 1) {
      // If preparatory behavior is "yes", need timeframe too
      return hasRequiredFollowUps && responses[6] !== undefined;
    }

    return hasRequiredFollowUps;
  })();

  // Calculate risk score (simplified for display)
  const calculateRiskScore = () => {
    let score = 0;
    score += responses[0] || 0; // Question 0
    score += responses[1] || 0; // Question 1

    if (hasActiveSuicidalThoughts) {
      score += responses[2] || 0; // Question 2
      score += responses[3] || 0; // Question 3
      score += responses[4] || 0; // Question 4
      score += responses[5] || 0; // Question 5
    }

    return score;
  };

  const riskScore = calculateRiskScore();

  const getRiskInterpretation = (score: number) => {
    if (score <= 1) return { level: "Low Risk", color: "text-green-600", bg: "bg-green-50" };
    if (score <= 3) return { level: "Moderate Risk", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "High Risk", color: "text-red-600", bg: "bg-red-50" };
  };

  const interpretation = getRiskInterpretation(riskScore);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CSSRS Suicide Assessment</h1>
          <p className="text-gray-600 mb-4">
            Columbia Suicide Severity Rating Scale - Please answer honestly about your recent
            thoughts and feelings.
          </p>

          {/* Warning Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Important Notice</h3>
                <p className="text-sm text-red-700">
                  If you are having thoughts of suicide or self-harm, please reach out for help
                  immediately. Contact emergency services (911) or a crisis hotline.
                </p>
              </div>
            </div>
          </div>

          {isComplete && (
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg ${interpretation.bg} ${interpretation.color} font-medium`}
            >
              Current Assessment: {interpretation.level}
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-6">
        {/* Base Questions (always shown) */}
        {baseQuestions.map((question, index) => (
          <QuestionCard
            key={index}
            questionNumber={index + 1}
            question={question}
            choices={yesNoChoices}
            selectedValue={responses[index]}
            onSelect={(value) => handleAnswerSelect(index, value)}
          />
        ))}

        {/* Follow-up Questions (only if user has suicidal thoughts) */}
        {shouldShowFollowUpQuestions &&
          followUpQuestions.map((question, index) => {
            const questionIndex = index + 2; // Start from index 2
            return (
              <QuestionCard
                key={questionIndex}
                questionNumber={questionIndex + 1}
                question={question}
                choices={yesNoChoices}
                selectedValue={responses[questionIndex]}
                onSelect={(value) => handleAnswerSelect(questionIndex, value)}
              />
            );
          })}

        {/* Timeframe Question (only if user answered yes to preparatory behavior) */}
        {responses[5] === 1 && (
          <QuestionCard
            key={6}
            questionNumber={7}
            question={timeframeQuestion}
            choices={timeframeChoices}
            selectedValue={responses[6]}
            onSelect={(value) => handleAnswerSelect(6, value)}
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

      {/* Additional Safety Resources */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Crisis Resources</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>National Suicide Prevention Lifeline:</strong> 988
          </p>
          <p>
            <strong>Crisis Text Line:</strong> Text HOME to 741741
          </p>
          <p>
            <strong>Emergency Services:</strong> 911
          </p>
        </div>
      </div>
    </div>
  );
};
