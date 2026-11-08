import type { Metadata } from "next";
import LandingPage from "./LandingPage";
import { eventConfig, siteConfig } from "./config";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.path,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.path,
    siteName: "Grupo CLS",
    locale: "pt-BR",
    type: "website",
    images: [{ url: eventConfig.expertPhoto, alt: eventConfig.expert }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [eventConfig.expertPhoto],
  },
  robots: { index: true, follow: true },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: eventConfig.name,
  description: siteConfig.description,
  startDate: "2026-11-20T19:00:00-03:00",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "VirtualLocation",
    url: "https://zoom.us",
  },
  performer: {
    "@type": "Person",
    name: eventConfig.expert,
  },
  organizer: {
    "@type": "Organization",
    name: "Grupo CLS",
    url: siteConfig.url,
  },
  offers: {
    "@type": "Offer",
    price: eventConfig.ticketPrice.toFixed(2),
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    url: `${siteConfig.url}${siteConfig.path}`,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <LandingPage />
    </>
  );
}
