import React, { useEffect, useState } from "react";
import { Brain, Heart, Zap, Shield, CheckSquare } from "lucide-react";
import { AssessmentCard } from "@/components/atoms";
import { useAuth, useAnxiety, useDepression, useStress } from "@/hooks";
import type { CooldownInfo } from "@/services/stress.service";

type AssessmentType = "anxiety" | "depression" | "stress" | "suicide" | "checklist" | null;

interface AssessmentGridProps {
  onSelectAssessment: (type: AssessmentType) => void;
  isGuidanceUser?: boolean;
}

interface CooldownState {
  anxiety: CooldownInfo | null;
  depression: CooldownInfo | null;
  stress: CooldownInfo | null;
  loading: boolean;
}

export const AssessmentGrid: React.FC<AssessmentGridProps> = ({ onSelectAssessment, isGuidanceUser = false }) => {
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

  // Descriptions for different user types
  const descriptions = {
    anxiety: {
      student:
        "GAD-7 questionnaire to evaluate anxiety symptoms over the past 2 weeks. Takes about 2-3 minutes to complete.",
      guidance:
        "GAD-7 Anxiety Primary Care Evaluation of Mental Disorders Patient Health Questionnaire (PRIME-MD-PHQ). The PHQ was developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke, and colleagues. For research information, contact Dr. Spitzer at ris8@columbia.edu. PRIME-MD® is a trademark of Pfizer Inc. Copyright© 1999 Pfizer Inc. All rights reserved. Reproduced with permission.",
    },
    depression: {
      student:
        "PHQ-9 questionnaire to screen for depression symptoms over the past 2 weeks. Takes about 2-3 minutes to complete.",
      guidance:
        "PHQ-9 Quick Depression Assessment. Since the questionnaire relies on patient self-report, all responses should be verified by the clinician, and a definitive diagnosis is made on clinical grounds taking into account how well the patient understood the questionnaire, as well as other relevant information from the patient. Diagnoses of Major Depressive Disorder or Other Depressive Disorder also require impairment of social, occupational, or other important areas of functioning (Question #10) and ruling out normal bereavement, a history of a Manic Episode (Bipolar Disorder), and a physical disorder, medication, or other drug as the biological cause of the depressive symptoms.",
    },
    stress: {
      student:
        "Perceived Stress Scale to measure stress levels over the past month. Takes about 3-4 minutes to complete.",
      guidance:
        "Perceived Stress Scale. A more precise measure of personal stress can be determined by using a variety of instruments that have been designed to help measure individual stress levels. The first of these is called the Perceived Stress Scale. The Perceived Stress Scale (PSS) is a classic stress assessment instrument. The tool, while originally developed in 1983, remains a popular choice for helping us understand how different situations affect our feelings and our perceived stress. The questions in this scale ask about your feelings and thoughts during the last month. In each case, you will be asked to indicate how often you felt or thought a certain way. Although some of the questions are similar, there are differences between them and you should treat each one as a separate question. The best approach is to answer fairly quickly. That is, don't try to count up the number of times you felt a particular way; rather indicate the alternative that seems like a reasonable estimate.",
    },
    suicide: {
      student:
        "CSSRS questionnaire to assess suicide risk and safety. Takes about 2-3 minutes to complete. Confidential and secure.",
      guidance:
        "Columbia-Suicide Severity Rating Scale (C-SSRS). The Columbia Lighthouse Project is dedicated to suicide prevention by supporting the use of the Columbia Protocol (C-SSRS) and other evidence-based tools. The C-SSRS is a suicide assessment tool that asks questions about thoughts and behaviors related to suicide. The scale is evidence-supported and is used in various settings including emergency departments, inpatient units, outpatient clinics, and research studies. It was developed by researchers at Columbia University, the University of Pennsylvania, and the University of Pittsburgh with support from the National Institute of Mental Health (NIMH). The C-SSRS is available free of charge and can be used by clinicians, researchers, and others. For more information, visit cssrs.columbia.edu.",
    },
    checklist: {
      student:
        "Comprehensive assessment to identify personal problems across 10 areas. Takes about 10-15 minutes to complete.",
      guidance:
        "Personal Problems Checklist for Adolescents (PPCA). This comprehensive screening instrument assesses problems across multiple domains including social relationships, academic performance, family dynamics, emotional well-being, behavioral concerns, substance use, health issues, developmental challenges, personal identity, and future planning. The checklist uses a structured format to identify areas of concern that may require further assessment or intervention. Developed as a broad screening tool, it helps counselors and mental health professionals quickly identify which life areas are causing the most difficulty for the student, allowing for targeted support and intervention strategies. The multidimensional approach ensures comprehensive coverage of common adolescent concerns while respecting the complexity of youth development.",
    },
  };

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
          description={isGuidanceUser ? descriptions.anxiety.guidance : descriptions.anxiety.student}
          icon={<Brain className="w-6 h-6" />}
          color="anxiety"
          onClick={() => handleAssessmentSelect("anxiety")}
          disabled={cooldownState.anxiety?.isActive}
          cooldownMessage={cooldownState.anxiety ? formatCooldownMessage(cooldownState.anxiety) : undefined}
        />

        <AssessmentCard
          title="Depression Assessment"
          description={isGuidanceUser ? descriptions.depression.guidance : descriptions.depression.student}
          icon={<Heart className="w-6 h-6" />}
          color="depression"
          onClick={() => handleAssessmentSelect("depression")}
          disabled={cooldownState.depression?.isActive}
          cooldownMessage={cooldownState.depression ? formatCooldownMessage(cooldownState.depression) : undefined}
        />

        <AssessmentCard
          title="Stress Assessment"
          description={isGuidanceUser ? descriptions.stress.guidance : descriptions.stress.student}
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
          description={isGuidanceUser ? descriptions.suicide.guidance : descriptions.suicide.student}
          icon={<Shield className="w-6 h-6" />}
          color="suicide"
          onClick={() => handleAssessmentSelect("suicide")}
          disabled={false} // Suicide assessment does not have a cooldown
          cooldownMessage={undefined}
        />

        <AssessmentCard
          title="Personal Problems Checklist"
          description={isGuidanceUser ? descriptions.checklist.guidance : descriptions.checklist.student}
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
