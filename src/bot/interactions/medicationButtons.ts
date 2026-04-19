import { formatMedicationResponse, nextMedicationStatus, type ReminderAction } from "../../medication/medicationService.js";

export const handleMedicationButton = (
  currentStatus: "taken" | "skipped" | "delayed" | "missed" | undefined,
  action: ReminderAction
): { nextStatus: "taken" | "skipped" | "delayed" | "missed"; response: string } => {
  const nextStatus = nextMedicationStatus(currentStatus, action);
  return {
    nextStatus,
    response: formatMedicationResponse(nextStatus)
  };
};
