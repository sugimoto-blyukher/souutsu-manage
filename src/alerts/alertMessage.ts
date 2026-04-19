import type { GeneratedAlert } from "./types.js";

const severityLabel: Record<GeneratedAlert["severity"], string> = {
  none: "なし",
  low: "低",
  medium: "中",
  high: "高"
};

const alertTitle: Record<GeneratedAlert["alertType"], string> = {
  mania_risk: "躁転警戒",
  depression_risk: "落ち込み警戒",
  recovery_debt: "回復負債",
  medication_adherence: "服薬継続",
  data_quality: "データ品質"
};

export const formatAlertMessage = (alert: GeneratedAlert): string => {
  const lines = [
    `${alertTitle[alert.alertType]}: ${severityLabel[alert.severity]}`,
    "",
    "理由:",
    ...alert.reasons.map((reason) => `- ${reason.message}`),
    "",
    "提案:",
    ...alert.suggestedActions.map((action) => `- ${action}`)
  ];

  if (alert.dataQualityNote) {
    lines.push("", `補足: ${alert.dataQualityNote}`);
  }

  return lines.join("\n");
};
