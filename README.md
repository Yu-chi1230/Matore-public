# Matore

Excel・スプレッドシートの改善、データ集計・加工、Googleサービスの自動化をフルリモートで支援するサイトの公開用ソースです。

運営者：Yu-chi ／ 公開サイト：[matore.jp](https://matore.jp)

## 構成

Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / GSAPで画面を実装し、Cloudflare Workersで静的ページと問い合わせAPIを配信します。問い合わせはSupabaseへ保存し、Resendで通知します。

- `src/`：トップ、サービス詳細、問い合わせフォーム、プライバシーポリシー。
- `worker/`：問い合わせAPI、通知再送処理、テスト。
- `supabase/migrations/`：DB定義と権限制御。
- `supabase/tests/`：保存期限に関するSQLテスト。
- `tests/`：フロントエンドテストの共通設定。
- `public/`：favicon・OGP画像。

このリポジトリは公開向けのスナップショットです。本番環境の設定、内部の運用記録、開発リポジトリの過去の履歴は含みません。

## 起動・検証

Node.js 22以降を使用します。

```sh
npm ci --ignore-scripts
npm run dev
```

`http://localhost:3000` で画面を確認できます。`npm run dev` 単体では問い合わせAPIは動作しません。

```sh
npm run lint
npm test
npm run build
```

`npm run build` は静的ファイルを `out/` に生成します。

## 問い合わせAPIのローカル確認

自身の開発用Supabase・Resendを用意し、`.dev.vars.example` を `.dev.vars` にコピーして値を設定します。Supabaseには `supabase/migrations/` のSQLをファイル名順に適用してください。新規の開発用DBを使用してください。

```sh
cp .dev.vars.example .dev.vars
npm run build
npm run worker:dev
```

Wranglerが表示するローカルURLで画面と `/api/contact` を確認します。設定後にフォームを送信すると、指定した開発用DBへ保存し、指定した宛先へメールを送信します。実在する顧客情報はテストに使用しないでください。

管理者権限のSupabaseキー、Resendキー、レート制限用の秘密値はWorker側だけで使用します。`NEXT_PUBLIC_` で始まる変数へ秘密の値を設定しないでください。

問い合わせ処理には入力検証、本文サイズ制限、IPハッシュによるレート制限、冪等キーによる重複防止があります。通知失敗分の再送処理も含みますが、この公開用設定ではCronを有効にしていません。

## 公開用設定

`wrangler.jsonc` は本番アカウント・カスタムドメインを含まない開発用設定です。自身の環境へ公開する場合はWorker名、ドメイン、環境変数、Secrets、必要に応じて通知再送用Cronを設定してください。

`src/lib/site.ts` にはMatoreの公開URLとサイト情報を記載しています。別サイトとして配信する場合は、本文・料金・運営者情報・プライバシーポリシー・画像と合わせて変更してください。

アクセス解析は初期状態では無効です。自身のCloudflare Web Analyticsを使う場合のみ、`.env.example` を `.env.local` にコピーし、`NEXT_PUBLIC_CF_ANALYTICS_TOKEN` を設定してビルドしてください。

## 利用について

Copyright © 2026 Yu-chi. All rights reserved.

ソースコードの閲覧・実装の紹介を目的として公開しています。オープンソースライセンスは付与していません。コード・文章・画像・ブランドの利用については、別途ご相談ください。
