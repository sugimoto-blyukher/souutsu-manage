import { describe, expect, it } from "vitest";
import { summarizeHealthDay } from "../src/health/summarizeHealthData.js";

describe("summarizeHealthDay", () => {
  it("marks sparse records as partial or missing without throwing", () => {
    expect(
      summarizeHealthDay({
        date: "2026-04-10",
        sleepMinutes: 420,
        steps: 5000,
        activeMinutes: null,
        restingHeartRate: null,
        hrvRmssd: null
      }).dataQuality
    ).toBe("partial");

    expect(
      summarizeHealthDay({
        date: "2026-04-11",
        sleepMinutes: null,
        steps: null,
        activeMinutes: null,
        restingHeartRate: null,
        hrvRmssd: null
      }).dataQuality
    ).toBe("missing");
  });
});
