import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "鎌倉彫体験ワークショップ お申込み | 円応寺",
  description:
    "円応寺で開催する鎌倉彫体験ワークショップのお申込みフォームです。図案と仕上げを選んでお申し込みいただけます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Serif+JP:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
