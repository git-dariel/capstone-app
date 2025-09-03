import React, { useState } from "react";
import { Modal } from "@/components/atoms";
import {
  Heart,
  Brain,
  Wind,
  PlayCircle,
  Headphones,
  Book,
  Activity,
  Smile,
  Clock,
  Star,
  ExternalLink,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";

interface ActivityCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "breathing" | "video" | "audio" | "exercise" | "reading" | "interactive";
  url?: string;
  benefits: string[];
  instructions?: string[];
  isRecommended?: boolean;
}

const activityCategories: ActivityCategory[] = [
  {
    id: "breathing",
    title: "Breathing Exercises",
    description: "Simple breathing techniques to reduce stress and anxiety",
    icon: <Wind className="w-6 h-6" />,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    activities: [
      {
        id: "box-breathing",
        title: "Box Breathing (4-4-4-4)",
        description: "A powerful technique used by Navy SEALs to stay calm under pressure",
        duration: "5-10 minutes",
        difficulty: "beginner",
        type: "breathing",
        benefits: ["Reduces anxiety", "Improves focus", "Calms nervous system"],
        instructions: [
          "Sit comfortably with your back straight",
          "Exhale completely through your mouth",
          "Inhale through nose for 4 counts",
          "Hold breath for 4 counts",
          "Exhale through mouth for 4 counts",
          "Hold empty lungs for 4 counts",
          "Repeat 4-8 cycles",
        ],
        isRecommended: true,
      },
      {
        id: "478-breathing",
        title: "4-7-8 Breathing Technique",
        description: "Dr. Andrew Weil's relaxation technique for better sleep and anxiety relief",
        duration: "3-5 minutes",
        difficulty: "beginner",
        type: "breathing",
        benefits: ["Promotes sleep", "Reduces anxiety", "Lowers stress"],
        instructions: [
          "Sit with your back straight",
          "Exhale completely through your mouth",
          "Inhale through nose for 4 counts",
          "Hold breath for 7 counts",
          "Exhale through mouth for 8 counts",
          "Repeat 3-4 cycles initially",
        ],
      },
      {
        id: "alternate-nostril",
        title: "Alternate Nostril Breathing",
        description: "Ancient yogic breathing technique to balance the mind",
        duration: "5-10 minutes",
        difficulty: "intermediate",
        type: "breathing",
        benefits: ["Balances nervous system", "Improves concentration", "Reduces stress"],
        instructions: [
          "Sit comfortably with spine erect",
          "Use right thumb to close right nostril",
          "Inhale through left nostril",
          "Close left nostril with ring finger",
          "Release thumb, exhale through right nostril",
          "Inhale through right nostril",
          "Close right nostril, exhale through left",
          "Continue for 5-10 rounds",
        ],
      },
    ],
  },
  {
    id: "mindfulness",
    title: "Mindfulness & Meditation",
    description: "Guided practices to improve mental well-being and emotional regulation",
    icon: <Brain className="w-6 h-6" />,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    activities: [
      {
        id: "body-scan",
        title: "Progressive Body Scan",
        description: "Systematic relaxation technique to release physical and mental tension",
        duration: "10-20 minutes",
        difficulty: "beginner",
        type: "audio",
        url: "https://www.youtube.com/watch?v=15q-N-_kkrU",
        benefits: ["Reduces muscle tension", "Improves sleep", "Increases body awareness"],
        isRecommended: true,
      },
      {
        id: "loving-kindness",
        title: "Loving-Kindness Meditation",
        description: "Cultivate compassion and positive emotions towards yourself and others",
        duration: "10-15 minutes",
        difficulty: "beginner",
        type: "audio",
        url: "https://www.youtube.com/watch?v=sz7cpV7ERsM",
        benefits: [
          "Increases self-compassion",
          "Reduces negative emotions",
          "Improves relationships",
        ],
      },
      {
        id: "mindful-walking",
        title: "Mindful Walking Practice",
        description: "Combine gentle movement with mindfulness for mental clarity",
        duration: "10-30 minutes",
        difficulty: "beginner",
        type: "exercise",
        benefits: ["Improves mood", "Increases mindfulness", "Gentle exercise"],
        instructions: [
          "Find a quiet path or space to walk",
          "Start walking slowly and deliberately",
          "Focus on the sensation of your feet touching the ground",
          "Notice your surroundings without judgment",
          "When mind wanders, gently return focus to walking",
          "End with a moment of gratitude",
        ],
      },
    ],
  },
  {
    id: "videos",
    title: "Therapeutic Videos",
    description: "Professional-guided content for stress relief and mental health support",
    icon: <PlayCircle className="w-6 h-6" />,
    color: "bg-green-50 border-green-200 text-green-700",
    activities: [
      {
        id: "anxiety-relief",
        title: "10-Minute Anxiety Relief Session",
        description: "Therapist-led techniques for immediate anxiety reduction",
        duration: "10 minutes",
        difficulty: "beginner",
        type: "video",
        url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
        benefits: ["Quick anxiety relief", "Practical coping strategies", "Professional guidance"],
        isRecommended: true,
      },
      {
        id: "stress-release-yoga",
        title: "Gentle Yoga for Stress Relief",
        description: "Restorative yoga sequence designed for mental wellness",
        duration: "20 minutes",
        difficulty: "beginner",
        type: "video",
        url: "https://www.youtube.com/watch?v=hJbRpHZr_d0",
        benefits: ["Physical relaxation", "Stress reduction", "Improved flexibility"],
      },
      {
        id: "depression-support",
        title: "Understanding Depression: Coping Strategies",
        description: "Educational content about depression and healthy coping mechanisms",
        duration: "15 minutes",
        difficulty: "beginner",
        type: "video",
        url: "https://www.youtube.com/watch?v=z-IR48Mb3W0",
        benefits: ["Education about depression", "Practical strategies", "Validation and support"],
      },
      {
        id: "grounding-techniques",
        title: "5-4-3-2-1 Grounding Technique",
        description: "Powerful technique to manage panic attacks and overwhelming emotions",
        duration: "5 minutes",
        difficulty: "beginner",
        type: "video",
        url: "https://www.youtube.com/watch?v=30VMIEmA114",
        benefits: ["Immediate grounding", "Panic attack management", "Present moment awareness"],
      },
    ],
  },
  {
    id: "audio",
    title: "Calming Audio",
    description: "Soothing sounds and guided audio for relaxation and focus",
    icon: <Headphones className="w-6 h-6" />,
    color: "bg-teal-50 border-teal-200 text-teal-700",
    activities: [
      {
        id: "nature-sounds",
        title: "Nature Sounds for Relaxation",
        description: "Peaceful forest, rain, and ocean sounds to reduce stress",
        duration: "30-60 minutes",
        difficulty: "beginner",
        type: "audio",
        url: "https://www.youtube.com/watch?v=eKFTSSKCzWA",
        benefits: ["Background relaxation", "Improved focus", "Stress reduction"],
      },
      {
        id: "sleep-meditation",
        title: "Guided Sleep Meditation",
        description: "Peaceful meditation designed to help you fall asleep naturally",
        duration: "30 minutes",
        difficulty: "beginner",
        type: "audio",
        url: "https://www.youtube.com/watch?v=aAVPDYIJ00k",
        benefits: ["Better sleep quality", "Reduced bedtime anxiety", "Relaxation"],
      },
      {
        id: "binaural-beats",
        title: "Binaural Beats for Focus",
        description: "Scientifically-designed audio frequencies to enhance concentration",
        duration: "45 minutes",
        difficulty: "intermediate",
        type: "audio",
        url: "https://www.youtube.com/watch?v=WPni755-Krg",
        benefits: ["Enhanced focus", "Reduced distractions", "Mental clarity"],
      },
    ],
  },
  {
    id: "physical",
    title: "Physical Activities",
    description: "Gentle exercises and movement practices for mental wellness",
    icon: <Activity className="w-6 h-6" />,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    activities: [
      {
        id: "desk-stretches",
        title: "Desk Stretches for Students",
        description: "Simple stretches to relieve tension from studying",
        duration: "5-10 minutes",
        difficulty: "beginner",
        type: "exercise",
        benefits: ["Relieves muscle tension", "Improves posture", "Increases energy"],
        instructions: [
          "Neck rolls: Slowly roll head in circles",
          "Shoulder shrugs: Lift shoulders to ears, hold, release",
          "Spinal twist: Sit tall, twist gently left and right",
          "Wrist circles: Rotate wrists in both directions",
          "Ankle pumps: Point and flex feet",
          "Deep breathing between each stretch",
        ],
        isRecommended: true,
      },
      {
        id: "morning-energizer",
        title: "5-Minute Morning Energy Boost",
        description: "Quick routine to start your day with positive energy",
        duration: "5 minutes",
        difficulty: "beginner",
        type: "exercise",
        benefits: ["Increases energy", "Improves mood", "Boosts metabolism"],
        instructions: [
          "20 jumping jacks",
          "10 arm circles forward and backward",
          "5 deep squats",
          "10 push-ups (modified if needed)",
          "30-second plank hold",
          "5 deep breaths with arms overhead",
        ],
      },
      {
        id: "progressive-relaxation",
        title: "Progressive Muscle Relaxation",
        description: "Systematic tension and release of muscle groups",
        duration: "15-20 minutes",
        difficulty: "beginner",
        type: "exercise",
        benefits: ["Reduces physical tension", "Improves sleep", "Stress relief"],
        instructions: [
          "Lie down comfortably",
          "Start with toes, tense for 5 seconds",
          "Release and notice the relaxation",
          "Move up to calves, thighs, abdomen",
          "Continue with hands, arms, shoulders",
          "Finish with facial muscles",
          "Rest for 5 minutes, noticing full-body relaxation",
        ],
      },
    ],
  },
  {
    id: "educational",
    title: "Educational Resources",
    description: "Learn about mental health, coping strategies, and self-care",
    icon: <Book className="w-6 h-6" />,
    color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    activities: [
      {
        id: "anxiety-understanding",
        title: "Understanding Anxiety: A Guide for Students",
        description: "Comprehensive guide to recognizing and managing anxiety",
        duration: "10-15 minutes",
        difficulty: "beginner",
        type: "reading",
        url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
        benefits: ["Better understanding of anxiety", "Practical strategies", "Reduces stigma"],
      },
      {
        id: "stress-management",
        title: "Stress Management for Academic Success",
        description: "Evidence-based strategies for managing academic stress",
        duration: "15 minutes",
        difficulty: "beginner",
        type: "reading",
        url: "https://www.apa.org/education-career/k12/stress-management",
        benefits: ["Academic performance", "Stress reduction", "Time management skills"],
      },
      {
        id: "depression-resources",
        title: "Depression: Signs, Symptoms, and Support",
        description: "Educational resource about depression and available help",
        duration: "12 minutes",
        difficulty: "beginner",
        type: "reading",
        url: "https://www.nimh.nih.gov/health/topics/depression",
        benefits: ["Increased awareness", "Reduces stigma", "Encourages help-seeking"],
      },
    ],
  },
];

