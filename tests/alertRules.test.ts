import { describe, expect, it } from "vitest";
import { evaluateAlertRules } from "../src/alerts/alertRules.js";
import { formatAlertMessage } from "../src/alerts/alertMessage.js";
import type { BaselineSnapshot } from "../src/alerts/types.js";

const baseline: BaselineSnapshot = {
  sleepMinutes: { mean: 480, median: 480, stddev: 30, sampleSize: 20 },
  steps: { mean: 6000, median: 5900, stddev: 1000, sampleSize: 20 },
  restingHeartRate: { mean: 58, median: 58, stddev: 4, sampleSize: 20 },
  hrvRmssd: { mean: 40, median: 39, stddev: 8, sampleSize: 20 }
};

describe("evaluateAlertRules", () => {
  it("creates a mania risk alert from short sleep and high activity", () => {
    const alerts = evaluateAlertRules({
      baseline,
      recentHealth: [
        {
          date: "2026-04-10",
          sleepMinutes: 330,
          steps: 8200,
          restingHeartRate: 66,
          hrvRmssd: 28,
          dataQuality: "good"
        },
        {
          date: "2026-04-11",
          sleepMinutes: 340,
          steps: 8500,
          restingHeartRate: 65,
          hrvRmssd: 29,
          dataQuality: "good"
        }
      ],
      recentMood: [
        {
          date: "2026-04-10",
          moodScore: 7,
          energyScore: 8,
          agitationScore: 8,
          anxietyScore: 3
        },
        {
          date: "2026-04-11",
          moodScore: 7,
          energyScore: 8,
          agitationScore: 7,
          anxietyScore: 3
        }
      ],
      recentMedicationMisses: 1
    });

    const maniaAlert = alerts.find((alert) => alert.alertType === "mania_risk");
    expect(maniaAlert?.severity).toBe("high");
    expect(maniaAlert?.reasons.map((reason) => reason.code)).toContain("short_sleep");
  });

  it("creates a depression risk alert from low steps and low energy", () => {
    const alerts = evaluateAlertRules({
      baseline,
      recentHealth: [
        { date: "2026-04-10", steps: 2500, sleepMinutes: 560, dataQuality: "good" },
        { date: "2026-04-11", steps: 2200, sleepMinutes: 580, dataQuality: "good" }
      ],
      recentMood: [
        {
          date: "2026-04-10",
          moodScore: 3,
          energyScore: 2,
          agitationScore: 2,
          anxietyScore: 5
        },
        {
          date: "2026-04-11",
          moodScore: 2,
          energyScore: 3,
          agitationScore: 2,
          anxietyScore: 5
        }
      ],
      recentMedicationMisses: 0
    });

    const depressionAlert = alerts.find((alert) => alert.alertType === "depression_risk");
    expect(depressionAlert?.severity).toBe("medium");
  });
});

describe("formatAlertMessage", () => {
  it("does not include diagnostic or medication change language", () => {
    const message = formatAlertMessage({
      alertType: "mania_risk",
      severity: "medium",
      reasons: [{ code: "short_sleep", message: "睡眠時間が短い状態が続いています" }],
      suggestedActions: ["睡眠確保を優先してください。"]
    });

    expect(message).not.toContain("躁状態です");
    expect(message).not.toContain("うつ状態です");
    expect(message).not.toContain("診断");
    expect(message).not.toContain("薬を増やす");
    expect(message).not.toContain("薬をやめる");
  });
});
