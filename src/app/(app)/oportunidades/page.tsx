"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonGenericGrid } from "@/components/SkeletonLoading";

interface InvestmentAsset {
  id: string;
  title: string;
  category: "incorporacao" | "infraestrutura" | "missoes-tecnicas" | "contech";
  categoryLabel: string;
  desc: string;
  longDesc: string;
  img: string;
  badge?: string;
  targetIrr: string;
  minInvestment: string;
  status: string;
}

const assetsData: InvestmentAsset[] = [
  {
    id: "nexus-commercial",
    title: "Nexus Commercial Tower",
    category: "incorporacao",
    categoryLabel: "Incorporação Corporativa",
    desc: "Co-investimento em torre corporativa Classe A com certificação LEED e modelagem 100% BIM em São Paulo.",
    longDesc: "A Nexus Commercial Tower representa o estado da arte em edifícios corporativos sustentáveis e inteligentes. O co-investimento destina-se à incorporação e aquisição de três lajes corporativas premium construídas com tecnologia BIM avançada e certificação LEED Gold, já locadas para multinacionais, garantindo rendimento imediato e alto potencial de ganho de capital na venda em bloco no médio prazo.",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    badge: "Sustentabilidade & BIM",
    targetIrr: "18.5% a.a. projetada",
    minInvestment: "R$ 250.000",
    status: "Captação Ativa"
  },
  {
    id: "cls-mastermind-dubai",
    title: "CLS Technical Tour Dubai - High-Rises",
    category: "missoes-tecnicas",
    categoryLabel: "Missões Técnicas",
    desc: "Visita técnica guiada para engenheiros e incorporadores para analisar as maiores obras e estruturas de Dubai.",
    longDesc: "Imersão técnica internacional restrita a 12 membros do ecossistema. O programa inclui reuniões exclusivas com os engenheiros estruturais do Burj Khalifa, visitas técnicas a canteiros de obras de megaempreendimentos em Dubai e discussões sobre novas tecnologias construtivas, métodos de planejamento acelerado e wealth preservation.",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    badge: "Exclusivo para Mentorados",
    targetIrr: "N/A (Imaterial)",
    minInvestment: "R$ 45.000 / vaga",
    status: "Vagas Limitadas"
  },
  {
    id: "heritage-infrastructure-fund",
    title: "Heritage Infrastructure Fund I",
    category: "infraestrutura",
    categoryLabel: "Infraestrutura & Obras Públicas",
    desc: "Fundo fechado para financiamento de obras de infraestrutura urbana, saneamento e logística de grande porte.",
    longDesc: "O Heritage Infrastructure Fund I capta recursos privados para atuar em consórcios de obras públicas e privadas de grande escala, como concessões de saneamento básico, rodovias de pedágio e portos secos. Foco em previsibilidade de fluxo de caixa e proteção contra inflação com garantias reais de ativos de engenharia e infraestrutura estruturados pelo ecossistema.",
    img: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800",
    badge: "Foco em Yield & Infra",
    targetIrr: "14.2% a.a. histórica",
    minInvestment: "R$ 100.000",
    status: "Apenas Convidados"
  },
  {
    id: "horizon-residence",
    title: "The Horizon Residence Portfolio",
    category: "incorporacao",
    categoryLabel: "Incorporação Residencial de Luxo",
    desc: "Portfólio de incorporação e construção de residências de altíssimo padrão em condomínios fechados costeiros.",
    longDesc: "Portfólio estruturado de multipropriedade e incorporação residencial de luxo na região litorânea premium. Une engenharia estrutural de ponta para terrenos complexos e projetos arquitetônicos sob medida assinados pela mentora Arq. Mayara Costa. Alta rentabilidade operacional por meio de locação de curta temporada gerida por concierge.",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    badge: "Oportunidade Âncora",
    targetIrr: "22.4% a.a. estimada",
    minInvestment: "R$ 500.000",
    status: "Captação Prioritária"
  },
  {
    id: "buildtech-solutions",
    title: "BuildTech Solutions - Série A",
    category: "contech",
    categoryLabel: "ConTech & Inovação",
    desc: "Rodada de investimento Venture Capital em startup de inteligência artificial aplicada ao planejamento e controle de obras.",
    longDesc: "A BuildTech Solutions é uma das contechs mais promissoras do Brasil, fornecendo software de visão computacional e inteligência artificial para monitoramento em tempo real de canteiros de obras de grande porte. A captação de Série A visa acelerar a expansão comercial no mercado norte-americano e no ecossistema global da construção civil.",
    img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=800",
    badge: "Alta Escalaridade",
    targetIrr: "35% a.a. projetada (VC)",
    minInvestment: "R$ 150.000",
    status: "Captação Ativa"
  }
];

