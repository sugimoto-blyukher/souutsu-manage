export const buildDailyCheckInPrompt = (): string =>
  ["今日の簡易チェック:", "気分 0-10", "エネルギー 0-10", "焦燥感 0-10", "不安 0-10"].join(
    "\n"
  );
