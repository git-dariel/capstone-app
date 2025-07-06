import React from "react";
import { SignInCard } from "@/components/organisms";
import landingImage from "@/assets/landing-img.png";

export const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Illustration - Hidden on mobile, half width on desktop */}
      <div className="hidden lg:block lg:w-1/2 bg-white">
        <div className="h-full border border-gray-100">
          <img
            src={landingImage}
            alt="Therapy session illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Form section */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 lg:px-16 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm py-8 lg:py-0">
          <SignInCard />
        </div>
      </div>
    </div>
  );
};
