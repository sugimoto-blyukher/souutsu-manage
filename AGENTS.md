# AGENTS.md

## プロジェクト概要

このプロジェクトは、双極性障害の当事者向けのセルフモニタリングおよび早期警戒支援アプリケーションである。

このアプリは以下のデータを扱う。

- Pixel Watch / Fitbit / Google Health API 由来のウェアラブル健康データ
- 服薬記録
- 簡易的な気分・エネルギーの自己申告ログ
- 任意の日次メモ

主な操作インターフェースは `discord.js` で実装された Discord Bot とする。

このアプリの目的は、双極性障害を診断することでも、ユーザーが躁状態・軽躁状態・うつ状態であると断定することでもない。

目的は、ユーザー本人の通常状態からのズレを検知し、説明可能で保守的な警告を出すことである。

表現方針は以下の通り。

良い例:

- 「躁転警戒が高まっています」
- 「普段と比べて睡眠が短く、活動量が増えています」

悪い例:

- 「あなたは躁状態です」
- 「今日の精神状態は83点です」
- 「このスコアなら安全です」

このアプリはセルフモニタリング支援ツールであり、医療機器、診断システム、緊急対応システムではない。

---

## 中核となるプロダクト原則

このアプリでは、賢さよりも、安全性・プライバシー・説明可能性を優先する。

ブラックボックスな気分判定器を作ってはいけない。
単一のセンサーに過度に依存してはいけない。
不確実なデータを医学的確実性のように表示してはいけない。

すべての警告は、以下に答えられる必要がある。

1. 何が変化したのか
2. 何と比較して変化したのか
3. なぜ注意が必要なのか
4. ユーザーが検討できる低リスクな行動は何か

例:

> 過去30日のあなたの平均と比べて、睡眠時間が2日連続で2時間以上短く、活動量も高くなっています。躁転前のパターンに近い可能性があるため、今日は予定を増やさず、服薬と睡眠確保を優先してください。

---

## 非目標

以下は実装しない。

- 医学的診断
- 自動的な疾患分類
- 「躁状態 / うつ状態 / 正常」といった断定的ラベル
- 精神科的緊急介入
- 家族・友人・支援者へのデフォルト自動通知
- 公開 Discord チャンネルへの健康状態投稿
- メンタルヘルスのゲーム的スコア化
- ユーザー同士のランキングや比較
- 服薬内容の変更提案
- 服薬中止の提案
- 根拠のない臨床的主張

自殺リスク、重度の悪化、服薬変更、緊急対応に関わる機能は、保守的な記録とユーザー向け案内のみに留める。

例:

> 緊急性がある場合は、地域の救急窓口、主治医、支援者に連絡してください。

専門的治療の代替を試みてはいけない。

---

## MVP スコープ

MVP は以下の4機能を中心に構築する。

1. Discord ベースの服薬リマインダー
2. Discord ベースの日次自己申告
3. Google Health API からのデータ取得
4. 個人ベースラインに基づく警告生成

### MVP のユーザーフロー

1. ユーザーが最小限の Web セットアップ画面で登録する
2. Google アカウント / Health API を連携する
3. Discord アカウントを連携する
4. 服薬内容とリマインド時刻を設定する
5. Bot が DM で服薬リマインドを送る
6. ユーザーが「飲んだ」「後で」「スキップ」を押す
7. Bot が短い日次気分チェックを行う
8. Backend が定期的に健康データを取得する
9. システムが直近データを本人のベースラインと比較する
10. リスクパターンがある場合、Bot が保守的な警告を送る

---

## 推奨技術スタック

ユーザーが明示的に変更しない限り、以下の構成を採用する。

### Runtime

- Node.js 22.12.0 以上
- TypeScript
- pnpm

### Bot

- discord.js
- Discord Slash Commands
- Discord Buttons / Select Menus / Modals
- DM 優先の通知設計

### Backend

MVP では単一の TypeScript サービスを優先する。

