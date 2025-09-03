import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Target,
  Wind,
  Activity,
  Book,
} from "lucide-react";

interface TimerPageProps {
  activity?: {
    title: string;
    description: string;
    duration: string;
    type: string;
    instructions?: string[];
    benefits: string[];
    difficulty: string;
  };
}

export const TimerPage: React.FC<TimerPageProps> = () => {
  const [activity, setActivity] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get activity data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const activityData = urlParams.get("activity");

    if (activityData) {
      try {
        const parsedActivity = JSON.parse(decodeURIComponent(activityData));
        setActivity(parsedActivity);

        // Parse duration and set timer
        const duration = parsedActivity.duration;
        let minutes = 0;

        if (duration.includes("-")) {
          // Handle range like "5-10 minutes"
          const range = duration.match(/(\d+)-(\d+)/);
          if (range) {
            minutes = parseInt(range[2]); // Use the higher end of the range
          }
        } else {
          // Handle single duration like "15 minutes"
          const match = duration.match(/(\d+)/);
          if (match) {
            minutes = parseInt(match[1]);
          }
        }

        const totalSeconds = minutes * 60;
        setTimeLeft(totalSeconds);
        setInitialTime(totalSeconds);
      } catch (error) {
        console.error("Error parsing activity data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (initialTime === 0) return 0;
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setIsCompleted(false);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (activity?.instructions && currentStep < activity.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "breathing":
        return <Wind className="w-8 h-8 text-blue-600" />;
      case "exercise":
        return <Activity className="w-8 h-8 text-orange-600" />;
      case "reading":
        return <Book className="w-8 h-8 text-indigo-600" />;
      default:
        return <Target className="w-8 h-8 text-purple-600" />;
    }
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

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getActivityIcon(activity.type)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                activity.difficulty
              )}`}
            >
              {activity.difficulty}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isCompleted ? "Completed!" : isRunning ? "Running" : "Ready"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center space-x-4 mb-4">
                  {!isCompleted && (
                    <>
                      {!isRunning ? (
                        <button
                          onClick={handleStart}
                          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          <Play className="w-5 h-5" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          onClick={handlePause}
                          className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                        >
                          <Pause className="w-5 h-5" />
                          <span>Pause</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>
                </div>

                {isCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center text-green-800 mb-2">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-semibold">Activity Completed!</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Great job! You've successfully completed this mental health activity.
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Benefits
                </h3>
                <div className="space-y-2">
                  {activity.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Instructions</h2>

              {activity.instructions && activity.instructions.length > 0 ? (
                <div>
                  {/* Step Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-gray-500">
                      Step {currentStep + 1} of {activity.instructions.length}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={currentStep === activity.instructions.length - 1}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Current Step */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0 mt-0.5">
                        {currentStep + 1}
                      </div>
                      <div>
                        <p className="text-blue-900 font-medium text-lg leading-relaxed">
                          {activity.instructions[currentStep]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Progress</span>
                      <span>
                        {Math.round(((currentStep + 1) / activity.instructions.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentStep + 1) / activity.instructions.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* All Steps Overview */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">All Steps Overview</h3>
                    <div className="space-y-3">
                      {activity.instructions.map((instruction: string, index: number) => (
                        <div
                          key={index}
                          className={`flex items-start p-3 rounded-lg border transition-colors ${
                            index === currentStep
                              ? "bg-blue-50 border-blue-200"
                              : index < currentStep
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div
                            className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0 ${
                              index === currentStep
                                ? "bg-blue-600 text-white"
                                : index < currentStep
                                ? "bg-green-600 text-white"
                                : "bg-gray-400 text-white"
                            }`}
                          >
                            {index < currentStep ? "✓" : index + 1}
                          </div>
                          <p
                            className={`text-sm ${
                              index === currentStep ? "text-blue-900 font-medium" : "text-gray-700"
                            }`}
                          >
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Follow your own pace for this activity.</p>
                  <p className="text-sm mt-2">Use the timer to track your session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
