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

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  type: string;
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
  user: User;
  student?: Student;
  token?: string;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>("/auth/login", credentials);

      // The API returns the response directly, not wrapped in data property
      const authData = response as unknown as AuthResponse;

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

      // Validate that we have a user object at minimum
      if (!authData.user || !authData.user.id) {
        throw new Error("Invalid user data in response");
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

  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    // Check if user exists and has an ID - token might be optional if using cookies
    return !!(user && user.id);
  }
}
