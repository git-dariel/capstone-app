import React from "react";
import { Lightbulb, BookOpen, Users, Phone, Heart, Brain, TrendingUp } from "lucide-react";
import type { ProgressInsight } from "@/services/student-dashboard.service";

interface RecommendationsPanelProps {
  insights: ProgressInsight[];
  assessmentStats?: {
    anxiety: { count: number; averageScore: number | null };
    stress: { count: number; averageScore: number | null };
    depression: { count: number; averageScore: number | null };
    suicide: { count: number };
  };
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  insights,
  assessmentStats,
}) => {
  const getGeneralRecommendations = () => {
    const recommendations = [];

    // Based on assessment frequency
    const totalAssessments = assessmentStats
      ? assessmentStats.anxiety.count +
        assessmentStats.stress.count +
        assessmentStats.depression.count +
        assessmentStats.suicide.count
      : 0;

    if (totalAssessments === 0) {
      recommendations.push({
        icon: BookOpen,
        title: "Start Your Mental Health Journey",
        description:
          "Take your first assessment to establish a baseline for your mental health. This will help you track your progress over time.",
        priority: "high",
        category: "Getting Started",
      });
    } else if (totalAssessments < 3) {
      recommendations.push({
        icon: TrendingUp,
        title: "Build Assessment Habits",
        description:
          "Consider taking assessments regularly (weekly or bi-weekly) to better understand your mental health patterns and progress.",
        priority: "medium",
        category: "Consistency",
      });
    }

    // Based on severity levels
    const hasHighSeverity = insights.some(
      (insight) => insight.type === "warning" && insight.severity === "high"
    );

    if (hasHighSeverity) {
      recommendations.push({
        icon: Phone,
        title: "Seek Professional Support",
        description:
          "Your assessments indicate that professional support would be beneficial. Consider reaching out to your guidance counselor or mental health professional.",
        priority: "high",
        category: "Professional Support",
      });
    }

    // Based on improvement trends
    const hasImprovement = insights.some((insight) => insight.type === "improvement");
    if (hasImprovement) {
      recommendations.push({
        icon: Heart,
        title: "Maintain Positive Practices",
        description:
          "You're showing positive progress! Continue with your current strategies and consider adding new wellness activities to your routine.",
        priority: "low",
        category: "Wellness",
      });
    }

    // Based on decline trends
    const hasDecline = insights.some((insight) => insight.type === "decline");
    if (hasDecline) {
      recommendations.push({
        icon: Brain,
        title: "Stress Management Techniques",
        description:
          "Consider practicing mindfulness, deep breathing exercises, or other stress management techniques to help manage your mental health.",
        priority: "medium",
        category: "Self-Care",
      });
    }

    // Default recommendations if no specific insights
    if (recommendations.length === 0) {
      recommendations.push(
        {
          icon: BookOpen,
          title: "Explore Mental Health Resources",
          description:
            "Check out the resources section to learn more about mental health, coping strategies, and wellness practices.",
          priority: "low",
          category: "Education",
        },
        {
          icon: Users,
          title: "Connect with Support Network",
          description:
            "Build and maintain connections with friends, family, and support groups. Social support is crucial for mental health.",
          priority: "medium",
          category: "Social Support",
        }
      );
    }

    return recommendations;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-800";
      case "medium":
        return "text-yellow-800";
      case "low":
        return "text-blue-800";
      default:
        return "text-gray-800";
    }
  };

  const recommendations = getGeneralRecommendations();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No specific recommendations at this time.</p>
          <p className="text-sm text-gray-400 mt-1">
            Continue taking assessments to receive personalized insights.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => {
            const Icon = recommendation.icon;
            return (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getPriorityColor(
                  recommendation.priority
                )} hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getPriorityTextColor(
                      recommendation.priority
                    )}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`font-medium ${getPriorityTextColor(recommendation.priority)}`}
                      >
                        {recommendation.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                          recommendation.priority
                        )} ${getPriorityTextColor(recommendation.priority)} border`}
                      >
                        {recommendation.category}
                      </span>
                    </div>
                    <p className={`text-sm ${getPriorityTextColor(recommendation.priority)}`}>
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Resources */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Additional Resources</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            • Visit the <strong>Resources</strong> section for mental health guides and coping
            strategies
          </p>
          <p>
            • Use the <strong>Activities</strong> section for wellness exercises and mindfulness
            practices
          </p>
          <p>
            • Contact your <strong>Guidance Counselor</strong> for personalized support and
            counseling
          </p>
          <p>
            • Reach out to <strong>Emergency Services</strong> if you're in immediate crisis
          </p>
        </div>
      </div>
    </div>
  );
};
