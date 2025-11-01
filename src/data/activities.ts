export type ActivityDifficulty = "beginner" | "intermediate" | "advanced";
export type ActivityType = "breathing" | "video" | "audio" | "exercise" | "reading" | "interactive";

export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: ActivityDifficulty;
  type: ActivityType;
  url?: string;
  benefits: string[];
  instructions?: string[];
  isRecommended?: boolean;
}

export interface ActivityCategory {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
}

export const activityCategories: ActivityCategory[] = [
  {
    id: "breathing",
    title: "Breathing Exercises",
    description: "Simple breathing techniques to reduce stress and anxiety",
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
