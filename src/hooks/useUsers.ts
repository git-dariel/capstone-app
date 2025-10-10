import { useState, useCallback } from "react";
import { UserService } from "@/services";
import type { User } from "@/services";

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: {
    type?: "student" | "guidance";
    limit?: number;
    fields?: string;
    page?: number;
  }) => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (params?: {
      type?: "student" | "guidance";
      limit?: number;
      fields?: string;
      page?: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams: any = {};

        if (params?.type) {
          queryParams.type = params.type;
        }
        if (params?.limit) {
          queryParams.limit = params.limit;
        }
        if (params?.fields) {
          queryParams.fields = params.fields;
        }
        if (params?.page) {
          queryParams.page = params.page;
        }

        const response = await UserService.getAllUsers(queryParams);
        setUsers(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
        setError(errorMessage);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
};
