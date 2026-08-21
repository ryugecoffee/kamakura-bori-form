"use client";

import type { Finish, PatternId } from "@/lib/patterns";
import { patSVG } from "@/lib/patternSvg";

type Props = {
  id: PatternId;
  finish?: Finish;
  size: number;
  className?: string;
};

// 図案プレート。未配置画像へのリクエストを避けるため、
// ローカルで生成した SVG を直接表示する。
export default function PatternPlate({
  id,
  finish = "wood",
  size,
  className = "",
}: Props) {
  const style = { width: size, height: size };

  return (
    <div
      className={`plate ${className}`}
      style={style}
      role="img"
      aria-label={`${id}-${finish}`}
      dangerouslySetInnerHTML={{ __html: patSVG(id, finish) }}
    />
  );
}
