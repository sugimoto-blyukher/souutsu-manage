import { describe, expect, it } from "vitest";
import { buildBaselineSnapshot } from "../src/alerts/baselineService.js";

describe("buildBaselineSnapshot", () => {
  it("excludes non-good health days from baselines", () => {
    const baseline = buildBaselineSnapshot(
      [
        { date: "2026-04-01", sleepMinutes: 420, steps: 5000, dataQuality: "good" },
        { date: "2026-04-02", sleepMinutes: 450, steps: 6500, dataQuality: "good" },
        { date: "2026-04-03", sleepMinutes: 999, steps: 20000, dataQuality: "missing" }
      ],
      [
        {
          date: "2026-04-01",
          moodScore: 6,
          energyScore: 5,
          agitationScore: 3,
          anxietyScore: 4
        }
      ]
    );

    expect(baseline.sleepMinutes?.mean).toBe(435);
    expect(baseline.steps?.mean).toBe(5750);
    expect(baseline.sleepMinutes?.sampleSize).toBe(2);
  });
});