推奨:

- Node.js
- Fastify または Hono
- Prisma または Drizzle
- PostgreSQL
- Zod
- pino
- BullMQ または単純な cron worker

MVP の段階では、やむを得ない理由がない限りマイクロサービス化しない。

### Database

PostgreSQL を使用する。

本番に近い健康データ管理では SQLite は避ける。
理由は、マイグレーション、並行処理、ホスティング環境で後から面倒になりやすいため。

### 外部 API

Pixel Watch / Fitbit データの主要取得経路は Google Health API とする。

以下は避ける。

- Pixel Watch の生センサーへ直接アクセスできる前提で設計すること
- 明示的な要求なしに Wear OS アプリを作ること
- Google Fit API を新規の主要連携先にすること
- Google Health API が使えない場合を除き、Fitbit Web API を新規の主要連携先にすること

---

## データソース

### ウェアラブルデータ

まず対象にするデータ群:

- 睡眠時間
- 入眠時刻
- 起床時刻
- 睡眠セッション
- 歩数
- 活動量
- 心拍数
- 日次安静時心拍数
- 日次 HRV
- Active Zone Minutes

後から追加してよいもの:

- SpO2
- 皮膚温変化
- 呼吸数
- 運動セッション

MVP では血圧を使わない。
Pixel Watch が信頼できる直接的な血圧データを提供すると仮定してはいけない。

### 自己申告データ

自己申告は必須である。

日次で以下の短い入力を収集する。

- 気分: 0〜10
- エネルギー: 0〜10
- 焦燥感 / イライラ: 0〜10
- 不安: 0〜10
- 服薬したか: yes / no / skip
- カフェイン量: 任意
- アルコール: 任意
- 自由記述メモ: 任意

希死念慮などの高感度項目について:

- MVP ではデフォルトで収集しない
- 将来追加する場合は、非公開・暗号化・Discord に生データを投稿しない設計にする
- 危機対応として安全な表現のみを使用する

---

## 安全性ルール

### 医療安全

以下の文言を生成してはいけない。

- 「あなたは躁状態です」
- 「あなたはうつ状態です」
- 「あなたは安全です」
- 「治療は不要です」
- 「薬を変更してください」
- 「薬をやめてください」
- 「薬を増やしてください」
- 「薬を減らしてください」

以下のような慎重な表現を使う。

- 「可能性があります」
- 「傾向があります」
- 「警戒が高まっています」
- 「主治医や支援者への共有を検討してください」
- 「服薬内容の変更は主治医に相談してください」

### 警告レベル

警告レベルは以下を使う。

- none
- low
- medium
- high

MVP では、人間による確認済みのエスカレーション設計がない限り `critical` は使わない。

### 警告の送信先

デフォルト:

- ユーザー本人への Discord DM のみ

任意機能:

- 信頼できる支援者への通知は、明示的な opt-in 後のみ
- 支援者には生ログではなく要約された警告だけを送る

絶対に行わないこと:

- 健康警告を公開 Discord チャンネルに投稿する
- 明示的同意なしに支援者へ通知する
- 服薬名を公開する

---

## プライバシールール

健康データは高感度情報である。

行うこと:

- 健康データは Discord ではなくデータベースに保存する
- Discord メッセージは短くする
- Discord 通知には生の医療詳細を書きすぎない
- OAuth refresh token は暗号化して保存する
- 生データの保持を最小化する
- データ削除機能を用意する
- ログには運用上必要なメタデータのみ残す
- token や個人の健康データはログから除外する

行ってはいけないこと:

- OAuth token をログに出す
- 本番環境で Health API の生ペイロードをログに出す
- 高感度のメンタルヘルスメモを Discord に保存する
- エラートレースにユーザーデータを含める
- 公開チャンネルで健康状態を表示する
- デフォルトで個人データを分析用途に使う

---

## データモデル

以下の概念モデルを使う。

### users

