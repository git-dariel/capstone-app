import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService, ConsentService } from "@/services";
import type { LoginRequest, RegisterRequest, AuthResponse, Student } from "@/services";

interface AuthState {
  user: any | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  program: string;
  year: string;
  gender: string;
  email: string;
  password: string;
  contactNumber: string;
  address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  guardian: {
    name: string;
    contactNumber: string;
    relationship: string;
  };
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
    user: null,
    student: null,
    loading: false,
    error: null,
    initialized: false,
  });

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = AuthService.getCurrentUser();
        const student = AuthService.getCurrentStudent();
        setAuthState((prev) => ({
          ...prev,
          user,
          student,
          initialized: true,
        }));
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState((prev) => ({
          ...prev,
          user: null,
          student: null,
          initialized: true,
        }));
      }
    };

    initializeAuth();
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
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          province: formData.address.province,
          zipCode: formData.address.zipCode,
        },
        guardian: {
          firstName: formData.guardian.name.split(" ")[0] || "",
          lastName: formData.guardian.name.split(" ").slice(1).join(" ") || "",
          contactNumber: formData.guardian.contactNumber,
          relationship: formData.guardian.relationship,
        },
        userName: formData.email, // Use email as username
        type: "student", // Default to student for signup
        role: "user", // Default to user role
        studentNumber: generateStudentNumber(), // Generate a student number
        program: mapProgramValue(formData.program),
        year: formData.year, // Use year from form data
      };

      const response: AuthResponse = await AuthService.register(registerData);

      // Don't update auth state - keep user unauthenticated
      // They will need to sign in after registration
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        // Keep user and student as null to remain unauthenticated
      }));

      console.log("Registration completed successfully. User needs to sign in.");

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

      // Check if email verification is required
      if (response.emailVerificationRequired && response.otpSent) {
        // Don't set user data yet, just stop loading and return response for OTP handling
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));
        console.log("Login requires email verification. OTP sent to email.");
        return response;
      }

      // Proceed with normal login flow if email is already verified
      setAuthState((prev) => ({
        ...prev,
        user: response.user,
        student: response.student || null,
        loading: false,
        error: null,
      }));

      // Small delay to ensure state is set before navigation
      setTimeout(async () => {
        // Check if user is a student and needs to complete consent
        if (response.user.type === "student" && response.student?.id) {
          try {
            const hasConsent = await ConsentService.hasConsent(response.student.id);
            if (!hasConsent) {
              navigate("/consent", { replace: true });
              return;
            }
          } catch (error) {
            console.error("Error checking consent:", error);
            // If consent check fails, continue to normal navigation
          }
        }

        // Set default route based on user type
        const defaultRoute = response.user.type === "student" ? "/resources" : "/home";
        const from = (location.state as any)?.from?.pathname || defaultRoute;
        navigate(from, { replace: true });
      }, 100);

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

  const completeSignInAfterVerification = async (userData: AuthResponse) => {
    // Complete the sign-in process after successful email verification
    setAuthState((prev) => ({
      ...prev,
      user: userData.user,
      student: userData.student || null,
      loading: false,
      error: null,
    }));

    // Small delay to ensure state is set before navigation
    setTimeout(async () => {
      // Check if user is a student and needs to complete consent
      if (userData.user.type === "student" && userData.student?.id) {
        try {
          const hasConsent = await ConsentService.hasConsent(userData.student.id);
          if (!hasConsent) {
            navigate("/consent", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Error checking consent:", error);
          // If consent check fails, continue to normal navigation
        }
      }

      const from = (location.state as any)?.from?.pathname || "/home";
      navigate(from, { replace: true });
    }, 100);
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await AuthService.logout();
      setAuthState((prev) => ({
        ...prev,
        user: null,
        student: null,
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
        student: null,
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
    // Use the hook's state instead of calling AuthService directly
    return !!(authState.user && authState.user.id);
  };

  return {
    user: authState.user,
    student: authState.student,
    loading: authState.loading,
    error: authState.error,
    initialized: authState.initialized,
    signUp,
    signIn,
    signOut,
    completeSignInAfterVerification,
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
