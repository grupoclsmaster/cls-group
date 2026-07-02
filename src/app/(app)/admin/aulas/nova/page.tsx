"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function CreateLessonPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get("moduleId") || "";
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Parent context details
  const [moduleTitle, setModuleTitle] = useState("Módulo");
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("Masterclass");

  // Lesson states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("15 MIN");
  const [videoUrl, setVideoUrl] = useState("");
  const [muxPlaybackId, setMuxPlaybackId] = useState("");
  const [status, setStatus] = useState<"rascunho" | "agendado" | "publicado">("publicado");
  const [scheduledAt, setScheduledAt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  
  const [instructorName, setInstructorName] = useState("Eng. Magno Santos");
  const [instructorRole, setInstructorRole] = useState("CEO & Fundador CLS");
  const [instructorAvatar, setInstructorAvatar] = useState("/magno.jpg");

  // Mux upload states
  const [videoSource, setVideoSource] = useState<"manual" | "mux_upload">("manual");
  const [muxUploadStatus, setMuxUploadStatus] = useState<"idle" | "requesting" | "uploading" | "processing" | "ready" | "error">("idle");
  const [muxUploadProgress, setMuxUploadProgress] = useState(0);
  const [muxUploadError, setMuxUploadError] = useState("");
  const [generatingCover, setGeneratingCover] = useState(false);

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

          if (!moduleId) {
            showStatus("error", "ID do módulo não fornecido.");
            return;
          }

          // Fetch module title and course title for breadcrumbs
          const { data: mData, error: mErr } = await supabase
            .from("modules")
            .select("*, courses(id, title)")
            .eq("id", moduleId)
            .single();

          if (mErr) throw mErr;

          if (mData) {
            setModuleTitle(mData.title || "Módulo");
            setCourseId((mData.courses as any)?.id || "");
            setCourseTitle((mData.courses as any)?.title || "Masterclass");
          }
        } else {
          router.push("/sem-permissao");
        }
      } catch (err: any) {
        console.error("Erro ao carregar contexto:", err);
        showStatus("error", err.message || "Erro ao carregar contexto da aula.");
      } finally {
        setLoading(false);
      }
    };

    void checkAdminAndLoadContext();
  }, [moduleId, router, supabase]);

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !moduleId) return;
    setSubmitting(true);
    try {
      const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${randomSuffix}`;

      // Fetch the current highest sequence_order for lessons in this module
      const { data: lastLessons } = await supabase
        .from("lessons")
        .select("sequence_order")
        .eq("module_id", moduleId)
        .order("sequence_order", { ascending: false })
        .limit(1);

      let nextOrder = 1;
      if (lastLessons && lastLessons.length > 0) {
        const lastOrder = lastLessons[0].sequence_order;
        if (lastOrder !== null && lastOrder !== undefined) {
          nextOrder = lastOrder + 1;
        }
      }

      const { error } = await supabase.from("lessons").insert([{
        module_id: moduleId,
        title,
        description,
        duration: duration || "15 MIN",
        video_url: videoUrl,
        mux_playback_id: muxPlaybackId || null,
        instructor_name: instructorName,
        instructor_role: instructorRole,
        instructor_avatar: instructorAvatar,
        status,
        scheduled_at: status === "agendado" ? new Date(scheduledAt).toISOString() : null,
        cover_image_url: coverImageUrl,
        slug,
        sequence_order: nextOrder
      }]);

      if (error) throw error;
      
      showStatus("success", "Aula criada com sucesso!");
      setTimeout(() => {
        router.push(`/admin/painel?courseId=${courseId}`);
      }, 1000);
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar aula.");
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

  const handleGenerateAICover = async () => {
    if (!title.trim()) {
      showStatus("error", "Por favor, insira o título da aula para gerar a capa correspondente.");
      return;
    }

    setGeneratingCover(true);
    showStatus("success", "Gerando capa por Inteligência Artificial...");

    try {
      const res = await fetch("/api/admin/generate-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar capa com IA");

      setCoverImageUrl(data.url);
      showStatus("success", "Imagem de capa gerada com sucesso pela IA!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro inesperado ao gerar a capa.");
    } finally {
      setGeneratingCover(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <p style={{ color: "var(--color-outline)" }}>Carregando dados...</p>
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

      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Cadastrar Nova Aula</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Insira as informações básicas, o vídeo e a capa para a nova aula do módulo.
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
              placeholder="Ex: 01 - Apresentação Geral"
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
              placeholder="Resumo do conteúdo da aula..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Mux Video Upload Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>VÍDEO DA AULA (UPLOAD DIRETO PARA O MUX)</label>
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

              {muxUploadStatus === "ready" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-success, #4CAF50)", marginBottom: "4px" }}>
                    check_circle
                  </span>
                  <p style={{ color: "#81C784", margin: 0, fontSize: "14px", fontWeight: 600 }}>
                    Vídeo enviado e processado com sucesso!
                  </p>
                  <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "12px" }}>
                    Playback ID: <strong style={{ color: "#ffffff" }}>{muxPlaybackId}</strong>
                  </p>
                  {duration && (
                    <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "12px" }}>
                      Duração detectada: <strong style={{ color: "#ffffff" }}>{duration}</strong>
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: "12px", padding: "6px 16px", fontSize: "12px" }}
                    onClick={() => {
                      setMuxUploadStatus("idle");
                      setMuxPlaybackId("");
                      setMuxUploadProgress(0);
                    }}
                  >
                    Enviar outro vídeo
                  </button>
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
          </div>


          {/* Instructor & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
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
            
            <button
              type="button"
              className="btn-secondary"
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 20px",
                border: "1px solid var(--color-gold, #b89047)",
                color: "var(--color-gold, #b89047)",
                width: "100%",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
              onClick={handleGenerateAICover}
              disabled={generatingCover || uploadingCover}
            >
              {generatingCover ? (
                <>
                  <div style={{
                    border: "2px solid rgba(255,255,255,0.1)",
                    borderTop: "2px solid var(--color-gold, #b89047)",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    animation: "spin 1s linear infinite"
                  }}></div>
                  <span>Gerando Capa com IA...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
                  <span>Gerar Capa com IA (Baseado no título)</span>
                </>
              )}
            </button>
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
              {submitting ? "Salvando..." : "Salvar Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