- id
- discord_user_id
- google_subject_id
- timezone
- created_at
- updated_at

### oauth_connections

- id
- user_id
- provider
- access_token_encrypted
- refresh_token_encrypted
- expires_at
- scopes
- created_at
- updated_at

### medications

- id
- user_id
- name
- dose_label
- schedule_label
- reminder_time
- enabled
- created_at
- updated_at

### medication_logs

- id
- user_id
- medication_id
- scheduled_at
- status
  - taken
  - skipped
  - delayed
  - missed
- recorded_at
- source
  - discord
  - manual
  - system

### mood_logs

- id
- user_id
- date
- mood_score
- energy_score
- agitation_score
- anxiety_score
- note
- created_at

### health_daily_summaries

- id
- user_id
- date
- sleep_minutes
- sleep_start_at
- wake_at
- steps
- active_minutes
- resting_heart_rate
- hrv_rmssd
- data_quality
- source
- created_at

### baselines

- id
- user_id
- metric_name
- window_days
- mean_value
- median_value
- stddev_value
- valid_from
- valid_to

### alerts

- id
- user_id
- alert_type
  - mania_risk
  - depression_risk
  - recovery_debt
  - medication_adherence
  - data_quality
- severity
  - low
  - medium
  - high
- reasons_json
- generated_at
- delivered_at
- acknowledged_at

---

## スコアリング / 検知ルール

最初から機械学習を使わない。

まずは説明可能なルールベース検知から始める。

個人ベースラインとの比較を使う。

ベースライン:

- 直近 14〜30 日の有効データを使う
- データ品質が低い日は除外する
- 平均値、中央値、標準偏差を計算する
- 壊れやすい厳密値ではなく、頑健な閾値を優先する

### 躁転 / 軽躁警戒シグナル

シグナル:

- 睡眠時間がベースラインより短くなる
- 睡眠時間の短縮が 2 日以上続く
- 活動量がベースラインより増える
- 安静時心拍数が上がる
- HRV が下がる
- エネルギー自己申告が上がる
- 焦燥感自己申告が上がる
- 服薬抜けがある

ルール例:

- `sleep_minutes <= baseline_sleep_mean - 120`
- かつ、それが 2 日以上続く
- かつ、`steps >= baseline_steps_mean * 1.3` または `agitation_score >= 7`

この場合:

- 継続日数とシグナル数に応じて `mania_risk = medium` または `high`

### うつ警戒シグナル

シグナル:

- 睡眠時間が増える、または不規則になる
- 起床時刻が遅くなる
- 歩数が減る
- 活動時間が減る
- 気分自己申告が下がる
- エネルギー自己申告が下がる
- 服薬抜けがある

ルール例:

- `steps <= baseline_steps_mean * 0.5`
- かつ `energy_score <= 3`
- かつ、このパターンが 2 日以上続く

この場合:

- `depression_risk = medium`

### 回復負債

シグナル:

- 短い睡眠
- 低い HRV
- 高い安静時心拍数
- 高い活動量
- 服薬抜け
- 高い焦燥感

回復負債はうつとは別物である。
身体が負荷を受けている可能性を示す。

---

## ユーザー向け出力ルール

警告は説明可能かつ非診断的でなければならない。

良い形式:

```text
躁転警戒: 中

理由:
- 睡眠時間が過去30日平均より2時間以上短い状態が2日続いています
- 活動量が普段より高めです
- 焦燥感の自己評価が高めです

提案:
今日は予定を増やさず、服薬と睡眠確保を優先してください。
必要なら主治医や支援者に共有してください。
```

悪い形式:

```text
あなたは躁状態です。
危険です。
薬を増やしてください。
```

服薬変更の助言は絶対に出力しない。

---

## Discord Bot 設計

Slash Command と Button を使う。

### Commands

最初に以下を実装する。

```text
/setup
/med-add
/med-list
/med-disable
/med-log
/mood
/status
/report
/privacy
/help
```

