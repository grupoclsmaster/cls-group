"use client";
import { useState, useEffect } from "react";
import { SkeletonGenericGrid } from "@/components/SkeletonLoading";
import { createClient } from "@/utils/supabase/client";
import DateTimePicker from "@/components/DateTimePicker";

interface ResourceFile {
  id: string;
  title: string;
  description: string;
  category: "pdf" | "spreadsheet" | "template" | "link";
  created_at: string;
  size?: string;
  file_url: string;
  format: string;
  available_at: string | null;
}

export default function RecursosPage() {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [editingResource, setEditingResource] = useState<ResourceFile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formFormat, setFormFormat] = useState("XLSX");
  const [formSize, setFormSize] = useState("");
  const [formAvailableAt, setFormAvailableAt] = useState("");
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");

  // Fetch current user and resources on load
  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      let isUserAdmin = false;
      if (user) {
        const { data: member } = await supabase
          .from("members")
          .select("id, name, img, role, initials, member_type")
          .eq("id", user.id)
          .single();
        if (member) {
          setCurrentUser(member);
          const emailLower = user.email?.toLowerCase();
          const isEmailAdmin = emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com";
          if (member.member_type === "admin" || member.role === "admin" || isEmailAdmin) {
            isUserAdmin = true;
            setIsAdmin(true);
          }
        }
      }

      const { data: dbResources, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(dbResources || []);
    } catch (err) {
      console.error("Erro ao carregar recursos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const detectCategory = (urlOrFormat: string): "pdf" | "spreadsheet" | "template" | "link" => {
    const clean = urlOrFormat.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase() || urlOrFormat.toLowerCase();
    if (["xlsx", "xls", "csv", "numbers"].includes(clean)) {
      return "spreadsheet";
    } else if (clean === "pdf") {
      return "pdf";
    } else if (["doc", "docx", "ppt", "pptx", "key", "keynote", "zip", "rar", "tar", "gz", "7z"].includes(clean)) {
      return "template";
    }
    return "link";
  };

  // Handle resource upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      setFormUrl(data.url);
      setFormFormat(data.format || "PDF");
      setFormSize(data.size || "0.0 MB");
      
      if (!formTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFormTitle(nameWithoutExt);
      }
    } catch (err: any) {
      alert(err.message || "Erro ao enviar arquivo.");
    } finally {
      setUploadingFile(false);
    }
  };

  // Add new resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formUrl) {
      alert("Preencha o título e a URL do arquivo.");
      return;
    }
    setSubmitting(true);
    try {
      const finalCategory = detectCategory(formUrl || formFormat || "link");
      const { error } = await supabase.from("resources").insert([{
        title: formTitle,
        category: finalCategory,
        description: formDesc,
        file_url: formUrl,
        format: formFormat.toUpperCase() || "LINK",
        size: formSize || "0.0 MB",
        available_at: formAvailableAt ? new Date(formAvailableAt).toISOString() : null
      }]);

      if (error) throw error;
      setShowCreateModal(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao criar recurso.");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit existing resource
  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !formTitle || !formUrl) return;
    setSubmitting(true);
    try {
      const finalCategory = detectCategory(formUrl || formFormat || "link");
      const { error } = await supabase
        .from("resources")
        .update({
          title: formTitle,
          category: finalCategory,
          description: formDesc,
          file_url: formUrl,
          format: formFormat.toUpperCase() || "LINK",
          size: formSize || "0.0 MB",
          available_at: formAvailableAt ? new Date(formAvailableAt).toISOString() : null
        })
        .eq("id", editingResource.id);

      if (error) throw error;
      setEditingResource(null);
      resetForm();
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao editar recurso.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete single resource
  const handleDeleteResource = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir este recurso permanentemente?")) return;
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert("Erro ao excluir recurso: " + err.message);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja excluir permanentemente os ${selectedIds.length} recursos selecionados?`)) return;
    try {
      const { error } = await supabase.from("resources").delete().in("id", selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      alert("Erro ao excluir recursos em massa: " + err.message);
    }
  };

  // Toggle selection checkbox
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (filteredItems: ResourceFile[]) => {
    const filteredIds = filteredItems.map(item => item.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormUrl("");
    setFormFormat("XLSX");
    setFormSize("");
    setFormAvailableAt("");
    setUploadMode("upload");
  };

  const openEditModal = (res: ResourceFile) => {
    setEditingResource(res);
    setFormTitle(res.title);
    setFormDesc(res.description || "");
    setFormUrl(res.file_url);
    setFormFormat(res.format || "XLSX");
    setFormSize(res.size || "");
    setFormAvailableAt(res.available_at ? new Date(res.available_at).toISOString().slice(0, 16) : "");
    setUploadMode("url");
  };

  if (loading) {
    return <SkeletonGenericGrid cols={2} rows={3} />;
  }

  // Filter resources based on current time & admin status
  const now = new Date();
  const allowedResources = resources.filter(res => {
    if (isAdmin) return true; // Admins see everything
    return !res.available_at || new Date(res.available_at) <= now;
  });

  const filteredResources = allowedResources.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(search.toLowerCase()) ||
      (file.description || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory =
      activeCategory === "todos" ||
      (activeCategory === "pdf" && file.category === "pdf") ||
      (activeCategory === "spreadsheet" && file.category === "spreadsheet") ||
      (activeCategory === "template" && file.category === "template") ||
      (activeCategory === "link" && file.category === "link");

    return matchesSearch && matchesCategory;
  });

  const getIcon = (category: string) => {
    switch (category) {
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
    window.open(file.file_url, "_blank");
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

        {/* Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", width: "100%", maxWidth: "600px", justifyContent: "flex-end" }}>
          {/* Search Bar */}
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
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

          {/* Admin Create Trigger */}
          {isAdmin && (
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 20px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              Novo Recurso
            </button>
          )}
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
            backgroundColor: activeCategory === "todos" ? "rgba(37, 99, 235, 0.05)" : "transparent"
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
            backgroundColor: activeCategory === "pdf" ? "rgba(37, 99, 235, 0.05)" : "transparent"
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
            backgroundColor: activeCategory === "spreadsheet" ? "rgba(37, 99, 235, 0.05)" : "transparent"
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
            backgroundColor: activeCategory === "template" ? "rgba(37, 99, 235, 0.05)" : "transparent"
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "32px", marginBottom: "16px" }}>dashboard_customize</span>
          <h3 className="font-title-lg" style={{ fontSize: "16px", color: "var(--color-on-surface)", marginBottom: "4px" }}>Templates Prontos</h3>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>Apresentações executivas e propostas comerciais.</p>
        </div>
      </section>

      {/* Resource Table List */}
      <section className="glass-panel" style={{ borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", fontSize: "18px", margin: 0 }}>
              Recursos de Apoio
            </h3>
            {selectedIds.length > 0 && isAdmin && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", animation: "fadeIn 0.2s ease" }}>
                <span style={{ fontSize: "12px", color: "var(--color-secondary)", fontWeight: 600 }}>{selectedIds.length} selecionados</span>
                <button
                  onClick={handleBulkDelete}
                  className="hover-opacity"
                  style={{
                    backgroundColor: "rgba(244, 63, 94, 0.15)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#f43f5e",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
                  Excluir Selecionados
                </button>
              </div>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">
            {filteredResources.length} {filteredResources.length === 1 ? "recurso disponível" : "recursos disponíveis"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                {isAdmin && (
                  <th style={{ padding: "16px 24px", width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={filteredResources.length > 0 && filteredResources.every(r => selectedIds.includes(r.id))}
                      onChange={() => handleToggleSelectAll(filteredResources)}
                      style={{ cursor: "pointer", accentColor: "var(--color-secondary)" }}
                    />
                  </th>
                )}
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">NOME DO MATERIAL</th>
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">DESCRIÇÃO</th>
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">CATEGORIA / FORMATO</th>
                {isAdmin && <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }} className="font-label-caps">STATUS DE AGENDAMENTO</th>}
                <th style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)", textAlign: "right" }} className="font-label-caps">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((file) => {
                  const isScheduled = file.available_at && new Date(file.available_at) > now;
                  const isSelected = selectedIds.includes(file.id);
                  return (
                    <tr
                      key={file.id}
                      className="card-hover"
                      style={{ 
                        borderBottom: "1px solid rgba(255,255,255,0.05)", 
                        transition: "background-color 0.2s",
                        backgroundColor: isSelected ? "rgba(37, 99, 235, 0.03)" : "transparent"
                      }}
                    >
                      {/* Bulk Select Checkbox */}
                      {isAdmin && (
                        <td style={{ padding: "20px 24px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(file.id)}
                            style={{ cursor: "pointer", accentColor: "var(--color-secondary)" }}
                          />
                        </td>
                      )}

                      {/* Name */}
                      <td style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(37, 99, 235, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid rgba(37, 99, 235, 0.2)"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>
                              {getIcon(file.category)}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: "14px", display: "block" }}>
                              {file.title}
                            </span>
                            <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                              Adicionado em {new Date(file.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: "20px 24px", color: "var(--color-on-surface-variant)", fontSize: "13px", maxWidth: "350px" }}>
                        {file.description || <span style={{ color: "var(--color-outline)", fontStyle: "italic" }}>Sem descrição</span>}
                      </td>

                      {/* Type and Size */}
                      <td style={{ padding: "20px 24px", color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                        <span className="font-label-caps" style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "2px", marginRight: "8px" }}>
                          {file.category}
                        </span>
                        {file.size && <span>{file.size}</span>}
                      </td>

                      {/* Scheduled Status */}
                      {isAdmin && (
                        <td style={{ padding: "20px 24px", fontSize: "12px" }}>
                          {isScheduled ? (
                            <span style={{ color: "var(--color-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
                              Agendado: {new Date(file.available_at!).toLocaleString("pt-BR")}
                            </span>
                          ) : file.available_at ? (
                            <span style={{ color: "#4CAF50", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span>
                              Publicado ({new Date(file.available_at).toLocaleString("pt-BR")})
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-outline)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>public</span>
                              Imediato
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      <td style={{ padding: "20px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(file)}
                                className="btn-outline"
                                style={{ padding: "8px", minWidth: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                title="Editar Recurso"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteResource(file.id)}
                                className="btn-outline"
                                style={{ padding: "8px", minWidth: "auto", color: "#f43f5e", borderColor: "rgba(244, 63, 94, 0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                title="Excluir"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDownload(file)}
                            className="btn-primary"
                            style={{
                              display: "inline-flex",
                              padding: "8px 16px",
                              fontSize: "11px",
                              gap: "4px",
                              backgroundColor: file.category === "link" ? "transparent" : "var(--color-secondary)",
                              color: file.category === "link" ? "var(--color-secondary)" : "var(--color-on-secondary)",
                              border: file.category === "link" ? "1px solid var(--color-secondary)" : "none"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                              {file.category === "link" ? "open_in_new" : "download"}
                            </span>
                            {file.category === "link" ? "ACESSAR" : "BAIXAR"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ textAlign: "center", padding: "40px", color: "var(--color-on-surface-variant)" }}>
                    Nenhum recurso encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE RESOURCE MODAL */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backdropFilter: "blur(5px)"
        }}>
          <div className="glass-panel metallic-edge animate-scaleIn" style={{
            width: "100%",
            maxWidth: "600px",
            borderRadius: "8px",
            backgroundColor: "#131316",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", margin: 0 }}>Adicionar Novo Recurso</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateResource} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Mode Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TIPO DE ENVIO</label>
                <select
                  className="input-dark"
                  value={uploadMode}
                  onChange={(e) => {
                    setUploadMode(e.target.value as any);
                    setFormUrl("");
                  }}
                >
                  <option value="upload" style={{ backgroundColor: "#131316" }}>Fazer Upload de Arquivo</option>
                  <option value="url" style={{ backgroundColor: "#131316" }}>Inserir Link Externo (Google Drive, OneDrive, etc.)</option>
                </select>
              </div>

              {/* Upload Dropzone */}
              {uploadMode === "upload" && (
                <div style={{
                  border: "2px dashed rgba(37, 99, 235, 0.3)",
                  borderRadius: "6px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  position: "relative"
                }}>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 5 }}
                  />
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--color-secondary)", marginBottom: "8px" }}>cloud_upload</span>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 600 }}>
                    {uploadingFile ? "Enviando arquivo..." : "Arraste ou clique para selecionar o arquivo"}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-outline)" }}>
                    Limite máximo de 150 MB.
                  </p>
                </div>
              )}

              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO RECURSO</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Ex: Planilha de BDI & Custos Indiretos"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO DO CONTEÚDO</label>
                <textarea
                  className="input-dark"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Breve resumo sobre o material..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* URL */}
              {/* URL */}
              {uploadMode === "url" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>URL DO RECURSO (LINK)</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="https://link-do-recurso.com"
                    value={formUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormUrl(val);
                      if (val) {
                        const ext = val.split('.').pop()?.split(/[?#]/)[0]?.toUpperCase() || "LINK";
                        setFormFormat(ext);
                      }
                    }}
                    required
                  />
                </div>
              )}

              {/* Schedule */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>AGENDAR DISPONIBILIDADE</label>
                <DateTimePicker
                  value={formAvailableAt}
                  onChange={(val) => setFormAvailableAt(val)}
                />
                <span style={{ fontSize: "10px", color: "var(--color-outline)" }}>Deixe em branco para disponibilização imediata.</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Salvando..." : "Criar Recurso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESOURCE MODAL */}
      {editingResource && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backdropFilter: "blur(5px)"
        }}>
          <div className="glass-panel metallic-edge animate-scaleIn" style={{
            width: "100%",
            maxWidth: "600px",
            borderRadius: "8px",
            backgroundColor: "#131316",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", margin: 0 }}>Editar Recurso</h3>
              <button onClick={() => setEditingResource(null)} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateResource} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO RECURSO</label>
                <input
                  type="text"
                  className="input-dark"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO DO CONTEÚDO</label>
                <textarea
                  className="input-dark"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* URL */}
              {formFormat.toUpperCase() === "LINK" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>URL DO RECURSO (LINK)</label>
                  <input
                    type="text"
                    className="input-dark"
                    value={formUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormUrl(val);
                      if (val) {
                        const ext = val.split('.').pop()?.split(/[?#]/)[0]?.toUpperCase() || "LINK";
                        setFormFormat(ext);
                      }
                    }}
                    required
                  />
                </div>
              )}

              {/* Schedule */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>AGENDAR DISPONIBILIDADE</label>
                <DateTimePicker
                  value={formAvailableAt}
                  onChange={(val) => setFormAvailableAt(val)}
                />
                <span style={{ fontSize: "10px", color: "var(--color-outline)" }}>Deixe em branco para disponibilização imediata.</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" onClick={() => setEditingResource(null)} className="btn-outline">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
