"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SkeletonMasterclasses } from "@/components/SkeletonLoading";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = Array.isArray(params?.courseSlug) ? params.courseSlug[0] : (params?.courseSlug || "");
  const supabase = createClient();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    async function loadCourseData() {
      if (!courseSlug) return;
      try {
        setLoading(true);

        // Fetch course by slug or ID
        const courseQuery = supabase.from('courses').select('*');
        if (courseSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          courseQuery.eq('id', courseSlug);
        } else {
          courseQuery.eq('slug', courseSlug);
        }
        const { data: dbCourse, error: courseErr } = await courseQuery.single();

        if (courseErr || !dbCourse) {
          console.error("Course not found:", courseErr);
          router.push("/masterclasses");
          return;
        }

        setCourse(dbCourse);

        // Fetch user progress
        const { data: { user } } = await supabase.auth.getUser();
        let dbProgress: any[] = [];
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user.id);
          if (progressData) dbProgress = progressData;
        }

        // Fetch modules for this course
        const { data: dbModules } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', dbCourse.id)
          .order('sequence_order', { ascending: true });

        const activeModules = dbModules || [];
        setModules(activeModules);

        if (activeModules.length > 0) {
          const moduleIds = activeModules.map((m: any) => m.id);
          // Fetch lessons for these modules
          const { data: dbLessons } = await supabase
            .from('lessons')
            .select('*')
            .in('module_id', moduleIds)
            .order('sequence_order', { ascending: true });

          const finalLessons = (dbLessons || []).map((l: any) => {
            const prog = dbProgress.find((p) => p.lesson_id === l.id);
            return {
              ...l,
              thumbnail_url: l.cover_image_url || l.thumbnail_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400",
              progress: prog ? prog.percent_complete : 0,
              completed: prog ? prog.completed : false,
              watched_seconds: prog ? prog.watched_seconds : 0
            };
          });
          setLessons(finalLessons);
        } else {
          setLessons([]);
        }

      } catch (err) {
        console.error("Erro ao carregar curso:", err);
        router.push("/masterclasses");
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();
  }, [courseSlug]);

  const handleResetProgress = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, progress: 0, completed: false } : l));
        alert("Progresso da aula reiniciado localmente!");
        return;
      }

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          percent_complete: 0,
          completed: false,
          watched_seconds: 0,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, progress: 0, completed: false } : l));
    } catch (err) {
      console.error("Erro ao reiniciar progresso:", err);
    }
  };

  const scrollCarousel = (id: string, direction: 'left' | 'right') => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <SkeletonMasterclasses />;
  }

  if (!course) {
    return null;
  }

  // Filtered lessons based on search
  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active Hero Lesson calculation
  const inProgress = lessons.find((l) => l.progress > 0 && l.progress < 100);
  const firstUnfinished = lessons.find((l) => !l.completed);
  const defaultHero = inProgress || firstUnfinished || lessons[0];
  
  const currentHeroLesson = defaultHero ? {
    ...defaultHero,
    module_title: modules.find(m => m.id === defaultHero.module_id)?.title || "Módulo"
  } : null;

  return (
    <div className="animate-fadeIn" style={{ position: "relative" }}>
      {/* CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .netflix-carousel {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          gap: 18px;
          padding: 10px 0 20px;
          margin-bottom: 20px;
        }
        .netflix-carousel::-webkit-scrollbar {
          height: 6px;
        }
        .netflix-carousel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .netflix-carousel::-webkit-scrollbar-thumb:hover {
          background: rgba(10, 82, 185, 0.3);
        }
        .netflix-card {
          flex: 0 0 280px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--dropdown-bg);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          flex-direction: column;
        }
        .netflix-card:hover {
          transform: scale(1.03);
          border-color: rgba(10, 82, 185, 0.3);
        }
        .carousel-container {
          position: relative;
        }
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--dropdown-bg);
          border: 1px solid var(--dropdown-border);
          color: var(--color-on-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s ease, border-color 0.2s, background-color 0.2s;
        }
        .carousel-container:hover .carousel-arrow {
          opacity: 1;
        }
        .carousel-arrow:hover {
          background-color: rgba(10, 82, 185, 0.1);
          border-color: var(--color-secondary);
          color: var(--color-secondary);
        }
        .carousel-arrow-left {
          left: -20px;
        }
        .carousel-arrow-right {
          right: -20px;
        }
        .hero-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: var(--color-secondary);
          color: var(--color-on-secondary);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 28px;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .hero-action-btn:hover {
          background-color: var(--color-secondary-fixed-dim);
          box-shadow: 0 0 20px rgba(10, 82, 185, 0.25);
        }
        .control-circle-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background-color 0.2s, color 0.2s;
        }
        .control-circle-btn:hover {
          border-color: #ffffff;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--color-secondary);
        }
        .back-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-outline);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 0;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .back-nav-btn:hover {
          color: var(--color-secondary);
        }
      `}} />

      {/* Back Button and Search Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <button onClick={() => router.push("/masterclasses")} className="back-nav-btn">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
            Voltar para os Cursos
          </button>
        </div>

        {/* Search Input Pill */}
        <div style={{ position: "relative" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#a0a0a5",
              fontSize: "18px"
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Buscar aulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "220px",
              padding: "10px 16px 10px 42px",
              backgroundColor: "var(--search-input-bg)",
              border: "1px solid var(--search-input-border)",
              borderRadius: "100px",
              color: "var(--color-on-surface)",
              fontSize: "13px",
              outline: "none",
              backdropFilter: "blur(8px)"
            }}
          />
        </div>
      </div>

      {/* Course detail view */}
      <div>
        {/* Hero Banner (Only shown if a lesson is available and search is empty) */}
        {currentHeroLesson && searchQuery === "" && (
          <section
            style={{
              margin: "-20px -40px 36px -40px",
              height: "45vh",
              minHeight: "380px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${currentHeroLesson.thumbnail_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: 1
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, rgba(19, 19, 22, 0.95) 0%, rgba(19, 19, 22, 0.8) 25%, rgba(19, 19, 22, 0.3) 60%, transparent 100%)",
                zIndex: 2
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, #131316 0%, rgba(19, 19, 22, 0.8) 12%, rgba(19, 19, 22, 0.3) 45%, transparent 100%)",
                zIndex: 2
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 5,
                padding: "0 40px 40px 40px",
                maxWidth: "600px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <span
                className="font-label-caps"
                style={{
                  color: "var(--color-secondary)",
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  fontWeight: 700
                }}
              >
                Continuar Trilha • {currentHeroLesson.module_title}
              </span>
              <h1
                className="font-display"
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em"
                }}
              >
                {currentHeroLesson.title}
              </h1>

              {currentHeroLesson.progress > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
                  <div
                    style={{
                      width: "200px",
                      height: "3px",
                      backgroundColor: "rgba(255,255,255,0.25)",
                      borderRadius: "100px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "var(--color-secondary)",
                        width: `${currentHeroLesson.progress}%`
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--color-on-surface-variant)", fontWeight: 600 }}>
                    {currentHeroLesson.progress}% assistido
                  </span>
                </div>
              )}

              <p
                className="font-body-lg"
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  margin: "4px 0 16px 0",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical"
                }}
              >
                {currentHeroLesson.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Link href={`/masterclasses/aula/${currentHeroLesson.slug || currentHeroLesson.id}`} className="hero-action-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Assistir Agora
                </Link>

                <button
                  onClick={() => handleResetProgress(currentHeroLesson.id)}
                  className="control-circle-btn"
                  title="Reiniciar Progresso"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>replay</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Modules & Lessons List (Netflix Style Rows) */}
        <div>
          {modules.map((mod) => {
            const moduleLessons = filteredLessons.filter((l) => l.module_id === mod.id);
            if (moduleLessons.length === 0) return null;

            return (
              <section key={mod.id} className="carousel-container" style={{ marginBottom: "40px" }}>
                <h3
                  className="font-title-lg"
                  style={{
                    color: "var(--color-on-surface)",
                    fontWeight: 700,
                    fontSize: "18px",
                    marginBottom: "12px",
                    fontFamily: "var(--font-display)"
                  }}
                >
                  {mod.title}
                </h3>

                <button
                  className="carousel-arrow carousel-arrow-left"
                  onClick={() => scrollCarousel(`carousel-${mod.id}`, "left")}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                <div id={`carousel-${mod.id}`} className="netflix-carousel">
                  {moduleLessons.map((lesson) => {
                    const progress = lesson.progress || 0;
                    const isCompleted = lesson.completed || false;
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => router.push(`/masterclasses/aula/${lesson.slug || lesson.id}`)}
                        className="netflix-card"
                      >
                        <div className="course-card-img-wrapper" style={{ aspectRatio: "16/9", position: "relative" }}>
                          <img
                            src={lesson.thumbnail_url}
                            alt={lesson.title}
                            className="course-card-img"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />

                          {/* Play overlay hover indicator */}
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.2s"
                          }} className="play-overlay">
                            <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-secondary)" }}>
                              play_circle
                            </span>
                          </div>

                          {/* Progress Line */}
                          {progress > 0 && (
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "rgba(255,255,255,0.2)", zIndex: 4 }}>
                              <div style={{ height: "100%", backgroundColor: isCompleted ? "#4CAF50" : "var(--color-secondary)", width: `${progress}%` }} />
                            </div>
                          )}

                          {/* Completion Badge */}
                          {isCompleted && (
                            <span
                              className="material-symbols-outlined"
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                color: "#4CAF50",
                                fontSize: "22px",
                                backgroundColor: "rgba(0,0,0,0.6)",
                                borderRadius: "50%",
                                padding: "2px"
                              }}
                            >
                              check_circle
                            </span>
                          )}

                          {/* Duration Badge */}
                          {lesson.duration && (
                            <span style={{
                              position: "absolute",
                              bottom: "8px",
                              right: "8px",
                              backgroundColor: "rgba(0,0,0,0.75)",
                              color: "#ffffff",
                              fontSize: "9px",
                              padding: "2px 6px",
                              borderRadius: "2px",
                              fontWeight: 700
                            }} className="font-label-caps">
                              {lesson.duration}
                            </span>
                          )}
                        </div>

                        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                          <span
                            className="font-label-caps"
                            style={{
                              color: "var(--color-secondary)",
                              fontSize: "9px",
                              letterSpacing: "0.05em",
                              fontWeight: 700,
                              marginBottom: "4px"
                            }}
                          >
                            AULA {lesson.sequence_order}
                          </span>
                          <h4
                            style={{
                              fontSize: "14px",
                              color: "var(--color-on-surface)",
                              fontWeight: 600,
                              lineHeight: "1.3",
                              marginBottom: "6px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {lesson.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--color-on-surface-variant)",
                              lineHeight: "1.4",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              margin: 0
                            }}
                          >
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="carousel-arrow carousel-arrow-right"
                  onClick={() => scrollCarousel(`carousel-${mod.id}`, "right")}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </section>
            );
          })}
          
          {modules.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-outline)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.5 }}>list</span>
              <p>Nenhum módulo ou aula cadastrados para esta masterclass.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
