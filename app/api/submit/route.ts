// フォーム送信の中継エンドポイント
// クライアントからの POST を Google Apps Script (スプレッドシート) へ転送する

const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;

const PATTERN_IDS = new Set(["ume", "keshi", "sakura", "tsubaki", "icho"]);
const FINISHES = new Set(["wood", "lacquer"]);
const HANDS = new Set(["right", "left"]);

const responseHeaders = {
  "Cache-Control": "no-store",
};

type Submission = {
  count: "1" | "2+";
  patternId: string;
  finish: string;
  name: string;
  email: string;
  phone: string;
  hand: string;
};

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: responseHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function spreadsheetSafe(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function parseSubmission(value: unknown): Submission | null {
  if (!isRecord(value)) return null;

  const { count, patternId, finish, name, email, phone, hand } = value;
  if (count !== "1" && count !== "2+") return null;
  if (typeof patternId !== "string" || !PATTERN_IDS.has(patternId)) return null;
  if (typeof finish !== "string" || !FINISHES.has(finish)) return null;
  if (typeof hand !== "string" || !HANDS.has(hand)) return null;
  if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string") {
    return null;
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const normalizedPhone = phone.trim();

  if (normalizedName.length < 1 || normalizedName.length > 100) return null;
  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return null;
  }
  if (
    normalizedPhone.length > 20 ||
    !/^[0-9-]+$/.test(normalizedPhone) ||
    normalizedPhone.replace(/-/g, "").length < 10
  ) {
    return null;
  }

  return {
    count,
    patternId,
    finish,
    name: spreadsheetSafe(normalizedName),
    email: spreadsheetSafe(normalizedEmail),
    phone: spreadsheetSafe(normalizedPhone),
    hand,
  };
}

export async function POST(req: Request) {
  const requestOrigin = new URL(req.url).origin;
  const origin = req.headers.get("origin");
  if (origin && origin !== requestOrigin) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const declaredLength = Number(contentLength);
    if (!Number.isFinite(declaredLength) || declaredLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "payload_too_large" }, 413);
    }
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const data = parseSubmission(parsed);
  if (!data) {
    return json({ ok: false, error: "invalid_submission" }, 400);
  }

  const configuredUrl = process.env.APPS_SCRIPT_URL;
  if (!configuredUrl) {
    console.error("APPS_SCRIPT_URL is not set");
    return json({ ok: false, error: "not_configured" }, 500);
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    console.error("APPS_SCRIPT_URL is invalid");
    return json({ ok: false, error: "not_configured" }, 500);
  }

  if (url.protocol !== "https:") {
    console.error("APPS_SCRIPT_URL must use HTTPS");
    return json({ ok: false, error: "not_configured" }, 500);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error("Apps Script responded", res.status);
      return json({ ok: false }, 502);
    }
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("submit error:", err);
    return json({ ok: false }, 502);
  }
}
