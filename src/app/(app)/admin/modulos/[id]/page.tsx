"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import DateTimePicker from "@/components/DateTimePicker";

export default function EditModulePage() {
  const params = useParams();
  const router = useRouter();
  const idStr = Array.isArray(params?.id) ? params.id[0] : (params?.id || "");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Module states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"rascunho" | "agendado" | "publicado">("publicado");
  const [scheduledAt, setScheduledAt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  useEffect(() => {
    const checkAdminAndLoadModule = async () => {
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
          
          // Fetch module details with courses
          const { data: mData, error: mErr } = await supabase
            .from("modules")
            .select("*, courses(title)")
            .eq("id", idStr)
            .single();

          if (mErr) throw mErr;

          if (mData) {
            setTitle(mData.title || "");
            setDescription(mData.description || "");
            setStatus(mData.status || "publicado");
            setScheduledAt(mData.scheduled_at ? new Date(mData.scheduled_at).toISOString().slice(0, 16) : "");
            setCoverImageUrl(mData.cover_image_url || "");
            setCourseId(mData.course_id || "");
            setCourseTitle((mData.courses as any)?.title || "Masterclass");
          }
        } else {
          router.push("/sem-permissao");
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados do módulo:", err);
        showStatus("error", err.message || "Erro ao carregar dados do módulo.");
      } finally {
        setLoading(false);
      }
    };

    if (idStr) {
      void checkAdminAndLoadModule();
    }
  }, [idStr, router, supabase]);

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title,
          description,
          status,
          scheduled_at: status === "agendado" ? new Date(scheduledAt).toISOString() : null,
          cover_image_url: coverImageUrl
        })
        .eq("id", idStr);

      if (error) throw error;
      
      showStatus("success", "Módulo atualizado com sucesso!");
      setTimeout(() => {
        router.push(`/admin/painel?courseId=${courseId}`);
      }, 1000);
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar módulo.");
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
        <p style={{ color: "var(--color-outline)" }}>Carregando dados do módulo...</p>
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
        <Link href="/admin/painel" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }} className="hover-gold-text">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          PAINEL DE CONTROLE
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <Link href={`/admin/painel?courseId=${courseId}`} style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }} className="hover-gold-text">
          {courseTitle}
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <span style={{ color: "var(--color-on-surface-variant)" }}>{title}</span>
      </section>

      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Administrar Módulo</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Edite informações básicas do módulo e insira a capa para os alunos.
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
        <form onSubmit={handleSaveModule} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO MÓDULO</label>
            <input
              type="text"
              className="input-dark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO / RESUMO DO MÓDULO</label>
            <textarea
              className="input-dark"
              style={{ minHeight: "120px", resize: "vertical" }}
              placeholder="Descreva o que será abordado neste módulo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status & Schedule */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>STATUS DE PUBLICAÇÃO</label>
              <select
                className="input-dark"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="publicado" style={{ backgroundColor: "#131316" }}>Publicado</option>
                <option value="rascunho" style={{ backgroundColor: "#131316" }}>Rascunho</option>
                <option value="agendado" style={{ backgroundColor: "#131316" }}>Agendado</option>
              </select>
            </div>

            {status === "agendado" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>AGENDAR LANÇAMENTO</label>
                <DateTimePicker
                  value={scheduledAt}
                  onChange={(val) => setScheduledAt(val)}
                />
              </div>
            )}
          </div>

          {/* Cover image (Thumbnail) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>IMAGEM DE CAPA</label>
            
            {coverImageUrl && (
              <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={coverImageUrl} alt="Capa do Módulo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
              onClick={() => router.push(`/admin/painel?courseId=${courseId}`)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1, padding: "14px 28px" }}
              disabled={submitting || uploadingCover}
            >
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
