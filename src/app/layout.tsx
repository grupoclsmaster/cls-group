import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLUB PRO CLS",
  description: "Plataforma exclusiva de educação e mentoria para membros CLS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23edc066'%3E%3Cpath d='M6 2h12l4 6-10 14L2 8z'/%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
