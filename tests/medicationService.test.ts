import { describe, expect, it } from "vitest";
import { formatMedicationResponse, nextMedicationStatus } from "../src/medication/medicationService.js";

describe("nextMedicationStatus", () => {
  it("supports reminder state transitions", () => {
    expect(nextMedicationStatus(undefined, "take")).toBe("taken");
    expect(nextMedicationStatus(undefined, "delay")).toBe("delayed");
    expect(nextMedicationStatus("delayed", "take")).toBe("taken");
    expect(nextMedicationStatus("delayed", "skip")).toBe("skipped");
    expect(nextMedicationStatus("delayed", "expire")).toBe("missed");
  });

  it("returns safe skip language", () => {
    expect(formatMedicationResponse("skipped")).toContain("主治医に相談");
    expect(formatMedicationResponse("skipped")).not.toContain("危険");
  });
});
