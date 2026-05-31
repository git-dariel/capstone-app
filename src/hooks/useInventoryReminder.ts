import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { InventoryService } from "@/services/inventory.service";
import { type InventoryReminderInfo } from "@/utils/inventoryReminder";

interface UseInventoryReminderState {
  reminderInfo: InventoryReminderInfo | null;
  message: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  timeRemaining: string | null;
  loading: boolean;
  error: string | null;
  showReminder: boolean;
}

export const useInventoryReminder = () => {
  const { student } = useAuth();
  const [state, setState] = useState<UseInventoryReminderState>({
    reminderInfo: null,
    message: null,
    severity: null,
    timeRemaining: null,
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

      // Fetch reminder information from API
      const reminderData = await InventoryService.getReminderInfo(student.id);

      // Check if we should show the reminder
      // Only show if needs update and user hasn't dismissed it recently
      const lastDismissed = localStorage.getItem(
        `inventory-reminder-dismissed-${student.id}`,
      );
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const shouldShow =
        reminderData.reminderInfo.needsUpdate &&
        (!lastDismissed || parseInt(lastDismissed) < oneDayAgo);

      setState((prev) => ({
        ...prev,
        reminderInfo: reminderData.reminderInfo,
        message: reminderData.message,
        severity: reminderData.severity,
        timeRemaining: reminderData.timeRemaining,
        loading: false,
        showReminder: shouldShow,
      }));
    } catch (err: unknown) {
      // If student doesn't have inventory yet, don't treat as error
      if (err instanceof Error && err.message?.includes("not found")) {
        setState((prev) => ({
          ...prev,
          reminderInfo: null,
          message: null,
          severity: null,
          timeRemaining: null,
          loading: false,
          showReminder: false,
        }));
        return;
      }

      console.error("Error checking inventory reminder:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to check inventory reminder",
      }));
    }
  }, [student?.id]);

  const dismissReminder = useCallback(() => {
    if (student?.id) {
      localStorage.setItem(
        `inventory-reminder-dismissed-${student.id}`,
        Date.now().toString(),
      );
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
    reminderInfo: state.reminderInfo,
    message: state.message,
    severity: state.severity,
    timeRemaining: state.timeRemaining,
    loading: state.loading,
    error: state.error,
    showReminder: state.showReminder,
    dismissReminder,
    forceShowReminder,
    refreshReminder: checkInventoryReminder,
  };
};
