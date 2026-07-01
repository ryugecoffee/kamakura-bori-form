"use client";

import { useState } from "react";
import { PATTERN_MAP } from "@/lib/patterns";
import type { Finish, PatternId } from "@/lib/patterns";
import StepIndicator from "@/components/StepIndicator";
import PatternSelector from "@/components/PatternSelector";
import PatternPlate from "@/components/PatternPlate";

// 開催情報（適宜書き換えてください）
const EVENT = {
  title: "鎌倉彫体験ワークショップ",
  place: "円応寺（鎌倉）",
  date: "日程は追ってメールでご案内します",
};

type FormState = {
  step: 0 | 1 | 2 | 3;
  count: "1" | "2+";
  patternId: PatternId | null;
  finish: Finish | null;
  name: string;
  email: string;
  phone: string;
  hand: "right" | "left" | null;
};

const initial: FormState = {
  step: 0,
  count: "1",
  patternId: null,
  finish: null,
  name: "",
  email: "",
  phone: "",
  hand: null,
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v: string) =>
  /^[0-9-]+$/.test(v) && v.replace(/-/g, "").length >= 10;

export default function Page() {
  const [form, setForm] = useState<FormState>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));
  const { step } = form;

  const canNext = () => {
    if (step === 0) return !!form.count;
    if (step === 1) return !!form.patternId && !!form.finish;
    if (step === 2)
      return (
        form.name.trim().length >= 1 &&
        emailOk(form.email) &&
        phoneOk(form.phone) &&
        !!form.hand
      );
    return true;
  };

  const next = () => set({ step: Math.min(3, step + 1) as FormState["step"] });
  const back = () => set({ step: Math.max(0, step - 1) as FormState["step"] });

  async function submit() {
    setSending(true);
    try {
      const { step: _step, ...data } = form;
      void _step;
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("submit failed");
      setDone(true);
    } catch {
      alert("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSending(false);
    }
  }

  const pat = form.patternId ? PATTERN_MAP[form.patternId] : null;
  const finishLabel = form.finish === "wood" ? "木地" : "漆塗り";

  // ---- 完了画面 ----
  if (done) {
    return (
      <main className="page">
        <div className="wrap">
          <div className="card done">
            <div className="check">
              <svg viewBox="0 0 24 24">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            </div>
            <h2 className="serif">お申し込みを受け付けました</h2>
            <p>確認のご連絡をメールにてお送りします</p>

            {form.patternId && (
              <PatternPlate
                id={form.patternId}
                finish={form.finish ?? "wood"}
                size={80}
              />
            )}

            <div className="event">
              <dl>
                <div className="summary-row">
                  <dt>体験</dt>
                  <dd>{EVENT.title}</dd>
                </div>
                <div className="summary-row">
                  <dt>会場</dt>
                  <dd>{EVENT.place}</dd>
                </div>
                <div className="summary-row">
                  <dt>日時</dt>
                  <dd>{EVENT.date}</dd>
                </div>
                <div className="summary-row">
                  <dt>図案</dt>
                  <dd>
                    {pat?.name}（{finishLabel}）
                  </dd>
                </div>
                <div className="summary-row">
                  <dt>人数</dt>
                  <dd>{form.count === "1" ? "1名" : "2名以上"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="wrap">
        <div className="head">
          <h1 className="serif">{EVENT.title}</h1>
          <p>{EVENT.place} ・ お申込みフォーム</p>
        </div>

        <StepIndicator step={step} />

        <div className="card">
          {/* Step 0 — 人数 */}
          {step === 0 && (
            <>
              <h2 className="serif">お申込み人数</h2>
              <div className="radio-row">
                {(
                  [
                    ["1", "1名"],
                    ["2+", "2名以上"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    type="button"
                    key={v}
                    className={`radio ${form.count === v ? "is-sel" : ""}`}
                    onClick={() => set({ count: v })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 1 — 図案 + 仕上げ */}
          {step === 1 && (
            <>
              <h2 className="serif">図案をお選びください</h2>
              <PatternSelector
                patternId={form.patternId}
                finish={form.finish}
                onPattern={(id) => set({ patternId: id })}
                onFinish={(f) => set({ finish: f })}
              />
            </>
          )}

          {/* Step 2 — お客様情報 */}
          {step === 2 && (
            <>
              <h2 className="serif">お客様情報</h2>

              <div
                className={`field ${
                  touched.name && form.name.trim().length < 1 ? "has-error" : ""
                }`}
              >
                <label>お名前（ふりがな）</label>
                <input
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="かまくら たろう"
                />
              </div>

              <div
                className={`field ${
                  touched.email && !emailOk(form.email) ? "has-error" : ""
                }`}
              >
                <label>メールアドレス</label>
                <input
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="example@mail.com"
                />
                {touched.email && !emailOk(form.email) && (
                  <p className="err">正しいメールアドレスを入力してください</p>
                )}
              </div>

              <div
                className={`field ${
                  touched.phone && !phoneOk(form.phone) ? "has-error" : ""
                }`}
              >
                <label>お電話番号</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  placeholder="090-1234-5678"
                />
                {touched.phone && !phoneOk(form.phone) && (
                  <p className="err">数字・ハイフンのみで入力してください</p>
                )}
              </div>

              <div className="field">
                <label>利き手</label>
                <div className="radio-row">
                  {(
                    [
                      ["right", "右手"],
                      ["left", "左手"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      type="button"
                      key={v}
                      className={`radio ${form.hand === v ? "is-sel" : ""}`}
                      onClick={() => set({ hand: v })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3 — 確認 */}
          {step === 3 && (
            <>
              <h2 className="serif">ご入力内容の確認</h2>
              <div className="confirm-head">
                {form.patternId && (
                  <PatternPlate
                    id={form.patternId}
                    finish={form.finish ?? "wood"}
                    size={60}
                  />
                )}
                <div>
                  <b className="serif" style={{ fontSize: 16 }}>
                    {pat?.name}
                  </b>
                  <div style={{ fontSize: 12, color: "var(--ink-lt)" }}>
                    {pat?.meaning} ・ {finishLabel}
                  </div>
                </div>
              </div>

              <dl className="summary">
                <div className="summary-row">
                  <dt>人数</dt>
                  <dd>{form.count === "1" ? "1名" : "2名以上"}</dd>
                </div>
                <div className="summary-row">
                  <dt>図案</dt>
                  <dd>{pat?.name}</dd>
                </div>
                <div className="summary-row">
                  <dt>仕上げ</dt>
                  <dd>{finishLabel}</dd>
                </div>
                <div className="summary-row">
                  <dt>お名前</dt>
                  <dd>{form.name}</dd>
                </div>
                <div className="summary-row">
                  <dt>メール</dt>
                  <dd>{form.email}</dd>
                </div>
                <div className="summary-row">
                  <dt>電話</dt>
                  <dd>{form.phone}</dd>
                </div>
                <div className="summary-row">
                  <dt>利き手</dt>
                  <dd>{form.hand === "right" ? "右手" : "左手"}</dd>
                </div>
              </dl>
            </>
          )}

          {/* アクション */}
          <div className="actions">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={back}>
                戻る
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canNext()}
                onClick={next}
              >
                次へ
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={sending}
                onClick={submit}
              >
                {sending ? "送信中…" : "申し込む"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
