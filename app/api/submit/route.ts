// フォーム送信の中継エンドポイント
// クライアントからの POST を Google Apps Script (スプレッドシート) へ転送する

const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;

const PATTERN_IDS = ["ume", "keshi", "sakura", "tsubaki", "icho"] as const;
const FINISHES = ["wood", "lacquer"] as const;
const HANDS = ["right", "left"] as const;

type Submission = {
  count: "1" | "2+";
  patternId: (typeof PATTERN_IDS)[number];
  finish: (typeof FINISHES)[number];
  name: string;
  email: string;
  phone: string;
  hand: (typeof HANDS)[number];
};

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function cleanText(value: string) {
  return value.trim().replace(/[\u0000-\u001f\u007f]/g, " ");
}

// Google Sheets が利用者入力を数式として評価しないようにする。
function sheetSafe(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function validateSubmission(value: unknown): Submission | null {
  if (!isRecord(value)) return null;

  if (value.count !== "1" && value.count !== "2+") return null;
  if (!isOneOf(value.patternId, PATTERN_IDS)) return null;
  if (!isOneOf(value.finish, FINISHES)) return null;
  if (!isOneOf(value.hand, HANDS)) return null;
  if (
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.phone !== "string"
  ) {
    return null;
  }

  const name = cleanText(value.name);
  const email = cleanText(value.email);
  const phone = cleanText(value.phone);
  const phoneDigits = phone.replace(/-/g, "");

  if (name.length < 1 || name.length > 100) return null;
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }
  if (
    phone.length > 20 ||
    !/^[0-9-]+$/.test(phone) ||
    phoneDigits.length < 10 ||
    phoneDigits.length > 15
  ) {
    return null;
  }

  return {
    count: value.count,
    patternId: value.patternId,
    finish: value.finish,
    name: sheetSafe(name),
    email: sheetSafe(email),
    phone: sheetSafe(phone),
    hand: value.hand,
  };
}

function getAppsScriptUrl() {
  const configured = process.env.APPS_SCRIPT_URL;
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "script.google.com" ||
      !url.pathname.startsWith("/macros/s/")
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const requestUrl = new URL(req.url);
  const origin = req.headers.get("origin");
  const fetchSite = req.headers.get("sec-fetch-site");

  if (
    (origin !== null && origin !== requestUrl.origin) ||
    fetchSite === "cross-site"
  ) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }

  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
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

  const submission = validateSubmission(parsed);
  if (!submission) {
    return json({ ok: false, error: "invalid_submission" }, 400);
  }

  const url = getAppsScriptUrl();
  if (!url) {
    console.error("APPS_SCRIPT_URL is missing or invalid");
    return json({ ok: false, error: "not_configured" }, 500);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...submission,
        submittedAt: new Date().toISOString(),
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("Apps Script returned a non-success status", res.status);
      return json({ ok: false, error: "upstream_error" }, 502);
    }

    const upstream: unknown = await res.json().catch(() => null);
    if (!isRecord(upstream) || upstream.ok !== true) {
      console.error("Apps Script returned an invalid response");
      return json({ ok: false, error: "upstream_error" }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error(
      "Submission upstream request failed",
      error instanceof Error ? error.name : "unknown_error",
    );
    return json({ ok: false, error: "upstream_error" }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
