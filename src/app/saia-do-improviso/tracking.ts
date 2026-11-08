/**
 * Camada de rastreamento (Meta Pixel, GA4, GTM).
 * Os scripts só são injetados quando os IDs estiverem configurados em `trackingConfig`.
 */

export type TrackingEventName =
  | "page_view"
  | "cta_click"
  | "begin_checkout"
  | "purchase"
  | "order_bump_added"
  | "scroll_depth"
  | string;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Envia o evento para GTM (dataLayer) e GA4 (gtag). */
export function track(name: TrackingEventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
  window.gtag?.("event", name, params);
}

/** Envia o evento para o Meta Pixel (evento padrão ou customizado). */
export function trackPixel(
  event: string,
  params: Record<string, unknown> = {},
  custom = false,
): void {
  if (typeof window === "undefined") return;
  window.fbq?.(custom ? "trackCustom" : "track", event, params);
}

/**
 * Exemplos de uso fora desta página (checkout/página de obrigado/webhook),
 * para disparar a compra aprovada e o adicional de gravação:
 *
 *   track("purchase", { value: 47, currency: "BRL", transaction_id: "..." });
 *   trackPixel("Purchase", { value: 47, currency: "BRL" });
 *
 *   track("order_bump_added", { value: 27, currency: "BRL" });
 *   trackPixel("OrderBumpAdded", { value: 27, currency: "BRL" }, true);
 */
