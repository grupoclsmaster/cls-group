"use client";
import { useState, useEffect } from "react";
import { SkeletonGenericGrid } from "@/components/SkeletonLoading";

interface ResourceFile {
  id: string;
  name: string;
  desc: string;
  type: "pdf" | "spreadsheet" | "template" | "link";
  addedDate: string;
  fileSize?: string;
  downloadUrl: string;
}

const resourcesData: ResourceFile[] = [
  {
    id: "1",
    name: "Dossiê Cenário da Construção Civil & Infraestrutura",
    desc: "Visão geral abrangente do desempenho do setor de real estate, incorporação imobiliária e projeções macroeconômicas de infraestrutura.",
    type: "pdf",
    addedDate: "12 de Out, 2025",
    fileSize: "5.2 MB",
    downloadUrl: "#"
  },
  {
    id: "2",
    name: "Planilha de Viabilidade Econômica de Obras (EVTL)",
    desc: "Modelo completo para estudos de viabilidade técnica, legal e financeira (EVTL) de novos empreendimentos residenciais e comerciais.",
    type: "spreadsheet",
    addedDate: "08 de Out, 2025",
    fileSize: "14.8 MB",
    downloadUrl: "#"
  },
  {
    id: "3",
    name: "Master Deck para Apresentação de Projetos Civis",
    desc: "Template de apresentação executiva estruturado para captação de recursos com investidores de incorporação e roadshows de projetos civis.",
    type: "template",
    addedDate: "28 de Set, 2025",
    fileSize: "28.3 MB",
    downloadUrl: "#"
  },
  {
    id: "4",
    name: "Planilha de BDI & Custos Indiretos",
    desc: "Ferramenta avançada para cálculo de BDI (Benefícios e Despesas Indiretas) adaptada para orçamentos de obras corporativas e residenciais premium.",
    type: "spreadsheet",
    addedDate: "15 de Set, 2025",
    fileSize: "4.1 MB",
    downloadUrl: "#"
  },
  {
    id: "5",
    name: "Manual de Gestão Contratual & Claims em Obras",
    desc: "Manual prático com boas práticas jurídicas e de engenharia para gestão de pleitos (claims), aditivos contratuais e prevenção de litígios em obras.",
    type: "pdf",
    addedDate: "02 de Set, 2025",
    fileSize: "3.5 MB",
    downloadUrl: "#"
  },
  {
    id: "6",
    name: "Acesso Privado: Biblioteca BIM & ConTech Hub",
    desc: "Acesso ao repositório compartilhado de templates de modelagem BIM (Revit/Archicad) e contatos com startups ConTech parceiras.",
    type: "link",
    addedDate: "20 de Ago, 2025",
    downloadUrl: "https://bim.clspro.example.com"
  }
];

