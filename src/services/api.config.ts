// Dynamic API configuration based on environment
const getBaseURL = (): string => {
  // Check if we're running in development (localhost)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // If running on localhost, use local API
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      return "http://localhost:5000/api";
    }
  }

  // For all other environments (production, staging, etc.), use Heroku
  return "https://mental-health-dev-796aa66da7d5.herokuapp.com/api";
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  select?: string;
  sort?: string;
  populate?: string;
  fields?: string;
  query?: string;
  order?: "asc" | "desc";
}

// Token management
export class TokenManager {
  private static readonly USER_KEY = "user_data";
  private static readonly STUDENT_KEY = "student_data";
  private static readonly TOKEN_KEY = "auth_token";

  private static isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getUser(): any | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear corrupted data
      this.removeUser();
      return null;
    }
  }

  static setUser(user: any): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage not available, user data not persisted");
      return;
    }

    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  }

  static removeUser(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.STUDENT_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  }

  static getStudent(): any | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const studentData = localStorage.getItem(this.STUDENT_KEY);
      return studentData ? JSON.parse(studentData) : null;
    } catch (error) {
      console.error("Error parsing student data:", error);
      // Clear corrupted data
      localStorage.removeItem(this.STUDENT_KEY);
      return null;
    }
  }

  static setStudent(student: any): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage not available, student data not persisted");
      return;
    }

    try {
      localStorage.setItem(this.STUDENT_KEY, JSON.stringify(student));
    } catch (error) {
      console.error("Error storing student data:", error);
    }
  }

  static getToken(): string | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  static setToken(token: string): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage not available, token not persisted");
      return;
    }

    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  }
}

// HTTP Client utility
export class HttpClient {
  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = TokenManager.getToken();

    // Prepare headers with authentication
    const headers = new Headers({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include cookies in requests
      });

      // Handle 401 Unauthorized - clear auth data but don't redirect
      if (response.status === 401) {
        // Clear user data and token
        TokenManager.removeUser();

        // Don't redirect automatically - let the component handle the error
        throw new Error("Unauthorized - Please log in again");
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      // Return the response data directly
      return response.json();
    } catch (error: any) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  static async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
    const queryString = params ? new URLSearchParams(params as any).toString() : "";
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, {
      method: "GET",
    });
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}
