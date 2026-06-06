import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLUB PRO CLS",
  description: "Plataforma exclusiva de educação e mentoria para membros CLS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CLS PRO",
  },
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
        {/* Theme & PWA init */}
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
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
        {/* Viewport with safe-area support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* PWA meta tags */}
        <meta name="theme-color" content="#070732" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CLS PRO" />
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/icons/icon-cls.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-cls.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-cls.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-cls.png" />
        {/* Fonts */}
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
        <link rel="icon" href="/icons/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
