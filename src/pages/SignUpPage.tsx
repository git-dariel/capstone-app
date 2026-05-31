import React from "react";
import { SignUpCard } from "@/components/organisms/SignUpCard";
import landingImage from "@/assets/landing-img.png";

export const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white lg:overflow-hidden">
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
      <div className="w-full lg:w-1/2 bg-white flex justify-center px-4 sm:px-6 lg:px-7 min-h-screen lg:h-screen lg:min-h-0 lg:overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-4xl py-5 lg:py-4 xl:py-5">
          <SignUpCard />
        </div>
      </div>
    </div>
  );
};
