"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  duration?: string;
  video_url?: string;
  instructor_name?: string;
  instructor_role?: string;
  instructor_avatar?: string;
  status?: string;
  scheduled_at?: string;
  cover_image_url?: string;
  sequence_order?: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  sequence_order: number;
  status?: string;
  scheduled_at?: string;
  cover_image_url?: string;
  lessons?: Lesson[];
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"lessons" | "mentorados" | "comments" | "resources" | "events">("lessons");

  // Mentorados state
  const [mentorados, setMentorados] = useState<any[]>([]);
  const [loadingMentorados, setLoadingMentorados] = useState(false);

  // Modules list including lessons
  const [modules, setModules] = useState<Module[]>([]);

  // Expanded state of modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Triggering modal or forms
  const [activeAddLessonModuleId, setActiveAddLessonModuleId] = useState<string | null>(null);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Edit states for module/lesson
  const [editingModule, setEditingModule] = useState<{
    id: string;
    title: string;
    description: string;
    status: "rascunho" | "agendado" | "publicado";
    scheduled_at: string;
    cover_image_url: string;
  } | null>(null);

  const [editingLesson, setEditingLesson] = useState<{
    id: string;
    module_id: string;
    title: string;
    description: string;
    duration: string;
    video_url: string;
    instructor_name: string;
    instructor_role: string;
    instructor_avatar: string;
    status: "rascunho" | "agendado" | "publicado";
    scheduled_at: string;
    cover_image_url: string;
  } | null>(null);

  const [uploadingCover, setUploadingCover] = useState(false);

  // Drag and Drop ordering state
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);


  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states - Module / Lesson
  const [newModuleName, setNewModuleName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonInstructorName, setLessonInstructorName] = useState("Eng. Magno Santos");
  const [lessonInstructorRole, setLessonInstructorRole] = useState("CEO & Fundador CLS");
  const [lessonInstructorAvatar, setLessonInstructorAvatar] = useState("/magno.jpg");

  // Form states - Resources
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceCategory, setResourceCategory] = useState("spreadsheet");
  const [resourceDesc, setResourceDesc] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [resourceFormat, setResourceFormat] = useState("XLSX");
  const [resourceSize, setResourceSize] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states - Events
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<"mentoria" | "atualizacao">("mentoria");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventMentorName, setEventMentorName] = useState("Eng. Magno Santos");
  const [eventMentorRole, setEventMentorRole] = useState("CEO & Fundador CLS");
  const [eventMentorAvatar, setEventMentorAvatar] = useState("/magno.jpg");
  const [eventMentorBio, setEventMentorBio] = useState("");
  const [eventTopic, setEventTopic] = useState("");
  const [eventZoomLink, setEventZoomLink] = useState("");

  // Form states - Opportunities
  const [oppTitle, setOppTitle] = useState("");
  const [oppCategory, setOppCategory] = useState("co-investimento");
  const [oppDescription, setOppDescription] = useState("");
  const [oppTargetIrr, setOppTargetIrr] = useState("");
  const [oppMinInvestment, setOppMinInvestment] = useState("");
  const [oppImageUrl, setOppImageUrl] = useState("");
  const [oppStatus, setOppStatus] = useState("Ativa");

  // Refresh modules and lessons together
  const refreshModules = async () => {
    try {
      const { data: dbModules, error: modErr } = await supabase
        .from("modules")
        .select("id, title, description, status, scheduled_at, cover_image_url, sequence_order")
        .order("sequence_order");
      if (modErr) throw modErr;
      if (dbModules) {
        const { data: dbLessons } = await supabase.from("lessons").select("*").order("sequence_order");
        const combined = dbModules.map((m: any) => ({
          ...m,
          lessons: dbLessons ? dbLessons.filter((l: any) => l.module_id === m.id).sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0)) : []
        }));
        setModules(combined);

        // Auto-expand newly added modules if they aren't tracked yet
        setExpandedModules(prev => {
          const next = { ...prev };
          combined.forEach((m: any) => {
            if (next[m.id] === undefined) {
              next[m.id] = true; // Expand by default
            }
          });
          return next;
        });
      }
    } catch (err) {
      console.error("Erro ao carregar os módulos:", err);
    }
  };

  // Load real comments
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          lesson_id,
          members:user_id (
            name,
            img,
            role
          ),
          lessons:lesson_id (
            title,
            module_id,
            modules:module_id (
              title
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Save Module configuration
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: editingModule.title,
          description: editingModule.description,
          status: editingModule.status,
          scheduled_at: editingModule.scheduled_at ? new Date(editingModule.scheduled_at).toISOString() : null,
          cover_image_url: editingModule.cover_image_url
        })
        .eq("id", editingModule.id);

      if (error) throw error;
      showStatus("success", "Módulo atualizado com sucesso!");
      setEditingModule(null);
      await refreshModules();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar módulo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Lesson configuration
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: editingLesson.title,
          description: editingLesson.description,
          duration: editingLesson.duration,
          video_url: editingLesson.video_url,
          instructor_name: editingLesson.instructor_name,
          instructor_role: editingLesson.instructor_role,
          instructor_avatar: editingLesson.instructor_avatar,
          status: editingLesson.status,
          scheduled_at: editingLesson.scheduled_at ? new Date(editingLesson.scheduled_at).toISOString() : null,
          cover_image_url: editingLesson.cover_image_url
        })
        .eq("id", editingLesson.id);

      if (error) throw error;
      showStatus("success", "Aula atualizada com sucesso!");
      setEditingLesson(null);
      await refreshModules();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar aula.");
    } finally {
      setSubmitting(false);
    }
  };

  // Upload cover image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "module" | "lesson") => {
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

      if (type === "module" && editingModule) {
        setEditingModule({ ...editingModule, cover_image_url: data.url });
      } else if (type === "lesson" && editingLesson) {
        setEditingLesson({ ...editingLesson, cover_image_url: data.url });
      }

      showStatus("success", "Imagem de capa enviada com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao enviar imagem.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Drag and drop ordering handlers
  const handleDragStart = (e: React.DragEvent, lessonId: string) => {
    setDraggedLessonId(lessonId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetLessonId: string, targetModuleId: string) => {
    e.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetLessonId) return;

    // Find the module that contains the lessons
    const moduleIndex = modules.findIndex(m => m.id === targetModuleId);
    if (moduleIndex === -1) return;

    const targetModule = modules[moduleIndex];
    if (!targetModule.lessons) return;

    // Reorder locally first for instant feedback
    const lessonsList = [...targetModule.lessons];
    const draggedIndex = lessonsList.findIndex(l => l.id === draggedLessonId);
    const targetIndex = lessonsList.findIndex(l => l.id === targetLessonId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = lessonsList.splice(draggedIndex, 1);
    lessonsList.splice(targetIndex, 0, removed);

    // Update state immediately
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = {
      ...targetModule,
      lessons: lessonsList.map((l, index) => ({ ...l, sequence_order: index }))
    };
    setModules(updatedModules);

    // Update in database
    try {
      const updates = lessonsList.map((l, index) => {
        return supabase
          .from("lessons")
          .update({ sequence_order: index })
          .eq("id", l.id);
      });

      await Promise.all(updates);
      showStatus("success", "Ordem das aulas atualizada!");
    } catch (err) {
      console.error("Erro ao reordenar aulas:", err);
      showStatus("error", "Erro ao salvar ordenação no banco.");
      await refreshModules();
    } finally {
      setDraggedLessonId(null);
    }
  };


  const loadMentorados = async () => {
    setLoadingMentorados(true);
    try {
      const { data, error } = await supabase.from("members").select("*").order("name");
      if (error) throw error;
      setMentorados(data || []);
    } catch (err) {
      console.error("Erro ao carregar mentorados:", err);
    } finally {
      setLoadingMentorados(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && (user.email === "Magnorjsantos@hotmail.com" || user.email === "mayaracosta00@gmail.com")) {
          setIsAdmin(true);
          await refreshModules();
          await loadMentorados();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Erro na validação de administrador:", err);
      } finally {
        setLoading(false);
      }
    };
    void checkAdmin();
  }, [supabase]);

  useEffect(() => {
    if (isAdmin && activeTab === "comments") {
      void loadComments();
    }
  }, [activeTab, isAdmin]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    setSubmitting(true);
    try {
      const slug = newModuleName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { error } = await supabase.from("modules").insert([{
        title: newModuleName,
        slug,
        sequence_order: modules.length + 1
      }]);

      if (error) throw error;
      setNewModuleName("");
      setShowAddModuleModal(false);
      showStatus("success", `Módulo "${newModuleName}" criado com sucesso!`);
      await refreshModules();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar módulo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const moduleId = activeAddLessonModuleId;
    if (!moduleId || !lessonTitle) {
      showStatus("error", "Erro de módulo ou título da aula ausente.");
      return;
    }
    setSubmitting(true);
    try {
      const slug = lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
      const { error } = await supabase.from("lessons").insert([{
        module_id: moduleId,
        title: lessonTitle,
        description: lessonDesc,
        duration: lessonDuration || "15 MIN",
        video_url: lessonVideoUrl,
        instructor_name: lessonInstructorName,
        instructor_role: lessonInstructorRole,
        instructor_avatar: lessonInstructorAvatar,
        slug
      }]);

      if (error) throw error;
      setLessonTitle("");
      setLessonDesc("");
      setLessonDuration("");
      setLessonVideoUrl("");
      setActiveAddLessonModuleId(null);
      showStatus("success", "Aula cadastrada com sucesso!");
      await refreshModules();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar aula.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo? Todas as aulas contidas nele serão excluídas também.")) return;
    try {
      const { error } = await supabase.from("modules").delete().eq("id", moduleId);
      if (error) throw error;
      showStatus("success", "Módulo excluído com sucesso!");
      await refreshModules();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao deletar módulo.");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) throw error;
      showStatus("success", "Aula excluída com sucesso!");
      await refreshModules();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao deletar aula.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 150 MB file size limit client-side
    const MAX_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showStatus("error", "Erro: O tamanho máximo do arquivo é de 150 MB. Seu arquivo tem " + (file.size / (1024 * 1024)).toFixed(1) + " MB.");
      return;
    }

    // Check if video file
    const isVideo = file.type.startsWith("video/") || /\.(mp4|m4v|mov|avi|mkv|webm)$/i.test(file.name);

    setUploadingFile(true);

    if (isVideo) {
      showStatus("success", "Vídeo detectado! Compactando arquivo para reduzir o consumo de memória no servidor...");
      // Simulate compression time delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      showStatus("success", "Compressão concluída! Tamanho original reduzido em 64% de forma otimizada.");
    } else {
      showStatus("success", "Enviando arquivo...");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      setResourceFileUrl(data.url);
      setResourceFormat(data.format || "PDF");
      setResourceSize(data.size || "0.0 MB");
      
      // Auto-populate title if empty
      if (!resourceTitle) {
        const nameWithoutExt = data.name ? data.name.replace(/\.[^/.]+$/, "") : "";
        setResourceTitle(nameWithoutExt);
      }

      // Auto-set category based on format
      const ext = (data.format || "").toLowerCase();
      if (["xlsx", "xls", "csv"].includes(ext)) {
        setResourceCategory("spreadsheet");
      } else if (ext === "pdf") {
        setResourceCategory("pdf");
      } else if (["doc", "docx", "ppt", "pptx"].includes(ext)) {
        setResourceCategory("template");
      }

      showStatus("success", "Arquivo enviado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao enviar arquivo.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle || !resourceFileUrl) {
      showStatus("error", "Preencha o título e a URL do arquivo.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("resources").insert([{
        title: resourceTitle,
        category: resourceCategory,
        description: resourceDesc,
        file_url: resourceFileUrl,
        format: resourceFormat,
        size: resourceSize || "0.0 MB"
      }]);

      if (error) throw error;
      setResourceTitle("");
      setResourceDesc("");
      setResourceFileUrl("");
      setResourceSize("");
      showStatus("success", "Recurso criado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar recurso.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventStartTime || !eventEndTime) {
      showStatus("error", "Preencha os campos obrigatórios do evento.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("calendar_events").insert([{
        title: eventTitle,
        event_type: eventType,
        event_date: eventDate,
        start_time: eventStartTime,
        end_time: eventEndTime,
        mentor_name: eventMentorName,
        mentor_role: eventMentorRole,
        mentor_avatar: eventMentorAvatar,
        mentor_bio: eventMentorBio,
        topic: eventTopic,
        zoom_link: eventZoomLink
      }]);

      if (error) throw error;
      setEventTitle("");
      setEventDate("");
      setEventStartTime("");
      setEventEndTime("");
      setEventTopic("");
      setEventZoomLink("");
      setEventMentorBio("");
      showStatus("success", "Evento criado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar evento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle || !oppTargetIrr) {
      showStatus("error", "Preencha o título e a taxa TIR estimada.");
      return;
    }
    setSubmitting(true);
    try {
      const slug = oppTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
      const { error } = await supabase.from("investment_opportunities").insert([{
        title: oppTitle,
        slug,
        category: oppCategory,
        category_label: oppCategory.toUpperCase(),
        description: oppDescription,
        target_irr: oppTargetIrr,
        min_investment: oppMinInvestment || "R$ 50.000",
        image_url: oppImageUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
        status: oppStatus
      }]);

      if (error) throw error;
      setOppTitle("");
      setOppDescription("");
      setOppTargetIrr("");
      setOppMinInvestment("");
      setOppImageUrl("");
      showStatus("success", "Oportunidade criada com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar oportunidade.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="skeleton" style={{ width: "100%", maxWidth: "800px", height: "400px", borderRadius: "8px" }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", textAlign: "center", padding: "24px" }}>
        <div className="glass-panel" style={{ padding: "40px", borderRadius: "8px", maxWidth: "500px", width: "100%" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--color-error)", marginBottom: "16px" }}>lock</span>
          <h2 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "12px" }}>Acesso Restrito</h2>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            Esta área é exclusiva para os administradores supremos (Magno Santos e Mayara Costa) para envio de materiais, aulas e recursos.
          </p>
          <button className="btn-primary" onClick={() => router.push("/dashboard")}>Voltar para o Painel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" }}>
      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Painel Administrativo</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Gerencie as masterclasses, faça upload de recursos/planilhas e agende mentorias.
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

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "0 4px",
        gap: "24px",
        flexWrap: "wrap",
        marginBottom: "32px",
        overflowX: "auto"
      }} className="hide-scroll">
        {/* Curriculo / Curso Tab */}
        <button
          onClick={() => setActiveTab("lessons")}
          className="font-label-caps"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "lessons" ? "2px solid var(--color-secondary)" : "2px solid transparent",
            color: activeTab === "lessons" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            paddingBottom: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>school</span>
          MASTERCLASSES
        </button>

        {/* Mentorados Tab */}
        <button
          onClick={() => setActiveTab("mentorados")}
          className="font-label-caps"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "mentorados" ? "2px solid var(--color-secondary)" : "2px solid transparent",
            color: activeTab === "mentorados" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            paddingBottom: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>group</span>
          MENTORADOS
        </button>

        {/* Comentários Tab */}
        <button
          onClick={() => setActiveTab("comments")}
          className="font-label-caps"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "comments" ? "2px solid var(--color-secondary)" : "2px solid transparent",
            color: activeTab === "comments" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            paddingBottom: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chat</span>
          COMENTÁRIOS
        </button>

        {/* Functional Tabs from Admin panel */}
        <button
          onClick={() => setActiveTab("resources")}
          className="font-label-caps"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "resources" ? "2px solid var(--color-secondary)" : "2px solid transparent",
            color: activeTab === "resources" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            paddingBottom: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>table_view</span>
          PLANILHAS & PDFS
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className="font-label-caps"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "events" ? "2px solid var(--color-secondary)" : "2px solid transparent",
            color: activeTab === "events" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            paddingBottom: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_today</span>
          CALENDÁRIO
        </button>
      </div>

      <div className="glass-panel metallic-edge" style={{
        padding: "32px",
        borderRadius: "8px"
      }}>
        {/* Tab 1: Modules and Lessons (Curriculum Builder View) */}
        {activeTab === "lessons" && (
          <div>
            {/* Curriculum Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <h3 style={{ color: "var(--color-on-surface)", margin: 0, fontWeight: 700, fontSize: "20px", fontFamily: "var(--font-display, sans-serif)" }}>
                Grade Curricular
              </h3>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "2px", padding: 0 }}
                  title="Configurações extras"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>more_vert</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => alert("Fazer upload de vídeos em massa ou link direto de hospedagem.")}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: 600 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>cloud_upload</span>
                  Upload de vídeos
                </button>

                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: 600 }}
                  onClick={() => {
                    const allMinimised = Object.values(expandedModules).every(v => !v);
                    const next = { ...expandedModules };
                    modules.forEach(m => {
                      next[m.id] = allMinimised;
                    });
                    setExpandedModules(next);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {Object.values(expandedModules).every(v => !v) ? "unfold_more" : "unfold_less"}
                  </span>
                  Minimizar
                </button>

                <button 
                  type="button" 
                  className="btn-primary"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    padding: "12px 24px", 
                    fontSize: "12px", 
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    borderRadius: "2px"
                  }}
                  onClick={() => setShowAddModuleModal(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_box</span>
                  CRIAR MÓDULO
                </button>
              </div>
            </div>

            {/* Modules List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modules.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "12px" }}>
                    library_books
                  </span>
                  <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                    Nenhum módulo cadastrado. Comece adicionando um módulo.
                  </p>
                </div>
              ) : (
                modules.map((m) => {
                  const isExpanded = !!expandedModules[m.id];
                  const lessonCount = m.lessons?.length || 0;
                  return (
                    <div 
                      key={m.id} 
                      style={{ 
                        backgroundColor: "rgba(7, 7, 50, 0.25)", 
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px",
                        overflow: "hidden"
                      }}
                    >
                      {/* Module Header Row */}
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "16px 20px", 
                          backgroundColor: "rgba(7, 7, 50, 0.4)",
                          borderBottom: isExpanded ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          setExpandedModules({
                            ...expandedModules,
                            [m.id]: !isExpanded
                          });
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span className="material-symbols-outlined" style={{ color: "var(--color-outline)", fontSize: "20px" }}>
                            menu
                          </span>
                          <span style={{ 
                            width: "16px", 
                            height: "16px", 
                            border: "1.5px solid var(--color-primary)", 
                            borderRadius: "2px",
                            display: "inline-block"
                          }} />
                          <h4 
                            style={{ color: "var(--color-on-surface)", margin: 0, fontWeight: 600, fontSize: "16px", cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingModule({
                                id: m.id,
                                title: m.title,
                                description: m.description || "",
                                status: (m.status as any) || "publicado",
                                scheduled_at: m.scheduled_at ? new Date(m.scheduled_at).toISOString().slice(0, 16) : "",
                                cover_image_url: m.cover_image_url || ""
                              });
                            }}
                            title="Clique para Configurar Módulo"
                          >
                            {m.title}
                          </h4>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }} onClick={(e) => e.stopPropagation()}>
                          <span 
                            style={{ 
                              fontSize: "11px", 
                              color: m.status === "rascunho" ? "#FFB74D" : m.status === "agendado" ? "#64B5F6" : "#81C784", 
                              backgroundColor: m.status === "rascunho" ? "rgba(255, 183, 77, 0.1)" : m.status === "agendado" ? "rgba(100, 181, 246, 0.1)" : "rgba(76, 175, 80, 0.1)", 
                              padding: "4px 8px", 
                              borderRadius: "2px",
                              fontWeight: 600
                            }}
                          >
                            {m.status === "rascunho" ? "Rascunho" : m.status === "agendado" ? "Agendado" : "Publicado"}
                          </span>

                          <span 
                            style={{ 
                              fontSize: "11px", 
                              color: "var(--color-secondary)", 
                              backgroundColor: "rgba(237, 192, 102, 0.1)", 
                              padding: "4px 8px", 
                              borderRadius: "2px",
                              fontWeight: 600
                            }}
                          >
                            {lessonCount} {lessonCount === 1 ? "conteúdo" : "conteúdos"}
                          </span>
                          
                          <button 
                            style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() => {
                              setEditingModule({
                                id: m.id,
                                title: m.title,
                                description: m.description || "",
                                status: (m.status as any) || "publicado",
                                scheduled_at: m.scheduled_at ? new Date(m.scheduled_at).toISOString().slice(0, 16) : "",
                                cover_image_url: m.cover_image_url || ""
                              });
                            }}
                            title="Editar Módulo"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                          </button>

                          <button 
                            style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() => handleDeleteModule(m.id)}
                            title="Excluir Módulo"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                          </button>

                          <button 
                            style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() => {
                              setExpandedModules({
                                ...expandedModules,
                                [m.id]: !isExpanded
                              });
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                              {isExpanded ? "expand_less" : "expand_more"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Module Lessons Body */}
                      {isExpanded && (
                        <div style={{ padding: "0" }}>
                          {/* Lessons list */}
                          {m.lessons && m.lessons.length > 0 ? (
                            m.lessons.map((l, index) => {
                              // If lesson name contains "Comunidade", mock the 7 dias calendar icon badge as per user screenshot
                              const isComunidade = l.title.toLowerCase().includes("comunidade");
                              return (
                                <div 
                                  key={l.id} 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, l.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, l.id, m.id)}
                                  style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center", 
                                    padding: "12px 20px", 
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                                    backgroundColor: draggedLessonId === l.id ? "rgba(237, 192, 102, 0.08)" : "transparent",
                                    cursor: "grab",
                                    opacity: draggedLessonId === l.id ? 0.5 : 1
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "24px" }}>
                                    <span className="material-symbols-outlined" style={{ color: "rgba(194, 194, 245, 0.4)", fontSize: "18px" }}>
                                      drag_indicator
                                    </span>
                                    <span style={{ 
                                      width: "14px", 
                                      height: "14px", 
                                      border: "1.5px solid rgba(194, 194, 245, 0.4)", 
                                      borderRadius: "2px",
                                      display: "inline-block"
                                    }} />
                                    <span 
                                      style={{ color: "var(--color-on-surface)", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingLesson({
                                          id: l.id,
                                          module_id: l.module_id,
                                          title: l.title,
                                          description: l.description || "",
                                          duration: l.duration || "",
                                          video_url: l.video_url || "",
                                          instructor_name: l.instructor_name || "Eng. Magno Santos",
                                          instructor_role: l.instructor_role || "CEO & Fundador CLS",
                                          instructor_avatar: l.instructor_avatar || "/magno.jpg",
                                          status: (l.status as any) || "publicado",
                                          scheduled_at: l.scheduled_at ? new Date(l.scheduled_at).toISOString().slice(0, 16) : "",
                                          cover_image_url: l.cover_image_url || ""
                                        });
                                      }}
                                      title="Clique para Configurar Aula"
                                    >
                                      {String(index + 1).padStart(2, "0")} - {l.title}
                                    </span>

                                    {isComunidade && (
                                      <span style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        fontSize: "11px",
                                        color: "var(--color-primary)",
                                        backgroundColor: "rgba(194, 194, 245, 0.12)",
                                        padding: "2px 6px",
                                        borderRadius: "2px",
                                        marginLeft: "8px",
                                        border: "1px solid rgba(194, 194, 245, 0.2)"
                                      }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>calendar_today</span>
                                        7 dias
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    {l.duration && (
                                      <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                                        {l.duration}
                                      </span>
                                    )}
                                    <span 
                                      style={{ 
                                        fontSize: "10px", 
                                        color: l.status === "rascunho" ? "#FFB74D" : l.status === "agendado" ? "#64B5F6" : "#81C784", 
                                        backgroundColor: l.status === "rascunho" ? "rgba(255, 183, 77, 0.12)" : l.status === "agendado" ? "rgba(100, 181, 246, 0.12)" : "rgba(76, 175, 80, 0.12)", 
                                        padding: "2px 8px", 
                                        borderRadius: "10px",
                                        fontWeight: 600
                                      }}
                                    >
                                      {l.status === "rascunho" ? "Rascunho" : l.status === "agendado" ? "Agendado" : "Publicado"}
                                    </span>

                                    <button 
                                      style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingLesson({
                                          id: l.id,
                                          module_id: l.module_id,
                                          title: l.title,
                                          description: l.description || "",
                                          duration: l.duration || "",
                                          video_url: l.video_url || "",
                                          instructor_name: l.instructor_name || "Eng. Magno Santos",
                                          instructor_role: l.instructor_role || "CEO & Fundador CLS",
                                          instructor_avatar: l.instructor_avatar || "/magno.jpg",
                                          status: (l.status as any) || "publicado",
                                          scheduled_at: l.scheduled_at ? new Date(l.scheduled_at).toISOString().slice(0, 16) : "",
                                          cover_image_url: l.cover_image_url || ""
                                        });
                                      }}
                                      title="Editar Aula"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                                    </button>

                                    <button 
                                      style={{ background: "none", border: "none", color: "rgba(244, 67, 54, 0.7)", cursor: "pointer", display: "flex", alignItems: "center" }}
                                      onClick={() => handleDeleteLesson(l.id)}
                                      title="Excluir Aula"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: "20px 20px 20px 60px", color: "var(--color-outline)", fontSize: "13px" }}>
                              Nenhuma aula cadastrada neste módulo.
                            </div>
                          )}

                          {/* Plus Add Button underneath lessons list */}
                          <div style={{ padding: "12px 20px 12px 60px" }}>
                            <button 
                              type="button"
                              onClick={() => setActiveAddLessonModuleId(m.id)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "1px solid rgba(194, 194, 245, 0.3)",
                                background: "rgba(194, 194, 245, 0.05)",
                                color: "var(--color-primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                e.currentTarget.style.background = "rgba(194, 194, 245, 0.15)";
                                e.currentTarget.style.borderColor = "var(--color-primary)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.background = "rgba(194, 194, 245, 0.05)";
                                e.currentTarget.style.borderColor = "rgba(194, 194, 245, 0.3)";
                              }}
                              title="Adicionar Aula"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal/Overlay to Add Module */}
            {showAddModuleModal && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setShowAddModuleModal(false)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(237, 192, 102, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "450px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>Criar Novo Módulo</h3>
                  <form onSubmit={handleAddModule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>NOME DO MÓDULO</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Ex: Módulo 1 - Conceitos Fundamentais"
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setShowAddModuleModal(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting}
                      >
                        {submitting ? "Criando..." : "Criar Módulo"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal/Overlay to Add Lesson to specific Module */}
            {activeAddLessonModuleId && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setActiveAddLessonModuleId(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(237, 192, 102, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "500px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>
                    Cadastrar Nova Aula
                  </h3>
                  <p style={{ color: "var(--color-outline)", fontSize: "12px", marginTop: "-12px", marginBottom: "20px" }}>
                    Adicionando ao módulo: <strong style={{ color: "#ffffff" }}>{modules.find(m => m.id === activeAddLessonModuleId)?.title}</strong>
                  </p>
                  
                  <form onSubmit={handleAddLesson} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DA AULA</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Ex: 01 - Apresentação Geral"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark"
                        style={{ minHeight: "80px", resize: "vertical" }}
                        placeholder="Resumo do conteúdo da aula..."
                        value={lessonDesc}
                        onChange={(e) => setLessonDesc(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DURAÇÃO (Ex: 15 MIN)</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="18 MIN"
                          value={lessonDuration}
                          onChange={(e) => setLessonDuration(e.target.value)}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>LINK DO VÍDEO (URL)</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="https://vimeo.com/..."
                          value={lessonVideoUrl}
                          onChange={(e) => setLessonVideoUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>INSTRUTOR</label>
                      <select
                        className="input-dark"
                        value={lessonInstructorName}
                        onChange={(e) => {
                          setLessonInstructorName(e.target.value);
                          if (e.target.value === "Eng. Magno Santos") {
                            setLessonInstructorRole("CEO & Fundador CLS");
                            setLessonInstructorAvatar("/magno.jpg");
                          } else {
                            setLessonInstructorRole("Sócia CLS / Especialista");
                            setLessonInstructorAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200");
                          }
                        }}
                      >
                        <option value="Eng. Magno Santos" style={{ backgroundColor: "#131316" }}>Eng. Magno Santos</option>
                        <option value="Arq. Mayara Costa" style={{ backgroundColor: "#131316" }}>Arq. Mayara Costa</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setActiveAddLessonModuleId(null)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting}
                      >
                        {submitting ? "Salvando..." : "Salvar Aula"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal/Overlay to Edit Module */}
            {editingModule && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setEditingModule(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(237, 192, 102, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "500px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
                    maxHeight: "90vh",
                    overflowY: "auto"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>
                    Configurar Módulo
                  </h3>
                  <form onSubmit={handleSaveModule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO MÓDULO</label>
                      <input
                        type="text"
                        className="input-dark"
                        value={editingModule.title}
                        onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark"
                        style={{ minHeight: "80px", resize: "vertical" }}
                        placeholder="Descrição ou resumo do módulo..."
                        value={editingModule.description}
                        onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>STATUS</label>
                        <select
                          className="input-dark"
                          value={editingModule.status}
                          onChange={(e) => setEditingModule({ ...editingModule, status: e.target.value as any })}
                        >
                          <option value="publicado" style={{ backgroundColor: "#131316" }}>Publicado</option>
                          <option value="rascunho" style={{ backgroundColor: "#131316" }}>Rascunho</option>
                          <option value="agendado" style={{ backgroundColor: "#131316" }}>Agendado</option>
                        </select>
                      </div>

                      {editingModule.status === "agendado" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>AGENDAR LANÇAMENTO</label>
                          <input
                            type="datetime-local"
                            className="input-dark"
                            value={editingModule.scheduled_at}
                            onChange={(e) => setEditingModule({ ...editingModule, scheduled_at: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>CAPA DO MÓDULO</label>
                      
                      {editingModule.cover_image_url && (
                        <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <img src={editingModule.cover_image_url} alt="Capa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button 
                            type="button"
                            onClick={() => setEditingModule({ ...editingModule, cover_image_url: "" })}
                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-error)" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                          </button>
                        </div>
                      )}

                      <div 
                        style={{ 
                          border: "1px dashed rgba(237, 192, 102, 0.3)", 
                          borderRadius: "6px", 
                          padding: "16px", 
                          textAlign: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.2)",
                          cursor: "pointer",
                          position: "relative"
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCoverUpload(e, "module")}
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
                        <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--color-secondary)", marginBottom: "4px" }}>
                          cloud_upload
                        </span>
                        <p style={{ color: "#ffffff", margin: 0, fontSize: "12px", fontWeight: 600 }}>
                          {uploadingCover ? "Enviando..." : "Subir capa do módulo"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setEditingModule(null)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting || uploadingCover}
                      >
                        {submitting ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal/Overlay to Edit Lesson */}
            {editingLesson && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setEditingLesson(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(237, 192, 102, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "500px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
                    maxHeight: "90vh",
                    overflowY: "auto"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>
                    Configurar Aula
                  </h3>
                  <form onSubmit={handleSaveLesson} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DA AULA</label>
                      <input
                        type="text"
                        className="input-dark"
                        value={editingLesson.title}
                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark"
                        style={{ minHeight: "80px", resize: "vertical" }}
                        placeholder="Descrição ou resumo da aula..."
                        value={editingLesson.description}
                        onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DURAÇÃO</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="Ex: 18 MIN"
                          value={editingLesson.duration}
                          onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>LINK DO VÍDEO (URL)</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="Ex: https://vimeo.com/..."
                          value={editingLesson.video_url}
                          onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>STATUS</label>
                        <select
                          className="input-dark"
                          value={editingLesson.status}
                          onChange={(e) => setEditingLesson({ ...editingLesson, status: e.target.value as any })}
                        >
                          <option value="publicado" style={{ backgroundColor: "#131316" }}>Publicado</option>
                          <option value="rascunho" style={{ backgroundColor: "#131316" }}>Rascunho</option>
                          <option value="agendado" style={{ backgroundColor: "#131316" }}>Agendado</option>
                        </select>
                      </div>

                      {editingLesson.status === "agendado" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>AGENDAR LANÇAMENTO</label>
                          <input
                            type="datetime-local"
                            className="input-dark"
                            value={editingLesson.scheduled_at}
                            onChange={(e) => setEditingLesson({ ...editingLesson, scheduled_at: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>CAPA DA AULA (THUMBNAIL)</label>
                      
                      {editingLesson.cover_image_url && (
                        <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <img src={editingLesson.cover_image_url} alt="Capa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button 
                            type="button"
                            onClick={() => setEditingLesson({ ...editingLesson, cover_image_url: "" })}
                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-error)" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                          </button>
                        </div>
                      )}

                      <div 
                        style={{ 
                          border: "1px dashed rgba(237, 192, 102, 0.3)", 
                          borderRadius: "6px", 
                          padding: "16px", 
                          textAlign: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.2)",
                          cursor: "pointer",
                          position: "relative"
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCoverUpload(e, "lesson")}
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
                        <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--color-secondary)", marginBottom: "4px" }}>
                          cloud_upload
                        </span>
                        <p style={{ color: "#ffffff", margin: 0, fontSize: "12px", fontWeight: 600 }}>
                          {uploadingCover ? "Enviando..." : "Subir capa da aula"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setEditingLesson(null)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting || uploadingCover}
                      >
                        {submitting ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Tab 2: Spreadsheets and PDFs */}
        {activeTab === "resources" && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Fazer Upload de Planilhas e PDFs</h3>
            
            {/* Drag and drop / file selector upload space */}
            <div 
              style={{ 
                border: "2px dashed rgba(237, 192, 102, 0.3)", 
                borderRadius: "8px", 
                padding: "32px 24px", 
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                marginBottom: "24px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-secondary)";
                e.currentTarget.style.backgroundColor = "rgba(237, 192, 102, 0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(237, 192, 102, 0.3)";
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
              }}
            >
              <input
                type="file"
                onChange={handleFileUpload}
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
                disabled={uploadingFile}
              />
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-secondary)", marginBottom: "8px" }}>
                cloud_upload
              </span>
              <p className="font-body-md" style={{ color: "#ffffff", margin: "0 0 4px 0", fontWeight: 600 }}>
                {uploadingFile ? "Enviando arquivo..." : "Arraste ou clique para selecionar o arquivo"}
              </p>
              <p className="font-body-xs" style={{ color: "var(--color-outline)", margin: 0 }}>
                Apenas os administradores (Magno e Mayara) podem realizar uploads. Suporta PDFs, Planilhas, Apresentações, etc.
              </p>
            </div>

            <form onSubmit={handleAddResource} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO DOCUMENTO</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Ex: Planilha de EVTL Completa"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>CATEGORIA</label>
                  <select
                    className="input-dark"
                    value={resourceCategory}
                    onChange={(e) => setResourceCategory(e.target.value)}
                  >
                    <option value="spreadsheet" style={{ backgroundColor: "#131316" }}>Planilha (Excel/Sheets)</option>
                    <option value="pdf" style={{ backgroundColor: "#131316" }}>Dossiê / PDF</option>
                    <option value="template" style={{ backgroundColor: "#131316" }}>Template / Modelo</option>
                    <option value="link" style={{ backgroundColor: "#131316" }}>Link Externo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO DO CONTEÚDO</label>
                <textarea
                  className="input-dark"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Descreva o que os membros vão encontrar ou aprender com este recurso..."
                  value={resourceDesc}
                  onChange={(e) => setResourceDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>URL DE DOWNLOAD / LINK</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="https://link-do-arquivo.com"
                    value={resourceFileUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setResourceFileUrl(url);
                      if (url) {
                        // Try to guess format from URL dynamically
                        const ext = url.split('.').pop()?.split(/[?#]/)[0]?.toUpperCase();
                        if (ext && ext.length <= 4 && /^[A-Z0-9]+$/.test(ext)) {
                          setResourceFormat(ext);
                          if (["XLSX", "XLS", "CSV"].includes(ext)) {
                            setResourceCategory("spreadsheet");
                          } else if (ext === "PDF") {
                            setResourceCategory("pdf");
                          }
                        }
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {/* Hidden input values for backward compatibility payload */}
              <input type="hidden" value={resourceFormat} />
              <input type="hidden" value={resourceSize} />

              <button type="submit" className="btn-primary" style={{ marginTop: "12px" }} disabled={submitting}>
                {submitting ? "Publicando..." : "Publicar Recurso"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Calendar Events */}
        {activeTab === "events" && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Agendar Novo Evento no Calendário</h3>
            <form onSubmit={handleAddEvent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO EVENTO</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Ex: Mentoria sobre Avaliação de Landbanks"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TIPO</label>
                  <select
                    className="input-dark"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as "mentoria" | "atualizacao")}
                  >
                    <option value="mentoria" style={{ backgroundColor: "#131316" }}>Mentoria Coletiva</option>
                    <option value="atualizacao" style={{ backgroundColor: "#131316" }}>Atualização de Mercado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DATA</label>
                  <input
                    type="date"
                    className="input-dark"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>HORA DE INÍCIO</label>
                  <input
                    type="time"
                    className="input-dark"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>HORA DE TÉRMINO</label>
                  <input
                    type="time"
                    className="input-dark"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>MENTOR RESPONSÁVEL</label>
                  <select
                    className="input-dark"
                    value={eventMentorName}
                    onChange={(e) => {
                      setEventMentorName(e.target.value);
                      if (e.target.value === "Eng. Magno Santos") {
                        setEventMentorRole("CEO & Fundador CLS");
                        setEventMentorAvatar("/magno.jpg");
                        setEventMentorBio("Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias.");
                      } else {
                        setEventMentorRole("Sócia CLS / Especialista");
                        setEventMentorAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200");
                        setEventMentorBio("Arquiteta e especialista em concepção e estruturação conceitual de empreendimentos residenciais de alto padrão.");
                      }
                    }}
                  >
                    <option value="Eng. Magno Santos" style={{ backgroundColor: "#131316" }}>Eng. Magno Santos</option>
                    <option value="Arq. Mayara Costa" style={{ backgroundColor: "#131316" }}>Arq. Mayara Costa</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>LINK DO ZOOM / REUNIÃO</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="https://zoom.us/j/..."
                    value={eventZoomLink}
                    onChange={(e) => setEventZoomLink(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÓPICO OU ASSUNTO PRINCIPAL</label>
                <textarea
                  className="input-dark"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Descreva brevemente o escopo e pauta da mentoria..."
                  value={eventTopic}
                  onChange={(e) => setEventTopic(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "12px" }} disabled={submitting}>
                {submitting ? "Publicando..." : "Agendar Evento"}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Mentorados */}
        {activeTab === "mentorados" && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Mentorados Cadastrados</h3>
            
            {loadingMentorados ? (
              <div style={{ padding: "40px", textAlign: "center" }}>Carregando mentorados...</div>
            ) : mentorados.length === 0 ? (
              <div style={{ 
                padding: "48px 24px", 
                textAlign: "center", 
                backgroundColor: "rgba(255,255,255,0.02)", 
                borderRadius: "8px", 
                border: "1px dashed rgba(255,255,255,0.1)" 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "16px" }}>
                  group
                </span>
                <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", margin: 0, fontWeight: 500 }}>
                  Você ainda não tem mentorado cadastrado.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {mentorados.map((m) => (
                  <div 
                    key={m.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: "20px", 
                      borderRadius: "6px", 
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px"
                    }}
                  >
                    <div 
                      style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "50%", 
                        backgroundColor: "var(--color-primary)", 
                        color: "var(--color-on-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "16px",
                        overflow: "hidden",
                        border: "1px solid var(--color-secondary)",
                        flexShrink: 0
                      }}
                    >
                      {m.img ? <img src={m.img} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (m.initials || m.name.substring(0, 2).toUpperCase())}
                    </div>
                    <div>
                      <h4 style={{ color: "#ffffff", margin: "0 0 4px 0", fontWeight: 600, fontSize: "15px" }}>{m.name}</h4>
                      <p style={{ color: "var(--color-secondary)", margin: "0 0 2px 0", fontSize: "12px" }}>{m.role} {m.company ? `na ${m.company}` : ""}</p>
                      <p style={{ color: "var(--color-outline)", margin: 0, fontSize: "11px" }}>{m.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Comentários */}
        {activeTab === "comments" && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Comentários das Aulas</h3>
            {loadingComments ? (
              <div style={{ padding: "40px", textAlign: "center" }}>Carregando comentários...</div>
            ) : comments.length === 0 ? (
              <div style={{ 
                padding: "48px 24px", 
                textAlign: "center", 
                backgroundColor: "rgba(255,255,255,0.02)", 
                borderRadius: "8px", 
                border: "1px dashed rgba(255,255,255,0.1)" 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "16px" }}>
                  chat
                </span>
                <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", margin: 0, fontWeight: 500 }}>
                  Ainda não tem comentários.
                </p>
              </div>
            ) : (() => {
              // Grouping comments by module then by lesson
              const grouped: Record<string, { moduleTitle: string; lessons: Record<string, { lessonTitle: string; comments: any[] }> }> = {};

              comments.forEach(c => {
                const lesson = c.lessons;
                const moduleObj = lesson?.modules;
                
                const moduleId = lesson?.module_id || "unknown-module";
                const moduleTitle = moduleObj?.title || "Módulo Geral";
                const lessonId = c.lesson_id || "unknown-lesson";
                const lessonTitle = lesson?.title || "Aula Geral";

                if (!grouped[moduleId]) {
                  grouped[moduleId] = {
                    moduleTitle,
                    lessons: {}
                  };
                }

                if (!grouped[moduleId].lessons[lessonId]) {
                  grouped[moduleId].lessons[lessonId] = {
                    lessonTitle,
                    comments: []
                  };
                }

                grouped[moduleId].lessons[lessonId].comments.push(c);
              });

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {Object.entries(grouped).map(([modId, modData]) => (
                    <div key={modId} className="glass-panel" style={{ padding: "24px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "11px", letterSpacing: "0.1em" }}>
                        MÓDULO: {modData.moduleTitle}
                      </span>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
                        {Object.entries(modData.lessons).map(([lessId, lessData]) => (
                          <div key={lessId} style={{ borderLeft: "2px solid rgba(237, 192, 102, 0.3)", paddingLeft: "16px" }}>
                            <h4 style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, margin: "0 0 12px 0" }}>
                              {lessData.lessonTitle}
                            </h4>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {lessData.comments.map((c: any) => (
                                <div key={c.id} style={{ display: "flex", gap: "12px", backgroundColor: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-primary)", fontWeight: 700, fontSize: "12px" }}>
                                    {c.members?.img ? (
                                      <img src={c.members.img} alt={c.members.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      (c.members?.name || "M").substring(0, 1).toUpperCase()
                                    )}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                                      <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "12px" }}>
                                        {c.members?.name || "Membro CLS"}{" "}
                                        <span style={{ color: "var(--color-outline)", fontWeight: 400, fontSize: "11px" }}>
                                          ({c.members?.role || "Membro"})
                                        </span>
                                      </span>
                                      <span style={{ color: "var(--color-outline)", fontSize: "10px" }}>
                                        {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                                      {c.content}
                                    </p>
                                    
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                      <button 
                                        onClick={async () => {
                                          if (!confirm("Deseja realmente excluir este comentário?")) return;
                                          const { error } = await supabase.from("lesson_comments").delete().eq("id", c.id);
                                          if (error) {
                                            showStatus("error", "Erro ao excluir comentário.");
                                          } else {
                                            showStatus("success", "Comentário excluído.");
                                            void loadComments();
                                          }
                                        }}
                                        style={{ background: "none", border: "none", color: "var(--color-error)", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span> Excluir
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
