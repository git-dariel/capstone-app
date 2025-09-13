import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { animate } from "animejs";
import {
  Brain,
  Calendar,
  MessageCircle,
  Activity,
  Shield,
  ChevronRight,
  Heart,
  TrendingUp,
  Clock,
  Menu,
  X,
} from "lucide-react";
import pupLogo from "@/assets/PUPLogo.png";
import iskoImage from "@/assets/isko.png";
import { InstallAppButton } from "@/components/atoms";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation refs
  const mainRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Brain,
      title: "Mental Health Assessments",
      description:
        "Scientific-based screening tools including GAD-7, PHQ-9, PSS, and CSSRS with immediate results and severity categorization.",
      color: "from-primary-100 to-primary-50",
    },
    {
      icon: Calendar,
      title: "Appointment Management",
      description:
        "Seamless booking system for counseling sessions with real-time availability and status tracking.",
      color: "from-gray-100 to-gray-50",
    },
    {
      icon: MessageCircle,
      title: "Secure Messaging",
      description:
        "HIPAA-compliant communication between students and counselors with encrypted real-time messaging.",
      color: "from-primary-100 to-primary-50",
    },
    {
      icon: Activity,
      title: "Wellness Activities",
      description:
        "Guided therapeutic exercises, mindfulness sessions, and interactive wellness content with progress tracking.",
      color: "from-gray-100 to-gray-50",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description:
        "Comprehensive dashboard with predictive analytics and historical tracking for mental health trends.",
      color: "from-primary-100 to-primary-50",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description:
        "FERPA-compliant data protection with role-based access and comprehensive consent management.",
      color: "from-gray-100 to-gray-50",
    },
  ];

  const stats = [
    { number: "4", label: "Assessment Tools", icon: Brain },
    { number: "Mon-Fri", label: "Office Hours", icon: Heart },
    { number: "Real-time", label: "Results", icon: Clock },
    { number: "Secure", label: "Communication", icon: Shield },
  ];

  // Initialize animations using anime.js
  useEffect(() => {
    if (!mainRef.current) return;

    // Hero section entrance animations with delayed sequence

    // Animate hero title
    animate(".hero-title", {
      opacity: [0, 1],
      translateY: [60, 0],
      duration: 1200,
      easing: "easeOutQuart",
    });

    // Animate hero description
    setTimeout(() => {
      animate(".hero-description", {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 1000,
        easing: "easeOutQuart",
      });
    }, 400);

    // Animate hero buttons
    setTimeout(() => {
      animate(".hero-buttons", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: "easeOutQuart",
      });
    }, 600);

    // Animate hero image
    setTimeout(() => {
      animate(".hero-image", {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 1000,
        easing: "easeOutQuart",
      });
    }, 300);

    // Animate stats with stagger
    setTimeout(() => {
      animate(".stat-card", {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        duration: 600,
        delay: (_, i) => i * 100,
        easing: "easeOutQuart",
      });
    }, 800);

    // Add hover animations for interactive elements
    const addHoverEffects = () => {
      // Feature cards hover effect
      document.querySelectorAll(".feature-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          animate(card, {
            scale: 1.05,
            translateY: -8,
            duration: 300,
            easing: "easeOutQuad",
          });
        });

        card.addEventListener("mouseleave", () => {
          animate(card, {
            scale: 1,
            translateY: 0,
            duration: 300,
            easing: "easeOutQuad",
          });
        });
      });

      // Assessment cards hover effect
      document.querySelectorAll(".assessment-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          animate(card, {
            scale: 1.03,
            rotate: -2,
            duration: 250,
            easing: "easeOutQuad",
          });
        });

        card.addEventListener("mouseleave", () => {
          animate(card, {
            scale: 1,
            rotate: 0,
            duration: 250,
            easing: "easeOutQuad",
          });
        });
      });
    };

    // Add hover effects after initial animation
    setTimeout(addHoverEffects, 1000);
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;

          if (target.classList.contains("features-section")) {
            animate(".feature-card", {
              opacity: [0, 1],
              translateY: [60, 0],
              scale: [0.95, 1],
              duration: 800,
              delay: (_, i) => i * 150,
              easing: "easeOutExpo",
            });
            observer.unobserve(target);
          }

          if (target.classList.contains("assessments-section")) {
            animate(".assessment-card", {
              opacity: [0, 1],
              translateY: [50, 0],
              rotate: [5, 0],
              duration: 700,
              delay: (_, i) => i * 120,
              easing: "easeOutBack",
            });
            observer.unobserve(target);
          }

          if (target.classList.contains("cta-section")) {
            animate(".cta-section", {
              opacity: [0, 1],
              translateY: [60, 0],
              scale: [0.98, 1],
              duration: 1000,
              easing: "easeOutQuart",
            });
            observer.unobserve(target);
          }
        }
      });
    }, observerOptions);

    // Observe sections when they exist
    const observeSections = () => {
      const featuresSection = document.querySelector(".features-section");
      const assessmentsSection = document.querySelector(".assessments-section");
      const ctaSection = document.querySelector(".cta-section");

      if (featuresSection) observer.observe(featuresSection);
      if (assessmentsSection) observer.observe(assessmentsSection);
      if (ctaSection) observer.observe(ctaSection);
    };

    // Delay section observation to ensure elements are rendered
    setTimeout(observeSections, 100);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <img src={pupLogo} alt="PUP Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
              <div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-primary-700 leading-tight">
                  Office of Guidance and Counseling Services
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Mental Health Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-3">
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2 text-primary-700 font-medium hover:bg-primary-50 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 transition-colors duration-200 shadow-sm cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={() => {
                    navigate("/signin");
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-white text-primary-700 border-2 border-primary-700 font-medium rounded-lg hover:bg-primary-50 transition-colors duration-200 text-center cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 transition-colors duration-200 shadow-sm text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-primary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="hero-title text-4xl lg:text-6xl font-bold text-gray-900 leading-tight opacity-0">
                  Your Mental Health
                  <span className="block text-primary-700">Matters</span>
                </h1>
                <p className="hero-description text-xl text-gray-600 leading-relaxed opacity-0">
                  A comprehensive digital platform for mental health screening, counseling support,
                  and wellness resources designed specifically for university students.
                </p>
              </div>

              <div className="hero-buttons flex flex-col sm:flex-row gap-4 opacity-0">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center px-8 py-4 bg-primary-700 text-white font-semibold rounded-2xl hover:bg-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
                  style={{
                    boxShadow: `20px 20px 40px rgba(163, 18, 97, 0.1), 
                                -20px -20px 40px rgba(255, 255, 255, 0.8),
                                inset 5px 5px 10px rgba(163, 18, 97, 0.1),
                                inset -5px -5px 10px rgba(255, 255, 255, 0.5)`,
                  }}
                >
                  Start Assessment
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/signin")}
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl border-2 border-primary-100 hover:border-primary-200 transition-all duration-300 cursor-pointer"
                  style={{
                    boxShadow: `20px 20px 40px rgba(163, 18, 97, 0.05), 
                                -20px -20px 40px rgba(255, 255, 255, 1),
                                inset 5px 5px 10px rgba(255, 255, 255, 0.8),
                                inset -5px -5px 10px rgba(163, 18, 97, 0.05)`,
                  }}
                >
                  Access Portal
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-8 max-w-4xl">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="stat-card bg-white rounded-2xl p-4 lg:p-6 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[120px] opacity-0"
                    style={{
                      boxShadow: `15px 15px 30px rgba(163, 18, 97, 0.05), 
                                  -15px -15px 30px rgba(255, 255, 255, 0.8),
                                  inset 3px 3px 6px rgba(255, 255, 255, 0.7),
                                  inset -3px -3px 6px rgba(163, 18, 97, 0.03)`,
                    }}
                  >
                    <stat.icon className="h-6 w-6 lg:h-8 lg:w-8 text-primary-700 mb-2 flex-shrink-0" />
                    <div className="text-xl lg:text-lg font-bold text-gray-900 leading-tight">
                      {stat.number}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="hero-image relative opacity-0">
              <div
                className="bg-gradient-to-br from-primary-100 to-white rounded-3xl p-12 border border-primary-100"
                style={{
                  boxShadow: `30px 30px 60px rgba(163, 18, 97, 0.1), 
                              -30px -30px 60px rgba(255, 255, 255, 0.9),
                              inset 10px 10px 20px rgba(255, 255, 255, 0.8),
                              inset -10px -10px 20px rgba(163, 18, 97, 0.05)`,
                }}
              >
                <div className="text-center space-y-8">
                  <div className="relative">
                    <img
                      src={iskoImage}
                      alt="Welcome sa PUP, Iskoolmates! - Happy PUP students"
                      className="w-full h-auto max-w-sm mx-auto rounded-2xl shadow-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">For PUP Students</h3>
                    <p className="text-gray-600">
                      A mental health platform designed specifically for the PUP community,
                      supporting our iskoolmates' wellness journey with culturally-aware and
                      scientifically-validated assessment tools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for mental health screening, counseling, and wellness - all in one
              secure, user-friendly platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300 group opacity-0"
                style={{
                  boxShadow: `20px 20px 40px rgba(163, 18, 97, 0.08), 
                              -20px -20px 40px rgba(255, 255, 255, 0.9),
                              inset 5px 5px 10px rgba(255, 255, 255, 0.8),
                              inset -5px -5px 10px rgba(163, 18, 97, 0.03)`,
                }}
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}
                  style={{
                    boxShadow: `inset 5px 5px 10px rgba(255, 255, 255, 0.8),
                                inset -5px -5px 10px rgba(163, 18, 97, 0.05)`,
                  }}
                >
                  <feature.icon className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Tools Section */}
      <section className="assessments-section py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Evidence-Based Assessment Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clinically validated screening instruments used by mental health professionals
              worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "GAD-7",
                fullName: "Generalized Anxiety Disorder",
                description: "7-question anxiety screening",
                severity: "Minimal • Mild • Moderate • Severe",
              },
              {
                name: "PHQ-9",
                fullName: "Patient Health Questionnaire",
                description: "Depression assessment tool",
                severity: "5 severity levels with risk evaluation",
              },
              {
                name: "PSS",
                fullName: "Perceived Stress Scale",
                description: "Monthly stress evaluation",
                severity: "Low • Moderate • High stress levels",
              },
              {
                name: "CSSRS",
                fullName: "Columbia Suicide Severity Rating",
                description: "Comprehensive risk assessment",
                severity: "Immediate crisis intervention available",
              },
            ].map((tool, index) => (
              <div
                key={index}
                className="assessment-card bg-white rounded-2xl p-6 border border-primary-100 opacity-0"
                style={{
                  boxShadow: `15px 15px 30px rgba(163, 18, 97, 0.08), 
                              -15px -15px 30px rgba(255, 255, 255, 0.9),
                              inset 5px 5px 10px rgba(255, 255, 255, 0.8),
                              inset -5px -5px 10px rgba(163, 18, 97, 0.03)`,
                }}
              >
                <div className="text-center space-y-4">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 bg-primary-700 text-white rounded-2xl font-bold text-lg"
                    style={{
                      boxShadow: `inset 3px 3px 6px rgba(255, 255, 255, 0.2),
                                  inset -3px -3px 6px rgba(0, 0, 0, 0.2)`,
                    }}
                  >
                    {tool.name}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{tool.fullName}</h3>
                    <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                    <p className="text-primary-700 text-xs mt-2 font-medium">{tool.severity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="cta-section bg-gradient-to-br from-primary-50 to-white rounded-3xl p-12 border border-primary-100 opacity-0"
            style={{
              boxShadow: `30px 30px 60px rgba(163, 18, 97, 0.1), 
                          -30px -30px 60px rgba(255, 255, 255, 0.9),
                          inset 10px 10px 20px rgba(255, 255, 255, 0.8),
                          inset -10px -10px 20px rgba(163, 18, 97, 0.05)`,
            }}
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Take the First Step Towards Better Mental Health
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join thousands of students who are taking control of their mental wellness with
                  our comprehensive assessment and support platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center px-8 py-4 bg-primary-700 text-white font-semibold rounded-2xl hover:bg-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
                  style={{
                    boxShadow: `20px 20px 40px rgba(163, 18, 97, 0.15), 
                                -20px -20px 40px rgba(255, 255, 255, 0.8),
                                inset 5px 5px 10px rgba(163, 18, 97, 0.1),
                                inset -5px -5px 10px rgba(255, 255, 255, 0.5)`,
                  }}
                >
                  Create Account
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/signin")}
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl border-2 border-primary-200 hover:border-primary-300 transition-all duration-300"
                  style={{
                    boxShadow: `20px 20px 40px rgba(163, 18, 97, 0.08), 
                                -20px -20px 40px rgba(255, 255, 255, 1),
                                inset 5px 5px 10px rgba(255, 255, 255, 0.8),
                                inset -5px -5px 10px rgba(163, 18, 97, 0.05)`,
                  }}
                >
                  Sign In
                </button>
              </div>

              {/* Install App Button */}
              <div className="flex justify-center mt-6">
                <InstallAppButton
                  variant="outline"
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm border-primary-300 text-primary-700 hover:bg-primary-50"
                />
              </div>

              <div className="pt-8 border-t border-primary-200">
                <p className="text-sm text-gray-500">
                  Secure • HIPAA Compliant • FERPA Compliant • Available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <img src={pupLogo} alt="PUP Logo" className="h-12 w-12" />
              <div>
                <h3 className="text-lg font-bold text-primary-700">
                  Office of Guidance and Counseling Services
                </h3>
                <p className="text-xs text-gray-500">Polytechnic University of the Philippines</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Student Mental Health Assessment Platform - A comprehensive digital solution for
              mental health screening, counseling, and wellness support.
            </p>
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>
                © 2024 Office of Guidance and Counseling Services. Academic use only. All rights
                reserved.
              </p>
              <p className="mt-1">HIPAA Compliant • FERPA Compliant • Secure & Confidential</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