export const ActivitiesContent: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const closeModal = () => {
    setSelectedActivity(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "breathing":
        return <Wind className="w-4 h-4" />;
      case "video":
        return <PlayCircle className="w-4 h-4" />;
      case "audio":
        return <Headphones className="w-4 h-4" />;
      case "exercise":
        return <Activity className="w-4 h-4" />;
      case "reading":
        return <Book className="w-4 h-4" />;
      case "interactive":
        return <Target className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const handleStartActivity = (activity: Activity) => {
    // For activities with instructions (breathing, exercise, reading without URL)
    if (activity.instructions || (activity.type === "reading" && !activity.url)) {
      const activityData = encodeURIComponent(JSON.stringify(activity));
      const timerUrl = `/activity-timer?activity=${activityData}`;
      window.open(timerUrl, "_blank");
    }
    closeModal();
  };

  return (
    <main className="flex-1 p-3 sm:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Heart className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Mental Health Activities
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Professional-recommended activities to support your mental wellness
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-gray-200">
              <div className="text-xl sm:text-2xl font-bold text-primary-600 mb-1">
                {activityCategories.reduce((acc, cat) => acc + cat.activities.length, 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Activities</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-gray-200">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {activityCategories.reduce(
                  (acc, cat) =>
                    acc + cat.activities.filter((a) => a.difficulty === "beginner").length,
                  0
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Beginner Friendly</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-gray-200">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {activityCategories.reduce(
                  (acc, cat) => acc + cat.activities.filter((a) => a.isRecommended).length,
                  0
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Recommended</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-gray-200">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600">Available</div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-1">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">
                  💙 Your Wellness Journey
                </h3>
                <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                  These activities are designed by mental health professionals to complement your
                  overall wellness. They're most effective when practiced regularly. If you're
                  experiencing severe distress, please reach out to a counselor or mental health
                  professional.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Categories */}
        <div className="space-y-4 sm:space-y-6">
          {activityCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Category Header */}
              <div
                className="p-4 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>{category.icon}</div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {category.title}
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base mt-1">
                        {category.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {category.activities.length} activities
                        </span>
                        <span className="text-xs sm:text-sm text-green-600">
                          {category.activities.filter((a) => a.isRecommended).length} recommended
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedCategory === category.id ? "transform rotate-90" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Activities List */}
              {selectedCategory === category.id && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {category.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        onClick={() => handleActivityClick(activity)}
                      >
                        {/* Activity Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(activity.type)}
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                              {activity.title}
                            </h3>
                          </div>
                          {activity.isRecommended && (
                            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                              ⭐ Top Pick
                            </div>
                          )}
                        </div>

                        {/* Activity Details */}
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                          {activity.description}
                        </p>

                        {/* Activity Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{activity.duration}</span>
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(
                              activity.difficulty
                            )}`}
                          >
                            {activity.difficulty}
                          </div>
                        </div>

                        {/* Benefits Preview */}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Benefits: {activity.benefits.slice(0, 2).join(", ")}
                            {activity.benefits.length > 2 && "..."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Resources */}
        <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-900">Need Immediate Support?</h2>
          </div>
          <p className="text-red-800 text-sm sm:text-base mb-4">
            If you're experiencing a mental health crisis or having thoughts of self-harm:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="font-semibold text-red-900">Campus Counseling Center</p>
              <p className="text-red-700 text-sm">Available 24/7 for students</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="font-semibold text-red-900">Crisis Helpline</p>
              <p className="text-red-700 text-sm">1-800-273-8255 (24/7)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Modal isOpen={true} onClose={closeModal} title={selectedActivity.title} size="xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Activity Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedActivity.type)}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedActivity.description}</p>
                </div>
              </div>
              {selectedActivity.isRecommended && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">
                  ⭐ Highly Recommended
                </div>
              )}
            </div>

            {/* Activity Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">{selectedActivity.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Target className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Difficulty</p>
                <p
                  className={`font-semibold px-2 py-1 rounded capitalize ${getDifficultyColor(
                    selectedActivity.difficulty
                  )}`}
                >
                  {selectedActivity.difficulty}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                {getTypeIcon(selectedActivity.type)}
                <p className="text-sm text-gray-600 mt-2">Type</p>
                <p className="font-semibold text-gray-900 capitalize">{selectedActivity.type}</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Smile className="w-5 h-5 mr-2 text-green-600" />
                Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedActivity.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-green-50 rounded-lg p-3"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-green-800 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {selectedActivity.instructions && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Book className="w-5 h-5 mr-2 text-blue-600" />
                  Instructions
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedActivity.instructions.map((instruction, index) => (
                      <li key={index} className="text-blue-900 text-sm">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* External Link */}
            {selectedActivity.url && (
              <div className="mb-6 flex items-center justify-center">
                <a
                  href={selectedActivity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Access Content</span>
                </a>
              </div>
            )}

            {/* Call to Action - Only show for activities with instructions or reading without URL */}
            {(selectedActivity.instructions ||
              (selectedActivity.type === "reading" && !selectedActivity.url)) && (
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 sm:p-6 text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Consistency is key to mental wellness. Try to practice this activity regularly for
                  best results.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleStartActivity(selectedActivity)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Start Activity
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Save for Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </main>
  );
};
