"use client";

import { useState } from "react";
import type { Finish, PatternId } from "@/lib/patterns";
import { patSVG } from "@/lib/patternSvg";

type Props = {
  id: PatternId;
  finish?: Finish;
  size: number;
  className?: string;
};

// 図案プレート。public/patterns/<id>-<finish>.jpg を表示し、
// 画像が無ければ SVG フォールバックに切り替える。
export default function PatternPlate({
  id,
  finish = "wood",
  size,
  className = "",
}: Props) {
  const [err, setErr] = useState(false);
  const style = { width: size, height: size };

  if (err) {
    return (
      <div
        className={`plate ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: patSVG(id, finish) }}
      />
    );
  }
  return (
    <div className={`plate ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/patterns/${id}-${finish}.jpg`}
        alt=""
        onError={() => setErr(true)}
      />
    </div>
  );
}
