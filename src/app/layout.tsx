import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLUB PRO CLS",
  description: "Plataforma exclusiva de educação e mentoria para membros CLS",
  openGraph: {
    title: "CLUB PRO CLS",
    description: "Plataforma exclusiva de educação e mentoria para membros CLS",
    url: "https://grupocls.com.br",
    siteName: "CLUB PRO CLS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CLUB PRO CLS Share Card",
      },
    ],
    locale: "pt-BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLUB PRO CLS",
    description: "Plataforma exclusiva de educação e mentoria para membros CLS",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('cls-theme') || 'dark';
                  document.documentElement.className = saved;
                  document.documentElement.setAttribute('data-theme', saved);
                } catch (e) {}
              })();
            `,
          }}
        />
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
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230A52B9'%3E%3Cpath d='M12 2L2 9l10 13 10-13z'/%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
