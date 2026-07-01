# 鎌倉彫体験 申込みフォーム

円応寺（ennoji.com）で開催する「鎌倉彫体験ワークショップ」の参加申込みフォーム。
Google フォームの代替として、**図案を視覚的に選択できる UI** が最大の特徴です。

## 技術スタック

- **Next.js (App Router)** + React 19 + TypeScript
- 送信先: **Google Apps Script** (Webhook) → Google スプレッドシートに記録
- ホスティング: **Vercel**
- フォント: Noto Serif JP（見出し）/ Noto Sans JP（本文）— Google Fonts

## セットアップ

```bash
npm install
cp .env.example .env.local   # APPS_SCRIPT_URL を設定
npm run dev                  # http://localhost:3000
```

### 環境変数

| 変数 | 説明 |
|------|------|
| `APPS_SCRIPT_URL` | Apps Script ウェブアプリの URL |

## Google Apps Script

`docs/apps-script.gs` を参照。スプレッドシートに「申込み一覧」シートを作り、
1 行目にヘッダーを入力してからウェブアプリとして公開し、URL を `.env.local` に設定します。

```
申込日時 | 人数 | 図案 | 仕上げ | お名前 | メール | 電話 | 利き手
```

## 構成

```
app/
  layout.tsx            フォント・メタデータ
  page.tsx              フォーム本体（状態管理・4ステップ）
  globals.css           和紙テーマ・全スタイル
  api/submit/route.ts   Apps Script への中継
components/
  StepIndicator.tsx
  PatternSelector.tsx   図案 + 仕上げ選択（中心UI）
  PatternPlate.tsx      画像→SVGフォールバック
lib/
  patterns.ts           図案データ・型
  patternSvg.ts         SVGフォールバック
public/patterns/        図案画像（README参照）
docs/apps-script.gs     スプレッドシート記録スクリプト
```

## フォーム仕様

| Step | 内容 |
|------|------|
| 0 | お申込み人数（1名 / 2名以上） |
| 1 | 図案選択（梅・ケシ・桜・椿・イチョウ）+ 仕上げ（木地 / 漆塗り） |
| 2 | お客様情報（氏名・メール・電話・利き手） |
| 3 | 確認 → 送信 |

図案画像が未配置の場合は SVG フォールバックで表示されます（`public/patterns/README.md`）。
