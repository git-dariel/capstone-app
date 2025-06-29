import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/atoms/FormField";
import { Button } from "@/components/ui/button";
import { AuthService, type LoginRequest } from "@/services";

interface SignInFormData {
  email: string;
  password: string;
  type: "student" | "employee";
}

export const EnhancedSignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    type: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
        type: formData.type,
      };

      const response = await AuthService.login(loginData);

      // Show success message
      console.log("Login successful:", response.message);
      console.log("User:", response.user);

      // If user is a student and has student data
      if (response.student) {
        console.log("Student data:", response.student);
      }

      // Navigate to dashboard or home
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof SignInFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <FormField
        id="email"
        label="Email address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
        disabled={loading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        required
        disabled={loading}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Account Type</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value as "student" | "employee")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="student">Student</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <div className="text-center text-xs text-gray-600 mt-3">
        Don't have an account?{" "}
        <a href="/signup" className="text-teal-500 hover:text-teal-600 font-medium">
          Sign up
        </a>
      </div>
    </form>
  );
};

// Example of how to check authentication status in a component
export const AuthenticationChecker: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if user is authenticated when component mounts
    if (!AuthService.isAuthenticated()) {
      // Redirect to login if not authenticated
      navigate("/signin");
    } else {
      // Get current user data
      const currentUser = AuthService.getCurrentUser();
      console.log("Current authenticated user:", currentUser);
    }
  }, [navigate]);

  return null; // This is just a utility component
};

// Example logout function
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await AuthService.logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout API call fails
      navigate("/signin");
    }
  };

  return logout;
};