export default function RecursosPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SkeletonGenericGrid cols={2} rows={3} />;
  }

  const filteredResources = resourcesData.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(search.toLowerCase()) ||
      file.desc.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory =
      activeCategory === "todos" ||
      (activeCategory === "pdf" && file.type === "pdf") ||
      (activeCategory === "spreadsheet" && file.type === "spreadsheet") ||
      (activeCategory === "template" && file.type === "template") ||
      (activeCategory === "link" && file.type === "link");

    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "picture_as_pdf";
      case "spreadsheet":
        return "table_view";
      case "template":
        return "dashboard_customize";
      case "link":
        return "link";
      default:
        return "insert_drive_file";
    }
  };

  const handleDownload = (file: ResourceFile) => {
    if (file.type === "link") {
      window.open(file.downloadUrl, "_blank");
    } else {
      alert(`Simulando download do arquivo: ${file.name} (${file.fileSize})`);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <section style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
        <div>
          <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
            Biblioteca de Recursos
          </h2>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
            Materiais de apoio exclusivos, modelos financeiros e diretrizes táticas para acelerar a performance.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "20px" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Pesquisar materiais..."
            className="input-dark"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </section>

      {/* Bento Grid Layout for Categories */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        {/* Category: All */}
        <div
          onClick={() => setActiveCategory("todos")}
          className="glass-panel card-hover"
          style={{
            padding: "24px",
            borderRadius: "6px",
            cursor: "pointer",
            border: activeCategory === "todos" ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.1)",
            backgroundColor: activeCategory === "todos" ? "rgba(237, 192, 102, 0.05)" : "transparent"
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "32px", marginBottom: "16px" }}>folder</span>
          <h3 className="font-title-lg" style={{ fontSize: "16px", color: "var(--color-on-surface)", marginBottom: "4px" }}>Todos os Arquivos</h3>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>Todos os downloads consolidados.</p>
        </div>

        {/* Category: PDFs */}
        <div
          onClick={() => setActiveCategory("pdf")}
          className="glass-panel card-hover"
          style={{
            padding: "24px",
            borderRadius: "6px",
            cursor: "pointer",
            border: activeCategory === "pdf" ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.1)",
            backgroundColor: activeCategory === "pdf" ? "rgba(237, 192, 102, 0.05)" : "transparent"
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "32px", marginBottom: "16px" }}>picture_as_pdf</span>
          <h3 className="font-title-lg" style={{ fontSize: "16px", color: "var(--color-on-surface)", marginBottom: "4px" }}>PDFs Executivos</h3>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>Guias estratégicos, relatórios e manuais.</p>
        </div>

        {/* Category: Spreadsheets */}
        <div
          onClick={() => setActiveCategory("spreadsheet")}
          className="glass-panel card-hover"
          style={{
            padding: "24px",
            borderRadius: "6px",
            cursor: "pointer",
            border: activeCategory === "spreadsheet" ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.1)",
            backgroundColor: activeCategory === "spreadsheet" ? "rgba(237, 192, 102, 0.05)" : "transparent"
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "32px", marginBottom: "16px" }}>table_view</span>
          <h3 className="font-title-lg" style={{ fontSize: "16px", color: "var(--color-on-surface)", marginBottom: "4px" }}>Planilhas & Cálculos</h3>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>Modelos de viabilidade e simuladores de valuation.</p>
        </div>

        {/* Category: Templates */}
        <div
          onClick={() => setActiveCategory("template")}
          className="glass-panel card-hover"
          style={{
            padding: "24px",
            borderRadius: "6px",
            cursor: "pointer",
            border: activeCategory === "template" ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.1)",
            backgroundColor: activeCategory === "template" ? "rgba(237, 192, 102, 0.05)" : "transparent"
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "32px", marginBottom: "16px" }}>dashboard_customize</span>
          <h3 className="font-title-lg" style={{ fontSize: "16px", color: "var(--color-on-surface)", marginBottom: "4px" }}>Templates Prontos</h3>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>Apresentações executivas e propostas comerciais.</p>
        </div>
      </section>

      {/* Resource Table List */}
      <section className="glass-panel" style={{ borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", fontSize: "18px" }}>
            Uploads Recentes e Acessos
          </h3>
          <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">
            {filteredResources.length} {filteredResources.length === 1 ? "recurso disponível" : "recursos disponíveis"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">NOME DO MATERIAL</th>
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">DESCRIÇÃO</th>
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">TIPO / TAMANHO</th>
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)", textAlign: "right" }} className="font-label-caps">AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((file) => (
                  <tr
                    key={file.id}
                    className="card-hover"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background-color 0.2s" }}
                  >
                    {/* Name */}
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(237, 192, 102, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(237, 192, 102, 0.2)"
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>
                            {getIcon(file.type)}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: "14px", display: "block" }}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                            Adicionado em {file.addedDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ padding: "20px 24px", color: "var(--color-on-surface-variant)", fontSize: "13px", maxWidth: "350px" }}>
                      {file.desc}
                    </td>

                    {/* Type and Size */}
                    <td style={{ padding: "20px 24px", color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                      <span className="font-label-caps" style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "2px", marginRight: "8px" }}>
                        {file.type}
                      </span>
                      {file.fileSize && <span>{file.fileSize}</span>}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "20px 24px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDownload(file)}
                        className="btn-primary"
                        style={{
                          display: "inline-flex",
                          padding: "8px 16px",
                          fontSize: "11px",
                          gap: "4px",
                          backgroundColor: file.type === "link" ? "transparent" : "var(--color-secondary)",
                          color: file.type === "link" ? "var(--color-secondary)" : "var(--color-on-secondary)",
                          border: file.type === "link" ? "1px solid var(--color-secondary)" : "none"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                          {file.type === "link" ? "open_in_new" : "download"}
                        </span>
                        {file.type === "link" ? "ACESSAR" : "BAIXAR"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--color-on-surface-variant)" }}>
                    Nenhum recurso encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
