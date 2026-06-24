"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function CreateModulePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId") || "";
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Parent course details
  const [courseTitle, setCourseTitle] = useState("Masterclass");

  // States
  const [title, setTitle] = useState("");

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  useEffect(() => {
    const checkAdminAndLoadContext = async () => {
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

          if (!courseId) {
            showStatus("error", "ID da Masterclass não fornecido.");
            return;
          }

          const { data: course, error: cErr } = await supabase
            .from("courses")
            .select("title")
            .eq("id", courseId)
            .single();

          if (cErr) throw cErr;

          if (course) {
            setCourseTitle(course.title || "Masterclass");
          }
        } else {
          router.push("/sem-permissao");
        }
      } catch (err: any) {
        console.error("Erro ao carregar contexto:", err);
        showStatus("error", err.message || "Erro ao carregar dados do curso.");
      } finally {
        setLoading(false);
      }
    };

    void checkAdminAndLoadContext();
  }, [courseId, router, supabase]);

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;
    setSubmitting(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Determine sequence_order
      const { data: existingModules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId);
      const sequence_order = (existingModules?.length || 0) + 1;

      const { error } = await supabase.from("modules").insert([{
        title,
        slug,
        course_id: courseId,
        sequence_order
      }]);

      if (error) throw error;
      
      showStatus("success", `Módulo "${title}" criado com sucesso!`);
      setTimeout(() => {
        router.push(`/admin/painel?courseId=${courseId}`);
      }, 1000);
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar módulo.");
      setSubmitting(false);
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
        <Link href="/admin/painel" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }} className="hover-gold-text">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          PAINEL DE CONTROLE
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <Link href={`/admin/painel?courseId=${courseId}`} style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }} className="hover-gold-text">
          {courseTitle}
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <span style={{ color: "var(--color-on-surface-variant)" }}>Cadastrar Novo Módulo</span>
      </section>

      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Cadastrar Novo Módulo</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Defina o título do novo módulo para a Masterclass "{courseTitle}".
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
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO MÓDULO</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: Módulo 01 - Fundamentos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
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
              disabled={submitting}
            >
              {submitting ? "Criando..." : "Criar Módulo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
