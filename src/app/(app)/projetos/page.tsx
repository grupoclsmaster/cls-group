"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonGenericGrid } from "@/components/SkeletonLoading";

interface ProjectSpec {
  area: string;
  suites: string;
  bathrooms: string;
  executionTime: string;
  estimatedCost: number;
  appraisalValue: number;
}

interface ProjectFile {
  name: string;
  type: string;
  size: string;
}

interface Project {
  id: string;
  title: string;
  category: "luxury" | "micro-living" | "chalet";
  categoryLabel: string;
  description: string;
  image: string;
  badge: string;
  badgeColor: string; // "secondary" | "primary" | "tertiary"
  roi: string;
  highlightLabel: string;
  highlightValue: string;
  specs: ProjectSpec;
  files: ProjectFile[];
}

const projectsData: Project[] = [
  {
    id: "residencia-horizon",
    title: "Residência Horizon",
    category: "luxury",
    categoryLabel: "Residência de Luxo",
    description: "Mansões contemporâneas com foco em sustentabilidade, design biofílico e automação residencial. Projetada para terrenos em condomínios de altíssimo padrão, unindo sofisticação e engenharia moderna.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWrOztEooOM02xGQF3AS83ZsrznjhwH5wa5-P17Vt2sgVxTa3okKRDMA1KxqDc47IP-vmKgtQv_mea6DhaHuoCJP6dWh0Rn5o8xQXRsxR5JAezlPJ7XRPKlIn6HG7P8r2sp1hpSEDmyHVY3UUGWlDo2B_e6SDXmCfGGjWRhbzH8GjxUZku5viBOLJo6RCouHo2yIv5dL2o0WV41dn_iEZhoVeXaA-7SxMARfWAOHjeVGBzOa79wCd9nqzlt1mCNgxtD5wWqY5-t3ww",
    badge: "PREMIUM",
    badgeColor: "secondary",
    roi: "18.5% a.a.",
    highlightLabel: "LOCALIZAÇÃO",
    highlightValue: "Alpha Village",
    specs: {
      area: "580m²",
      suites: "4 Suítes",
      bathrooms: "6 Banheiros",
      executionTime: "12 meses",
      estimatedCost: 2400000,
      appraisalValue: 4200000,
    },
    files: [
      { name: "Planta_Baixa_Executiva_Horizon.pdf", type: "PDF", size: "14.2 MB" },
      { name: "Memorial_Descritivo_Acabamentos.pdf", type: "PDF", size: "8.5 MB" },
      { name: "Estudo_Viabilidade_Financeira_Horizon.xlsx", type: "EVTL", size: "4.1 MB" },
    ],
  },
  {
    id: "studio-urban-loft",
    title: "Studio Urban Loft",
    category: "micro-living",
    categoryLabel: "Micro-Living Premium",
    description: "Studios inteligentes projetados para máxima rentabilidade em aluguéis de curta e média duração (AirBnb/Short stay). Conta com design escandinavo, otimização de espaço e alta liquidez.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLJxKknaCrDpriZatUdkGNuW5yye5PVoVE9l5M2SQWwjEfsmVZexFD6cjwKk6ySmCk9rMKYj7oMu-q70aT4hOz11zjlOeLYJhIjmGkT7p0p_eyl9H0H_cLC_1mgtmGyZeUB2oBU8dA_GiHUWF_8YJkmbPT7v6mzYxL4vy0PqDwh9I0AtpUhV5IlDhjJPxQ3wxhVAYnb95X51m1NqfaobFTCNg7ezb22p0PFqy61Cvd_f9FLGZBCn_6GwvIBq-XRdfz0SebaElqAQ33",
    badge: "ALTA DEMANDA",
    badgeColor: "primary",
    roi: "22.1% a.a.",
    highlightLabel: "PRODUTO",
    highlightValue: "6 Unidades",
    specs: {
      area: "210m² (Total)",
      suites: "6 Estúdios",
      bathrooms: "6 Banheiros",
      executionTime: "8 meses",
      estimatedCost: 960000,
      appraisalValue: 1800000,
    },
    files: [
      { name: "Planta_Implantacao_Studios_Urban.pdf", type: "PDF", size: "11.6 MB" },
      { name: "Memorial_Instalacoes_Automacao.pdf", type: "PDF", size: "6.2 MB" },
      { name: "Estudo_Rentabilidade_Locacao_Studios.xlsx", type: "EVTL", size: "3.8 MB" },
    ],
  },
  {
    id: "refugio-chale-alpine",
    title: "Refúgio Chalé Alpine",
    category: "chalet",
    categoryLabel: "Chalés de Refúgio",
    description: "Retiros de luxo em destinos de montanha e serra. Arquitetura vernacular (A-Frame) fundida com minimalismo moderno, utilizando materiais nobres como pedra natural, madeira tratada e vidro duplo.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7yi9zFoc9cSNQA_aoxdDqvsQGd5UVMzNbuAtFxSKENkEcMI-DVeYB83fZjojvtTXjbBm6iglmb71ELDnjBl9bxuZc1OSuK14uvTniPmthJJqt7O05EsM_Xy_bSi2cdbel23errQ5YnJIJWAe_FkPql4FAPf3ySFGtV_KexsIMpk762CpbKyQfIz9htqIpXTxmOMGj3br0d5FSq0eIkn1jNaR-ibmV61LoR0MqP0ZrhaJMv2tGjntupg7CV0GJpqHo8mwGW21GUf7t",
    badge: "EXCLUSIVO",
    badgeColor: "tertiary",
    roi: "15.8% a.a.",
    highlightLabel: "VALORIZAÇÃO",
    highlightValue: "+35% Lançam.",
    specs: {
      area: "120m²",
      suites: "2 Suítes",
      bathrooms: "3 Banheiros",
      executionTime: "6 meses",
      estimatedCost: 450000,
      appraisalValue: 750000,
    },
    files: [
      { name: "Projeto_Arquitetonico_Alpine_AFrame.pdf", type: "PDF", size: "18.1 MB" },
      { name: "Detalhes_Estruturais_Madeira_Pedra.pdf", type: "PDF", size: "9.4 MB" },
      { name: "Simulacao_Airbnb_Rentabilidade_Turismo.xlsx", type: "EVTL", size: "5.0 MB" },
    ],
  },
];

