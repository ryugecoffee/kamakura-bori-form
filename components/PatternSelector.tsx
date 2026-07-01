"use client";

import { PATTERNS, FINISHES } from "@/lib/patterns";
import type { Finish, PatternId } from "@/lib/patterns";
import PatternPlate from "./PatternPlate";

type Props = {
  patternId: PatternId | null;
  finish: Finish | null;
  onPattern: (id: PatternId) => void;
  onFinish: (f: Finish) => void;
};

// 図案選択 + 仕上げ選択（このUIが本フォームの中心）
export default function PatternSelector({
  patternId,
  finish,
  onPattern,
  onFinish,
}: Props) {
  return (
    <div>
      <div className="pattern-grid">
        {PATTERNS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`pattern-cell ${patternId === p.id ? "is-sel" : ""}`}
            onClick={() => onPattern(p.id)}
          >
            <PatternPlate id={p.id} finish={finish ?? "wood"} size={56} />
            <span className="pattern-name">{p.name}</span>
          </button>
        ))}
      </div>

      {patternId && (
        <div className="finish">
          <p className="finish-label">仕上げを選ぶ</p>
          <div className="finish-row">
            {FINISHES.map((f) => (
              <button
                type="button"
                key={f.id}
                className={`finish-card ${finish === f.id ? "is-sel" : ""}`}
                onClick={() => onFinish(f.id)}
              >
                <PatternPlate id={patternId} finish={f.id} size={70} />
                <span className="finish-text">
                  <b>{f.name}</b>
                  <span>{f.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
