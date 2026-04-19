export interface ReminderJob {
  medicationId: string;
  userId: string;
  reminderTime: string;
}

export const buildReminderJobKey = (job: ReminderJob): string =>
  `${job.userId}:${job.medicationId}:${job.reminderTime}`;
