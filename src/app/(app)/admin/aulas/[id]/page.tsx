"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import DateTimePicker from "@/components/DateTimePicker";

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = Array.isArray(params?.id) ? params.id[0] : (params?.id || "");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lesson states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState<"rascunho" | "agendado" | "publicado">("publicado");
  const [scheduledAt, setScheduledAt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [attachedResources, setAttachedResources] = useState<any[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const [instructorName, setInstructorName] = useState("Eng. Magno Santos");
  const [instructorRole, setInstructorRole] = useState("CEO & Fundador CLS");
  const [instructorAvatar, setInstructorAvatar] = useState("/magno.jpg");
  const [muxPlaybackId, setMuxPlaybackId] = useState("");

  // Mux upload states
  const [videoSource, setVideoSource] = useState<"mux_upload" | "manual">("mux_upload");
  const [muxUploadStatus, setMuxUploadStatus] = useState<"idle" | "requesting" | "uploading" | "processing" | "ready" | "error">("idle");
  const [muxUploadProgress, setMuxUploadProgress] = useState(0);
  const [muxUploadError, setMuxUploadError] = useState("");

  const handleMuxVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMuxUploadStatus("requesting");
    setMuxUploadError("");
    setMuxUploadProgress(0);

    try {
      // 1. Get Direct Upload URL from Server API
      const res = await fetch("/api/admin/mux/upload", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao obter URL de upload do Mux");

      const { uploadUrl, uploadId } = data;

      // 2. Upload video directly to Mux GCS URL using XHR to track progress
      setMuxUploadStatus("uploading");
      
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setMuxUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setMuxUploadStatus("processing");
          startPollingMuxStatus(uploadId);
        } else {
          setMuxUploadStatus("error");
          setMuxUploadError("Falha ao transferir o arquivo para o servidor do Mux.");
        }
      };

      xhr.onerror = () => {
        setMuxUploadStatus("error");
        setMuxUploadError("Erro de rede durante o upload.");
      };

      xhr.send(file);
    } catch (err: any) {
      setMuxUploadStatus("error");
      setMuxUploadError(err.message || "Erro inesperado ao iniciar upload.");
    }
  };

  const startPollingMuxStatus = (uploadId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/mux/status?uploadId=${uploadId}`);
        const data = await res.json();
        
        if (!res.ok) {
          clearInterval(interval);
          setMuxUploadStatus("error");
          setMuxUploadError(data.error || "Erro ao consultar processamento do Mux.");
          return;
        }

        if (data.status === "completed") {
          clearInterval(interval);
          setMuxPlaybackId(data.playbackId);
          setVideoUrl(""); // Clear manual url since we are using Mux playback
          setMuxUploadStatus("ready");
          showStatus("success", "Vídeo importado e pronto para reprodução!");
        } else if (data.status === "error") {
          clearInterval(interval);
          setMuxUploadStatus("error");
          setMuxUploadError(data.error || "Mux falhou ao processar o vídeo.");
        }
      } catch (err: any) {
        console.error("Erro no polling do Mux:", err);
      }
    }, 3000);
  };


  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  useEffect(() => {
    const checkAdminAndLoadLesson = async () => {
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
          
          // Fetch lesson details with modules and courses
          const { data: lesson, error: lessonErr } = await supabase
            .from("lessons")
            .select("*, modules(*, courses(title))")
            .eq("id", idStr)
            .single();

          if (lessonErr) throw lessonErr;

          if (lesson) {
            setTitle(lesson.title || "");
            setDescription(lesson.description || "");
            setDuration(lesson.duration || "");
            setVideoUrl(lesson.video_url || "");
            setStatus(lesson.status || "publicado");
            setScheduledAt(lesson.scheduled_at ? new Date(lesson.scheduled_at).toISOString().slice(0, 16) : "");
            setCoverImageUrl(lesson.cover_image_url || "");
            setAttachedResources(lesson.attached_resources || []);
            setModuleId(lesson.module_id || "");
            setModuleTitle((lesson.modules as any)?.title || "Módulo");
            setCourseId((lesson.modules as any)?.course_id || "");
            setCourseTitle((lesson.modules as any)?.courses?.title || "Masterclass");
            setInstructorName(lesson.instructor_name || "Eng. Magno Santos");
            setInstructorRole(lesson.instructor_role || "CEO & Fundador CLS");
            setInstructorAvatar(lesson.instructor_avatar || "/magno.jpg");
            setMuxPlaybackId(lesson.mux_playback_id || "");
          }
        } else {
          router.push("/sem-permissao");
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        showStatus("error", err.message || "Erro ao carregar dados da aula.");
      } finally {
        setLoading(false);
      }
    };

    if (idStr) {
      void checkAdminAndLoadLesson();
    }
  }, [idStr, router, supabase]);

  // Auto-detect duration from Mux HLS stream when Playback ID changes
  const durationDetectRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!muxPlaybackId.trim()) return;

    // Clean up any previous attempt
    if (durationDetectRef.current) {
      durationDetectRef.current.src = "";
      durationDetectRef.current = null;
    }

    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.crossOrigin = "anonymous";
    vid.style.display = "none";
    // Mux HLS URL — works for public (non-signed) playback IDs
    vid.src = `https://stream.mux.com/${muxPlaybackId.trim()}.m3u8`;
    durationDetectRef.current = vid;

    const onLoaded = () => {
      const secs = vid.duration;
      if (secs && isFinite(secs) && secs > 0) {
        const totalMin = Math.floor(secs / 60);
        const hours = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        if (hours > 0) {
          setDuration(`${hours}H ${mins > 0 ? mins + " MIN" : ""}`.trim());
        } else {
          setDuration(`${totalMin} MIN`);
        }
      }
      vid.remove();
    };

    vid.addEventListener("loadedmetadata", onLoaded);
    document.body.appendChild(vid);

    return () => {
      vid.removeEventListener("loadedmetadata", onLoaded);
      vid.src = "";
      vid.remove();
      durationDetectRef.current = null;
    };
  }, [muxPlaybackId]);

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title,
          description,
          duration,
          video_url: videoUrl,
          mux_playback_id: muxPlaybackId || null,
          instructor_name: instructorName,
          instructor_role: instructorRole,
          instructor_avatar: instructorAvatar,
          status,
          scheduled_at: status === "agendado" ? new Date(scheduledAt).toISOString() : null,
          cover_image_url: coverImageUrl,
          attached_resources: attachedResources
        })
        .eq("id", idStr);

      if (error) throw error;
      
      showStatus("success", "Aula atualizada com sucesso!");
      setTimeout(() => {
        router.push(`/admin/painel?courseId=${courseId}`);
      }, 1000);
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar aula.");
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

  const handleResourceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size to suggest Google Drive / OneDrive
    const limitSuggest = 15 * 1024 * 1024; // 15MB
    let suggestion = "";
    if (file.size > limitSuggest) {
      suggestion = "Este arquivo é muito pesado. Sugerimos compartilhar um link do Google Drive ou OneDrive para não sobrecarregar o servidor.";
    }

    const newRes = [...attachedResources];
    newRes[idx].fileUploading = true;
    newRes[idx].suggestion = suggestion;
    setAttachedResources(newRes);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      const updatedRes = [...attachedResources];
      updatedRes[idx].url = data.url;
      updatedRes[idx].fileUploading = false;
      // Auto fill title if empty
      if (!updatedRes[idx].title) {
        updatedRes[idx].title = data.name ? data.name.replace(/\.[^/.]+$/, "") : "Arquivo";
      }
      setAttachedResources(updatedRes);
      showStatus("success", "Arquivo do recurso enviado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao fazer upload do recurso.");
      const updatedRes = [...attachedResources];
      updatedRes[idx].fileUploading = false;
      setAttachedResources(updatedRes);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <p style={{ color: "var(--color-outline)" }}>Carregando dados da aula...</p>
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
        <span style={{ color: "var(--color-on-surface-variant)" }}>{moduleTitle}</span>
      </section>

      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Administrar Aula</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Edite informações básicas, faça upload de vídeos, insira a capa e anexe arquivos de apoio para os alunos.
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
        <form onSubmit={handleSaveLesson} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DA AULA</label>
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
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO / CONTEÚDO</label>
            <textarea
              className="input-dark"
              style={{ minHeight: "120px", resize: "vertical" }}
              placeholder="Descreva o que será abordado nesta aula..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Mux Video Selection / Upload Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>VÍDEO DA AULA</label>
            
            {muxPlaybackId ? (
              <div 
                style={{ 
                  border: "1px solid rgba(212, 175, 55, 0.25)", 
                  borderRadius: "6px", 
                  padding: "20px", 
                  backgroundColor: "rgba(184, 144, 71, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--color-gold, #b89047)" }}>
                    smart_display
                  </span>
                  <div>
                    <p style={{ color: "#ffffff", margin: 0, fontSize: "13px", fontWeight: 600 }}>
                      Vídeo Mux Ativo
                    </p>
                    <p style={{ color: "var(--color-outline)", margin: "2px 0 0 0", fontSize: "11px" }}>
                      Playback ID: <strong style={{ color: "var(--color-on-surface)" }}>{muxPlaybackId}</strong>
                      {duration && ` • Duração: ${duration}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "11px",
                    borderColor: "var(--color-error, #ffb4ab)",
                    color: "var(--color-error, #ffb4ab)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                  onClick={() => {
                    setMuxPlaybackId("");
                    setVideoUrl("");
                    setDuration("");
                    setMuxUploadStatus("idle");
                    setMuxUploadProgress(0);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
                  Substituir Vídeo
                </button>
              </div>
            ) : (
              <div>
                {/* Mode Selector */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      fontSize: "12px",
                      border: videoSource === "mux_upload" ? "1px solid var(--color-gold, #b89047)" : "1px solid rgba(255,255,255,0.1)",
                      color: videoSource === "mux_upload" ? "var(--color-gold, #b89047)" : "var(--color-outline)",
                      backgroundColor: videoSource === "mux_upload" ? "rgba(184, 144, 71, 0.05)" : "transparent",
                      fontWeight: 600,
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                    onClick={() => setVideoSource("mux_upload")}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>cloud_upload</span>
                    Fazer Upload de Vídeo
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      fontSize: "12px",
                      border: videoSource === "manual" ? "1px solid var(--color-gold, #b89047)" : "1px solid rgba(255,255,255,0.1)",
                      color: videoSource === "manual" ? "var(--color-gold, #b89047)" : "var(--color-outline)",
                      backgroundColor: videoSource === "manual" ? "rgba(184, 144, 71, 0.05)" : "transparent",
                      fontWeight: 600,
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                    onClick={() => setVideoSource("manual")}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>link</span>
                    Vincular Mux Playback ID
                  </button>
                </div>

                {videoSource === "mux_upload" ? (
                  <div 
                    style={{ 
                      border: "1px dashed rgba(145, 179, 225, 0.3)", 
                      borderRadius: "6px", 
                      padding: "32px", 
                      textAlign: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      position: "relative"
                    }}
                  >
                    {muxUploadStatus === "idle" && (
                      <>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleMuxVideoSelect}
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
                        />
                        <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-gold, #b89047)", marginBottom: "8px" }}>
                          movie
                        </span>
                        <p style={{ color: "#ffffff", margin: 0, fontSize: "14px", fontWeight: 600 }}>
                          Arraste ou clique para enviar um vídeo diretamente para o Mux
                        </p>
                        <p style={{ color: "var(--color-outline)", margin: "4px 0 0 0", fontSize: "12px" }}>
                          Formatos suportados: .mp4, .mov, .avi, etc.
                        </p>
                      </>
                    )}

                    {(muxUploadStatus === "requesting" || muxUploadStatus === "uploading" || muxUploadStatus === "processing") && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                        <div style={{
                          border: "3px solid rgba(255,255,255,0.1)",
                          borderTop: "3px solid var(--color-gold, #b89047)",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          animation: "spin 1s linear infinite"
                        }}></div>
                        
                        <p style={{ color: "#ffffff", margin: 0, fontSize: "14px", fontWeight: 600 }}>
                          {muxUploadStatus === "requesting" && "Solicitando permissão de upload..."}
                          {muxUploadStatus === "uploading" && `Enviando vídeo para o Mux: ${muxUploadProgress}%`}
                          {muxUploadStatus === "processing" && "Mux processando o vídeo... (isso pode levar alguns minutos)"}
                        </p>

                        {muxUploadStatus === "uploading" && (
                          <div style={{ width: "100%", maxWidth: "300px", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${muxUploadProgress}%`, height: "100%", backgroundColor: "var(--color-gold, #b89047)", transition: "width 0.2s ease-out" }}></div>
                          </div>
                        )}
                      </div>
                    )}

                    {muxUploadStatus === "error" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-error, #F44336)", marginBottom: "4px" }}>
                          error
                        </span>
                        <p style={{ color: "#E57373", margin: 0, fontSize: "14px", fontWeight: 600 }}>
                          Erro no envio do vídeo
                        </p>
                        <p style={{ color: "var(--color-outline)", margin: 0, fontSize: "12px" }}>
                          {muxUploadError}
                        </p>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ marginTop: "12px", padding: "6px 16px", fontSize: "12px" }}
                          onClick={() => {
                            setMuxUploadStatus("idle");
                            setMuxUploadProgress(0);
                          }}
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                    <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>MUX PLAYBACK ID (MANUAL)</label>
                    <input
                      type="text"
                      className="input-dark"
                      placeholder="Cole o Playback ID do Mux (ex: e5Y5l0Hk44Mm6qyaqRi6Cvo95gs6c06b)"
                      value={muxPlaybackId}
                      onChange={(e) => setMuxPlaybackId(e.target.value)}
                    />
                    <p style={{ fontSize: "11px", color: "var(--color-outline)", margin: "4px 0 0 0" }}>
                      A duração do vídeo será detectada automaticamente ao vincular o Playback ID válido do Mux.
                    </p>
                  </div>
                )}
              </div>
            )}
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

          {/* Instructor */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>INSTRUTOR</label>
            <select
              className="input-dark"
              value={instructorName}
              onChange={(e) => {
                setInstructorName(e.target.value);
                if (e.target.value === "Eng. Magno Santos") {
                  setInstructorRole("CEO & Fundador CLS");
                  setInstructorAvatar("/magno.jpg");
                } else {
                  setInstructorRole("Sócia CLS / Especialista");
                  setInstructorAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200");
                }
              }}
            >
              <option value="Eng. Magno Santos" style={{ backgroundColor: "#131316" }}>Eng. Magno Santos</option>
              <option value="Arq. Mayara Costa" style={{ backgroundColor: "#131316" }}>Arq. Mayara Costa</option>
            </select>
          </div>

          {/* Cover image (Thumbnail) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>IMAGEM DE CAPA (THUMBNAIL)</label>
            
            {coverImageUrl && (
              <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={coverImageUrl} alt="Capa da Aula" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

          {/* Attached Resources */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>RECURSOS ANEXADOS (ARQUIVOS / PLANILHAS)</label>
              <button 
                type="button" 
                onClick={() => {
                  setAttachedResources([...attachedResources, { title: "", url: "", type: "upload" }]);
                }}
                className="btn-outline"
                style={{ padding: "6px 12px", fontSize: "11px" }}
              >
                + Anexar Novo Recurso
              </button>
            </div>
            
            {attachedResources.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {attachedResources.map((res: any, idx: number) => {
                  const type = res.type || "upload";
                  return (
                    <div key={idx} style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "12px", 
                      padding: "16px", 
                      backgroundColor: "rgba(255, 255, 255, 0.02)", 
                      borderRadius: "6px", 
                      border: "1px solid rgba(255, 255, 255, 0.05)" 
                    }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <input 
                            type="text" 
                            className="input-dark" 
                            placeholder="Título (ex: Planilha de Custos)" 
                            value={res.title || ""} 
                            onChange={(e) => {
                              const newRes = [...attachedResources];
                              newRes[idx].title = e.target.value;
                              setAttachedResources(newRes);
                            }}
                            required
                          />
                        </div>

                        <div style={{ width: "180px" }}>
                          <select
                            className="input-dark"
                            value={type}
                            onChange={(e) => {
                              const newRes = [...attachedResources];
                              newRes[idx].type = e.target.value;
                              newRes[idx].url = "";
                              newRes[idx].suggestion = "";
                              setAttachedResources(newRes);
                            }}
                          >
                            <option value="upload" style={{ backgroundColor: "#131316" }}>Upload de Arquivo</option>
                            <option value="url" style={{ backgroundColor: "#131316" }}>Compartilhar Link / URL</option>
                          </select>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => {
                            setAttachedResources(attachedResources.filter((_, i) => i !== idx));
                          }}
                          style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>delete</span>
                        </button>
                      </div>

                      {type === "upload" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <input
                              type="file"
                              onChange={(e) => handleResourceFileUpload(e, idx)}
                              disabled={res.fileUploading}
                              style={{ display: "none" }}
                              id={`file-input-${idx}`}
                            />
                            <label 
                              htmlFor={`file-input-${idx}`}
                              className="btn-outline"
                              style={{ padding: "8px 16px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>upload</span>
                              {res.fileUploading ? "Enviando..." : "Escolher Arquivo"}
                            </label>
                            
                            {res.url ? (
                              <span style={{ fontSize: "12px", color: "#81C784", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}>
                                ✓ Arquivo carregado: {res.url.split("/").pop()}
                              </span>
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>
                                Nenhum arquivo selecionado
                              </span>
                            )}
                          </div>

                          {res.suggestion && (
                            <p style={{ fontSize: "11px", color: "var(--color-secondary)", margin: "4px 0 0 0", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>info</span>
                              {res.suggestion}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div style={{ width: "100%" }}>
                          <input 
                            type="text" 
                            className="input-dark" 
                            placeholder="URL do link (ex: https://drive.google.com/...)" 
                            value={res.url || ""} 
                            onChange={(e) => {
                              const newRes = [...attachedResources];
                              newRes[idx].url = e.target.value;
                              setAttachedResources(newRes);
                            }}
                            required
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--color-outline)",
                backgroundColor: "rgba(255, 255, 255, 0.01)",
                borderRadius: "6px",
                border: "1px dashed rgba(255, 255, 255, 0.05)"
              }}>
                Nenhum arquivo ou recurso de apoio anexado a esta aula.
              </div>
            )}
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
