export type AlertSeverity = "none" | "low" | "medium" | "high";
export type AlertType =
  | "mania_risk"
  | "depression_risk"
  | "recovery_debt"
  | "medication_adherence"
  | "data_quality";
export type DataQuality = "good" | "partial" | "missing" | "stale";

export interface HealthSummaryInput {
  date: string;
  sleepMinutes?: number;
  steps?: number;
  activeMinutes?: number;
  restingHeartRate?: number;
  hrvRmssd?: number;
  dataQuality: DataQuality;
}

export interface MoodLogInput {
  date: string;
  moodScore: number;
  energyScore: number;
  agitationScore: number;
  anxietyScore: number;
}

export interface MetricBaseline {
  mean: number;
  median: number;
  stddev: number;
  sampleSize: number;
}

export interface BaselineSnapshot {
  sleepMinutes?: MetricBaseline;
  steps?: MetricBaseline;
  restingHeartRate?: MetricBaseline;
  hrvRmssd?: MetricBaseline;
  moodScore?: MetricBaseline;
  energyScore?: MetricBaseline;
  agitationScore?: MetricBaseline;
}

export interface AlertReason {
  code: string;
  message: string;
}

export interface GeneratedAlert {
  alertType: AlertType;
  severity: AlertSeverity;
  reasons: AlertReason[];
  suggestedActions: string[];
  dataQualityNote?: string;
}