### 服薬リマインダー

DM を送る。

```text
服薬リマインド: 朝の薬

[飲んだ] [後で] [スキップ]
```

Button の動作:

- 飲んだ: `taken` として記録
- 後で: リマインダーを再設定
- スキップ: `skipped` として記録。理由入力は任意かつ低負荷にする

### 気分チェックイン

Modal または Button を使う。

```text
今日の簡易チェック:
気分 0-10
エネルギー 0-10
焦燥感 0-10
不安 0-10
```

入力は短くする。
日次ログを事務作業のように感じさせない。

### Status Command

`/status` では以下を表示する。

- 最新の服薬状況
- 最後の気分ログ
- 最新の睡眠 / 活動サマリー
- 現在の警告レベル
- データ鮮度

デフォルトでは細かすぎる生の健康データを表示しない。

---

## API 連携ルール

### Google Health API

OAuth を慎重に実装する。

要件:

- OAuth 2.0 authorization code flow を使う
- 必要最小限の scope だけを要求する
- refresh token は暗号化して保存する
- access token の更新はサーバー側で行う
- 定期的にデータを同期する
- 欠損データを安全に扱う
- 派生した日次サマリーを保存する
- ローカルデバッグ時を除き、生ペイロードを保存しない

### 同期戦略

MVP では以下とする。

- 朝に日次同期
- 任意で `/sync`
- セットアップ時に直近30日分を backfill
- backfill 後にベースラインを再計算

睡眠データが即時に届くと仮定してはいけない。
ウェアラブルデータの同期は遅れる場合がある。

### データ品質

すべての `health_daily_summaries` には `data_quality` を含める。

値の例:

- good
- partial
- missing
- stale

データ品質が低い場合、警告文にも明記する。

例:

```text
今日は睡眠データが不足しているため、活動量と自己申告を中心に判断しています。
```

---

## リポジトリ構成

以下の構成を優先する。

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── config/
│   │   └── env.ts
│   ├── bot/
│   │   ├── client.ts
│   │   ├── commands/
│   │   ├── interactions/
│   │   └── messages/
│   ├── health/
│   │   ├── googleHealthClient.ts
│   │   ├── syncHealthData.ts
│   │   └── summarizeHealthData.ts
│   ├── medication/
│   │   ├── medicationService.ts
│   │   └── reminderScheduler.ts
│   ├── mood/
│   │   └── moodService.ts
│   ├── alerts/
│   │   ├── baselineService.ts
│   │   ├── alertRules.ts
│   │   └── alertMessage.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── web/
│   │   ├── routes.ts
│   │   └── oauthRoutes.ts
│   └── utils/
│       ├── date.ts
│       ├── crypto.ts
│       └── logger.ts
└── tests/
    ├── alertRules.test.ts
    ├── baselineService.test.ts
    └── medicationService.test.ts
