import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms";
import {
  Brain,
  Activity,
  Zap,
  Shield,
  CheckSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { StudentProgressInsight } from "@/services/guidance-dashboard.service";
import { GuidanceDashboardService } from "@/services";
import type { 
  AnxietyAssessment, 
  DepressionAssessment, 
  StressAssessment, 
  SuicideAssessment, 
  PersonalProblemsChecklist 
} from "@/services";

interface AssessmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProgressInsight | null;
}

interface AssessmentItem {
  id: string;
  type: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  date: string;
  score?: number;
  severity?: string;
  riskLevel?: string;
  detailedData?: AnxietyAssessment | DepressionAssessment | StressAssessment | SuicideAssessment | PersonalProblemsChecklist;
}

export const AssessmentHistoryModal: React.FC<AssessmentHistoryModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentItem[]>([]);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !student) {
      setAssessmentHistory([]);
      return;
    }

    // Build assessment history from student data
    const history: AssessmentItem[] = [];

    if (student.latestAssessments.anxiety) {
      history.push({
        id: `anxiety-${student.latestAssessments.anxiety.id || Date.now()}`,
        type: "anxiety",
        date: student.latestAssessments.anxiety.assessmentDate || student.lastAssessmentDate || "",
        score: student.latestAssessments.anxiety.totalScore,
        severity: student.latestAssessments.anxiety.severityLevel,
      });
    }

    if (student.latestAssessments.depression) {
      history.push({
        id: `depression-${student.latestAssessments.depression.id || Date.now()}`,
        type: "depression",
        date: student.latestAssessments.depression.assessmentDate || student.lastAssessmentDate || "",
        score: student.latestAssessments.depression.totalScore,
        severity: student.latestAssessments.depression.severityLevel,
      });
    }

    if (student.latestAssessments.stress) {
      history.push({
        id: `stress-${student.latestAssessments.stress.id || Date.now()}`,
        type: "stress",
        date: student.latestAssessments.stress.assessmentDate || student.lastAssessmentDate || "",
        score: student.latestAssessments.stress.totalScore,
        severity: student.latestAssessments.stress.severityLevel,
      });
    }

    if (student.latestAssessments.suicide) {
      history.push({
        id: `suicide-${student.latestAssessments.suicide.id || Date.now()}`,
        type: "suicide",
        date: student.latestAssessments.suicide.assessmentDate || student.lastAssessmentDate || "",
        riskLevel: student.latestAssessments.suicide.riskLevel,
      });
    }

    if (student.latestAssessments.checklist) {
      history.push({
        id: `checklist-${student.latestAssessments.checklist.id || Date.now()}`,
        type: "checklist",
        date: student.latestAssessments.checklist.date_completed || student.lastAssessmentDate || "",
        riskLevel: student.latestAssessments.checklist.riskLevel,
      });
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAssessmentHistory(history);
  }, [isOpen, student]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAssessmentIcon = (type: string) => {
    switch (type) {
      case "anxiety":
        return <Brain className="w-5 h-5" />;
      case "depression":
        return <Activity className="w-5 h-5" />;
      case "stress":
        return <Zap className="w-5 h-5" />;
      case "suicide":
        return <Shield className="w-5 h-5" />;
      case "checklist":
        return <CheckSquare className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getAssessmentColor = (type: string) => {
    switch (type) {
      case "anxiety":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "depression":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "stress":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "suicide":
        return "text-red-600 bg-red-50 border-red-200";
      case "checklist":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return "text-gray-700 bg-gray-100 border-gray-300";
    const lower = severity.toLowerCase();
    if (lower.includes("minimal") || lower.includes("low")) {
      return "text-green-700 bg-green-100 border-green-300";
    }
    if (lower.includes("mild")) {
      return "text-blue-700 bg-blue-100 border-blue-300";
    }
    if (lower.includes("moderate")) {
      return "text-yellow-700 bg-yellow-100 border-yellow-300";
    }
    if (lower.includes("moderately_severe") || lower.includes("moderately severe")) {
      return "text-orange-700 bg-orange-100 border-orange-300";
    }
    if (lower.includes("severe") || lower.includes("high")) {
      return "text-red-700 bg-red-100 border-red-300";
    }
    return "text-gray-700 bg-gray-100 border-gray-300";
  };

  const formatSeverityLabel = (severity: string) => {
    if (severity === "moderately_severe") return "Moderately Severe";
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const getAssessmentTitle = (type: string) => {
    switch (type) {
      case "anxiety":
        return "Anxiety Assessment";
      case "depression":
        return "Depression Assessment";
      case "stress":
        return "Stress Assessment";
      case "suicide":
        return "Suicide Risk Assessment";
      case "checklist":
        return "Personal Checklist";
      default:
        return "Assessment";
    }
  };

  const toggleAssessmentExpansion = async (id: string, assessmentId: string, type: string) => {
    if (expandedAssessment === id) {
      setExpandedAssessment(null);
      return;
    }

    setExpandedAssessment(id);
    
    // Fetch detailed data if not already loaded
    const assessment = assessmentHistory.find(a => a.id === id);
    if (assessment && !assessment.detailedData) {
      setLoadingDetails(id);
      try {
        // Use GuidanceDashboardService to fetch detailed assessment data
        const detailedData = await GuidanceDashboardService.getAssessmentDetails(
          assessmentId,
          type as "anxiety" | "depression" | "stress" | "suicide" | "checklist"
        );

        // Update the assessment history with detailed data
        if (detailedData) {
          setAssessmentHistory(prev =>
            prev.map(a => a.id === id ? { ...a, detailedData } : a)
          );
        }
      } catch (error) {
        console.error("Error fetching assessment details:", error);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  // Helper function to format enum values to readable text
  const formatEnumValue = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Render Anxiety Assessment Details
  const renderAnxietyDetails = (data: AnxietyAssessment) => {
    if (!data) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Assessment details are not available.</p>
        </div>
      );
    }

    const questions = [
      { key: 'feeling_nervous_anxious_edge', label: 'Feeling nervous, anxious, or on edge' },
      { key: 'not_able_stop_control_worrying', label: 'Not being able to stop or control worrying' },
      { key: 'worrying_too_much_different_things', label: 'Worrying too much about different things' },
      { key: 'trouble_relaxing', label: 'Trouble relaxing' },
      { key: 'restless_hard_sit_still', label: 'Being so restless that it is hard to sit still' },
      { key: 'easily_annoyed_irritable', label: 'Becoming easily annoyed or irritable' },
      { key: 'feeling_afraid_awful_happen', label: 'Feeling afraid, as if something awful might happen' },
    ];

    const responseLabels = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

    // Map enum values to scores
    const getScoreFromEnum = (value: string): number => {
      const enumMap: Record<string, number> = {
        'not_at_all': 0,
        'several_days': 1,
        'more_than_half_days': 2,
        'nearly_every_day': 3,
      };
      return enumMap[value] || 0;
    };

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Question Responses</h4>
        <div className="grid grid-cols-1 gap-3">
          {questions.map((q, index) => {
            const enumValue = (data as any)[q.key] || 'not_at_all';
            const score = getScoreFromEnum(enumValue);
            return (
              <div key={q.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      <span className="text-sm text-gray-900">{q.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      score === 3 ? 'bg-red-100 text-red-700' :
                      score === 2 ? 'bg-orange-100 text-orange-700' :
                      score === 1 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {responseLabels[score]}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">Score: {score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Depression Assessment Details
  const renderDepressionDetails = (data: DepressionAssessment) => {
    if (!data) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Assessment details are not available.</p>
        </div>
      );
    }

    const questions = [
      { key: 'little_interest_pleasure_doing_things', label: 'Little interest or pleasure in doing things' },
      { key: 'feeling_down_depressed_hopeless', label: 'Feeling down, depressed, or hopeless' },
      { key: 'trouble_falling_staying_asleep_too_much', label: 'Trouble falling or staying asleep, or sleeping too much' },
      { key: 'feeling_tired_having_little_energy', label: 'Feeling tired or having little energy' },
      { key: 'poor_appetite_overeating', label: 'Poor appetite or overeating' },
      { key: 'feeling_bad_about_yourself_failure', label: 'Feeling bad about yourself or that you are a failure' },
      { key: 'trouble_concentrating_things', label: 'Trouble concentrating on things' },
      { key: 'moving_speaking_slowly_fidgety_restless', label: 'Moving or speaking slowly, or being fidgety or restless' },
      { key: 'thoughts_better_off_dead_hurting_yourself', label: 'Thoughts that you would be better off dead or hurting yourself' },
    ];

    const responseLabels = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

    // Map enum values to scores
    const getScoreFromEnum = (value: string): number => {
      const enumMap: Record<string, number> = {
        'not_at_all': 0,
        'several_days': 1,
        'more_than_half_days': 2,
        'nearly_every_day': 3,
      };
      return enumMap[value] || 0;
    };

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Question Responses</h4>
        <div className="grid grid-cols-1 gap-3">
          {questions.map((q, index) => {
            const enumValue = (data as any)[q.key] || 'not_at_all';
            const score = getScoreFromEnum(enumValue);
            return (
              <div key={q.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      <span className="text-sm text-gray-900">{q.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      score === 3 ? 'bg-red-100 text-red-700' :
                      score === 2 ? 'bg-orange-100 text-orange-700' :
                      score === 1 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {responseLabels[score]}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">Score: {score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Stress Assessment Details
  const renderStressDetails = (data: StressAssessment) => {
    if (!data) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Assessment details are not available.</p>
        </div>
      );
    }

    const questions = [
      { key: 'upset_because_something_unexpected', label: 'Been upset because of something that happened unexpectedly' },
      { key: 'unable_control_important_things', label: 'Felt unable to control important things in your life' },
      { key: 'feeling_nervous_and_stressed', label: 'Felt nervous and stressed' },
      { key: 'confident_handle_personal_problems', label: 'Felt confident about your ability to handle personal problems', positive: true },
      { key: 'feeling_things_going_your_way', label: 'Felt that things were going your way', positive: true },
      { key: 'unable_cope_with_all_things', label: 'Found that you could not cope with all the things you had to do' },
      { key: 'able_control_irritations', label: 'Been able to control irritations in your life', positive: true },
      { key: 'feeling_on_top_of_things', label: 'Felt that you were on top of things', positive: true },
      { key: 'angered_things_outside_control', label: 'Been angered because of things outside of your control' },
      { key: 'difficulties_piling_up_cant_overcome', label: 'Felt difficulties were piling up so high you could not overcome them' },
    ];

    // Map enum values to scores
    const getScoreFromEnum = (value: string, isPositive: boolean = false): number => {
      const enumMap: Record<string, number> = {
        'never': 0,
        'almost_never': 1,
        'sometimes': 2,
        'fairly_often': 3,
        'very_often': 4,
      };
      const rawScore = enumMap[value] || 0;
      // For positive items, reverse the scoring (4-score)
      return isPositive ? 4 - rawScore : rawScore;
    };

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Question Responses</h4>
        <div className="grid grid-cols-1 gap-3">
          {questions.map((q, index) => {
            const enumValue = (data as any)[q.key] || 'never';
            const score = getScoreFromEnum(enumValue, q.positive);
            return (
              <div key={q.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      <span className="text-sm text-gray-900">{q.label}</span>
                      {q.positive && (
                        <span className="text-xs text-blue-600">(Positive Item)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      score === 4 ? 'bg-red-100 text-red-700' :
                      score === 3 ? 'bg-orange-100 text-orange-700' :
                      score === 2 ? 'bg-yellow-100 text-yellow-700' :
                      score === 1 ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {formatEnumValue(enumValue)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">Score: {score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Suicide Assessment Details
  const renderSuicideDetails = (data: SuicideAssessment) => {
    const questions = [
      { key: 'wished_dead_or_sleep_not_wake_up', label: 'Wish you were dead or wish you could go to sleep and not wake up' },
      { key: 'actually_had_thoughts_killing_self', label: 'Actually had any thoughts of killing yourself' },
      { key: 'thinking_about_how_might_do_this', label: 'Been thinking about how you might do this' },
      { key: 'had_thoughts_and_some_intention', label: 'Had these thoughts and had some intention of acting on them' },
      { key: 'started_worked_out_details_how_kill', label: 'Started to work out or worked out the details of how to kill yourself' },
      { key: 'done_anything_started_prepared_end_life', label: 'Done anything, started to do anything, or prepared to do anything to end your life' },
    ];

    const timeframeLabels: { [key: string]: string } = {
      'past_three_months': 'Past 3 months',
      'lifetime_but_not_recent': 'Lifetime but not recent',
      'never': 'Never'
    };

    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-semibold text-red-900">Critical Assessment - Requires Professional Attention</span>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 mb-3">Question Responses</h4>
        <div className="grid grid-cols-1 gap-3">
          {questions.map((q, index) => {
            const value = (data as any)[q.key];
            if (value === undefined || value === null) return null;
            
            const isYes = value === 'yes';
            
            return (
              <div key={q.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      <span className="text-sm text-gray-900">{q.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isYes ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isYes ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isYes ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {data.behavior_timeframe && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-orange-900">Behavior Timeframe:</span>
              <span className="text-orange-700">
                {timeframeLabels[data.behavior_timeframe] || formatEnumValue(data.behavior_timeframe)}
              </span>
            </div>
          </div>
        )}
        {data.requires_immediate_intervention && (
          <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-700" />
              <span className="font-bold text-red-900">⚠️ REQUIRES IMMEDIATE INTERVENTION</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Checklist Assessment Details (simplified - can be expanded)
  const renderChecklistDetails = (data: PersonalProblemsChecklist) => {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Personal Problems Checklist</h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            This assessment contains detailed information about various personal problems across multiple categories
            including social/friends, appearance, attitude/opinion, parents, family/home, school, money, religion,
            emotional, and dating/sex concerns.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500">Risk Level</div>
              <div className="text-sm font-medium text-gray-900">
                {data.checklist_analysis?.riskLevel ? formatEnumValue(data.checklist_analysis.riskLevel) : 'N/A'}
              </div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500">Total Problems</div>
              <div className="text-sm font-medium text-gray-900">
                {data.checklist_analysis?.totalProblemsChecked || 0}
              </div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500">Most Important</div>
              <div className="text-sm font-medium text-gray-900">
                {data.checklist_analysis?.totalProblemsChecked || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 h-full overflow-y-auto px-6 py-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.studentName}</h2>
              <p className="text-gray-600 mt-1">
                {student.program} • Year {student.year} • {student.studentNumber}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Overall Risk Level</div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
                  student.riskLevel === "high"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : student.riskLevel === "medium"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-green-100 text-green-800 border-green-200"
                }`}
              >
                {student.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="text-xs text-gray-500 mb-1">Anxiety</div>
                <div className="text-lg font-semibold text-purple-600">
                  {student.totalAssessments.anxiety}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="text-xs text-gray-500 mb-1">Depression</div>
                <div className="text-lg font-semibold text-blue-600">
                  {student.totalAssessments.depression}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="text-xs text-gray-500 mb-1">Stress</div>
                <div className="text-lg font-semibold text-orange-600">
                  {student.totalAssessments.stress}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="text-xs text-gray-500 mb-1">Suicide Risk</div>
                <div className="text-lg font-semibold text-red-600">
                  {student.totalAssessments.suicide}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="text-xs text-gray-500 mb-1">Checklist</div>
                <div className="text-lg font-semibold text-green-600">
                  {student.totalAssessments.checklist}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Latest Assessment Results ({assessmentHistory.length})
          </h3>

          {assessmentHistory.length > 0 ? (
            <div className="space-y-3">
              {assessmentHistory.map((assessment) => (
                <div
                  key={assessment.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => {
                      const actualId = assessment.id.split('-')[1]; // Extract actual ID from compound ID like "anxiety-123"
                      toggleAssessmentExpansion(assessment.id, actualId, assessment.type);
                    }}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg border ${getAssessmentColor(assessment.type)}`}>
                        {getAssessmentIcon(assessment.type)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-semibold text-gray-900">
                          {getAssessmentTitle(assessment.type)}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(assessment.date)} at {formatTime(assessment.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {assessment.severity && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            assessment.severity
                          )}`}
                        >
                          {formatSeverityLabel(assessment.severity)}
                        </span>
                      )}
                      {assessment.riskLevel && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            assessment.riskLevel
                          )}`}
                        >
                          {formatSeverityLabel(assessment.riskLevel)} Risk
                        </span>
                      )}
                      <div className="text-gray-400">
                        {expandedAssessment === assessment.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {expandedAssessment === assessment.id && (
                    <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                      {/* Loading State */}
                      {loadingDetails === assessment.id && (
                        <div className="flex items-center justify-center py-8">
                          <Loader className="w-8 h-8 text-indigo-600 animate-spin mr-2" />
                          <span className="text-gray-600">Loading assessment details...</span>
                        </div>
                      )}

                      {/* Summary Cards */}
                      {!loadingDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assessment Type
                            </label>
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded ${getAssessmentColor(assessment.type)}`}>
                                {getAssessmentIcon(assessment.type)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {getAssessmentTitle(assessment.type)}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assessment Date
                            </label>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {formatDate(assessment.date)}
                              </span>
                            </div>
                          </div>

                          {assessment.score !== undefined && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Score
                              </label>
                              <div className="text-2xl font-bold text-indigo-600">
                                {assessment.score}
                              </div>
                            </div>
                          )}

                          {assessment.severity && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Severity Level
                              </label>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(
                                  assessment.severity
                                )}`}
                              >
                                {formatSeverityLabel(assessment.severity)}
                              </span>
                            </div>
                          )}

                          {assessment.riskLevel && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Risk Level
                              </label>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(
                                  assessment.riskLevel
                                )}`}
                              >
                                {formatSeverityLabel(assessment.riskLevel)} Risk
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Detailed Question Breakdown */}
                      {!loadingDetails && assessment.detailedData && (
                        <div className="mt-4">
                          {assessment.type === 'anxiety' && renderAnxietyDetails(assessment.detailedData as AnxietyAssessment)}
                          {assessment.type === 'depression' && renderDepressionDetails(assessment.detailedData as DepressionAssessment)}
                          {assessment.type === 'stress' && renderStressDetails(assessment.detailedData as StressAssessment)}
                          {assessment.type === 'suicide' && renderSuicideDetails(assessment.detailedData as SuicideAssessment)}
                          {assessment.type === 'checklist' && renderChecklistDetails(assessment.detailedData as PersonalProblemsChecklist)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No assessment history available for this student</p>
            </div>
          )}
        </div>

        {/* Progress Insights Section */}
        {student.progressInsights.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Insights</h3>
            <div className="space-y-3">
              {student.progressInsights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {insight.type === "improvement" && (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      )}
                      {insight.type === "decline" && (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      {insight.type === "stable" && <Minus className="w-5 h-5 text-blue-600" />}
                      {insight.type === "warning" && (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {insight.assessmentType.charAt(0).toUpperCase() +
                            insight.assessmentType.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            insight.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : insight.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {insight.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{insight.message}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
