// 鎌倉彫体験 図案データ
// kamakura-bori.co.jp のサイト掲載順に合わせること
// [梅][ケシ] / [桜][椿] / [イチョウ]

export const PATTERNS = [
  { id: "ume", name: "梅", meaning: "清楚・長寿" },
  { id: "keshi", name: "ケシ", meaning: "優雅・はかなさ" },
  { id: "sakura", name: "桜", meaning: "繁栄・美" },
  { id: "tsubaki", name: "椿", meaning: "高貴・艶" },
  { id: "icho", name: "イチョウ", meaning: "長寿・縁起" },
] as const;

export type Pattern = (typeof PATTERNS)[number];
export type PatternId = Pattern["id"];
export type Finish = "wood" | "urushi";

export const PATTERN_MAP = Object.fromEntries(
  PATTERNS.map((p) => [p.id, p])
) as Record<PatternId, Pattern>;

export const FINISHES: { id: Finish; name: string; desc: string }[] = [
  { id: "wood", name: "木地", desc: "彫りの陰影を活かす素地仕上げ" },
  { id: "urushi", name: "漆塗り", desc: "朱漆を重ねた伝統の仕上げ" },
];
