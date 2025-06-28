import React, { useState } from "react";
import {
  AssessmentGrid,
  AnxietyQuestionnaire,
  DepressionQuestionnaire,
  StressQuestionnaire,
} from "@/components/molecules";

type AssessmentType = "anxiety" | "depression" | "stress" | null;

export const ResourcesContent: React.FC = () => {
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>(null);

  const handleSelectAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
  };

  const handleBackToGrid = () => {
    setCurrentAssessment(null);
  };

  const handleSubmitAssessment = (responses: Record<number, number>) => {
    // Calculate score and severity
    const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);

    let severity: string;
    let maxScore: number;

    if (currentAssessment === "anxiety") {
      maxScore = 21;
      if (totalScore <= 4) severity = "minimal";
      else if (totalScore <= 9) severity = "mild";
      else if (totalScore <= 14) severity = "moderate";
      else severity = "severe";
    } else if (currentAssessment === "depression") {
      maxScore = 27;
      if (totalScore <= 4) severity = "minimal";
      else if (totalScore <= 9) severity = "mild";
      else if (totalScore <= 14) severity = "moderate";
      else if (totalScore <= 19) severity = "moderately_severe";
      else severity = "severe";
    } else {
      // stress
      maxScore = 40;
      // For stress, we need to calculate with reverse scoring
      let calculatedScore = 0;
      const reverseScoreQuestions = [3, 4, 6, 7];
      Object.entries(responses).forEach(([questionIndex, value]) => {
        const index = parseInt(questionIndex);
        if (reverseScoreQuestions.includes(index)) {
          calculatedScore += 4 - value;
        } else {
          calculatedScore += value;
        }
      });

      if (calculatedScore <= 13) severity = "low";
      else if (calculatedScore <= 26) severity = "moderate";
      else severity = "high";
    }

    // Show success message
    alert(
      `Assessment completed!\nScore: ${totalScore}/${maxScore}\nSeverity Level: ${
        severity.charAt(0).toUpperCase() + severity.slice(1).replace("_", " ")
      }\n\nYour results have been recorded.`
    );

    // Go back to grid
    handleBackToGrid();
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {currentAssessment === null && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Mental Health Resources</h1>
              <p className="text-gray-600 mt-1">
                Take a confidential assessment to better understand your mental health. Choose an
                assessment below to get started.
              </p>
            </div>

            <AssessmentGrid onSelectAssessment={handleSelectAssessment} />

            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h2>
              <p className="text-blue-800 text-sm leading-relaxed">
                These assessments are screening tools and not diagnostic instruments. If you're
                experiencing significant distress or having thoughts of self-harm, please contact a
                mental health professional or call a crisis helpline immediately.
              </p>
            </div>
          </>
        )}

        {currentAssessment === "anxiety" && (
          <AnxietyQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}

        {currentAssessment === "depression" && (
          <DepressionQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}

        {currentAssessment === "stress" && (
          <StressQuestionnaire onBack={handleBackToGrid} onSubmit={handleSubmitAssessment} />
        )}
      </div>
    </main>
  );
};
