import type { BaselineSnapshot, HealthSummaryInput, MetricBaseline, MoodLogInput } from "./types.js";

const calculateMetricBaseline = (values: number[]): MetricBaseline | undefined => {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const middleIndex = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? ((sorted[middleIndex - 1] ?? 0) + (sorted[middleIndex] ?? 0)) / 2
      : (sorted[middleIndex] ?? 0);
  const variance =
    sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(sorted.length - 1, 1);

  return {
    mean,
    median,
    stddev: Math.sqrt(variance),
    sampleSize: sorted.length
  };
};

const collectMetric = <T>(items: T[], selector: (value: T) => number | undefined): number[] =>
  items.flatMap((item) => {
    const value = selector(item);
    return typeof value === "number" ? [value] : [];
  });

export const buildBaselineSnapshot = (
  healthSummaries: HealthSummaryInput[],
  moodLogs: MoodLogInput[]
): BaselineSnapshot => {
  const validHealth = healthSummaries.filter((summary) => summary.dataQuality === "good");
  const sleepMinutes = calculateMetricBaseline(collectMetric(validHealth, (item) => item.sleepMinutes));
  const steps = calculateMetricBaseline(collectMetric(validHealth, (item) => item.steps));
  const restingHeartRate = calculateMetricBaseline(
    collectMetric(validHealth, (item) => item.restingHeartRate)
  );
  const hrvRmssd = calculateMetricBaseline(collectMetric(validHealth, (item) => item.hrvRmssd));
  const moodScore = calculateMetricBaseline(collectMetric(moodLogs, (item) => item.moodScore));
  const energyScore = calculateMetricBaseline(collectMetric(moodLogs, (item) => item.energyScore));
  const agitationScore = calculateMetricBaseline(
    collectMetric(moodLogs, (item) => item.agitationScore)
  );

  return {
    ...(sleepMinutes ? { sleepMinutes } : {}),
    ...(steps ? { steps } : {}),
    ...(restingHeartRate ? { restingHeartRate } : {}),
    ...(hrvRmssd ? { hrvRmssd } : {}),
    ...(moodScore ? { moodScore } : {}),
    ...(energyScore ? { energyScore } : {}),
    ...(agitationScore ? { agitationScore } : {})
  };
};
