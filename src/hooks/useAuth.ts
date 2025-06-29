import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "@/services";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/services";

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
  type: "student" | "guidance";
}

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>({
    user: AuthService.getCurrentUser(),
    loading: false,
    error: null,
  });

  // Initialize authentication state on mount
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setAuthState((prev) => ({ ...prev, user }));
    }
  }, []);

  const signUp = async (formData: SignUpFormData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Map form data to auth service format
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.email, // Use email as username
        type: "student", // Default to student for signup
        role: "user", // Default to user role
        studentNumber: generateStudentNumber(), // Generate a student number
        program: mapProgramValue(formData.program),
        year: "1st Year", // Default year for new students
      };

      const response: AuthResponse = await AuthService.register(registerData);

      setAuthState((prev) => ({
        ...prev,
        user: response.user,
        loading: false,
        error: null,
      }));

      // Navigate to home or intended destination after successful registration
      const from = (location.state as any)?.from?.pathname || "/home";
      navigate(from, { replace: true });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please try again.";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signIn = async (credentials: SignInData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const loginData: LoginRequest = {
        email: credentials.email,
        password: credentials.password,
        type: credentials.type,
      };

      const response: AuthResponse = await AuthService.login(loginData);

      setAuthState((prev) => ({
        ...prev,
        user: response.user,
        loading: false,
        error: null,
      }));

      // Navigate to home or intended destination after successful login
      const from = (location.state as any)?.from?.pathname || "/home";
      navigate(from, { replace: true });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await AuthService.logout();
      setAuthState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: null,
      }));

      // Navigate to signin page
      navigate("/signin");
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear state even if logout fails
      setAuthState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: null,
      }));
      navigate("/signin");
    }
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const isAuthenticated = () => {
    return AuthService.isAuthenticated();
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    clearError,
    isAuthenticated,
  };
};

// Helper function to generate a simple student number
function generateStudentNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `${currentYear}-${randomNum}`;
}

// Helper function to map program values from form to proper program names
function mapProgramValue(value: string): string {
  const programMap: Record<string, string> = {
    therapy: "BS Information Technology",
    counseling: "BS Hotel Management",
    psychology: "BS Nutrition and Dietetics",
    psychiatry: "Diploma in Information Technology",
    "social-work": "Diploma in Computer Programming and Engineering Technology",
  };

  return programMap[value] || value;
}
