import type { GoogleHealthClient } from "./googleHealthClient.js";
import { summarizeHealthDay } from "./summarizeHealthData.js";

export const syncHealthData = async (
  client: GoogleHealthClient,
  accessToken: string,
  startDate: string,
  endDate: string
) => {
  const dataset = await client.fetchDailySummaries(accessToken, startDate, endDate);
  return dataset.daily.map((item) => summarizeHealthDay(item));
};
