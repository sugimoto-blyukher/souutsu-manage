import type {
  BaselineSnapshot,
  GeneratedAlert,
  HealthSummaryInput,
  MoodLogInput
} from "./types.js";

const latestMoodByDate = (moodLogs: MoodLogInput[]): Map<string, MoodLogInput> =>
  new Map(moodLogs.map((log) => [log.date, log]));

const pushReason = (reasons: string[], condition: boolean, reason: string): void => {
  if (condition) {
    reasons.push(reason);
  }
};

export interface AlertEvaluationInput {
  baseline: BaselineSnapshot;
  recentHealth: HealthSummaryInput[];
  recentMood: MoodLogInput[];
  recentMedicationMisses: number;
}

export const evaluateAlertRules = ({
  baseline,
  recentHealth,
  recentMood,
  recentMedicationMisses
}: AlertEvaluationInput): GeneratedAlert[] => {
  const latestTwoDays = [...recentHealth].sort((left, right) => left.date.localeCompare(right.date)).slice(-2);
  const moodByDate = latestMoodByDate(recentMood);

  const shortSleepDays = latestTwoDays.filter((day) => {
    const threshold = baseline.sleepMinutes?.mean;
    return typeof day.sleepMinutes === "number" && typeof threshold === "number"
      ? day.sleepMinutes <= threshold - 120
      : false;
  });

  const highActivityDays = latestTwoDays.filter((day) => {
    const threshold = baseline.steps?.mean;
    return typeof day.steps === "number" && typeof threshold === "number"
      ? day.steps >= threshold * 1.3
      : false;
  });

  const highAgitationDays = latestTwoDays.filter((day) => {
    const mood = moodByDate.get(day.date);
    return typeof mood?.agitationScore === "number" ? mood.agitationScore >= 7 : false;
  });

  const lowStepsDays = latestTwoDays.filter((day) => {
    const threshold = baseline.steps?.mean;
    return typeof day.steps === "number" && typeof threshold === "number"
      ? day.steps <= threshold * 0.5
      : false;
  });

  const lowEnergyDays = latestTwoDays.filter((day) => {
    const mood = moodByDate.get(day.date);
    return typeof mood?.energyScore === "number" ? mood.energyScore <= 3 : false;
  });

  const lowMoodDays = latestTwoDays.filter((day) => {
    const mood = moodByDate.get(day.date);
    return typeof mood?.moodScore === "number" ? mood.moodScore <= 3 : false;
  });

  const recoveryReasons: string[] = [];
  pushReason(recoveryReasons, shortSleepDays.length >= 1, "短い睡眠がみられます");
  pushReason(
    recoveryReasons,
    latestTwoDays.some(
      (day) =>
        typeof day.restingHeartRate === "number" &&
        typeof baseline.restingHeartRate?.mean === "number" &&
        day.restingHeartRate >= baseline.restingHeartRate.mean + 5
    ),
    "安静時心拍数が普段より高めです"
  );
  pushReason(
    recoveryReasons,
    latestTwoDays.some(
      (day) =>
        typeof day.hrvRmssd === "number" &&
        typeof baseline.hrvRmssd?.mean === "number" &&
        day.hrvRmssd <= baseline.hrvRmssd.mean * 0.8
    ),
    "HRV が普段より低めです"
  );
  pushReason(recoveryReasons, recentMedicationMisses > 0, "服薬記録に抜けがあります");
  pushReason(
    recoveryReasons,
    highAgitationDays.length >= 1,
    "焦燥感の自己評価が高めです"
  );

  const alerts: GeneratedAlert[] = [];

  if (
    shortSleepDays.length >= 2 &&
    (highActivityDays.length >= 1 || highAgitationDays.length >= 1 || recentMedicationMisses > 0)
  ) {
    const severity = shortSleepDays.length >= 2 && highActivityDays.length >= 2 ? "high" : "medium";
    const dataQualityNote = latestTwoDays.some((day) => day.dataQuality !== "good")
      ? "今日は一部の健康データが不足しているため、自己申告も合わせて判断しています。"
      : undefined;
    alerts.push({
      alertType: "mania_risk",
      severity,
      reasons: [
        {
          code: "short_sleep",
          message: "睡眠時間がベースラインより2時間以上短い日が続いています"
        },
        ...(highActivityDays.length >= 1
          ? [{ code: "high_activity", message: "活動量が普段より高めです" }]
          : []),
        ...(highAgitationDays.length >= 1
          ? [{ code: "high_agitation", message: "焦燥感の自己評価が高めです" }]
          : []),
        ...(recentMedicationMisses > 0
          ? [{ code: "medication_miss", message: "服薬記録に抜けがあります" }]
          : [])
      ],
      suggestedActions: [
        "今日は予定を増やさず、服薬と睡眠確保を優先してください。",
        "必要なら主治医や支援者への共有を検討してください。"
      ],
      ...(dataQualityNote ? { dataQualityNote } : {})
    });
  }

  if (lowStepsDays.length >= 2 && lowEnergyDays.length >= 2) {
    alerts.push({
      alertType: "depression_risk",
      severity: lowMoodDays.length >= 1 ? "medium" : "low",
      reasons: [
        { code: "low_steps", message: "歩数がベースラインより大きく下がっています" },
        { code: "low_energy", message: "エネルギーの自己評価が低めです" },
        ...(lowMoodDays.length >= 1
          ? [{ code: "low_mood", message: "気分の自己評価が低めです" }]
          : []),
        ...(recentMedicationMisses > 0
          ? [{ code: "medication_miss", message: "服薬記録に抜けがあります" }]
          : [])
      ],
      suggestedActions: [
        "今日は負荷を増やしすぎず、休息と服薬記録の確認を優先してください。",
        "状態が続く場合は主治医や支援者への共有を検討してください。"
      ]
    });
  }

  if (recoveryReasons.length >= 2) {
    alerts.push({
      alertType: "recovery_debt",
      severity: recoveryReasons.length >= 4 ? "high" : "medium",
      reasons: recoveryReasons.map((message, index) => ({
        code: `recovery_${index + 1}`,
        message
      })),
      suggestedActions: [
        "今日は回復を優先し、予定を詰め込みすぎないようにしてください。",
        "睡眠確保と服薬の継続を優先してください。"
      ]
    });
  }

  if (latestTwoDays.every((day) => day.dataQuality !== "good")) {
    alerts.push({
      alertType: "data_quality",
      severity: "low",
      reasons: [
        {
          code: "insufficient_health_data",
          message: "最近の健康データが不足しているため、判定の確実性が下がっています"
        }
      ],
      suggestedActions: ["連携状態を確認し、必要なら `/sync` を実行してください。"]
    });
  }

  return alerts;
};