```

---

## コーディングルール

TypeScript は strict にする。

必須:

- strict TypeScript
- 環境変数と API 入力には Zod を使う
- `any` は原則禁止。使う場合はコメントで理由を書く
- alert rule は小さな pure function にする
- alert logic には unit test を書く
- timezone をハードコードしない
- user ID をハードコードしない
- secret をソースコードに入れない
- 生の健康データ payload をログ出力しない

推奨:

- 明示的な domain type
- API client の dependency injection
- scoring の pure function 化
- deterministic な test
- 短い service file

避ける:

- global mutable state
- 巨大な command handler
- 名前のない magic number
- Discord UI ロジックと健康スコアリングの混在
- Discord interaction payload を健康記録としてそのまま保存すること

---

## 環境変数

`.env.example` を用意する。

必要な変数:

```text
NODE_ENV=
DATABASE_URL=
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
TOKEN_ENCRYPTION_KEY=
APP_BASE_URL=
```

`.env` は絶対に commit しない。

---

## テスト要件

タスク完了前に以下を実行する。

```text
pnpm lint
pnpm typecheck
pnpm test
```

これらの command がまだ存在しない場合は追加する。

最低限必要なテスト:

- ベースライン計算
- 躁転警戒ルール
- うつ警戒ルール
- 服薬リマインダーの状態遷移
- Google Health API の欠損データ処理
- Discord 警告文生成

警告文のテストでは、以下の診断的・危険な文言が含まれないことを確認する。

- 「躁状態です」
- 「うつ状態です」
- 「診断」
- 「薬を増やす」
- 「薬をやめる」

---

## ローカル開発コマンド

リポジトリで変更されていない限り、以下を使う。

```text
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm prisma migrate dev
pnpm prisma studio
```

---

## 実装順序

このプロジェクトを構築する場合は、以下の順で実装する。

1. プロジェクト雛形
2. 環境変数バリデーション
3. データベーススキーマ
4. Discord Bot 起動
5. Slash Command 登録
6. 服薬リマインダー CRUD
7. 服薬リマインダー Button
8. 気分チェックイン
9. Google OAuth セットアップ
10. Google Health API 同期 stub
11. 健康データ日次サマリーテーブル
12. ベースライン計算
13. ルールベース alert engine
14. Discord alert message
15. 週次レポート
16. privacy / delete command
17. テストとドキュメント

最初から ML に飛ばない。
最初にモバイルアプリを作らない。
リマインダーとログが動く前に複雑な dashboard を作らない。

---

## UX ルール

ユーザーは精神的に疲弊している可能性がある。

そのため:

- 必須入力を最小化する
- 入力は typing より button を優先する
- 日次チェックインは30秒以内に収める
- 罪悪感を誘発する表現を避ける
- streak 圧をかけない
- 「失敗しました」より「記録できませんでした」を使う
- 「データが悪いです」より「今日はデータが不足しています」を使う

服薬スキップ時のメッセージ:

良い例:

```text
スキップとして記録しました。服薬内容の変更は主治医に相談してください。
```

悪い例:

```text
薬を飲まなかったので危険です。
```

---

## セキュリティチェックリスト

実装すること:

- refresh token の暗号化
- 本番環境の OAuth redirect は HTTPS のみ
- OAuth の CSRF / state validation
- 最小権限 scope
- ユーザーデータ削除
- 健康データを public log に出さない
- web routes の rate limit
- raw HTTP interactions を使う場合は Discord interaction signature validation
- database migration review

---

## デプロイメモ

MVP では以下を優先する。

- Railway / Render / Fly.io / VPS
- managed PostgreSQL
- 小規模なら background worker は同一 service 内

長時間動作する Discord Bot gateway connection が必要な場合、serverless-only deployment は避ける。

Discord interactions over HTTP 方式にする場合は、後から serverless を検討してよい。

---

## ドキュメント要件

以下を維持する。

- README.md
- セットアップ手順
- プライバシー注記
- 非医療用途の disclaimer
- データ削除手順
- API 連携メモ
- alert rule の説明

README には必ず以下の趣旨を書く。

> このアプリケーションは、セルフモニタリングと早期警戒を支援するツールです。双極性障害を診断・治療・予防するものではなく、専門的な医療の代替ではありません。

---

## Commit Style

小さな commit を使う。

commit message の例:

```text
feat(bot): add medication reminder buttons
feat(health): add Google Health OAuth flow
feat(alerts): implement baseline-based mania warning
test(alerts): add rule tests for short sleep and high activity
docs: add privacy and safety notes
```

---

## 判断に迷った場合

より安全な選択肢を選ぶ。

機能が誤った確信を生みそうなら、表現を弱める。
機能が個人の健康データを露出しそうなら、明示的同意なしに実装しない。
医学的に強そうに見えるが検証されていない機能は、記録または説明機能に留める。

このプロダクトは、退屈で、保守的で、信頼できるからこそ役に立つ。
