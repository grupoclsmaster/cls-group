"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SkeletonMasterclassDetail } from "@/components/SkeletonLoading";

interface Lesson {
  id: string;
  module: string;
  moduleTitle: string;
  code: string;
  title: string;
  desc: string;
  duration: string;
  videoUrl: string;
  instructor: {
    name: string;
    role: string;
    img: string;
  };
  longDesc: string;
  thumbnailUrl?: string;
  attachedResources?: any[];
  courseSlug?: string;
}

export default function WatchLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonSlug = Array.isArray(params?.lessonSlug) ? params.lessonSlug[0] : (params?.lessonSlug || "");

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblingLessons, setSiblingLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for player mock interaction
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedPercent, setWatchedPercent] = useState(30); // Default placeholder
  const [rating, setRating] = useState(4.5);
  const [hasRated, setHasRated] = useState(false);
  const [usefulCount, setUsefulCount] = useState(12);
  const [isUseful, setIsUseful] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Comments state
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Resources state
  const [downloadingResources, setDownloadingResources] = useState(false);

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim() || !lesson) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: inserted, error } = await supabase
        .from('lesson_comments')
        .insert({
          lesson_id: lesson.id,
          user_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId
        })
        .select('id, content, created_at, user_id, parent_id, members (name, img, role, initials)')
        .single();

      if (error) throw error;

      if (inserted) {
        const newReply = {
          id: inserted.id,
          userId: inserted.user_id,
          parentId: inserted.parent_id,
          author: inserted.members?.name || "Você",
          avatar: inserted.members?.img || "",
          initials: inserted.members?.initials || "",
          role: inserted.members?.role || "Membro",
          time: "Agora mesmo",
          content: inserted.content
        };
        setComments(prev => [...prev, newReply]);
        setReplyContent("");
        setReplyingToId(null);
        showToast("Resposta publicada com sucesso!", "success");
      }
    } catch (err: any) {
      alert("Erro ao responder: " + err.message);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('lesson_comments')
        .update({ content: editingContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editingContent.trim() } : c));
      setEditingCommentId(null);
      setEditingContent("");
      showToast("Comentário atualizado!", "success");
    } catch (err: any) {
      alert("Erro ao editar: " + err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('lesson_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
      showToast("Comentário excluído.", "info");
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load lesson details
  useEffect(() => {
    async function loadLesson() {
      if (!lessonSlug) return;
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: member } = await supabase
            .from("members")
            .select("id, name, img, role, initials, member_type")
            .eq("id", user.id)
            .single();
          if (member) {
            setCurrentUser(member);
          }
        }

        // 1. Fetch current lesson with modules and courses
        let currentLesson: any = null;
        let moduleTitle = "Módulo";
        let courseSlugVal = "";

        const query = supabase.from('lessons').select('*, modules(*, courses(*))');
        if (lessonSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          query.eq('id', lessonSlug);
        } else {
          query.eq('slug', lessonSlug);
        }
        const { data: dbLesson } = await query.single();

        if (dbLesson) {
          moduleTitle = (dbLesson.modules as any)?.title || "Módulo";
          courseSlugVal = (dbLesson.modules as any)?.courses?.slug || (dbLesson.modules as any)?.course_id || "";

          currentLesson = {
            id: dbLesson.id,
            module: dbLesson.module_id,
            moduleTitle: moduleTitle,
            code: `AULA ${dbLesson.sequence_order}`,
            title: dbLesson.title,
            desc: dbLesson.description,
            duration: dbLesson.duration,
            videoUrl: dbLesson.video_url || "",
            instructor: {
              name: dbLesson.instructor_name || "Mentor Sênior",
              role: dbLesson.instructor_role || "Mentor Sênior",
              img: dbLesson.instructor_avatar || "/magno.jpg"
            },
            longDesc: dbLesson.long_description || dbLesson.description,
            thumbnailUrl: dbLesson.cover_image_url || dbLesson.thumbnail_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400",
            attachedResources: dbLesson.attached_resources || [],
            courseSlug: courseSlugVal
          };
        }

        setLesson(currentLesson);

        // 2. Fetch sibling lessons (all lessons from the same module)
        let siblings: any[] = [];
        let progressList: any[] = [];

        if (currentLesson) {
          if (user) {
            const { data: userProgress } = await supabase
              .from('user_lesson_progress')
              .select('*')
              .eq('user_id', user.id);
            if (userProgress) progressList = userProgress;
          }

          const { data: dbSiblings } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', currentLesson.module)
            .order('sequence_order', { ascending: true });

          if (dbSiblings && dbSiblings.length > 0) {
            siblings = dbSiblings.map((sib: any) => {
              const prog = progressList.find(p => p.lesson_id === sib.id);
              return {
                id: sib.id,
                slug: sib.slug,
                code: `AULA ${sib.sequence_order}`,
                title: sib.title,
                duration: sib.duration,
                status: prog?.completed ? "completed" : (prog?.percent_complete > 0 ? "active" : "locked")
              };
            });
          }
        }

        setSiblingLessons(siblings);

        // 3. Set watch percentage if exists in db
        if (currentLesson) {
          const currentProg = progressList.find(p => p.lesson_id === currentLesson.id);
          if (currentProg) {
            setWatchedPercent(currentProg.percent_complete);
            setIsCompleted(!!currentProg.completed);
          } else {
            setWatchedPercent(0);
            setIsCompleted(false);
          }
        } else {
          setWatchedPercent(0);
          setIsCompleted(false);
        }

        // 4. Fetch real comments
        if (currentLesson) {
          const { data: dbComments } = await supabase
            .from('lesson_comments')
            .select('id, content, created_at, user_id, parent_id, members (name, img, role, initials)')
            .eq('lesson_id', currentLesson.id)
            .order('created_at', { ascending: true });

          if (dbComments) {
            setComments(dbComments.map((c: any) => ({
              id: c.id,
              userId: c.user_id,
              parentId: c.parent_id,
              author: c.members?.name || "Membro CLS",
              avatar: c.members?.img || "",
              initials: c.members?.initials || "",
              role: c.members?.role || "Membro",
              time: new Date(c.created_at).toLocaleDateString(),
              content: c.content
            })));
          } else {
            setComments([]);
          }
        } else {
          setComments([]);
        }

      } catch (err) {
        console.error("Erro ao carregar detalhes da aula:", err);
        setLesson(null);
        setSiblingLessons([]);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonSlug]);

  // Periodic progress saving during mock video play
  useEffect(() => {
    let interval: any;
    async function updateProg() {
      if (!isPlaying || !lesson) return;
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setWatchedPercent(prev => {
          const next = Math.min(prev + 4, 100);
          const isDone = next >= 100;
          
          if (isDone && !isCompleted) {
            setIsCompleted(true);
            setSiblingLessons(siblingsPrev =>
              siblingsPrev.map(sib => {
                if (sib.id === lesson.id) {
                  return { ...sib, status: "completed" };
                }
                return sib;
              })
            );
            
            showToast("Parabéns! Você completou esta aula.", "success");
          }

          supabase.from('user_lesson_progress').upsert({
            user_id: user.id,
            lesson_id: lesson.id,
            watched_seconds: Math.floor(1200 * (next / 100)),
            total_seconds: 1200,
            percent_complete: next,
            completed: isDone,
            last_watched_at: new Date().toISOString()
          }, { onConflict: 'user_id,lesson_id' }).then((res: { error: any }) => {
            if (res.error) console.error("Erro ao salvar progresso no Supabase:", res.error);
          });

          return next;
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (isPlaying) {
      interval = setInterval(updateProg, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lesson]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !lesson) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para comentar.");
        return;
      }

      const { data: inserted, error } = await supabase
        .from('lesson_comments')
        .insert({
          lesson_id: lesson.id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select('id, content, created_at, user_id, parent_id, members (name, img, role, initials)')
        .single();

      if (error) throw error;

      if (inserted) {
        setComments(prev => [
          ...prev,
          {
            id: inserted.id,
            userId: inserted.user_id,
            parentId: inserted.parent_id,
            author: inserted.members?.name || "Você",
            avatar: inserted.members?.img || "",
            initials: inserted.members?.initials || "",
            role: inserted.members?.role || "Membro",
            time: "Agora mesmo",
            content: inserted.content
          }
        ]);
      }
      setNewComment("");
    } catch (err: any) {
      alert("Erro ao postar comentário: " + err.message);
    }
  };

  const handleRate = (stars: number) => {
    setRating(stars);
    setHasRated(true);
  };

  const handleUseful = () => {
    if (isUseful) {
      setUsefulCount((prev) => prev - 1);
      setIsUseful(false);
    } else {
      setUsefulCount((prev) => prev + 1);
      setIsUseful(true);
    }
  };

  const handleToggleCompleted = async () => {
    if (!lesson) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para salvar seu progresso.");
        return;
      }

      const nextCompletedStatus = !isCompleted;
      const nextPercent = nextCompletedStatus ? 100 : 0;

      setIsCompleted(nextCompletedStatus);
      setWatchedPercent(nextPercent);

      if (nextCompletedStatus) {
        showToast("Aula marcada como concluída!", "success");
      } else {
        showToast("Progresso da aula desmarcado.", "info");
      }

      setSiblingLessons(prev =>
        prev.map(sib => {
          if (sib.id === lesson.id) {
            return {
              ...sib,
              status: nextCompletedStatus ? "completed" : "locked"
            };
          }
          return sib;
        })
      );

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          watched_seconds: nextCompletedStatus ? 1200 : 0,
          total_seconds: 1200,
          percent_complete: nextPercent,
          completed: nextCompletedStatus,
          last_watched_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (error) {
        console.error("Erro ao atualizar progresso:", error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ZIP packaging and download logic
  const handleDownloadAllResources = async () => {
    if (!lesson || !lesson.attachedResources || lesson.attachedResources.length === 0) return;
    setDownloadingResources(true);
    try {
      if (lesson.attachedResources.length === 1) {
        const file = lesson.attachedResources[0];
        window.open(file.url, "_blank");
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        
        for (let i = 0; i < lesson.attachedResources.length; i++) {
          const res = lesson.attachedResources[i];
          try {
            const resp = await fetch(res.url);
            const blob = await resp.blob();
            
            let ext = res.url.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase() || "dat";
            if (ext.length > 4 || !ext) ext = "dat";
            
            const sanitizedTitle = (res.title || `recurso-${i + 1}`).replace(/[^a-zA-Z0-9_\u00C0-\u00FF -]/g, "");
            const filename = `${sanitizedTitle}.${ext}`;
            zip.file(filename, blob);
          } catch (e) {
            console.error("Erro ao incluir recurso no ZIP:", res.url, e);
          }
        }
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = `recursos-${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
      }
    } catch (err: any) {
      alert("Erro ao empacotar arquivos: " + err.message);
    } finally {
      setDownloadingResources(false);
    }
  };

  if (loading) {
    return <SkeletonMasterclassDetail />;
  }

  if (!lesson) {
    return (
      <div style={{ padding: "40px", color: "var(--color-error)" }}>
        <h3>Aula não encontrada.</h3>
        <Link href="/masterclasses">Voltar para a Biblioteca</Link>
      </div>
    );
  }

  const renderCommentAvatar = (avatarUrl: string, authorName: string, initials: string, isSmall = false) => {
    const hasImg = avatarUrl && avatarUrl.trim() !== "" && !avatarUrl.includes("placeholder");
    const size = isSmall ? "32px" : "40px";
    return (
      <div style={{ 
        width: size, 
        height: size, 
        borderRadius: "50%", 
        overflow: "hidden", 
        border: "1px solid rgba(255,255,255,0.1)", 
        flexShrink: 0,
        backgroundColor: "var(--color-surface-container)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {hasImg ? (
          <img src={avatarUrl} alt={authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ 
            fontSize: isSmall ? "11px" : "13px", 
            fontWeight: 700, 
            color: "var(--color-secondary)",
            letterSpacing: "0.05em"
          }}>
            {initials || authorName.split(/\s+/).map(w => w[0]).join("").substring(0, 2).toUpperCase() || "CLS"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      {/* Toast Notification Component */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: toast.type === "success" ? "var(--color-secondary)" : toast.type === "info" ? "#2196F3" : "#F44336",
          color: toast.type === "success" ? "#000" : "#fff",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 9999,
          animation: "slideUp 0.3s ease-out"
        }}>
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : toast.type === "info" ? "info" : "error"}
          </span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <section style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }} className="font-label-caps">
        <Link href={lesson.courseSlug ? `/masterclasses/curso/${lesson.courseSlug}` : "/masterclasses"} style={{ color: "var(--color-on-surface-variant)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }} className="hover-gold-text">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          VOLTAR
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <span style={{ color: "var(--color-on-surface-variant)" }}>{lesson.moduleTitle}</span>
      </section>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "32px", alignItems: "start" }} className="hide-sidebar-at-900">
          
          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Immersive Video Player */}
            <div
              className="glass-panel"
              style={{
                position: "relative",
                aspectRatio: "16/9",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "var(--color-surface-container-lowest)",
                cursor: "pointer"
              }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${lesson.thumbnailUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1200"}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: isPlaying ? 0.25 : 0.6,
                  transition: "opacity 0.5s ease"
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(1, 1, 5, 0.9) 0%, transparent 60%)" }} />

              {!isPlaying && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-on-secondary)",
                      boxShadow: "0 0 30px rgba(10, 82, 185, 0.4)",
                      transform: "scale(1)",
                      transition: "transform 0.3s ease"
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1", marginLeft: "6px" }}>play_arrow</span>
                  </div>
                </div>
              )}

              {/* Controls bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  padding: "16px 24px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  zIndex: 20
                }}
              >
                <button
                  style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  <span className="material-symbols-outlined">{isPlaying ? "pause" : "play_arrow"}</span>
                </button>

                {/* Progress track */}
                <div style={{ flex: 1, height: "4px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "100px", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${watchedPercent}%`, backgroundColor: "var(--color-secondary)", borderRadius: "100px" }} />
                  <div style={{ position: "absolute", left: `${watchedPercent}%`, top: "50%", transform: "translate(-50%, -50%)", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-secondary)" }} />
                </div>

                <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", letterSpacing: "0.05em" }}>
                  {watchedPercent > 0 ? `${Math.floor((watchedPercent / 100) * parseInt(lesson.duration.split(":")[0]))}:${String(Math.floor((watchedPercent / 100) * parseInt(lesson.duration.split(":")[1] || "00"))).padStart(2, "0")}` : "00:00"} / {lesson.duration}
                </span>

                <button style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer" }} className="hover-gold-text">
                  <span className="material-symbols-outlined">volume_up</span>
                </button>
                <button style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer" }} className="hover-gold-text">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
            </div>

            {/* Title, Description & Mentor Details */}
            <div className="glass-panel" style={{ borderRadius: "8px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ backgroundColor: "rgba(10, 82, 185, 0.1)", border: "1px solid rgba(10, 82, 185, 0.3)", color: "var(--color-secondary)", padding: "4px 8px", fontSize: "10px", borderRadius: "2px" }} className="font-label-caps">
                    {lesson.code}
                  </span>
                  <span style={{ color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                    • {lesson.duration}
                  </span>
                </div>
                <h1 className="font-headline-sm" style={{ color: "var(--color-on-surface)", marginBottom: "16px", fontSize: "28px" }}>
                  {lesson.title}
                </h1>
                <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.8 }}>
                  {lesson.longDesc}
                </p>
              </div>

              {/* Mentor Profile details */}
              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "24px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={lesson.instructor.img || "/magno.jpg"}
                    alt={lesson.instructor.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--color-secondary)",
                      boxShadow: "0 0 10px rgba(10, 82, 185, 0.2)"
                    }}
                  />
                  <div>
                    <h4 style={{ margin: 0, color: "#ffffff", fontSize: "14px", fontWeight: 600 }}>
                      {lesson.instructor.name}
                    </h4>
                    <p style={{ margin: 0, color: "var(--color-outline)", fontSize: "12px" }}>
                      {lesson.instructor.role}
                    </p>
                  </div>
                </div>

                {/* Attached Lesson Resources / Materials */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {lesson.attachedResources && lesson.attachedResources.length > 0 ? (
                    <button
                      onClick={handleDownloadAllResources}
                      className="btn-outline animate-fadeIn"
                      disabled={downloadingResources}
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        padding: "10px 20px", 
                        fontSize: "11px", 
                        textDecoration: "none",
                        borderColor: "var(--color-secondary)",
                        color: "var(--color-secondary)",
                        cursor: "pointer",
                        background: "transparent"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        {downloadingResources ? "hourglass_empty" : "download"}
                      </span>
                      {downloadingResources ? "BAIXANDO..." : "BAIXAR RECURSOS"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--color-outline)", fontStyle: "italic" }}>
                      Sem materiais complementares para esta aula.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Comments & Discussion */}
            <div className="glass-panel" style={{ borderRadius: "8px", padding: "32px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>forum</span>
                Discussões da Comunidade
              </h3>

              <form onSubmit={handlePostComment} style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                {renderCommentAvatar(currentUser?.img || "", currentUser?.name || "Você", currentUser?.initials || "")}
                <div style={{ flex: 1, position: "relative" }}>
                  <textarea
                    placeholder="Adicione um insight ou tire sua dúvida sobre a aula..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input-dark"
                    style={{ minHeight: "80px", resize: "none", paddingRight: "50px", borderRadius: "4px" }}
                  />
                  <button
                    type="submit"
                    style={{ position: "absolute", bottom: "12px", right: "12px", background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    className="hover-gold-dim-text"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {comments.filter(c => !c.parentId).length === 0 ? (
                  <div style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--color-outline)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: "1px dashed rgba(255, 255, 255, 0.1)"
                  }}>
                    Ainda não tem discussões sobre esta aula. Seja o primeiro a comentar!
                  </div>
                ) : (
                  comments.filter(c => !c.parentId).map((c) => {
                    const isAuthor = currentUser && c.userId === currentUser.id;
                    const replies = comments.filter(r => r.parentId === c.id);

                    return (
                      <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", gap: "16px" }}>
                          {renderCommentAvatar(c.avatar, c.author, c.initials)}
                          
                          <div className="glass-panel" style={{ flex: 1, borderRadius: "0 8px 8px 8px", padding: "16px 20px", position: "relative" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                              <div>
                                <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: "14px" }}>{c.author}</span>
                                <span style={{ color: "var(--color-on-surface-variant)", fontSize: "11px", marginLeft: "8px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>{c.role}</span>
                              </div>
                              <span style={{ color: "var(--color-outline)", fontSize: "11px" }}>{c.time}</span>
                            </div>

                            {editingCommentId === c.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="input-dark"
                                  style={{ minHeight: "60px", resize: "none" }}
                                />
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                  <button onClick={() => setEditingCommentId(null)} className="btn-outline" style={{ padding: "6px 12px", fontSize: "10px" }}>
                                    Cancelar
                                  </button>
                                  <button onClick={() => handleEditComment(c.id)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "10px" }}>
                                    Salvar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p style={{ color: "var(--color-on-surface-variant)", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{c.content}</p>
                                
                                <div style={{ display: "flex", gap: "16px", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "8px" }}>
                                  <button 
                                    onClick={() => {
                                      setReplyingToId(c.id);
                                      setReplyContent("");
                                    }}
                                    style={{ background: "none", border: "none", color: "var(--color-secondary)", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                    className="hover-gold-dim-text"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>reply</span>
                                    Responder
                                  </button>

                                  {isAuthor && (
                                    <button 
                                      onClick={() => {
                                        setEditingCommentId(c.id);
                                        setEditingContent(c.content);
                                      }}
                                      style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                      className="hover-gold-text"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>edit</span>
                                      Editar
                                    </button>
                                  )}

                                  {(isAuthor || currentUser?.member_type === "admin") && (
                                    <button 
                                      onClick={() => handleDeleteComment(c.id)}
                                      style={{ background: "none", border: "none", color: "#f87171", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                      className="hover-opacity"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
                                      Excluir
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {replies.map((reply) => {
                          const isReplyAuthor = currentUser && reply.userId === currentUser.id;
                          return (
                            <div key={reply.id} style={{ display: "flex", gap: "12px", marginLeft: "56px" }}>
                              {renderCommentAvatar(reply.avatar, reply.author, reply.initials, true)}
                              
                              <div className="glass-panel" style={{ flex: 1, borderRadius: "0 8px 8px 8px", padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.01)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                  <div>
                                    <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: "13px" }}>{reply.author}</span>
                                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "10px", marginLeft: "8px", background: "rgba(255,255,255,0.04)", padding: "1px 4px", borderRadius: "2px" }}>{reply.role}</span>
                                  </div>
                                  <span style={{ color: "var(--color-outline)", fontSize: "10px" }}>{reply.time}</span>
                                </div>

                                {editingCommentId === reply.id ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                                    <textarea
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      className="input-dark"
                                      style={{ minHeight: "50px", resize: "none" }}
                                    />
                                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                      <button onClick={() => setEditingCommentId(null)} className="btn-outline" style={{ padding: "4px 8px", fontSize: "9px" }}>
                                        Cancelar
                                      </button>
                                      <button onClick={() => handleEditComment(reply.id)} className="btn-primary" style={{ padding: "4px 8px", fontSize: "9px" }}>
                                        Salvar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px", lineHeight: "1.5" }}>{reply.content}</p>
                                    
                                    {(isReplyAuthor || currentUser?.member_type === "admin") && (
                                      <div style={{ display: "flex", gap: "12px", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.02)", paddingTop: "6px" }}>
                                        {isReplyAuthor && (
                                          <button 
                                            onClick={() => {
                                              setEditingCommentId(reply.id);
                                              setEditingContent(reply.content);
                                            }}
                                            style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                                            className="hover-gold-text"
                                          >
                                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>edit</span>
                                            Editar
                                          </button>
                                        )}

                                        <button 
                                          onClick={() => handleDeleteComment(reply.id)}
                                          style={{ background: "none", border: "none", color: "#f87171", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                                          className="hover-opacity"
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>delete</span>
                                          Excluir
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {replyingToId === c.id && (
                          <div style={{ display: "flex", gap: "12px", marginLeft: "56px", marginTop: "8px" }}>
                            {renderCommentAvatar(currentUser?.img || "", currentUser?.name || "Você", currentUser?.initials || "", true)}
                            <div style={{ flex: 1 }}>
                              <textarea
                                placeholder="Escreva sua resposta..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="input-dark"
                                style={{ minHeight: "60px", resize: "none", borderRadius: "4px" }}
                              />
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                                <button onClick={() => setReplyingToId(null)} className="btn-outline" style={{ padding: "6px 12px", fontSize: "10px" }}>
                                  Cancelar
                                </button>
                                <button onClick={() => handlePostReply(c.id)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "10px" }}>
                                  Responder
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Menu Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div className="glass-panel" style={{ borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", fontSize: "10px" }}>
                INTERAÇÕES DA AULA
              </span>

              <button
                onClick={handleToggleCompleted}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: isCompleted ? "var(--color-secondary)" : "rgba(255, 255, 255, 0.05)",
                  color: isCompleted ? "var(--color-on-secondary)" : "var(--color-on-surface)",
                  border: isCompleted ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.15)",
                  padding: "12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  transition: "all 0.2s"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: ` 'FILL' ${isCompleted ? 1 : 0} ` }}>
                  {isCompleted ? "check_circle" : "radio_button_unchecked"}
                </span>
                {isCompleted ? "AULA CONCLUÍDA" : "MARCAR COMO CONCLUÍDA"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant)" }}>Avaliar</span>
                <div style={{ display: "flex", gap: "4px", color: "var(--color-secondary)" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", padding: 0 }}
                      onClick={() => handleRate(star)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: ` 'FILL' ${rating >= star ? 1 : 0} ` }}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUseful}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: isUseful ? "rgba(10, 82, 185, 0.15)" : "transparent",
                  color: isUseful ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                  border: isUseful ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.15)",
                  padding: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>thumb_up</span>
                MARCAR COMO ÚTIL ({usefulCount})
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: isSaved ? "rgba(10, 82, 185, 0.15)" : "transparent",
                  color: isSaved ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                  border: isSaved ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.15)",
                  padding: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: ` 'FILL' ${isSaved ? 1 : 0} ` }}>bookmark</span>
                {isSaved ? "SALVO" : "SALVAR AULA"}
              </button>
            </div>

            {/* Sibling module progress & catalog index list */}
            <div className="glass-panel" style={{ borderRadius: "8px", padding: "24px" }}>
              <h3 className="font-label-caps" style={{ color: "var(--color-on-surface)", marginBottom: "16px", fontSize: "11px", letterSpacing: "0.1em" }}>
                AULAS DESTE MÓDULO
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {siblingLessons.map((sib) => {
                  const isActive = sib.id === lessonSlug || sib.slug === lessonSlug;
                  const isCompleted = sib.status === "completed";
                  return (
                    <div
                      key={sib.id}
                      onClick={() => router.push(`/masterclasses/aula/${sib.slug || sib.id}`)}
                      className={`glass-panel card-hover`}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        opacity: isActive ? 1 : 0.8,
                        borderColor: isActive ? "var(--color-secondary)" : "rgba(255,255,255,0.05)",
                        backgroundColor: isActive ? "var(--color-surface-container-high)" : "var(--color-surface-container-low)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        position: "relative"
                      }}
                    >
                      {isActive && (
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", backgroundColor: "var(--color-secondary)" }} />
                      )}

                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "18px",
                          color: isActive || isCompleted ? "var(--color-secondary)" : "var(--color-outline)",
                          fontVariationSettings: ` 'FILL' ${isActive || isCompleted ? 1 : 0} `
                        }}
                      >
                        {isCompleted ? "check_circle" : "play_circle"}
                      </span>

                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "10px", color: "var(--color-secondary)", display: "block" }}>{sib.code}</span>
                        <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: "var(--color-on-surface)" }}>{sib.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
