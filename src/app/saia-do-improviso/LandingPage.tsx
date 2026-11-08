"use client";

import Script from "next/script";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./landing.module.css";
import { eventConfig, formatBRL, images, metaLine, siteConfig, trackingConfig } from "./config";
import { track, trackPixel } from "./tracking";
import {
  aiItems,
  audienceItems,
  faqItems,
  lessonCards,
  offerRows,
  problemCards,
} from "./content";

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

/* ---------- Scripts de rastreamento (carregam só se ID configurado) ---------- */
function TrackingScripts() {
  const { gtmId, ga4MeasurementId, metaPixelId } = trackingConfig;
  if (!gtmId && !ga4MeasurementId && !metaPixelId) return null;

  return (
    <>
      {gtmId && (
        <Script id="sdi-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {ga4MeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="sdi-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4MeasurementId}');`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="sdi-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');`}
        </Script>
      )}
    </>
  );
}

/* ---------- Botão de conversão reutilizável ---------- */
interface CtaProps {
  onClick: () => void;
  children: ReactNode;
  large?: boolean;
  full?: boolean;
  pulse?: boolean;
  className?: string;
}

function Cta({ onClick, children, large, full, pulse, className }: CtaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        styles.cta,
        large && styles["cta--lg"],
        full && styles["cta--full"],
        pulse && styles["cta--pulse"],
        className,
      )}
    >
      <span>{children}</span>
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        arrow_forward
      </span>
    </button>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Evento de visualização da página
    track("page_view", { page: siteConfig.path, event: eventConfig.name });
    trackPixel("PageView");

    // Revelação passiva ao rolar
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || elements.length === 0) {
      elements.forEach((el) => el.setAttribute("data-visible", ""));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /** Todos os CTAs apontam para o mesmo checkout. */
  const handleCheckout = (location: string) => {
    track("cta_click", { location, value: eventConfig.ticketPrice, currency: "BRL" });
    if (eventConfig.checkoutUrl) {
      track("begin_checkout", { value: eventConfig.ticketPrice, currency: "BRL" });
      trackPixel("InitiateCheckout", { value: eventConfig.ticketPrice, currency: "BRL" });
      window.location.href = eventConfig.checkoutUrl;
    }
  };

  return (
    <div className={styles.root}>
      <TrackingScripts />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>.${styles.reveal}{opacity:1 !important;transform:none !important;}</style>`,
        }}
      />

      <main className={styles.main}>
        {/* ================= DOBRA 01 — HERO ================= */}
        <section className={styles.hero}>
          <div className={styles.heroBg} style={{ backgroundImage: `url('${images.heroBg}')` }} />
          <div className={styles.heroOverlay} />
          <div className={styles.blueprint} />
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div>
                <span className={styles.badge}>
                  Aula especial para profissionais da construção civil
                </span>
                <h1 className={styles.heroTitle}>
                  Chega de improvisar na obra.
                </h1>
                <p className={styles.heroLead}>
                  Aprenda a trabalhar com organização, método e inteligência artificial na construção civil.
                </p>
                <p className={styles.heroSub}>
                  Aula online e ao vivo com o {eventConfig.expert}.
                </p>
                <div className={styles.heroMeta}>
                  <span className="material-symbols-outlined">calendar_month</span>
                  {metaLine}
                </div>
                <div className={styles.heroCta}>
                  <Cta large pulse onClick={() => handleCheckout("hero")}>
                    Quero sair do improviso
                  </Cta>
                </div>
              </div>

              <div className={styles.heroPhotoWrap}>
                <div className={styles.heroPhotoFrame}>
                  <img
                    className={styles.heroPhoto}
                    src={eventConfig.expertPhoto}
                    alt={eventConfig.expert}
                    loading="eager"
                  />
                  <div className={styles.heroPhotoTag}>
                    <strong>{eventConfig.expert}</strong>
                    <span>Engenharia • Infraestrutura • Projetos</span>
                    <a
                      href={eventConfig.expertInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.igLink}
                    >
                      @engenheiro.magno
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 02 — IDENTIFICAÇÃO COM O PROBLEMA ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={cx(styles.center, styles.reveal)} data-reveal>
              <h2 className={styles.h2}>
                Você trabalha muito, mas sente que poderia trabalhar melhor?
              </h2>
              <p className={styles.text} style={{ marginTop: 22 }}>
                Na construção civil, muitos profissionais acabam perdendo tempo com problemas que
                poderiam ser evitados.
              </p>
              <p className={styles.text} style={{ marginTop: 14 }}>
                Falta de planejamento, informações desorganizadas, retrabalho, atrasos e dificuldade
                para acompanhar atividades fazem parte da rotina de muita gente.
              </p>
              <p className={styles.h3} style={{ marginTop: 26 }}>
                Veja se você se identifica:
              </p>
            </div>

            <div className={styles.diagnostics}>
              {problemCards.map((item, index) => (
                <article key={item.title} className={styles.diagItem}>
                  <span className={styles.diagIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.diagBody}>
                    <h3 className={styles.diagTitle}>{item.title}</h3>
                    <p className={styles.diagText}>{item.text}</p>
                  </div>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </article>
              ))}
            </div>

            <p className={cx(styles.closing, styles.reveal)} data-reveal>
              O problema nem sempre é falta de conhecimento. Muitas vezes, é falta de método.
            </p>
          </div>
        </section>

        {/* ================= DOBRA 03 — QUEBRA DE CRENÇA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.split}>
              <div className={styles.reveal} data-reveal>
                <h2 className={styles.h2}>Não é sobre trabalhar mais. É sobre trabalhar melhor.</h2>
                <p className={styles.text} style={{ marginTop: 22 }}>
                  Existe uma diferença entre simplesmente executar uma atividade e saber planejar,
                  organizar e acompanhar todo o processo.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  O profissional que evolui não depende exclusivamente da experiência ou do
                  improviso. Ele desenvolve métodos, utiliza ferramentas, acompanha resultados e
                  busca melhorar continuamente sua maneira de trabalhar.
                </p>
              </div>
              <div className={cx(styles.highlight, styles.reveal)} data-reveal>
                Profissionalismo não acontece por acaso. É construído com{" "}
                <span>conhecimento, organização e método.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 04 — APRESENTAÇÃO DA SOLUÇÃO ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={styles.solution}>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>A solução</span>
                <h2 className={styles.h2}>Conheça o SAIA DO IMPROVISO.</h2>
                <p className={styles.text} style={{ marginTop: 22 }}>
                  Uma aula prática para profissionais da construção civil que desejam abandonar a
                  desorganização e desenvolver uma maneira mais profissional de trabalhar.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  Com o {eventConfig.expert}, você vai conhecer métodos, ferramentas e tecnologias
                  que podem ajudar a transformar sua rotina profissional.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  Não importa se você é engenheiro, arquiteto, mestre de obras, técnico ou
                  empreiteiro. <strong>O importante é querer evoluir.</strong>
                </p>
                <div className={styles.ctaRow}>
                  <Cta onClick={() => handleCheckout("solucao")}>Quero participar da aula</Cta>
                </div>
              </div>

              <div className={cx(styles.solutionMedia, styles.reveal)} data-reveal>
                <img src={images.heroBg} alt="Obra em execução" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 05 — CONTEÚDO DA AULA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={cx(styles.center, styles.reveal)} data-reveal>
              <span className={styles.eyebrow}>Conteúdo</span>
              <h2 className={styles.h2}>O que você vai aprender?</h2>
            </div>

            <ol className={styles.timeline}>
              {lessonCards.map((lesson) => (
                <li key={lesson.number} className={styles.tlItem}>
                  <span className={styles.tlNode}>{lesson.number}</span>
                  <div className={styles.tlBody}>
                    <h3 className={styles.tlTitle}>{lesson.title}</h3>
                    <p className={styles.tlText}>{lesson.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className={cx(styles.center, styles.reveal)} data-reveal style={{ marginTop: 44 }}>
              <Cta onClick={() => handleCheckout("conteudo")}>Quero participar da aula</Cta>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 06 — INTELIGÊNCIA ARTIFICIAL NA PRÁTICA ================= */}
        <section className={cx(styles.section, styles["section--dark"])}>
          <div className={styles.container}>
            <div className={styles.aiGrid}>
              <div className={cx(styles.aiMedia, styles.reveal)} data-reveal>
                <img src={images.aiVisual} alt="Engenheiro usando ferramentas digitais" loading="lazy" />
              </div>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>Tecnologia na prática</span>
                <h2 className={styles.h2}>
                  A inteligência artificial pode transformar a maneira como você trabalha.
                </h2>
                <p className={styles.text} style={{ marginTop: 20 }}>
                  Você não precisa ser especialista em tecnologia para começar a utilizar
                  inteligência artificial na sua rotina.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  Durante a aula, Magno Santos demonstrará aplicações práticas de ferramentas como
                  ChatGPT para ajudar profissionais da construção civil a organizar melhor suas
                  atividades.
                </p>

                <div className={styles.aiList}>
                  {aiItems.map((item) => (
                    <div key={item.label} className={styles.aiItem}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                <p className={styles.aiClosing}>
                  Não fique apenas ouvindo sobre tecnologia. Veja como começar a utilizar essas
                  ferramentas na prática.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 07 — PARA QUEM É A AULA ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={cx(styles.center, styles.reveal)} data-reveal>
              <h2 className={styles.h2}>
                Se você trabalha com construção civil, essa aula é para você.
              </h2>
            </div>

            <div className={styles.chips}>
              {audienceItems.map((item) => (
                <span key={item.label} className={styles.chip}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>

            <p className={cx(styles.closing, styles.reveal)} data-reveal style={{ fontWeight: 500 }}>
              Independentemente da sua experiência, se você quer melhorar sua maneira de trabalhar,
              desenvolver organização e utilizar ferramentas modernas, essa experiência foi pensada
              para você.
            </p>

            <div className={cx(styles.center, styles.reveal)} data-reveal style={{ marginTop: 40 }}>
              <Cta onClick={() => handleCheckout("publico")}>Quero garantir minha vaga</Cta>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 08 — AUTORIDADE DO EXPERT ================= */}
        <section className={cx(styles.section, styles["section--ice"])}>
          <div className={styles.container}>
            <div className={styles.authority}>
              <div className={cx(styles.authorityPhoto, styles.reveal)} data-reveal>
                <img src={eventConfig.expertPhoto} alt={eventConfig.expert} loading="lazy" />
              </div>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>Quem conduz a aula</span>
                <h2 className={styles.h2}>Aprenda com quem conhece os desafios do mercado.</h2>
                <p className={styles.authorityName}>{eventConfig.expert}</p>
                <a
                  href={eventConfig.expertInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.authorityIg}
                >
                  @engenheiro.magno
                </a>
                <p className={styles.text}>
                  Engenheiro com experiência em grandes projetos de engenharia e infraestrutura,
                  Magno Santos construiu sua trajetória profissional participando de operações e
                  projetos de grande complexidade.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  Sua experiência inclui atuação em projetos relacionados ao Metrô de São Paulo e ao
                  setor de infraestrutura, além de sua atuação à frente da Coliseu Arquitetura e
                  Engenharia.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  Agora, compartilha conhecimentos e experiências para ajudar outros profissionais a
                  desenvolverem uma atuação mais organizada, preparada e profissional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 09 — RESUMO DA EXPERIÊNCIA E OFERTA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={cx(styles.center, styles.reveal)} data-reveal>
              <h2 className={styles.h2}>
                Um encontro para começar a mudar sua maneira de trabalhar.
              </h2>
            </div>

            <div className={styles.offer}>
              <div className={styles.specSheet}>
                {offerRows.map((row) => (
                  <div key={row.label} className={styles.specRow}>
                    <span className={styles.specLabel}>{row.label}</span>
                    <span className={styles.specValue}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className={styles.offerPrice}>
                  <div className={styles.offerPriceLabel}>Investimento</div>
                  <div className={styles.offerPriceValue}>{formatBRL(eventConfig.ticketPrice)}</div>
                  <Cta full onClick={() => handleCheckout("oferta")}>
                    Garantir minha vaga
                  </Cta>
                </div>
                <p className={styles.offerNote}>
                  Pagamento único. Acesso à aula ao vivo mediante confirmação da inscrição.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 10 — APRESENTAÇÃO DO ADICIONAL ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={cx(styles.center, styles.reveal)} data-reveal>
              <h2 className={styles.h2}>Quer rever a aula depois?</h2>
            </div>

            <div className={cx(styles.addon, styles.reveal)} data-reveal>
              <div>
                <p className={styles.text}>
                  A participação ao vivo está garantida com seu ingresso.
                </p>
                <p className={styles.text} style={{ marginTop: 14 }}>
                  Mas, se você também quiser assistir novamente às explicações e consultar as
                  demonstrações realizadas durante a aula, poderá adicionar a gravação à sua
                  inscrição.
                </p>
                <p className={styles.addonNote}>
                  Importante: a gravação não está incluída no ingresso principal. Ela será oferecida
                  como adicional no checkout.
                </p>
              </div>
              <div className={styles.addonPrice}>
                <div className={styles.addonPriceLabel}>Adicional</div>
                <div className={styles.addonPriceValue}>
                  {formatBRL(eventConfig.recordingPrice)}
                </div>
                <div className={styles.addonPriceLabel} style={{ marginTop: 8 }}>
                  Gravação da aula
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 11 — PERGUNTAS FREQUENTES ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={cx(styles.center, styles.reveal)} data-reveal>
              <span className={styles.eyebrow}>Dúvidas frequentes</span>
              <h2 className={styles.h2}>Perguntas frequentes</h2>
            </div>

            <div className={styles.faqList}>
              {faqItems.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className={styles.faqItem} data-open={isOpen}>
                    <button
                      type="button"
                      className={styles.faqBtn}
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      {faq.question}
                      <span className={cx(styles.faqIcon, "material-symbols-outlined")}>
                        expand_more
                      </span>
                    </button>
                    <div className={styles.faqPanel}>
                      <div className={styles.faqPanelInner}>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= DOBRA 12 — CTA FINAL ================= */}
        <section className={styles.finalCta}>
          <div className={styles.blueprint} />
          <div className={styles.container}>
            <div className={styles.finalInner}>
              <h2 className={styles.finalTitle}>
                A construção civil está evoluindo.{" "}
                <span className={styles.finalHighlight}>
                  Sua maneira de trabalhar também precisa evoluir.
                </span>
              </h2>
              <p className={styles.text} style={{ fontSize: "1.1rem" }}>
                Chega de depender do improviso. Comece a desenvolver uma maneira mais organizada,
                produtiva e profissional de trabalhar.
              </p>
              <div className={styles.finalBrand}>SAIA DO IMPROVISO</div>
              <p className={styles.finalMeta}>Com {eventConfig.expert}</p>
              <p className={styles.finalMeta}>{metaLine}</p>
              <div className={styles.finalPrice}>{formatBRL(eventConfig.ticketPrice)}</div>
              <Cta large pulse onClick={() => handleCheckout("cta-final")}>
                Quero garantir minha vaga
              </Cta>
            </div>
          </div>
        </section>
      </main>

      {/* Barra fixa de compra (mobile) */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyInner}>
          <div className={styles.stickyPrice}>
            <span>Ingresso</span>
            <strong>{formatBRL(eventConfig.ticketPrice)}</strong>
          </div>
          <Cta onClick={() => handleCheckout("barra-fixa")}>Garantir minha vaga</Cta>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <strong>GRUPO CLS</strong>
          &copy; {new Date().getFullYear()} Grupo CLS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
