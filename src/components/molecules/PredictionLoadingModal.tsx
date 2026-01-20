import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, Activity, CheckCircle2 } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms";

interface PredictionLoadingModalProps {
  isOpen: boolean;
}

const loadingSteps = [
  {
    id: 1,
    icon: Brain,
    text: "Analyzing your responses...",
    duration: 2000,
  },
  {
    id: 2,
    icon: Activity,
    text: "Processing mental health indicators...",
    duration: 3000,
  },
  {
    id: 3,
    icon: Sparkles,
    text: "Generating personalized predictions...",
    duration: 4000,
  },
  {
    id: 4,
    icon: CheckCircle2,
    text: "Finalizing your assessment...",
    duration: 1000,
  },
];

export const PredictionLoadingModal: React.FC<PredictionLoadingModalProps> = ({
  isOpen,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          setCompletedSteps((completed) => [...completed, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(stepInterval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop with gradient animation */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/95 to-primary-900/95 backdrop-blur-md animate-gradient" />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          {/* Main Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 opacity-20 animate-pulse" />

            <div className="relative bg-white m-[2px] rounded-2xl p-4 sm:p-6">
              {/* Header Section */}
              <div className="text-center mb-4">
                <div className="relative inline-block mb-3">
                  {/* Animated rings around spinner */}
                  <div className="absolute inset-0 -m-6">
                    <div className="w-full h-full rounded-full border-2 border-primary-200 animate-ping opacity-75" />
                  </div>
                  <div className="absolute inset-0 -m-4">
                    <div className="w-full h-full rounded-full border-2 border-primary-300 animate-pulse" />
                  </div>

                  {/* Main loading spinner */}
                  <LoadingSpinner size="md" variant="lottie" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Generating Your Results
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Our AI is carefully analyzing your responses to provide
                  personalized insights
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2 mb-3">
                {loadingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(index);
                  const isCurrent = currentStep === index;
                  const isUpcoming = index > currentStep;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500",
                        isCurrent &&
                          "bg-primary-50 border-2 border-primary-200 scale-105",
                        isCompleted && "bg-green-50 border border-green-200",
                        isUpcoming &&
                          "bg-gray-50 border border-gray-200 opacity-50",
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500",
                          isCurrent &&
                            "bg-primary-600 text-white animate-pulse",
                          isCompleted && "bg-green-600 text-white",
                          isUpcoming && "bg-gray-300 text-gray-500",
                        )}
                      >
                        {isCurrent ? (
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm sm:text-base font-medium transition-all duration-500",
                            isCurrent && "text-primary-900",
                            isCompleted && "text-green-900",
                            isUpcoming && "text-gray-500",
                          )}
                        >
                          {step.text}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {isCurrent && (
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        )}
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${((currentStep + 1) / loadingSteps.length) * 100}%`,
                    }}
                  >
                    <div className="h-full w-full bg-white/30 animate-shimmer" />
                  </div>
                </div>
                <p className="text-center mt-3 text-sm text-gray-600">
                  <span className="font-semibold text-primary-700">
                    {Math.round(
                      ((currentStep + 1) / loadingSteps.length) * 100,
                    )}
                    %
                  </span>{" "}
                  complete
                </p>
              </div>

              {/* Bottom message */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-full text-xs sm:text-sm text-primary-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">
                    Please wait while we prepare your personalized results
                  </span>
                </div>
              </div>

              {/* Fun fact / tip section */}
              <div className="mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-700 text-center">
                  <span className="font-semibold text-primary-700">
                    💡 Did you know?
                  </span>{" "}
                  Your responses help our AI provide tailored recommendations to
                  support your mental well-being journey.
                </p>
              </div>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-10 w-2 h-2 bg-primary-400 rounded-full animate-float opacity-60" />
            <div className="absolute top-20 right-16 w-3 h-3 bg-purple-400 rounded-full animate-float-delayed opacity-50" />
            <div className="absolute bottom-24 left-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-40" />
            <div className="absolute bottom-32 right-12 w-2 h-2 bg-primary-300 rounded-full animate-float-delayed opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};
