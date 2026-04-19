import { z } from "zod";

export const moodLogSchema = z.object({
  date: z.string().min(1),
  moodScore: z.number().int().min(0).max(10),
  energyScore: z.number().int().min(0).max(10),
  agitationScore: z.number().int().min(0).max(10),
  anxietyScore: z.number().int().min(0).max(10),
  note: z.string().max(2000).optional()
});

export type MoodLogSubmission = z.infer<typeof moodLogSchema>;
