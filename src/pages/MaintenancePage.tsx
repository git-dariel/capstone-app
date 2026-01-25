import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { animate } from "animejs";
import { Wrench, Clock, Mail, AlertCircle, Heart, Shield, Brain } from "lucide-react";
import pupLogo from "@/assets/PUPLogo.png";
import catLoadingAnimation from "@/assets/cat Mark loading.json";

export const MaintenancePage: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  // Initialize animations using anime.js
  useEffect(() => {
    if (!mainRef.current) return;

    // Animate logo
    animate(".maintenance-logo", {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 1000,
      easing: "easeOutQuart",
    });

    // Animate title
    setTimeout(() => {
      animate(".maintenance-title", {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 1000,
        easing: "easeOutQuart",
      });
    }, 300);

    // Animate description
    setTimeout(() => {
      animate(".maintenance-description", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: "easeOutQuart",
      });
    }, 500);

    // Animate cat animation
    setTimeout(() => {
      animate(".maintenance-animation", {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 1000,
        easing: "easeOutQuart",
      });
    }, 400);

    // Animate info cards with stagger
    setTimeout(() => {
      animate(".info-card", {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        duration: 600,
        delay: (_, i) => i * 150,
        easing: "easeOutQuart",
      });
    }, 700);

    // Animate contact section
    setTimeout(() => {
      animate(".contact-section", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: "easeOutQuart",
      });
    }, 900);
  }, []);

  const infoCards = [
    {
      icon: Clock,
      title: "Temporary Downtime",
      description: "We're performing scheduled maintenance to improve your experience.",
      color: "from-primary-100 to-primary-50",
      iconColor: "text-primary-700",
      bgColor: "bg-primary-100",
    },
    {
      icon: Shield,
      title: "Your Data is Safe",
      description: "All your information remains secure during this maintenance period.",
      color: "from-blue-100 to-blue-50",
      iconColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    {
      icon: Heart,
      title: "Coming Back Soon",
      description: "We'll be back online shortly with enhanced features and performance.",
      color: "from-purple-100 to-purple-50",
      iconColor: "text-purple-700",
      bgColor: "bg-purple-100",
    },
  ];

  const features = [
    { icon: Brain, label: "Mental Health Assessments" },
    { icon: Shield, label: "Secure & Private" },
    { icon: Heart, label: "Student Wellness" },
  ];

  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden relative"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="maintenance-logo flex items-center justify-center space-x-4 mb-6 opacity-0">
            <img src={pupLogo} alt="PUP Logo" className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-700 leading-tight">
                Office of Guidance and Counseling Services
              </h1>
              <p className="text-sm text-gray-600">Mental Health Platform</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8 sm:p-12">
            {/* Cat Animation */}
            <div className="maintenance-animation mb-8 opacity-0">
              <Lottie
                animationData={catLoadingAnimation}
                className="w-64 h-64 mx-auto"
                loop={true}
                autoplay={true}
                rendererSettings={{
                  preserveAspectRatio: "xMidYMid slice",
                }}
              />
            </div>

            {/* Title and Description */}
            <div className="text-center mb-12">
              <div className="maintenance-title opacity-0">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Wrench className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Under Maintenance
                </h2>
              </div>
              <p className="maintenance-description text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed opacity-0">
                We're currently performing system maintenance to enhance your experience. The
                platform will be back online shortly. Thank you for your patience!
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {infoCards.map((card, index) => (
                <div
                  key={index}
                  className="info-card opacity-0 bg-gradient-to-br p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 ${card.bgColor} rounded-full mb-4`}
                  >
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>

            {/* Features Banner */}
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <span className="text-sm font-semibold text-gray-700">Platform Features:</span>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <feature.icon className="w-5 h-5 text-primary-700" />
                    <span className="text-sm text-gray-700">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="contact-section opacity-0">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                      <AlertCircle className="w-6 h-6 text-primary-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Need Immediate Assistance?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      If you require urgent mental health support during this maintenance period,
                      please contact our office directly.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href="mailto:codotado@pup.edu.ph"
                        className="inline-flex items-center space-x-2 text-primary-700 hover:text-primary-800 font-medium transition-colors duration-200"
                      >
                        <Mail className="w-5 h-5" />
                        <span>codotado@pup.edu.ph</span>
                      </a>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm">Mon-Fri, 8:00 AM - 5:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-800 px-8 py-6">
            <div className="text-center">
              <p className="text-white text-sm font-medium">
                Thank you for using the PUP Mental Health Platform
              </p>
              <p className="text-primary-100 text-xs mt-1">
                We appreciate your understanding and patience
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Expected to be back online soon. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
};
