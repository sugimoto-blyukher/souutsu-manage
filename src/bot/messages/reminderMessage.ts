export const buildMedicationReminderMessage = (medicationName: string): string =>
  `服薬リマインド: ${medicationName}\n\n[飲んだ] [後で] [スキップ]`;
