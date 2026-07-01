import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // このプロジェクトを Turbopack のルートに固定する
  // （親ディレクトリの別のロックファイルを誤検出させないため）
  turbopack: { root: __dirname },
};

export default nextConfig;
