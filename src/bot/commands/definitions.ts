export interface SlashCommandDefinition {
  name: string;
  description: string;
}

export const slashCommandDefinitions: SlashCommandDefinition[] = [
  { name: "setup", description: "初期セットアップを開始します" },
  { name: "med-add", description: "服薬設定を追加します" },
  { name: "med-list", description: "服薬設定の一覧を表示します" },
  { name: "med-disable", description: "服薬設定を停止します" },
  { name: "med-log", description: "服薬記録を手動で登録します" },
  { name: "mood", description: "日次の自己申告を記録します" },
  { name: "status", description: "最新の状態を表示します" },
  { name: "report", description: "週次サマリーを表示します" },
  { name: "privacy", description: "データ利用と削除方法を表示します" },
  { name: "help", description: "使い方を表示します" }
];
