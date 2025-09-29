import React from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";
import cat404Animation from "@/assets/404 error page with cat.json";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Cat 404 Animation */}
        <div className="mb-8">
          <Lottie
            animationData={cat404Animation}
            className="w-80 h-80 mx-auto"
            loop={true}
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Oops! Page Not Found</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for seems to have wandered off like our curious cat. 
            Let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleGoHome}
            variant="primary"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Home</span>
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </div>
  );
};