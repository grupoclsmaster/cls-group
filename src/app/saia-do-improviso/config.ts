/**
 * Configuração central da página "Saia do Improviso".
 * Preencha os campos marcados como TODO antes de subir para produção.
 */

export const eventConfig = {
  name: "Saia do Improviso",
  expert: "Engenheiro Magno Santos",
  expertInstagram: "https://www.instagram.com/engenheiro.magno/",
  date: "20/11/2026",
  time: "19:00",
  timezone: "America/Sao_Paulo",
  platform: "Zoom",
  ticketPrice: 47,
  recordingPrice: 27,
  checkoutUrl: "", // TODO: URL real do checkout
  expertPhoto: "/magno.jpg", // TODO: trocar pela foto oficial, se necessário
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
  title: "Saia do Improviso | Aula com Engenheiro Magno Santos",
  description:
    "Participe da aula Saia do Improviso com Engenheiro Magno Santos. Aprenda sobre planejamento, organização, processos e inteligência artificial na construção civil.",
};

/** Imagens decorativas (obras/planejamento). A foto do expert vem de eventConfig.expertPhoto. */
export const images = {
  heroBg:
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Cinematic%20wide%20photograph%20of%20a%20modern%20high-rise%20construction%20site%20at%20dusk%2C%20tower%20crane%20silhouette%2C%20exposed%20concrete%20structure%2C%20engineers%20in%20hard%20hats%20reviewing%20blueprints%2C%20deep%20navy%20blue%20and%20steel%20tones%2C%20dramatic%20lighting%2C%20professional%20architectural%20photography%2C%20ultra%20detailed%2C%20no%20text%2C%20no%20watermark&image_size=landscape_16_9",
  aiVisual:
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20photograph%20of%20a%20civil%20engineer%20using%20a%20laptop%20with%20a%20digital%20project%20dashboard%20and%20AI%20assistant%20interface%20at%20a%20construction%20site%20office%2C%20blueprints%20and%20hard%20hat%20on%20the%20desk%2C%20blue%20and%20white%20tones%2C%20clean%20modern%20technology%20atmosphere%2C%20sharp%20focus%2C%20no%20text&image_size=landscape_4_3",
};

/** Formata números em Real brasileiro de forma determinística (server/client). */
export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export const metaLine = `${eventConfig.dateShort.toUpperCase()} | ÀS ${eventConfig.timeLabel.toUpperCase()} | AO VIVO NO ${eventConfig.platform.toUpperCase()}`;
