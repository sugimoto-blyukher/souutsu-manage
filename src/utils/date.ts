export const startOfDayUtc = (value: Date): Date => {
  const next = new Date(value);
  next.setUTCHours(0, 0, 0, 0);
  return next;
};

export const subtractDays = (value: Date, days: number): Date => {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
};
