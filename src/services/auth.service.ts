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
  person: User["person"];
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

      // The backend response structure is direct, not wrapped in data
      const authData = response as unknown as AuthResponse;

      if (authData && authData.user) {
        // Backend sets token as httpOnly cookie, not in response body
        // We'll rely on the cookie for authentication
        TokenManager.setUser(authData.user);

        return authData;
      }

      throw new Error("Login failed");
    } catch (error) {
      throw error;
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>("/auth/register", userData);

      // The backend response structure is direct, not wrapped in data
      const authData = response as unknown as AuthResponse;

      if (authData && authData.user) {
        // Backend sets token as httpOnly cookie, not in response body
        // We'll rely on the cookie for authentication
        TokenManager.setUser(authData.user);

        return authData;
      }

      throw new Error("Registration failed");
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      // Clear user data from localStorage
      // Note: httpOnly cookie will expire naturally (24h expiry set by backend)
      TokenManager.removeUser();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user data even if error occurs
      TokenManager.removeUser();
    }
  }

  static getCurrentUser(): User | null {
    return TokenManager.getUser();
  }

  static isAuthenticated(): boolean {
    const user = TokenManager.getUser();
    return !!user;
  }
}
