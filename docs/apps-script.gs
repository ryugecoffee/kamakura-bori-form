// ============================================================
// Google Apps Script — 鎌倉彫体験 申込み記録
// ============================================================
// 使い方:
//  1. 記録用スプレッドシートを開く
//  2. 「申込み一覧」という名前のシートを作成
//  3. 1行目にヘッダーを手入力:
//       申込日時 | 人数 | 図案 | 仕上げ | お名前 | メール | 電話 | 利き手
//  4. 拡張機能 → Apps Script を開き、このコードを貼り付け
//  5. 「デプロイ」→「新しいデプロイ」→種類「ウェブアプリ」
//       - 次のユーザーとして実行: 自分
//       - アクセスできるユーザー: 全員
//  6. 発行された URL を .env.local の APPS_SCRIPT_URL に設定
// ============================================================

const PAT = { ume: "梅", keshi: "ケシ", sakura: "桜", tsubaki: "椿", icho: "イチョウ" };

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("申込み一覧")
    .appendRow([
      d.submittedAt,
      d.count === "1" ? "1名" : "2名以上",
      PAT[d.patternId] || d.patternId,
      d.finish === "wood" ? "木地" : "漆塗り",
      d.name,
      d.email,
      d.phone,
      d.hand === "right" ? "右手" : "左手",
    ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
