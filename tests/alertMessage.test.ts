import { describe, expect, it } from "vitest";
import { formatAlertMessage } from "../src/alerts/alertMessage.js";

describe("formatAlertMessage", () => {
  it("renders conservative non-diagnostic wording", () => {
    const message = formatAlertMessage({
      alertType: "recovery_debt",
      severity: "medium",
      reasons: [
        { code: "recovery_1", message: "短い睡眠がみられます" },
        { code: "recovery_2", message: "HRV が普段より低めです" }
      ],
      suggestedActions: [
        "今日は回復を優先し、予定を詰め込みすぎないようにしてください。",
        "睡眠確保と服薬の継続を優先してください。"
      ],
      dataQualityNote: "今日は睡眠データが不足しているため、活動量と自己申告を中心に判断しています。"
    });

    expect(message).toContain("回復負債: 中");
    expect(message).toContain("提案:");
    expect(message).toContain("補足:");
  });
});
