import React, { useEffect, useState } from "react";
import { Brain, Heart, Zap, Shield, CheckSquare } from "lucide-react";
import { AssessmentCard } from "@/components/atoms";
import { useAuth, useAnxiety, useDepression, useStress } from "@/hooks";
import type { CooldownInfo } from "@/services/stress.service";

type AssessmentType = "anxiety" | "depression" | "stress" | "suicide" | "checklist" | null;

interface AssessmentGridProps {
  onSelectAssessment: (type: AssessmentType) => void;
}

interface CooldownState {
  anxiety: CooldownInfo | null;
  depression: CooldownInfo | null;
  stress: CooldownInfo | null;
  loading: boolean;
}

export const AssessmentGrid: React.FC<AssessmentGridProps> = ({ onSelectAssessment }) => {
  const { user } = useAuth();
  const anxietyHook = useAnxiety();
  const depressionHook = useDepression();
  const stressHook = useStress();

  const [cooldownState, setCooldownState] = useState<CooldownState>({
    anxiety: null,
    depression: null,
    stress: null,
    loading: false,
  });

  // Check cooldown status for all assessment types
  useEffect(() => {
    const checkAllCooldowns = async () => {
      if (!user?.id) return;

      setCooldownState((prev) => ({ ...prev, loading: true }));

      try {
        const [anxietyCooldown, depressionCooldown, stressCooldown] = await Promise.all([
          anxietyHook.checkCooldownStatus(user.id),
          depressionHook.checkCooldownStatus(user.id),
          stressHook.checkCooldownStatus(user.id),
        ]);

        setCooldownState({
          anxiety: anxietyCooldown,
          depression: depressionCooldown,
          stress: stressCooldown,
          loading: false,
        });
      } catch (error) {
        console.error("Error checking cooldown status:", error);
        setCooldownState((prev) => ({ ...prev, loading: false }));
      }
    };

    checkAllCooldowns();
  }, [user?.id]);

  const formatCooldownMessage = (cooldownInfo: CooldownInfo) => {
    const { daysRemaining, nextAvailableDate } = cooldownInfo;
    const nextDate = new Date(nextAvailableDate).toLocaleDateString();

    if (daysRemaining === 1) {
      return `Assessment available tomorrow (${nextDate})`;
    } else if (daysRemaining <= 7) {
      return `Assessment available in ${daysRemaining} days (${nextDate})`;
    } else {
      return `Assessment available on ${nextDate}`;
    }
  };

  const handleAssessmentSelect = (type: AssessmentType) => {
    if (type === "suicide" || type === "checklist") {
      // Suicide assessment and checklist don't have cooldown
      onSelectAssessment(type);
      return;
    }

    const cooldownInfo = cooldownState[type as keyof Omit<CooldownState, "loading">];
    if (cooldownInfo?.isActive) {
      // Don't allow selection if cooldown is active
      return;
    }

    onSelectAssessment(type);
  };

  return (
    <div className="space-y-6">
      {/* Main assessments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssessmentCard
          title="Anxiety Assessment"
          description="GAD-7 questionnaire to evaluate anxiety symptoms over the past 2 weeks. Takes about 2-3 minutes to complete."
          icon={<Brain className="w-6 h-6" />}
          color="anxiety"
          onClick={() => handleAssessmentSelect("anxiety")}
          disabled={cooldownState.anxiety?.isActive}
          cooldownMessage={cooldownState.anxiety ? formatCooldownMessage(cooldownState.anxiety) : undefined}
        />

        <AssessmentCard
          title="Depression Assessment"
          description="PHQ-9 questionnaire to screen for depression symptoms over the past 2 weeks. Takes about 2-3 minutes to complete."
          icon={<Heart className="w-6 h-6" />}
          color="depression"
          onClick={() => handleAssessmentSelect("depression")}
          disabled={cooldownState.depression?.isActive}
          cooldownMessage={cooldownState.depression ? formatCooldownMessage(cooldownState.depression) : undefined}
        />

        <AssessmentCard
          title="Stress Assessment"
          description="Perceived Stress Scale to measure stress levels over the past month. Takes about 3-4 minutes to complete."
          icon={<Zap className="w-6 h-6" />}
          color="stress"
          onClick={() => handleAssessmentSelect("stress")}
          disabled={cooldownState.stress?.isActive}
          cooldownMessage={cooldownState.stress ? formatCooldownMessage(cooldownState.stress) : undefined}
        />
      </div>

      {/* Suicide assessment and Personal Problems Checklist - separate row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssessmentCard
          title="Suicide Assessment"
          description="CSSRS questionnaire to assess suicide risk and safety. Takes about 2-3 minutes to complete. Confidential and secure."
          icon={<Shield className="w-6 h-6" />}
          color="suicide"
          onClick={() => handleAssessmentSelect("suicide")}
          disabled={false} // Suicide assessment does not have a cooldown
          cooldownMessage={undefined}
        />

        <AssessmentCard
          title="Personal Problems Checklist"
          description="Comprehensive assessment to identify personal problems across 10 areas. Takes about 10-15 minutes to complete."
          icon={<CheckSquare className="w-6 h-6" />}
          color="checklist"
          onClick={() => handleAssessmentSelect("checklist")}
          disabled={false} // Checklist does not have a cooldown
          cooldownMessage={undefined}
        />
      </div>
    </div>
  );
};
