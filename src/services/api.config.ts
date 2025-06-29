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

// Token management (using httpOnly cookies)
export class TokenManager {
  private static readonly USER_KEY = "user_data";

  // Token is managed via httpOnly cookies, no localStorage needed
  static getUser(): any | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}

// HTTP Client utility
export class HttpClient {
  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const defaultHeaders = {
      ...API_CONFIG.headers,
    };

    const config: RequestInit = {
      ...options,
      credentials: "include", // Include cookies in requests
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  static async get<T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : "";
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, {
      method: "GET",
    });
  }

  static async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}
