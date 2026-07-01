// 図案プレートの SVG フォールバック
// 画像 (public/patterns/*.jpg) が未配置の場合に使用する。
// viewBox: 0 0 120 120 / プレート円: <circle cx="60" cy="60" r="58" />
//   木地   (wood)  : 背景 #C4956A / ライン #7A4E28
//   漆塗り (urushi): 背景 #8B1A1A / ライン #5C1010

import type { Finish, PatternId } from "./patterns";

const COLORS: Record<Finish, { bg: string; line: string }> = {
  wood: { bg: "#C4956A", line: "#7A4E28" },
  urushi: { bg: "#8B1A1A", line: "#5C1010" },
};

// path を中心 (60,60) まわりに n 枚回転コピー
function petals(d: string, n: number, offset = 0): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const deg = offset + i * (360 / n);
    s += `<path d="${d}" transform="rotate(${deg} 60 60)"/>`;
  }
  return s;
}

function motif(id: PatternId, line: string): string {
  const dot = (cx: number, cy: number, r: number) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${line}" stroke="none"/>`;

  switch (id) {
    case "ume": // 梅：5枚の丸い花弁
      return (
        petals("M60 58 C52 48 52 34 60 27 C68 34 68 48 60 58 Z", 5) +
        dot(60, 60, 4)
      );
    case "keshi": // ケシ：4枚の大きな花弁 + 中心の実
      return (
        petals("M60 57 C46 47 45 28 60 20 C75 28 74 47 60 57 Z", 4) +
        dot(60, 60, 2.4) +
        dot(56, 62, 2) +
        dot(64, 62, 2)
      );
    case "sakura": // 桜：先が割れた5枚の花弁
      return (
        petals(
          "M60 58 C52 48 52 33 56 26 L60 30 L64 26 C68 33 68 48 60 58 Z",
          5
        ) + dot(60, 60, 3.5)
      );
    case "tsubaki": // 椿：外弁5 + 内弁5 + 芯
      return (
        petals("M60 56 C47 50 45 33 60 25 C75 33 73 50 60 56 Z", 5) +
        petals("M60 54 C52 50 51 40 60 34 C69 40 68 50 60 54 Z", 5, 36) +
        dot(60, 58, 3)
      );
    case "icho": // イチョウ：扇形の葉
      return (
        `<path d="M60 92 C42 74 34 50 42 32 C50 44 55 48 60 48 C65 48 70 44 78 32 C86 50 78 74 60 92 Z"/>` +
        `<path d="M60 88 L60 50"/>` +
        `<path d="M60 92 L60 104"/>`
      );
    default:
      return dot(60, 60, 6);
  }
}

export function patSVG(id: PatternId, finish: Finish = "wood"): string {
  const c = COLORS[finish] || COLORS.wood;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <circle cx="60" cy="60" r="58" fill="${c.bg}"/>
    <g fill="none" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
      ${motif(id, c.line)}
    </g>
  </svg>`;
}
