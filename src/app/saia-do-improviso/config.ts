/**
 * Configuração central da página "Saia do Improviso".
 * Preencha os campos marcados como TODO antes de subir para produção.
 */

export const eventConfig = {
  name: "Saia do Improviso",
  expert: "Magno Santos",
  expertInstagram: "https://www.instagram.com/engenheiro.magno/",
  date: "20/11/2026",
  time: "19:00",
  timezone: "America/Sao_Paulo",
  platform: "Zoom",
  ticketPrice: 47,
  recordingPrice: 27,
  checkoutUrl: "", // TODO: URL real do checkout
  expertPhoto: "/magno-hero.jpg", // Foto oficial do Magno (alta definição)
  eventAccessUrl: "", // TODO: link de acesso enviado após a confirmação
  // Rótulos derivados usados nos textos (ajuste junto com date/time acima)
  dateLabel: "20 de novembro de 2026",
  dateShort: "20 de novembro",
  timeLabel: "19h",
};

/** IDs de rastreamento. Deixe vazio para não carregar o respectivo script. */
export const trackingConfig = {
  metaPixelId: "", // TODO: Meta Pixel ID
  ga4MeasurementId: "", // TODO: GA4 Measurement ID (G-XXXXXXX)
  gtmId: "", // TODO: Google Tag Manager ID (GTM-XXXXXXX)
};

/** Domínio e caminho públicos usados em SEO/canonical. */
export const siteConfig = {
  url: "https://grupocls.com.br",
  path: "/saia-do-improviso",
  title: "Saia do Improviso | Aula com Magno Santos",
  description:
    "Participe da aula Saia do Improviso com Magno Santos. Aprenda sobre planejamento, organização, processos e inteligência artificial na construção civil.",
};

/** Imagens decorativas (obras/planejamento/tecnologia IA). A foto do expert vem de eventConfig.expertPhoto. */
export const images = {
  /** Foto de obra de casa / construção residencial */
  houseConstruction: "/obra-casa.jpg",
  /** Foto de Inteligência Artificial e ferramentas digitais aplicada à obra (Magno com holograma IA) */
  aiTechnology: "/magno-ia.jpg",
  /** Foto do Magno no canteiro de obras real (Seu Mentor / Autoridade) */
  expertField: "/magno-obra.jpg",
};

/** Formata números em Real brasileiro de forma determinística (server/client). */
export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export const metaLine = `${eventConfig.dateShort.toUpperCase()} | ÀS ${eventConfig.timeLabel.toUpperCase()} | AO VIVO NO ${eventConfig.platform.toUpperCase()}`;