export default function OportunidadesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  
  // Modal for detail view
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAsset | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sem-permissao");
        return;
      }
      
      const { data: member } = await supabase
        .from("members")
        .select("member_type")
        .eq("id", user.id)
        .single();
        
      if (!member || member.member_type !== "admin") {
        router.push("/sem-permissao");
        return;
      }
      
      setLoading(false);
    };
    
    checkAccess();
  }, [router, supabase]);

  if (loading) {
    return <SkeletonGenericGrid cols={2} rows={2} />;
  }

  const filteredAssets = assetsData.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(search.toLowerCase()) ||
      asset.desc.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory =
      activeCategory === "todos" || asset.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <section style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
        <div>
          <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
            Oportunidades de Investimento
          </h2>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
            Acesso a captações fechadas, investimentos corporativos e ativos reais exclusivos estruturados para membros.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "20px" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Pesquisar oportunidades..."
            className="input-dark"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </section>

      {/* Featured Asset Hero Banner */}
      <section
        className="glass-panel"
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          height: "380px",
          display: "flex",
          alignItems: "flex-end",
          padding: "40px",
          marginBottom: "48px",
          border: "1px solid rgba(10, 82, 185, 0.25)"
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14, 14, 17, 1) 0%, rgba(14, 14, 17, 0.4) 60%, transparent 100%)" }} />

        {/* Hero Content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: "600px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(10, 82, 185, 0.15)", border: "1px solid rgba(10, 82, 185, 0.3)", padding: "4px 10px", borderRadius: "2px", marginBottom: "16px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "14px" }}>star</span>
            <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "9px" }}>OPORTUNIDADE DESTAQUE</span>
          </div>

          <h3 className="font-display-mobile" style={{ color: "var(--color-on-surface)", fontSize: "28px", marginBottom: "12px" }}>
            The Horizon Residence Portfolio
          </h3>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px", lineHeight: "1.6" }}>
            Incorporação residencial de alto padrão com projetos assinados pela Arq. Mayara Costa e engenharia estrutural complexa. Rentabilidade projetada em 22.4% a.a. com gestão integrada do ativo.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedAsset(assetsData.find(a => a.id === "horizon-residence") || null)}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              ANALISAR PITCH
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Tab Filters */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "32px" }}>
        <nav style={{ display: "flex", gap: "32px", overflowX: "auto", paddingBottom: "12px" }} className="hide-scroll">
          {[
            { id: "todos", label: "TODOS OS PROJETOS" },
            { id: "incorporacao", label: "INCORPORAÇÃO" },
            { id: "infraestrutura", label: "INFRAESTRUTURA" },
            { id: "missoes-tecnicas", label: "MISSÕES TÉCNICAS" },
            { id: "contech", label: "CONTECH" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className="font-label-caps"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeCategory === tab.id ? "2px solid var(--color-secondary)" : "2px solid transparent",
                color: activeCategory === tab.id ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                paddingBottom: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "11px",
                letterSpacing: "0.1em"
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {/* Grid List */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <article
              key={asset.id}
              className="glass-panel card-hover"
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative"
              }}
            >
              {/* Asset Image */}
              <div style={{ aspectRatio: "16/10", position: "relative", backgroundColor: "var(--color-surface-container)" }}>
                <img src={asset.img} alt={asset.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "rgba(14, 14, 17, 0.8)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "2px", fontSize: "9px" }} className="font-label-caps">
                  {asset.categoryLabel}
                </div>
              </div>

              {/* Asset Info */}
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
                  {asset.title}
                </h3>
                <p style={{ color: "var(--color-on-surface-variant)", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1 }}>
                  {asset.desc}
                </p>

                {/* Key Metrics block */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px", padding: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ display: "block", fontSize: "9px", color: "var(--color-outline)" }} className="font-label-caps">TIR PROJETADA</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-secondary)" }}>{asset.targetIrr}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontSize: "9px", color: "var(--color-outline)" }} className="font-label-caps">APORTE MÍNIMO</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-on-surface)" }}>{asset.minInvestment}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", marginTop: "auto" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-secondary)", fontWeight: 600 }} className="font-label-caps">
                    {asset.status}
                  </span>
                  <button
                    onClick={() => setSelectedAsset(asset)}
                    style={{ background: "none", border: "none", color: "var(--color-on-surface)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700 }}
                    className="hover-gold-text font-label-caps"
                  >
                    SABER MAIS
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--color-on-surface-variant)" }}>
            Nenhuma oportunidade de investimento encontrada.
          </div>
        )}
      </section>

      {/* Pitch Desk Modal Detail */}
      {selectedAsset && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(1,1,5,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "680px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--color-secondary)",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn 0.3s ease-out"
            }}
          >
            {/* Modal Image banner */}
            <div style={{ aspectRatio: "16/6", position: "relative", backgroundColor: "var(--color-surface-container)" }}>
              <img src={selectedAsset.img} alt={selectedAsset.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--color-background), transparent)" }} />
              <button
                onClick={() => setSelectedAsset(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                className="hover-gold-text"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "32px", backgroundColor: "var(--color-background)" }}>
              <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px", display: "block", marginBottom: "4px" }}>
                {selectedAsset.categoryLabel}
              </span>
              <h3 className="font-headline-sm" style={{ fontSize: "24px", color: "var(--color-on-surface)", marginBottom: "16px" }}>
                {selectedAsset.title}
              </h3>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px", lineHeight: "1.7", marginBottom: "24px" }}>
                {selectedAsset.longDesc}
              </p>

              {/* Performance / Investment requirements grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px", padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                <div>
                  <span style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "2px" }} className="font-label-caps">RETORNO ESPERADO (TIR)</span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-secondary)" }}>{selectedAsset.targetIrr}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "2px" }} className="font-label-caps">MÍNIMO EXIGIDO</span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-on-surface)" }}>{selectedAsset.minInvestment}</span>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "2px" }} className="font-label-caps">STATUS VAGAS</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-secondary)" }}>{selectedAsset.status}</span>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "2px" }} className="font-label-caps">PRAZO ESTIMADO DE RETORNO</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-on-surface)" }}>36 a 60 meses</span>
                </div>
              </div>

              {/* Call to action */}
              <div style={{ display: "flex", gap: "16px" }}>
                <button
                  onClick={() => alert(`Sua manifestação de interesse na oportunidade '${selectedAsset.title}' foi registrada. O gestor do fundo entrará em contato em até 24 horas.`)}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  MANIFESTAR INTERESSE
                </button>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="btn-outline"
                  style={{ color: "var(--color-on-surface)", borderColor: "rgba(255,255,255,0.15)" }}
                >
                  FECHAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