export default function ProjetosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // File Download Simulation State
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Financing Simulator States
  const [simProjectId, setSimProjectId] = useState<string>(projectsData[0].id);
  const [simTotalValue, setSimTotalValue] = useState<number>(projectsData[0].specs.estimatedCost);
  const [simDownPaymentPercent, setSimDownPaymentPercent] = useState<number>(20); // 20%
  const [simMonths, setSimMonths] = useState<number>(120);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSendingToManager, setIsSendingToManager] = useState(false);

  // Sync simulator inputs when project selection changes in simulator dropdown
  useEffect(() => {
    const syncSimProject = async () => {
      const selected = projectsData.find((p) => p.id === simProjectId);
      if (selected) {
        setSimTotalValue(selected.specs.estimatedCost);
      }
    };

    void syncSimProject();
  }, [simProjectId]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to filter projects
  const filteredProjects = projectsData.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = activeCategory === "todos" || p.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate financing values
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const downPaymentAmount = (simTotalValue * simDownPaymentPercent) / 100;
  const financedAmount = simTotalValue - downPaymentAmount;

  // Club Pro Rate: 8.5% a.a. -> Monthly Rate
  const clubAnnualRate = 0.085;
  const clubMonthlyRate = Math.pow(1 + clubAnnualRate, 1 / 12) - 1;

  // Market Rate: 11.5% a.a. -> Monthly Rate
  const marketAnnualRate = 0.115;
  const marketMonthlyRate = Math.pow(1 + marketAnnualRate, 1 / 12) - 1;

  // PMT Amortization Formula: PMT = P * (i * (1+i)^n) / ((1+i)^n - 1)
  const calculatePMT = (principal: number, rate: number, months: number) => {
    if (rate === 0) return principal / months;
    return (principal * (rate * Math.pow(1 + rate, months))) / (Math.pow(1 + rate, months) - 1);
  };

  const monthlyInstallmentClub = calculatePMT(financedAmount, clubMonthlyRate, simMonths);
  const monthlyInstallmentMarket = calculatePMT(financedAmount, marketMonthlyRate, simMonths);

  const totalPaidClub = monthlyInstallmentClub * simMonths + downPaymentAmount;
  const totalPaidMarket = monthlyInstallmentMarket * simMonths + downPaymentAmount;
  const estimatedSavings = Math.max(0, totalPaidMarket - totalPaidClub);

  // Simulated download action
  const handleDownload = (fileName: string) => {
    setDownloadingFile(fileName);
    setTimeout(() => {
      setDownloadingFile(null);
      showToast(`Arquivo "${fileName}" baixado com sucesso!`, "success");

      // Trigger actual dummy file download in browser
      try {
        const element = document.createElement("a");
        const file = new Blob(["Simulado: " + fileName], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } catch (err) {
        console.error("Erro ao iniciar download:", err);
      }
    }, 1500);
  };

  // Add notification function helper
  const addSystemNotification = (title: string, description: string, link: string) => {
    try {
      const saved = localStorage.getItem("cls_notifications");
      let notificationsList = [];
      if (saved) {
        try {
          notificationsList = JSON.parse(saved);
        } catch (e) {
          notificationsList = [];
        }
      }
      const newNotification = {
        id: `notif-${Date.now()}`,
        title,
        description,
        type: "oportunidade",
        time: "Agora mesmo",
        read: false,
        link,
      };
      localStorage.setItem("cls_notifications", JSON.stringify([newNotification, ...notificationsList]));
      window.dispatchEvent(new Event("cls_notifications_changed"));
    } catch (err) {
      console.error("Erro ao registrar notificação:", err);
    }
  };

  const handleSimulateSubmit = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      showToast("Simulação financeira gerada e salva no seu perfil!", "success");

      const selectedProj = projectsData.find((p) => p.id === simProjectId);
      const projName = selectedProj ? selectedProj.title : "Projeto Customizado";
      addSystemNotification(
        "Financiamento Simulado",
        `Simulação de R$ ${simTotalValue.toLocaleString()} (${simMonths}x) salva para ${projName}.`,
        "/projetos"
      );
    }, 1200);
  };

  const handleFalarComGerente = () => {
    setIsSendingToManager(true);
    setTimeout(() => {
      setIsSendingToManager(false);
      showToast("Solicitação enviada! Um gerente de crédito entrará em contato em breve.", "success");

      const selectedProj = projectsData.find((p) => p.id === simProjectId);
      const projName = selectedProj ? selectedProj.title : "Projeto Customizado";
      addSystemNotification(
        "Mesa de Crédito Acionada",
        `Análise de crédito iniciada para o projeto ${projName}. Consultor entrará em contato por telefone.`,
        "/oportunidades"
      );
    }, 1500);
  };

  if (loading) {
    return <SkeletonGenericGrid cols={3} rows={1} />;
  }

  return (
    <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Page Header */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
        <div>
          <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
            Projetos para Financiamento
          </h2>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
            Explore e faça o download de projetos prontos, e simule linhas de financiamento exclusivas com a taxa de 8.5% a.a. do clube.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "20px" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Pesquisar projetos, plantas ou memoriais..."
            className="input-dark"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </section>

      {/* Intro Hero with decorative abstract background */}
      <section
        className="glass-panel"
        style={{
          borderRadius: "8px",
          padding: "40px",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(145, 179, 225, 0.2)"
        }}
      >
        <div style={{ position: "relative", zIndex: 10, maxWidth: "700px" }}>
          <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "11px", letterSpacing: "0.2em", display: "block", marginBottom: "12px" }}>
            CURADORIA EXCLUSIVA
          </span>
          <h3 className="font-display" style={{ fontSize: "36px", marginBottom: "16px", lineHeight: "1.2" }}>
            Arquitetura de Elite, <br />
            <span style={{ color: "var(--color-secondary)", fontStyle: "italic" }}>Investimento Seguro.</span>
          </h3>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", lineHeight: "1.7" }}>
            Tenha acesso completo a projetos de chalés, studios e kitnets minuciosamente validados por nossa equipe técnica. Baixe as plantas completas, memoriais construtivos e faça estudos de viabilidade econômica com suporte de ponta.
          </p>
        </div>
        {/* Glow decoration */}
        <div style={{ position: "absolute", right: "-10%", bottom: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(145, 179, 225, 0.08) 0%, transparent 70%)" }} />
      </section>

      {/* Tabs Filter */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <nav style={{ display: "flex", gap: "32px", overflowX: "auto", paddingBottom: "12px" }} className="hide-scroll">
          {[
            { id: "todos", label: "TODOS OS PROJETOS" },
            { id: "luxury", label: "RESIDÊNCIAS DE LUXO" },
            { id: "micro-living", label: "MICRO-LIVING & KITNETS" },
            { id: "chalet", label: "CHALÉS DE REFÚGIO" }
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
                fontSize: "11px"
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {/* Projects Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            let badgeStyle = { backgroundColor: "rgba(145, 179, 225, 0.15)", color: "var(--color-secondary)", border: "1px solid rgba(145, 179, 225, 0.3)" };
            if (project.badgeColor === "primary") {
              badgeStyle = { backgroundColor: "rgba(194, 194, 245, 0.15)", color: "var(--color-primary)", border: "1px solid rgba(194, 194, 245, 0.3)" };
            } else if (project.badgeColor === "tertiary") {
              badgeStyle = { backgroundColor: "rgba(251, 182, 162, 0.15)", color: "var(--color-tertiary)", border: "1px solid rgba(251, 182, 162, 0.3)" };
            }

            return (
              <article
                key={project.id}
                className="glass-panel card-hover"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "transform 0.3s ease, border-color 0.3s ease",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedProject(project)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(145, 179, 225, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }}
              >
                {/* Project Image */}
                <div style={{ height: "180px", width: "100%", position: "relative", overflow: "hidden", backgroundColor: "var(--color-surface-container-low)" }}>
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      padding: "4px 10px",
                      borderRadius: "2px",
                      fontSize: "9px",
                      ...badgeStyle
                    }}
                    className="font-label-caps"
                  >
                    {project.badge}
                  </div>
                </div>

                {/* Info Content */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h4 className="font-headline-sm" style={{ color: "var(--color-on-surface)", marginBottom: "8px", fontSize: "20px" }}>
                    {project.title}
                  </h4>
                  <p style={{ color: "var(--color-on-surface-variant)", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {project.description}
                  </p>

                  {/* Highlights block */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "20px" }}>
                    <div>
                      <span className="font-label-caps" style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "2px" }}>ROI ESTIMADO</span>
                      <span className="mono-numbers" style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-secondary)" }}>{project.roi}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="font-label-caps" style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "2px" }}>{project.highlightLabel}</span>
                      <span className="mono-numbers" style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-on-surface)" }}>{project.highlightValue}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                    <button
                      className="btn-outline"
                      style={{
                        padding: "8px 16px",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                    >
                      VER DETALHES
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>open_in_new</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--color-on-surface-variant)" }} className="glass-panel">
            <span className="material-symbols-outlined" style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.3 }}>search_off</span>
            <p className="font-body-lg">Nenhum projeto encontrado para os termos pesquisados.</p>
          </div>
        )}
      </section>

      {/* Financing Simulator Section */}
      <section
        id="simulador"
        className="glass-panel"
        style={{
          borderRadius: "8px",
          border: "1px solid rgba(145, 179, 225, 0.25)",
          padding: "40px",
          marginTop: "20px"
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>
            FERRAMENTA EXCLUSIVA DE MESA DE CRÉDITO
          </span>
          <h3 className="font-headline-md" style={{ color: "var(--color-secondary)", margin: 0 }}>
            Simulador de Financiamento CLS
          </h3>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
            Simule o parcelamento e o custo final com taxas exclusivas de 8.5% a.a. para membros do clube.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
          {/* Simulator Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Project Select */}
            <div>
              <label className="font-label-caps" style={{ display: "block", fontSize: "10px", color: "var(--color-outline)", marginBottom: "8px" }}>
                SELECIONAR PROJETO
              </label>
              <select
                className="input-dark"
                value={simProjectId}
                onChange={(e) => setSimProjectId(e.target.value)}
                style={{ appearance: "none", backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"white\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')", backgroundPosition: "right 12px center", backgroundRepeat: "no-repeat" }}
              >
                {projectsData.map((p) => (
                  <option key={p.id} value={p.id} style={{ backgroundColor: "#131316", color: "#e5e1e6" }}>
                    {p.title} ({formatCurrency(p.specs.estimatedCost)})
                  </option>
                ))}
                <option value="custom" style={{ backgroundColor: "#131316", color: "#e5e1e6" }}>Outro / Customizado</option>
              </select>
            </div>

            {/* Total Value Input */}
            <div>
              <label className="font-label-caps" style={{ display: "block", fontSize: "10px", color: "var(--color-outline)", marginBottom: "8px" }}>
                VALOR DO PROJETO / OBRA (R$)
              </label>
              <input
                type="number"
                className="input-dark"
                value={simTotalValue}
                onChange={(e) => setSimTotalValue(Number(e.target.value))}
                min={50000}
                max={50000000}
              />
            </div>

            {/* Down Payment % Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="font-label-caps" style={{ fontSize: "10px", color: "var(--color-outline)" }}>
                  ENTRADA (A PARTIR DE 10%)
                </label>
                <span className="mono-numbers" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-secondary)" }}>
                  {simDownPaymentPercent}% ({formatCurrency(downPaymentAmount)})
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={simDownPaymentPercent}
                onChange={(e) => setSimDownPaymentPercent(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--color-secondary)",
                  background: "var(--color-surface-container-highest)",
                  height: "4px",
                  borderRadius: "2px",
                  outline: "none"
                }}
              />
            </div>

            {/* Amortization Term (Months) Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="font-label-caps" style={{ fontSize: "10px", color: "var(--color-outline)" }}>
                  PRAZO DE PAGAMENTO
                </label>
                <span className="mono-numbers" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-on-surface)" }}>
                  {simMonths} meses ({Math.round(simMonths / 12)} anos)
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="360"
                step="12"
                value={simMonths}
                onChange={(e) => setSimMonths(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--color-secondary)",
                  background: "var(--color-surface-container-highest)",
                  height: "4px",
                  borderRadius: "2px",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          <div
            className="glass-panel-dark"
            style={{
              borderRadius: "6px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(145, 179, 225, 0.15)",
              backgroundColor: "rgba(7, 7, 50, 0.4)",
              justifyContent: "space-between"
            }}
          >
            <div>
              <span className="font-label-caps" style={{ display: "block", fontSize: "9px", color: "var(--color-outline)", marginBottom: "4px" }}>
                VALOR ESTIMADO DA PARCELA MENSAL
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                <span className="font-headline-md mono-numbers" style={{ color: "var(--color-secondary)", fontSize: "36px", fontWeight: 700 }}>
                  {formatCurrency(monthlyInstallmentClub)}
                </span>
                <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>/mês</span>
              </div>

              {/* Installment breakdown list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-on-surface-variant)" }}>Valor Financiado:</span>
                  <span className="mono-numbers" style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{formatCurrency(financedAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-on-surface-variant)" }}>Valor da Entrada:</span>
                  <span className="mono-numbers" style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{formatCurrency(downPaymentAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-on-surface-variant)" }}>Taxa de Juros Especial CLS:</span>
                  <span className="mono-numbers" style={{ fontWeight: 600, color: "var(--color-secondary)" }}>8.5% a.a. <span className="mono-numbers" style={{ fontSize: "10px", color: "var(--color-outline)" }}>(~0.68% a.m.)</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-on-surface-variant)" }}>Taxa de Mercado de Referência:</span>
                  <span className="mono-numbers" style={{ fontWeight: 500, color: "var(--color-outline)", textDecoration: "line-through" }}>11.5% a.a.</span>
                </div>
              </div>

              {/* Economy Highlights */}
              <div
                style={{
                  backgroundColor: "rgba(145, 179, 225, 0.08)",
                  border: "1px solid rgba(145, 179, 225, 0.2)",
                  borderRadius: "4px",
                  padding: "16px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "28px" }}>savings</span>
                <div>
                  <span className="font-label-caps" style={{ display: "block", fontSize: "9px", color: "var(--color-secondary)" }}>ECONOMIA EXCLUSIVA CLUB PRO</span>
                  <span className="mono-numbers" style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                    Você economiza {formatCurrency(estimatedSavings)}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "auto" }}>
              <button
                className="btn-primary"
                style={{ flex: 1, minWidth: "150px" }}
                onClick={handleSimulateSubmit}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite", fontSize: "18px" }}>sync</span>
                    SIMULANDO...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>insights</span>
                    SALVAR SIMULAÇÃO
                  </>
                )}
              </button>

              <button
                className="btn-outline"
                style={{ flex: 1, minWidth: "150px" }}
                onClick={handleFalarComGerente}
                disabled={isSendingToManager}
              >
                {isSendingToManager ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite", fontSize: "18px" }}>sync</span>
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>support_agent</span>
                    FALAR COM GERENTE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Details Modal */}
      {selectedProject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(1, 1, 5, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setSelectedProject(null)}
        >
          {/* Modal Container */}
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "750px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "8px",
              border: "1px solid var(--color-secondary)",
              animation: "fadeIn 0.25s ease-out",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--color-surface)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div style={{ width: "100%", height: "200px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--color-surface) 0%, transparent 100%)" }} />

              {/* Close button */}
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  backgroundColor: "rgba(14, 14, 17, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "color 0.2s"
                }}
                className="hover-gold-text"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>

              {/* Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "24px",
                  backgroundColor: "rgba(145, 179, 225, 0.2)",
                  border: "1px solid var(--color-secondary)",
                  color: "var(--color-secondary)",
                  padding: "4px 12px",
                  borderRadius: "2px",
                  fontSize: "10px"
                }}
                className="font-label-caps"
              >
                {selectedProject.categoryLabel}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Header Titles */}
              <div>
                <h3 className="font-headline-md" style={{ color: "var(--color-on-surface)", fontSize: "28px", marginBottom: "8px" }}>
                  {selectedProject.title}
                </h3>
                <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", lineHeight: "1.7" }}>
                  {selectedProject.description}
                </p>
              </div>

              {/* Specifications Table */}
              <div>
                <h4 className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "10px", marginBottom: "12px" }}>
                  ESPECIFICAÇÕES TÉCNICAS E FINANCEIRAS
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                  {[
                    { label: "ÁREA TOTAL", value: selectedProject.specs.area },
                    { label: "COMPOSIÇÃO", value: selectedProject.specs.suites },
                    { label: "BANHEIROS", value: selectedProject.specs.bathrooms },
                    { label: "CUSTO ESTIMADO DE OBRA", value: formatCurrency(selectedProject.specs.estimatedCost), highlight: true },
                    { label: "VALOR DA AVALIAÇÃO", value: formatCurrency(selectedProject.specs.appraisalValue) },
                    { label: "ROI ANUALIZADO", value: selectedProject.roi, highlight: true },
                    { label: "TEMPO DE EXECUÇÃO", value: selectedProject.specs.executionTime },
                    { label: "TAXA DE FINANCIAMENTO CLS", value: "8.5% a.a.", highlight: true },
                  ].map((spec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        backgroundColor: "var(--color-surface-container-low)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}
                    >
                      <span className="font-label-caps" style={{ fontSize: "8px", color: "var(--color-outline)" }}>
                        {spec.label}
                      </span>
                      <span className="mono-numbers" style={{ fontSize: "14px", fontWeight: 600, color: spec.highlight ? "var(--color-secondary)" : "var(--color-on-surface)" }}>
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Downloads Section */}
              <div>
                <h4 className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "10px", marginBottom: "12px" }}>
                  DOCUMENTAÇÃO TÉCNICA E MEMORIAIS
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedProject.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="glass-panel"
                      style={{
                        padding: "16px 20px",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "4px",
                            backgroundColor: file.type === "PDF" ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: file.type === "PDF" ? "#ef4444" : "#22c55e",
                            fontWeight: 700,
                            fontSize: "10px"
                          }}
                          className="font-label-caps"
                        >
                          {file.type}
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--color-on-surface)" }}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                            Tamanho: {file.size}
                          </span>
                        </div>
                      </div>

                      <button
                        className="btn-outline"
                        style={{
                          padding: "8px 16px",
                          fontSize: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                        disabled={downloadingFile === file.name}
                        onClick={() => handleDownload(file.name)}
                      >
                        {downloadingFile === file.name ? (
                          <>
                            <span className="material-symbols-outlined" style={{ animation: "spin 1.5s linear infinite", fontSize: "14px" }}>sync</span>
                            BAIXANDO...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>download</span>
                            DOWNLOAD
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div style={{ display: "flex", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginTop: "12px" }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setSimProjectId(selectedProject.id);
                    setSelectedProject(null);
                    const el = document.getElementById("simulador");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calculate</span>
                  SIMULAR FINANCIAMENTO
                </button>
                <button
                  className="btn-outline"
                  style={{ color: "var(--color-on-surface)", borderColor: "rgba(255, 255, 255, 0.15)" }}
                  onClick={() => setSelectedProject(null)}
                >
                  FECHAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert popup */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: toast.type === "success" ? "#0f2d1e" : "#3c1618",
            border: toast.type === "success" ? "1px solid #22c55e" : "1px solid #ef4444",
            color: "#ffffff",
            padding: "16px 24px",
            borderRadius: "4px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <span className="material-symbols-outlined" style={{ color: toast.type === "success" ? "#22c55e" : "#ef4444" }}>
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-body-md" style={{ fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* Dynamic Spin Animation and Monospace Numbers Style Rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .mono-numbers {
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', Courier, monospace !important;
          font-variant-numeric: tabular-nums;
        }
      `}} />
    </div>
  );
}
