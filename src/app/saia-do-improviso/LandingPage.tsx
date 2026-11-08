"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./landing.module.css";
import { eventConfig, formatBRL, images, metaLine, siteConfig, trackingConfig } from "./config";
import { track, trackPixel } from "./tracking";
import {
  aiItems,
  audienceProfiles,
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

/* ---------- Botão CTA reutilizável ---------- */
interface CtaProps {
  children: ReactNode;
  large?: boolean;
  full?: boolean;
  pulse?: boolean;
  onClick: () => void;
}

function Cta({ children, large, full, pulse, onClick }: CtaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        styles.cta,
        large && styles["cta--lg"],
        full && styles["cta--full"],
        pulse && styles["cta--pulse"],
      )}
    >
      <span>{children}</span>
      <span className={cx(styles.ctaArrow, "material-symbols-outlined")}>arrow_forward</span>
    </button>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* Reveal ao rolar + eventos de página e scroll depth */
  useEffect(() => {
    track("page_view", { page: siteConfig.path, event: eventConfig.name });
    trackPixel("PageView");
    trackPixel("ViewContent", {
      content_name: eventConfig.name,
      value: eventConfig.ticketPrice,
      currency: "BRL",
    });

    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    elements.forEach((el) => io.observe(el));

    const firedDepths = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      for (const mark of [25, 50, 75, 90]) {
        if (pct >= mark && !firedDepths.has(mark)) {
          firedDepths.add(mark);
          track("scroll_depth", { percent: mark });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Fallback de segurança: torna tudo visível caso o IntersectionObserver falhe no mobile
    const fallbackTimer = setTimeout(() => {
      elements.forEach((el) => el.setAttribute("data-visible", "true"));
    }, 1000);

    return () => {
      clearTimeout(fallbackTimer);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Redireciona para o checkout (ou rola para a oferta se URL ainda vazia) */
  const handleCheckout = (origin: string) => {
    track("cta_click", {
      origin,
      event: eventConfig.name,
      value: eventConfig.ticketPrice,
      currency: "BRL",
    });
    trackPixel("InitiateCheckout", {
      content_name: eventConfig.name,
      value: eventConfig.ticketPrice,
      currency: "BRL",
    });

    if (eventConfig.checkoutUrl) {
      window.location.href = eventConfig.checkoutUrl;
      return;
    }

    const offerEl = document.getElementById("inscricao");
    if (offerEl) {
      offerEl.scrollIntoView({ behavior: "smooth" });
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
        {/* ================= DOBRA 01: HERO ================= */}
        <section className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.blueprint} />
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div>
                <h1 className={styles.heroTitle}>
                  Pare de tocar obra apagando incêndio e perdendo margem.
                </h1>
                <p className={styles.heroLead}>
                  O método prático para <strong>engenheiros que precisam estruturar seu negócio</strong> e <strong>mestres de obras que querem organizar o canteiro</strong> e blindar o lucro que realmente sobra no bolso.
                </p>
                <div className={styles.heroMeta}>
                  <span className="material-symbols-outlined">calendar_month</span>
                  {metaLine}
                </div>
                <div className={styles.heroCta}>
                  <Cta large pulse onClick={() => handleCheckout("hero")}>
                    Quero sair do improviso
                  </Cta>
                  <span className={styles.heroSubNote}>
                    Encontro prático e ao vivo. Acesso imediato ao link após confirmação.
                  </span>
                </div>
              </div>

              <div className={styles.heroPhotoWrap}>
                <div className={styles.heroPhotoFrame}>
                  <Image
                    className={styles.heroPhoto}
                    src={eventConfig.expertPhoto}
                    alt={eventConfig.expert}
                    fill
                    priority
                    unoptimized
                  />
                  <div className={styles.heroPhotoTag}>
                    <strong>{eventConfig.expert}</strong>
                    <span>Engenharia Civil • Infraestrutura • Gestão de Obras</span>
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

        {/* ================= DOBRA 02: REALIDADE DO CANTEIRO ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={cx(styles.sectionHeader, styles.reveal)} data-reveal>
              <span className={styles.eyebrow}>A realidade do campo</span>
              <h2 className={styles.h2}>
                O improviso custa caro. E quase sempre sai do seu bolso.
              </h2>
              <p className={styles.text} style={{ marginTop: 16 }}>
                Quem vive rotina de obra sabe que trabalhar sem processo transforma qualquer projeto em dor de cabeça diária:
              </p>
            </div>

            <div className={styles.problemGrid}>
              {problemCards.map((item) => (
                <article key={item.title} className={cx(styles.problemCard, styles.reveal)} data-reveal>
                  <div className={styles.problemIconWrap}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <span className={styles.problemTag}>{item.tag}</span>
                    <h3 className={styles.diagTitle}>{item.title}</h3>
                    <p className={styles.diagText}>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= DOBRA 03: O MÉTODO NA PRÁTICA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.solution}>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>Saia do Improviso</span>
                <h2 className={styles.h2}>
                  O que muda quando você implanta processo na sua rotina.
                </h2>
                <p className={styles.text} style={{ marginTop: 20 }}>
                  Não é teoria de faculdade nem planilha impossível de preencher. Na aula do dia 20 de novembro, {eventConfig.expert} vai mostrar na tela como organiza suas próprias obras na Coliseu Arquitetura e Engenharia.
                </p>

                <ul className={styles.methodChecklist}>
                  <li>
                    <span className="material-symbols-outlined">check_circle</span>
                    <div>
                      <strong>Previsibilidade de compras e suprimentos:</strong> saiba exatamente o que entra na obra na semana seguinte antes de faltar no canteiro.
                    </div>
                  </li>
                  <li>
                    <span className="material-symbols-outlined">check_circle</span>
                    <div>
                      <strong>Conferência padronizada de execução:</strong> checklists diretos de campo para blindar sua obra contra erros de alvenaria, fôrma e instalações.
                    </div>
                  </li>
                  <li>
                    <span className="material-symbols-outlined">check_circle</span>
                    <div>
                      <strong>Alinhamento claro com clientes e empreiteiros:</strong> registros objetivos de avanço físico e financeiro que evitam discussões e prejuízos.
                    </div>
                  </li>
                </ul>

                <div className={styles.ctaRow}>
                  <Cta onClick={() => handleCheckout("solucao")}>Quero aplicar esse método</Cta>
                </div>
              </div>

              <div className={cx(styles.solutionMedia, styles.reveal)} data-reveal>
                <Image
                  src={images.houseConstruction}
                  alt="Obra residencial de alto padrão em execução organizada"
                  fill
                  unoptimized
                  className={styles.mediaCover}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 04: INTELIGÊNCIA ARTIFICIAL NA OBRA ================= */}
        <section className={cx(styles.section, styles["section--dark"])}>
          <div className={styles.container}>
            <div className={styles.aiGrid}>
              <div className={cx(styles.aiMedia, styles.reveal)} data-reveal>
                <Image
                  src={images.aiTechnology}
                  alt="Magno Santos utilizando Inteligência Artificial na gestão de obras"
                  fill
                  unoptimized
                  className={styles.mediaCover}
                />
              </div>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>Inteligência Artificial Aplicada</span>
                <h2 className={styles.h2}>
                  Faça em 5 minutos o que antes tomava a sua noite inteira no computador.
                </h2>
                <p className={styles.text} style={{ marginTop: 18 }}>
                  Esqueça textos robóticos. Durante a aula, você vai ver ao vivo como configurar o ChatGPT para trabalhar como seu assistente técnico de engenharia e gestão:
                </p>

                <div className={styles.aiCardsGrid}>
                  {aiItems.map((item) => (
                    <div key={item.title} className={styles.aiCard}>
                      <div className={styles.aiCardHeader}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <strong>{item.title}</strong>
                      </div>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 05: ROTEIRO DA AULA ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={cx(styles.sectionHeader, styles.reveal)} data-reveal>
              <span className={styles.eyebrow}>Conteúdo Programático</span>
              <h2 className={styles.h2}>O que será aberto ao vivo no dia 20/11</h2>
            </div>

            <div className={styles.curriculumGrid}>
              {lessonCards.map((lesson) => (
                <div key={lesson.title} className={cx(styles.curriculumCard, styles.reveal)} data-reveal>
                  <span className={styles.curriculumTag}>{lesson.tag}</span>
                  <h3 className={styles.tlTitle}>{lesson.title}</h3>
                  <p className={styles.tlText}>{lesson.text}</p>
                </div>
              ))}
            </div>

            <div className={styles.audienceSection}>
              <h3 className={styles.audienceTitle}>Para quem este encontro foi desenhado:</h3>
              <div className={styles.audienceGrid}>
                {audienceProfiles.map((profile) => (
                  <div key={profile.role} className={styles.audienceCol}>
                    <h4>{profile.role}</h4>
                    <span className={styles.audienceSubtitle}>{profile.subtitle}</span>
                    <p>{profile.description}</p>
                    <ul className={styles.audienceBenefits}>
                      {profile.benefits.map((benefit) => (
                        <li key={benefit}>
                          <span className="material-symbols-outlined">check_circle</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 06: QUEM CONDUZ A AULA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.authority}>
              <div className={cx(styles.authorityPhoto, styles.reveal)} data-reveal>
                <Image
                  src={images.expertField}
                  alt={`${eventConfig.expert} no canteiro de obras`}
                  fill
                  unoptimized
                  className={styles.authorityImg}
                />
              </div>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>Seu Mentor</span>
                <h2 className={styles.h2}>{eventConfig.expert}</h2>
                <a
                  href={eventConfig.expertInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.authorityIg}
                >
                  @engenheiro.magno
                </a>
                <p className={styles.text}>
                  Engenheiro civil com experiência prática em grandes operações de engenharia e infraestrutura pesada, com atuação nas linhas do <strong>Metrô de São Paulo (Linha 1-Azul, Linha 2-Verde, Linha 3-Vermelha, Linha 4-Amarela, Linha 5-Lilás, Linha 6-Laranja, Linha 15-Prata e Linha 17-Ouro Monotrilho)</strong>, além de fundador à frente da <strong>Coliseu Arquitetura e Engenharia</strong>.
                </p>
                <p className={styles.text} style={{ marginTop: 16 }}>
                  Depois de anos no campo vendo onde os projetos travam e onde o dinheiro é desperdiçado por falta de método, reuniu as ferramentas de planejamento, controle de canteiro e Inteligência Artificial que usa todos os dias para ensinar profissionais a trabalharem com organização e previsibilidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 07: INSCRIÇÃO E OFERTA ================= */}
        <section id="inscricao" className={cx(styles.section, styles["section--dark"])}>
          <div className={styles.blueprint} />
          <div className={styles.container}>
            <div className={styles.offer}>
              <div className={styles.reveal} data-reveal>
                <span className={styles.eyebrow}>Passaporte de Acesso</span>
                <h2 className={styles.h2}>
                  Garanta seu lugar na transmissão ao vivo.
                </h2>
                <p className={styles.text} style={{ marginTop: 16 }}>
                  Um investimento simbólico para organizar seu método de trabalho antes do próximo ano começar.
                </p>

                <div className={styles.specSheet}>
                  {offerRows.map((row) => (
                    <div key={row.label} className={styles.specRow}>
                      <span className={styles.specLabel}>{row.label}</span>
                      <span className={styles.specValue}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.reveal} data-reveal>
                <div className={styles.offerPrice}>
                  <div className={styles.offerPriceLabel}>Ingresso Individual • Lote Atual</div>
                  <div className={styles.offerPriceValue}>{formatBRL(eventConfig.ticketPrice)}</div>
                  <p className={styles.offerPriceSub}>
                    Pagamento único via PIX ou cartão.
                  </p>
                  <Cta full pulse onClick={() => handleCheckout("oferta")}>
                    Garantir minha vaga agora
                  </Cta>
                  <div className={styles.addonNotice}>
                    <span className="material-symbols-outlined">videocam</span>
                    <span>
                      <strong>Quer rever depois?</strong> No checkout você poderá incluir o acesso vitalício à gravação da aula por apenas +{formatBRL(eventConfig.recordingPrice)}.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOBRA 08: PERGUNTAS FREQUENTES ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={cx(styles.sectionHeader, styles.faqHeader, styles.reveal)} data-reveal>
              <span className={styles.eyebrow}>Tire suas dúvidas</span>
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
      </main>

      {/* Barra fixa de compra (mobile) */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyInner}>
          <div className={styles.stickyPrice}>
            <span>Aula ao vivo</span>
            <strong>20/11 às 19h</strong>
          </div>
          <Cta onClick={() => handleCheckout("barra-fixa")}>Garantir vaga</Cta>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <strong>GRUPO CLS • COLISEU ARQUITETURA E ENGENHARIA</strong>
          &copy; {new Date().getFullYear()} Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
