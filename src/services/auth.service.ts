import { HttpClient, TokenManager } from "./api.config";

export interface LoginRequest {
  email: string;
  password: string;
  type: "student" | "guidance";
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: string;
  address?: {
    street?: string;
    city?: string;
    houseNo?: string;
    province?: string;
    barangay?: string;
    zipCode?: string;
    country?: string;
    type?: string;
  };
  guardian?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    contactNumber?: string;
    relationship?: string;
    address?: {
      street?: string;
      city?: string;
      houseNo?: string;
      province?: string;
      barangay?: string;
      zipCode?: string;
      country?: string;
      type?: string;
    };
  };
  role?: "user" | "admin";
  type?: "student" | "employee";
  studentNumber?: string;
  program?: string;
  year?: string;
}

export interface FirstYearRegisterRequest {
  email: string;
  password: string;
  userName?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  age?: number;
  religion?: string;
  civilStatus?: string;
  address?: {
    street?: string;
    city?: string;
    houseNo?: string;
    province?: string;
    barangay?: string;
    zipCode?: string;
    country?: string;
    type?: string;
  };
  guardian?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    contactNumber?: string;
    relationship?: string;
    address?: {
      street?: string;
      city?: string;
      houseNo?: string;
      province?: string;
      barangay?: string;
      zipCode?: string;
      country?: string;
      type?: string;
    };
  };
  role?: "user" | "admin";
  type?: "student" | "employee";
  studentNumber?: string;
  program?: string;
  year?: string;
}

export interface RegisterAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  contactNumber?: string;
  gender?: string;
}

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  type: string;
  avatar?: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    contactNumber?: string;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
    age?: number;
    religion?: string;
    civilStatus?: string;
  };
}

export interface Student {
  id: string;
  studentNumber: string;
  program: string;
  year: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user?: User; // Made optional since it won't be present during initial registration
  student?: Student;
  token?: string;
  emailVerificationRequired?: boolean;
  otpSent?: boolean;
  isPendingRegistration?: boolean; // Flag to indicate this is a pending registration
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface VerifyEmailResponse {
  message: string;
  // Backend may return either of these flags
  verified?: boolean;
  emailVerified?: boolean;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>("/auth/login", credentials);

      // The API returns the response directly, not wrapped in data property
      const authData = response as unknown as AuthResponse;

      // If email verification is required, DO NOT persist auth yet
      if (authData.emailVerificationRequired) {
        // Ensure we don't store any user/token while waiting for OTP verification
        TokenManager.removeUser();
        return authData;
      }

      // Validate that we have a user object at minimum
      if (!authData.user || !authData.user.id) {
        throw new Error("Invalid user data in response");
      }

      // Store the token if it exists (might be optional if using cookies)
      if (authData.token) {
        TokenManager.setToken(authData.token);
      }

      // Store user data
      TokenManager.setUser(authData.user);

      // Store student data if it exists
      if (authData.student) {
        TokenManager.setStudent(authData.student);
      }

      return authData;
    } catch (error: any) {
      // Clear any existing auth data on error
      TokenManager.removeUser();
      throw error;
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>("/auth/register", userData);

      // The API returns the response directly, not wrapped in data property
      const authData = response as unknown as AuthResponse;

      // For new pending registration flow, we don't expect user data in the response
      // The response will only have emailVerificationRequired and otpSent flags
      if (authData.emailVerificationRequired) {
        // This is the new flow - pending registration created, OTP sent
        console.log("Registration initiated successfully. OTP verification required.");
        return authData;
      }

      // Fallback validation for old flow (if emailVerificationRequired is not set)
      if (!authData.user || !authData.user.id) {
        throw new Error("Invalid registration response");
      }

      // DON'T store any auth data during registration
      // User will need to sign in after registration
      console.log("Registration successful, but not storing auth data. User needs to sign in.");

      return authData;
    } catch (error: any) {
      // Clear any existing auth data on error
      TokenManager.removeUser();
      throw error;
    }
  }

  static async registerAdmin(userData: RegisterAdminRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>("/auth/register-admin", userData);

      // The API returns the response directly, not wrapped in data property
      const authData = response as unknown as AuthResponse;

      // Validate that we have a user object at minimum
      if (!authData.user || !authData.user.id) {
        throw new Error("Invalid user data in response");
      }

      // DON'T store any auth data during admin registration
      // Admin registration is done by existing admin users
      console.log("Admin registration successful");

      return authData;
    } catch (error: any) {
      throw error;
    }
  }

  static async registerFirstYearStudent(userData: FirstYearRegisterRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>("/auth/register-regular-email", userData);

      // The API returns the response directly, not wrapped in data property
      const authData = response as unknown as AuthResponse;

      // For new pending registration flow, we don't expect user data in the response
      // The response will only have emailVerificationRequired and otpSent flags
      if (authData.emailVerificationRequired) {
        // This is the new flow - pending registration created, OTP sent
        console.log("First-year student registration successful. OTP sent to email for verification.");
      }

      // Fallback validation for old flow (if emailVerificationRequired is not set)
      if (!authData.user || !authData.user.id) {
        // If we got here, assume it's the new flow and that's OK
        if (!authData.emailVerificationRequired) {
          throw new Error("Invalid response from registration");
        }
      }

      // DON'T store any auth data during registration
      // User will need to sign in after registration
      console.log(
        "First-year student registration successful, but not storing auth data. User needs to verify email and sign in."
      );

      return authData;
    } catch (error: any) {
      // Clear any existing auth data on error
      TokenManager.removeUser();
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      // Call the logout endpoint
      await HttpClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      TokenManager.removeUser();
    }
  }

  static getCurrentUser(): User | null {
    return TokenManager.getUser();
  }

  static getCurrentStudent(): Student | null {
    return TokenManager.getStudent();
  }

  static async verifyEmail(verificationData: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    try {
      const response = await HttpClient.post<VerifyEmailResponse>("/auth/verify-email", verificationData);
      return response as unknown as VerifyEmailResponse;
    } catch (error: any) {
      throw error;
    }
  }

  static async resendOTP(resendData: ResendOTPRequest): Promise<{ message: string; otpSent: boolean }> {
    try {
      const response = await HttpClient.post<{ message: string; otpSent: boolean }>("/auth/resend-otp", resendData);
      return response as unknown as { message: string; otpSent: boolean };
    } catch (error: any) {
      throw error;
    }
  }

  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    // Check if user exists and has an ID - token might be optional if using cookies
    return !!(user && user.id);
  }
}
