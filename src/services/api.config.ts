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
  private static readonly TOKEN_KEY = "auth_token";

  static getUser(): any | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  static setUser(user: any): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
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

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        // Clear user data and token
        TokenManager.removeUser();

        // Only redirect if we're not already on the signin page
        if (!window.location.pathname.includes("/signin")) {
          window.location.href = "/signin";
        }
        throw new Error("Unauthorized - Please log in again");
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "API request failed");
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
