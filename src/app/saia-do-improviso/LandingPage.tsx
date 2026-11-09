"use client";

import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./landing.module.css";
import { eventConfig, formatBRL, images, siteConfig, trackingConfig } from "./config";
import { track, trackPixel } from "./tracking";
import {
  aiItems,
  audienceProfiles,
  faqItems,
  lessonCards,
  offerRows,
  problemCards,
} from "./content";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

const metroLines = [
  "Linha 1-Azul",
  "Linha 2-Verde",
  "Linha 3-Vermelha",
  "Linha 4-Amarela",
  "Linha 5-Lilás",
  "Linha 6-Laranja",
  "Linha 15-Prata",
  "Linha 17-Ouro",
];

const includedItems = [
  `Aula ao vivo pelo ${eventConfig.platform} com ${eventConfig.expert}`,
  "Planejamento semanal, checklists práticos e controle de rotina",
  "Demonstração de IA aplicada ao seu dia a dia, na tela",
  "Link de acesso enviado por WhatsApp e e-mail",
];

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
  onClick: () => void;
}

function Cta({ children, large, full, onClick }: CtaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(styles.cta, large && styles["cta--lg"], full && styles["cta--full"])}
    >
      <span>{children}</span>
      <span className={cx(styles.ctaArrow, "material-symbols-outlined")} aria-hidden="true">
        arrow_forward
      </span>
    </button>
  );
}

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cx("material-symbols-outlined", className)} aria-hidden="true">
      {name}
    </span>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSticky, setShowSticky] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const offerRef = useRef<HTMLElement>(null);

  /* Eventos de página e scroll depth */
  useEffect(() => {
    track("page_view", { page: siteConfig.path, event: eventConfig.name });
    trackPixel("PageView");
    trackPixel("ViewContent", {
      content_name: eventConfig.name,
      value: eventConfig.ticketPrice,
      currency: "BRL",
    });

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
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Barra fixa: aparece depois que o CTA do topo sai da tela e some na seção de oferta */
  useEffect(() => {
    const heroEl = heroCtaRef.current;
    const offerEl = offerRef.current;
    if (!heroEl || !offerEl || typeof IntersectionObserver === "undefined") return;

    let heroVisible = true;
    let offerVisible = false;
    const update = () => setShowSticky(!heroVisible && !offerVisible);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroEl) heroVisible = entry.isIntersecting;
        if (entry.target === offerEl) offerVisible = entry.isIntersecting;
      });
      update();
    });
    io.observe(heroEl);
    io.observe(offerEl);
    return () => io.disconnect();
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
    document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" });
  };

  const price = formatBRL(eventConfig.ticketPrice);

  return (
    <div className={cx(styles.root, jakarta.variable)}>
      <TrackingScripts />

      <main className={styles.main}>
        {/* ================= HERO ================= */}
        <section className={styles.hero}>
          <div className={styles.blueprint} />
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div>
                <span className={styles.heroBadge}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  Aula ao vivo · 20 de Novembro às 19h
                </span>
                <h1 className={styles.heroTitle}>
                  Pare de viver apagando incêndio e perdendo dinheiro no improviso.
                </h1>
                <p className={styles.heroLead}>
                  Seja você empresário, empreendedor, autônomo ou engenheiro: trabalhar duro sem método é uma armadilha. Conheça as 3 engrenagens práticas para <strong>organizar a sua rotina</strong>, <strong>estruturar processos</strong> e <strong>fazer o lucro sobrar no seu bolso</strong>.
                </p>

                <dl className={styles.heroFacts}>
                  <div>
                    <dt>Data</dt>
                    <dd>{eventConfig.dateShort}</dd>
                  </div>
                  <div>
                    <dt>Horário</dt>
                    <dd>{eventConfig.timeLabel} (Brasília)</dd>
                  </div>
                  <div>
                    <dt>Onde</dt>
                    <dd>Ao vivo no {eventConfig.platform}</dd>
                  </div>
                  <div>
                    <dt>Acesso</dt>
                    <dd>Vagas Limitadas</dd>
                  </div>
                </dl>

                <div className={styles.heroCta} ref={heroCtaRef}>
                  <Cta large onClick={() => handleCheckout("hero")}>
                    Quero sair do improviso
                  </Cta>
                  <span className={styles.heroSubNote}>
                    <Icon name="lock" />
                    Pagamento único via PIX ou cartão. Link enviado após a confirmação.
                  </span>
                </div>

                <div className={styles.expertStrip}>
                  <img src={eventConfig.expertPhoto} alt="" width={48} height={48} />
                  <div>
                    <strong>Com {eventConfig.expert}</strong>
                    <span>Engenheiro civil · Fundador da Coliseu</span>
                  </div>
                </div>
              </div>

              <div className={styles.heroPhotoWrap}>
                <div className={styles.heroPhotoFrame}>
                  <img
                    className={styles.heroPhoto}
                    src={eventConfig.expertPhoto}
                    alt={eventConfig.expert}
                    loading="eager"
                    decoding="async"
                  />
                  <div className={styles.heroPhotoTag}>
                    <div>
                      <strong>{eventConfig.expert}</strong>
                      <span>Engenharia · Gestão de Operações · Inteligência Artificial</span>
                    </div>
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

        {/* ================= ATO 1: O DIAGNÓSTICO ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Ato 1 · O Diagnóstico</span>
              <h2 className={styles.h2}>O problema nunca foi a sua dedicação. É o improviso devorando seu tempo e seu lucro.</h2>
              <p className={styles.text}>
                Ninguém te ensinou a estruturar processos: nem na faculdade, nem no início do negócio. Trabalhar 14 horas por dia sem método é uma armadilha. Todo santo dia você se desdobra para entregar, mas o retorno vai embora nos mesmos ralos:
              </p>
            </div>

            <div className={styles.problemList}>
              {problemCards.map((item) => (
                <article key={item.title} className={styles.problemItem}>
                  <div className={styles.problemHead}>
                    <Icon name={item.icon} className={styles.problemIcon} />
                    <span className={styles.problemTag}>{item.tag}</span>
                  </div>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemText}>{item.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.narrativeBridge}>
              <strong>A verdade nua e crua:</strong> trabalhar 14 horas por dia não vai resolver isso. Você não precisa de mais esforço braçal: precisa de um método testado na trincheira.
            </div>
          </div>
        </section>

        {/* ================= ATO 2: O ENCONTRO COM O GUIA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.authority}>
              <figure className={styles.authorityPhoto}>
                <img
                  src={images.expertField}
                  alt={`${eventConfig.expert} no canteiro de obras`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <div>
                <span className={styles.eyebrow}>Ato 2 · O Mentor</span>
                <h2 className={styles.h2}>Eu já estive exatamente no seu lugar. E aprendi a criar processos no ambiente mais exigente do país.</h2>
                <a
                  href={eventConfig.expertInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.authorityIg}
                >
                  @engenheiro.magno
                </a>
                <p className={styles.text}>
                  Sei na pele o que é passar o dia inteiro resolvendo urgências e sentir que a operação depende 100% da sua presença. Atuei nas maiores operações de engenharia e infraestrutura pesada do país, incluindo <strong>todas as linhas do Metrô de São Paulo</strong>, e hoje estou à frente da <strong>Coliseu Arquitetura e Engenharia</strong>.
                </p>

                <div className={styles.metro}>
                  <span className={styles.metroLabel}>Atuação nas Linhas do Metrô de São Paulo</span>
                  <ul className={styles.metroLines}>
                    {metroLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <p className={styles.text}>
                  Na grande infraestrutura, 1 dia de improviso gera prejuízo milionário. Em qualquer empresa ou profissão, custa a sua paz e a margem do seu negócio. O método rigoroso que usei para coordenar operações gigantescas foi transformado em <strong>3 engrenagens simples</strong> para qualquer pessoa aplicar no seu negócio ou carreira.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ATO 3: O PLANO DE RESGATE ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={styles.split}>
              <div>
                <span className={styles.eyebrow}>Ato 3 · As 3 Engrenagens</span>
                <h2 className={styles.h2}>O método prático para o seu negócio rodar sem surpresas.</h2>
                <p className={styles.text}>
                  Esqueça teoria acadêmica e planilhas gigantes que ninguém preenche. No dia {eventConfig.dateShort}, você vai ver na prática como estruturo cada etapa na Coliseu:
                </p>

                <ul className={styles.checklist}>
                  <li>
                    <Icon name="check" />
                    <div>
                      <strong>Previsibilidade de demandas:</strong> antecipar o que a sua operação vai precisar na semana seguinte. Nunca mais corra atrás de urgências nem perca dinheiro com atrasos.
                    </div>
                  </li>
                  <li>
                    <Icon name="check" />
                    <div>
                      <strong>Checklists rápidos de 3 minutos:</strong> como criar padrões de conferência para garantir qualidade máxima sem precisar fazer tudo com as próprias mãos.
                    </div>
                  </li>
                  <li>
                    <Icon name="check" />
                    <div>
                      <strong>Comunicação blindada com clientes:</strong> relatórios e escopos claros que transmitem autoridade, eliminam desconfiança e garantem pagamentos em dia.
                    </div>
                  </li>
                </ul>

                <div className={styles.ctaRow}>
                  <Cta onClick={() => handleCheckout("solucao")}>Quero aplicar esse método</Cta>
                </div>
              </div>

              <figure className={styles.media}>
                <img
                  src={images.houseConstruction}
                  alt="Operação organizada e profissional em execução"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>
          </div>
        </section>

        {/* ================= ATO 4: A NOVA FERRAMENTA ================= */}
        <section className={cx(styles.section, styles["section--dark"])}>
          <div className={styles.container}>
            <div className={cx(styles.split, styles["split--reverse"])}>
              <div>
                <span className={styles.eyebrow}>Ato 4 · O Aliado Secreto</span>
                <h2 className={styles.h2}>
                  Faça em 3 minutos pelo celular o que antes tomava a sua noite inteira.
                </h2>
                <p className={styles.text}>
                  Esqueça termos técnicos ou teoria de TI. Na aula, eu vou abrir a tela do celular e te mostrar como transformar a Inteligência Artificial no seu assistente mais ágil de gestão:
                </p>

                <ul className={styles.aiList}>
                  {aiItems.map((item) => (
                    <li key={item.title}>
                      <Icon name={item.icon} />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <figure className={cx(styles.media, styles["media--dark"], styles["media--square"])}>
                <img
                  src={images.aiTechnology}
                  alt={`${eventConfig.expert} demonstrando inteligência artificial aplicada à gestão e processos`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>
          </div>
        </section>

        {/* ================= ATO 5: O ROTEIRO DA AULA ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Ato 5 · O Treinamento</span>
              <h2 className={styles.h2}>O que nós vamos abrir juntos na tela no dia {eventConfig.dateShort}:</h2>
              <p className={styles.text}>
                Direto ao ponto, com exemplos práticos da rotina e modelos prontos para você copiar e usar no seu negócio já no dia seguinte.
              </p>
            </div>

            <ol className={styles.agenda}>
              {lessonCards.map((lesson) => {
                const [step, area] = lesson.tag.split("•").map((s) => s.trim());
                return (
                  <li key={lesson.title} className={styles.agendaRow}>
                    <div className={styles.agendaMeta}>
                      <span className={styles.agendaStep}>{step}</span>
                      <span className={styles.agendaArea}>{area}</span>
                    </div>
                    <div>
                      <h3 className={styles.itemTitle}>{lesson.title}</h3>
                      <p className={styles.itemText}>{lesson.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ================= ATO 6: PARA QUEM É ================= */}
        <section className={cx(styles.section, styles["section--gray"])}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Ato 6 · Para Quem É</span>
              <h2 className={styles.h2}>Perfis diferentes. O mesmo alívio no fim do mês.</h2>
              <p className={styles.text}>
                Qualquer pessoa pode sair do improviso: não importa o tamanho da sua empresa ou a sua área de atuação, sem processos claros você trabalha muito e vê pouco retorno.
              </p>
            </div>

            <div className={styles.audienceGrid}>
              {audienceProfiles.map((profile) => (
                <div key={profile.role} className={styles.audienceCol}>
                  <h3 className={styles.audienceRole}>{profile.role}</h3>
                  <span className={styles.audienceSubtitle}>{profile.subtitle}</span>
                  <p className={styles.itemText}>{profile.description}</p>
                  <ul className={styles.audienceBenefits}>
                    {profile.benefits.map((benefit) => (
                      <li key={benefit}>
                        <Icon name="check" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ATO 7: A GRANDE DECISÃO ================= */}
        <section
          id="inscricao"
          ref={offerRef}
          className={cx(styles.section, styles["section--dark"])}
        >
          <div className={styles.blueprint} />
          <div className={styles.container}>
            <div className={styles.offer}>
              <div>
                <span className={styles.eyebrow}>Ato 7 · A Escolha</span>
                <h2 className={styles.h2}>Mais um ano apagando incêndio ou uma noite para virar a chave?</h2>
                <p className={styles.text}>
                  Continuar no improviso custa caro: um único retrabalho, erro de orçamento ou cliente insatisfeito já custa muito mais do que o valor simbólico deste encontro.
                </p>

                <dl className={styles.specSheet}>
                  {offerRows.map((row) => (
                    <div key={row.label} className={styles.specRow}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className={styles.priceCard}>
                <div className={styles.priceHead}>
                  <span className={styles.priceLabel}>Ingresso individual · 1º Lote</span>
                  <span className={styles.priceDate}>
                    {eventConfig.dateShort} · {eventConfig.timeLabel}
                  </span>
                </div>
                <div className={styles.priceValue}>{price}</div>
                <p className={styles.priceSub}>Pagamento único via PIX ou cartão</p>

                <ul className={styles.included}>
                  {includedItems.map((item) => (
                    <li key={item}>
                      <Icon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Cta full onClick={() => handleCheckout("oferta")}>
                  Garantir minha vaga agora
                </Cta>

                <div className={styles.addonNotice}>
                  <Icon name="videocam" />
                  <span>
                    <strong>Quer rever depois?</strong> No checkout você poderá incluir a gravação vitalícia da aula por +{formatBRL(eventConfig.recordingPrice)}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.faqLayout}>
              <div className={styles.faqIntro}>
                <span className={styles.eyebrow}>Dúvidas</span>
                <h2 className={styles.h2}>Perguntas frequentes</h2>
              </div>

              <div className={styles.faqList}>
                {faqItems.map((faq, index) => {
                  const isOpen = openFaq === index;
                  const panelId = `faq-panel-${index}`;
                  return (
                    <div key={faq.question} className={styles.faqItem} data-open={isOpen}>
                      <button
                        type="button"
                        className={styles.faqBtn}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        {faq.question}
                        <Icon name="add" className={styles.faqIcon} />
                      </button>
                      <div id={panelId} className={styles.faqPanel} role="region">
                        <div className={styles.faqPanelInner}>
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA FINAL ================= */}
        <section className={styles.closing}>
          <div className={cx(styles.container, styles.closingInner)}>
            <div>
              <strong>
                {eventConfig.dateLabel}, às {eventConfig.timeLabel}, ao vivo no {eventConfig.platform}.
              </strong>
              <span>Ingresso por {price}. O link chega por WhatsApp e e-mail após a confirmação.</span>
            </div>
            <Cta onClick={() => handleCheckout("cta-final")}>Garantir minha vaga</Cta>
          </div>
        </section>
      </main>

      {/* Barra fixa de compra (mobile) */}
      <div className={styles.stickyBar} data-visible={showSticky} inert={!showSticky}>
        <div className={styles.stickyInner}>
          <div className={styles.stickyPrice}>
            <strong>{price}</strong>
            <span>
              {eventConfig.dateShort} · {eventConfig.timeLabel}
            </span>
          </div>
          <Cta onClick={() => handleCheckout("barra-fixa")}>Garantir vaga</Cta>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <strong>Grupo CLS · Coliseu Arquitetura e Engenharia</strong>
          <span>&copy; {new Date().getFullYear()} Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
