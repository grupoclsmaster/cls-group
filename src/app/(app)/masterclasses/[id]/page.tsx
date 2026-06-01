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
}

export default function WatchLessonPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = Array.isArray(params?.id) ? params.id[0] : (params?.id || "2-2");

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

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load lesson details
  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        // createClient() is instantiated here (client-side only, inside useEffect)
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch current lesson
        let currentLesson: any = null;
        let moduleTitle = "Módulo";

        // Query lessons table
        const { data: dbLesson } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', idStr)
          .single();

        if (dbLesson) {
          // Query module title
          const { data: dbModule } = await supabase
            .from('modules')
            .select('title')
            .eq('id', dbLesson.module_id)
            .single();
          if (dbModule) moduleTitle = dbModule.title;

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
            thumbnailUrl: dbLesson.cover_image_url || dbLesson.thumbnail_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400"
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
            .select('id, content, created_at, user_id, members (name, img, role)')
            .eq('lesson_id', currentLesson.id)
            .order('created_at', { ascending: false });

          if (dbComments) {
            setComments(dbComments.map((c: any) => ({
              id: c.id,
              author: c.members?.name || "Membro CLS",
              avatar: c.members?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200",
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
  }, [idStr]);

  // Periodic progress saving during mock video play
  useEffect(() => {
    let interval: any;
    async function updateProg() {
      if (!isPlaying || !lesson) return;
      try {
        // createClient() is instantiated here (client-side only, inside useEffect)
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
            
            // Show congratulatory toast when completing the lesson automatically
            showToast("Parabéns! Você completou esta aula.", "success");
          }

          // Save to database
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
        .select('id, content, created_at, user_id, members (name, img, role)')
        .single();

      if (error) throw error;

      if (inserted) {
        setComments(prev => [
          {
            id: inserted.id,
            author: inserted.members?.name || "Você",
            avatar: inserted.members?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200",
            role: inserted.members?.role || "Membro",
            time: "Agora mesmo",
            content: inserted.content
          },
          ...prev
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

      // Update local states immediately
      setIsCompleted(nextCompletedStatus);
      setWatchedPercent(nextPercent);

      if (nextCompletedStatus) {
        showToast("Aula marcada como concluída!", "success");
      } else {
        showToast("Progresso da aula desmarcado.", "info");
      }

      // Update sidebar sibling status
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

      // Perform upsert to Supabase
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
        <Link href="/masterclasses" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }} className="hover-gold-text">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          VOLTAR
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <span style={{ color: "var(--color-on-surface-variant)" }}>{lesson.moduleTitle}</span>
      </section>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        {/* Large Layout: Video Player, Info, Sibling Menu & Comments in grid columns */}
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
              {/* Fake video container */}
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

              {/* Floating gold Play Button */}
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
                      boxShadow: "0 0 30px rgba(237, 192, 102, 0.4)",
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
                  <span style={{ backgroundColor: "rgba(237, 192, 102, 0.1)", border: "1px solid rgba(237, 192, 102, 0.3)", color: "var(--color-secondary)", padding: "4px 8px", fontSize: "10px", borderRadius: "2px" }} className="font-label-caps">
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
                  justifyContent: "flex-end",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "24px"
                }}
              >
                {/* Dossier Download Action */}
                <button
                  className="btn-outline"
                  onClick={() => alert("Fazendo download do Dossiê executivo e materiais de apoio...")}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "11px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>
                  BAIXAR DOSSIÊ
                </button>
              </div>
            </div>

            {/* Comments & Discussion */}
            <div className="glass-panel" style={{ borderRadius: "8px", padding: "32px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>forum</span>
                Discussões da Comunidade
              </h3>

              {/* Form Comment */}
              <form onSubmit={handlePostComment} style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                  <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200" alt="Sua Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
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

              {/* Comment Items list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {comments.length === 0 ? (
                  <div style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--color-outline)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: "1px dashed rgba(255, 255, 255, 0.1)"
                  }}>
                    Ainda não tem comentários.
                  </div>
                ) : (
                  comments.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                        <img src={c.avatar} alt={c.author} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div className="glass-panel" style={{ flex: 1, borderRadius: "0 8px 8px 8px", padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: "14px" }}>{c.author}</span>
                            <span style={{ color: "var(--color-on-surface-variant)", fontSize: "12px", marginLeft: "8px" }}>{c.role}</span>
                          </div>
                          <span style={{ color: "var(--color-outline)", fontSize: "11px" }}>{c.time}</span>
                        </div>
                        <p style={{ color: "var(--color-on-surface-variant)", fontSize: "13px", lineHeight: "1.6" }}>{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Menu Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Actions Quick Box */}
            <div className="glass-panel" style={{ borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", fontSize: "10px" }}>
                INTERAÇÕES DA AULA
              </span>

              {/* Toggle Completed Lesson Button */}
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

              {/* Star Rating */}
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

              {/* Helpful thumb button */}
              <button
                onClick={handleUseful}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: isUseful ? "rgba(237, 192, 102, 0.15)" : "transparent",
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

              {/* Save / Bookmark Button */}
              <button
                onClick={() => setIsSaved(!isSaved)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: isSaved ? "rgba(237, 192, 102, 0.15)" : "transparent",
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
                  const isActive = sib.id === idStr;
                  const isCompleted = sib.status === "completed";
                  return (
                    <div
                      key={sib.id}
                      onClick={() => router.push(`/masterclasses/${sib.id}`)}
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
