import type { AlertSeverity } from "../../alerts/types.js";

export interface StatusMessageInput {
  lastMedicationStatus: string;
  lastMoodDate?: string;
  latestSleepMinutes?: number;
  latestSteps?: number;
  alertSeverity: AlertSeverity;
  dataFreshness: string;
}

export const buildStatusMessage = (input: StatusMessageInput): string => [
  "現在の状況",
  `- 最新の服薬状況: ${input.lastMedicationStatus}`,
  `- 最後の気分ログ: ${input.lastMoodDate ?? "未記録"}`,
  `- 最新の睡眠 / 活動: ${
    typeof input.latestSleepMinutes === "number" || typeof input.latestSteps === "number"
      ? `${input.latestSleepMinutes ?? "?"}分 / ${input.latestSteps ?? "?"}歩`
      : "未取得"
  }`,
  `- 現在の警告レベル: ${input.alertSeverity}`,
  `- データ鮮度: ${input.dataFreshness}`
].join("\n");
