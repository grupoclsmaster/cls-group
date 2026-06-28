"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function CreateEcosystemBannerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("Acessar");
  const [ctaLink, setCtaLink] = useState("#");
  const [disabled, setDisabled] = useState(false);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const emailLower = user.email?.toLowerCase();
        const isEmailAdmin = emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com";

        const { data: member } = await supabase
          .from("members")
          .select("member_type")
          .eq("id", user.id)
          .single();

        if ((member && member.member_type === "admin") || isEmailAdmin) {
          setIsAdmin(true);
        } else {
          router.push("/sem-permissao");
        }
      } catch (err: any) {
        console.error("Erro ao validar permissões:", err);
        showStatus("error", err.message || "Erro de permissão.");
      } finally {
        setLoading(false);
      }
    };

    void checkAdmin();
  }, [router, supabase]);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coverImageUrl.trim()) {
      showStatus("error", "Por favor preencha os campos obrigatórios (Título e Imagem de Capa).");
      return;
    }
    setSubmitting(true);
    try {
      // Determine sequence_order
      const { data: existingBanners } = await supabase.from("ecosystem_banners").select("id");
      const sequence_order = (existingBanners?.length || 0) + 1;

      const { error } = await supabase.from("ecosystem_banners").insert([{
        title,
        subtitle: subtitle || null,
        description: description || null,
        tag: tag || null,
        image: coverImageUrl,
        cta_text: ctaText,
        cta_link: ctaLink,
        disabled,
        sequence_order
      }]);

      if (error) throw error;
      
      showStatus("success", "Slide criado com sucesso!");
      setTimeout(() => {
        router.push("/admin/ecossistema");
      }, 1000);
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar slide.");
      setSubmitting(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showStatus("error", "Erro: O tamanho máximo do arquivo é de 150 MB.");
      return;
    }

    setUploadingCover(true);
    showStatus("success", "Enviando imagem de capa...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      setCoverImageUrl(data.url);
      showStatus("success", "Imagem de capa enviada com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao enviar imagem.");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <p style={{ color: "var(--color-outline)" }}>Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Navigation Breadcrumb */}
      <section style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }} className="font-label-caps">
        <Link href="/admin/painel" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }} className="hover-gold-text">
          PAINEL DE CONTROLE
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <Link href="/admin/ecossistema" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }} className="hover-gold-text">
          ECOSSISTEMA
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <span style={{ color: "var(--color-on-surface-variant)" }}>Novo Slide</span>
      </section>

      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Cadastrar Novo Slide</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Adicione um novo slide (banner) rotativo na vitrine principal da página de Ecossistema.
      </p>

      {statusMsg && (
        <div style={{
          backgroundColor: statusMsg.type === "success" ? "rgba(76, 175, 80, 0.15)" : "rgba(244, 67, 54, 0.15)",
          border: `1px solid ${statusMsg.type === "success" ? "var(--color-success, #4CAF50)" : "var(--color-error, #F44336)"}`,
          color: statusMsg.type === "success" ? "#81C784" : "#E57373",
          padding: "16px",
          borderRadius: "4px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          animation: "slideIn 0.3s ease-out"
        }}>
          <span className="material-symbols-outlined">
            {statusMsg.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-body-md">{statusMsg.text}</span>
        </div>
      )}

      <div className="glass-panel metallic-edge" style={{ padding: "32px", borderRadius: "8px" }}>
        <form onSubmit={handleSaveBanner} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO PRINCIPAL *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: CLUB CLS PRO"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Subtitle & Tag */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>SUBTÍTULO</label>
              <input
                type="text"
                className="input-dark"
                placeholder="Ex: Programa de Aceleração"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TAG BADGE</label>
              <input
                type="text"
                className="input-dark"
                placeholder="Ex: FECHADO, NOVO EPISÓDIO, DESTAQUE"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO / TEXTO AUXILIAR</label>
            <textarea
              className="input-dark"
              style={{ minHeight: "100px", resize: "vertical" }}
              placeholder="Escreva um breve resumo informativo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* CTA Text & Link */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TEXTO DO BOTÃO (CTA) *</label>
              <input
                type="text"
                className="input-dark"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>LINK DO BOTÃO (CTA) *</label>
              <input
                type="text"
                className="input-dark"
                placeholder="Ex: https://checkout.grupocls.com.br/... ou link interno"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Checkbox: Disabled */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0" }}>
            <input
              type="checkbox"
              id="disabled-checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--color-secondary)" }}
            />
            <label htmlFor="disabled-checkbox" style={{ fontSize: "13px", color: "#ffffff", cursor: "pointer", userSelect: "none" }}>
              Desativar Slide temporariamente (oculta na página de ecossistema)
            </label>
          </div>

          {/* Cover image (Thumbnail) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>IMAGEM DE CAPA (BG DO SLIDE) *</label>
            
            {coverImageUrl && (
              <div style={{ position: "relative", width: "100%", height: "220px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={coverImageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button 
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-error)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                </button>
              </div>
            )}

            <div 
              style={{ 
                border: "1px dashed rgba(145, 179, 225, 0.3)", 
                borderRadius: "6px", 
                padding: "24px", 
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                position: "relative"
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 10
                }}
                disabled={uploadingCover}
              />
              <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--color-secondary)", marginBottom: "8px" }}>
                cloud_upload
              </span>
              <p style={{ color: "#ffffff", margin: 0, fontSize: "13px", fontWeight: 600 }}>
                {uploadingCover ? "Enviando arquivo..." : "Arraste ou clique para subir a imagem de capa"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", marginTop: "12px" }}>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ flex: 1, padding: "14px 28px" }}
              onClick={() => router.push("/admin/ecossistema")}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1, padding: "14px 28px" }}
              disabled={submitting || uploadingCover}
            >
              {submitting ? "Criando..." : "Criar Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
