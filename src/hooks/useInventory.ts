import { useState, useCallback } from "react";
import {
  InventoryService,
  type GetInventoryResponse,
  type GetAllInventoriesResponse,
  type InventoryFilters,
} from "@/services/inventory.service";

interface UseInventoryState {
  inventories: GetInventoryResponse[];
  totalInventories: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export const useInventory = () => {
  const [state, setState] = useState<UseInventoryState>({
    inventories: [],
    totalInventories: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const fetchInventories = useCallback(async (filters: InventoryFilters = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: GetAllInventoriesResponse = await InventoryService.getAllInventories(filters);
      setState((prev) => ({
        ...prev,
        inventories: response.inventories,
        totalInventories: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        loading: false,
      }));
      return response;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch inventories",
      }));
      throw error;
    }
  }, []);

  const getInventoryByStudentId = useCallback(async (studentId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const inventory = await InventoryService.getInventoryByStudentId(studentId);
      setState((prev) => ({ ...prev, loading: false }));
      return inventory;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch inventory",
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    inventories: state.inventories,
    totalInventories: state.totalInventories,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    fetchInventories,
    getInventoryByStudentId,
    clearError,
  };
};
