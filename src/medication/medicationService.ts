export type MedicationLogStatus = "taken" | "skipped" | "delayed" | "missed";
export type ReminderAction = "take" | "delay" | "skip" | "expire";

const transitions: Record<MedicationLogStatus, Partial<Record<ReminderAction, MedicationLogStatus>>> = {
  taken: {},
  skipped: {},
  delayed: {
    take: "taken",
    skip: "skipped",
    expire: "missed"
  },
  missed: {}
};

const defaultTransitions: Partial<Record<ReminderAction, MedicationLogStatus>> = {
  take: "taken",
  delay: "delayed",
  skip: "skipped",
  expire: "missed"
};

export const nextMedicationStatus = (
  current: MedicationLogStatus | undefined,
  action: ReminderAction
): MedicationLogStatus => {
  if (!current) {
    const next = defaultTransitions[action];
    if (!next) {
      throw new Error(`Unsupported reminder action: ${action}`);
    }

    return next;
  }

  const next = transitions[current][action];
  if (!next) {
    throw new Error(`Invalid medication reminder transition: ${current} -> ${action}`);
  }

  return next;
};

export const formatMedicationResponse = (status: MedicationLogStatus): string => {
  switch (status) {
    case "taken":
      return "服薬を記録しました。";
    case "delayed":
      return "あとで確認するように記録しました。";
    case "skipped":
      return "スキップとして記録しました。服薬内容の変更は主治医に相談してください。";
    case "missed":
      return "未記録のまま時間を過ぎたため、未対応として記録しました。";
  }
};
