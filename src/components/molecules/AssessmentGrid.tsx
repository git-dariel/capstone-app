import React from "react";
import { Brain, Heart, Zap } from "lucide-react";
import { AssessmentCard } from "@/components/atoms";

interface AssessmentGridProps {
  onSelectAssessment: (type: "anxiety" | "depression" | "stress") => void;
}

export const AssessmentGrid: React.FC<AssessmentGridProps> = ({ onSelectAssessment }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AssessmentCard
        title="Anxiety Assessment"
        description="GAD-7 questionnaire to evaluate anxiety symptoms over the past 2 weeks. Takes about 2-3 minutes to complete."
        icon={<Brain className="w-6 h-6" />}
        color="anxiety"
        onClick={() => onSelectAssessment("anxiety")}
      />

      <AssessmentCard
        title="Depression Assessment"
        description="PHQ-9 questionnaire to screen for depression symptoms over the past 2 weeks. Takes about 2-3 minutes to complete."
        icon={<Heart className="w-6 h-6" />}
        color="depression"
        onClick={() => onSelectAssessment("depression")}
      />

      <AssessmentCard
        title="Stress Assessment"
        description="Perceived Stress Scale to measure stress levels over the past month. Takes about 3-4 minutes to complete."
        icon={<Zap className="w-6 h-6" />}
        color="stress"
        onClick={() => onSelectAssessment("stress")}
      />
    </div>
  );
};
