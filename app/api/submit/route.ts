// フォーム送信の中継エンドポイント
// クライアントからの POST を Google Apps Script (スプレッドシート) へ転送する

export async function POST(req: Request) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    console.error("APPS_SCRIPT_URL is not set");
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: new Date().toISOString(),
        ...(data as Record<string, unknown>),
      }),
    });

    if (!res.ok) {
      console.error("Apps Script responded", res.status);
      return Response.json({ ok: false }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("submit error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
