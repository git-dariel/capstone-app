import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { InventoryService, type GetInventoryResponse } from "@/services/inventory.service";
import { calculateInventoryReminder, type InventoryReminderInfo } from "@/utils/inventoryReminder";

interface UseInventoryReminderState {
  inventory: GetInventoryResponse | null;
  reminderInfo: InventoryReminderInfo | null;
  loading: boolean;
  error: string | null;
  showReminder: boolean;
}

export const useInventoryReminder = () => {
  const { student } = useAuth();
  const [state, setState] = useState<UseInventoryReminderState>({
    inventory: null,
    reminderInfo: null,
    loading: true,
    error: null,
    showReminder: false,
  });

  const checkInventoryReminder = useCallback(async () => {
    if (!student?.id) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Student ID not found",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const inventory = await InventoryService.getInventoryByStudentId(student.id);

      if (!inventory) {
        setState((prev) => ({
          ...prev,
          inventory: null,
          reminderInfo: null,
          loading: false,
          showReminder: false,
        }));
        return;
      }

      const reminderInfo = calculateInventoryReminder(inventory);

      // Check if we should show the reminder
      // Only show if needs update and user hasn't dismissed it recently
      const lastDismissed = localStorage.getItem(`inventory-reminder-dismissed-${student.id}`);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const shouldShow =
        reminderInfo.needsUpdate && (!lastDismissed || parseInt(lastDismissed) < oneDayAgo);

      setState((prev) => ({
        ...prev,
        inventory,
        reminderInfo,
        loading: false,
        showReminder: shouldShow,
      }));
    } catch (err: any) {
      console.error("Error checking inventory reminder:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to check inventory reminder",
      }));
    }
  }, [student?.id]);

  const dismissReminder = useCallback(() => {
    if (student?.id) {
      localStorage.setItem(`inventory-reminder-dismissed-${student.id}`, Date.now().toString());
    }
    setState((prev) => ({ ...prev, showReminder: false }));
  }, [student?.id]);

  const forceShowReminder = useCallback(() => {
    setState((prev) => ({ ...prev, showReminder: true }));
  }, []);

  useEffect(() => {
    checkInventoryReminder();
  }, [checkInventoryReminder]);

  return {
    inventory: state.inventory,
    reminderInfo: state.reminderInfo,
    loading: state.loading,
    error: state.error,
    showReminder: state.showReminder,
    dismissReminder,
    forceShowReminder,
    refreshReminder: checkInventoryReminder,
  };
};
