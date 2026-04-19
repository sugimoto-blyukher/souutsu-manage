import type { HealthSummaryInput } from "../alerts/types.js";

export interface RawHealthDay {
  date: string;
  sleepMinutes?: number | null;
  steps?: number | null;
  activeMinutes?: number | null;
  restingHeartRate?: number | null;
  hrvRmssd?: number | null;
}

export const summarizeHealthDay = (input: RawHealthDay): HealthSummaryInput => {
  const numericFields = [
    input.sleepMinutes,
    input.steps,
    input.activeMinutes,
    input.restingHeartRate,
    input.hrvRmssd
  ];
  const presentValues = numericFields.filter((value) => typeof value === "number").length;

  return {
    date: input.date,
    ...(typeof input.sleepMinutes === "number" ? { sleepMinutes: input.sleepMinutes } : {}),
    ...(typeof input.steps === "number" ? { steps: input.steps } : {}),
    ...(typeof input.activeMinutes === "number" ? { activeMinutes: input.activeMinutes } : {}),
    ...(typeof input.restingHeartRate === "number"
      ? { restingHeartRate: input.restingHeartRate }
      : {}),
    ...(typeof input.hrvRmssd === "number" ? { hrvRmssd: input.hrvRmssd } : {}),
    dataQuality: presentValues >= 4 ? "good" : presentValues >= 2 ? "partial" : "missing"
  };
};
