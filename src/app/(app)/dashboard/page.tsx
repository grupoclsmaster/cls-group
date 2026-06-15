"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

import { useRouter } from "next/navigation";
import { SkeletonDashboard } from "@/components/SkeletonLoading";



// We will fetch these from Supabase dynamically

export default function DashboardPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Olá");
  const [userName, setUserName] = useState("Master");
  const [loading, setLoading] = useState(true);
  
  const [nextMentorship, setNextMentorship] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [latestCourses, setLatestCourses] = useState<any[]>([]);
  const [activeModuleName, setActiveModuleName] = useState("Nenhum módulo iniciado");
  const [progressPercent, setProgressPercent] = useState(0);
  const [missionsCount, setMissionsCount] = useState(0);
  const [approvedMissionsCount, setApprovedMissionsCount] = useState(0);
  const [missionsProgress, setMissionsProgress] = useState(0);

  const [tutorialStep, setTutorialStep] = useState<number>(-1);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tutorialSteps = [
    {
      title: "Boas-vindas ao Club Pro CLS!",
      description: "Este é o seu portal de elite. Vamos fazer um tour rápido pelas principais ferramentas disponíveis para alavancar seus negócios.",
      selector: "#welcome-section"
    },
    {
      title: "Progresso do Módulo Atual",
      description: "Aqui você acompanha a conclusão do seu treinamento atual. Conforme você assiste às aulas nas Masterclasses, o progresso é atualizado automaticamente.",
      selector: "#progress-card"
    },
    {
      title: "Mentorias ao Vivo",
      description: "Fique por dentro das datas, temas e links de transmissão das próximas mentorias ao vivo com os líderes do mercado.",
      selector: "#mentorship-card"
    },
    {
      title: "Próximos Eventos",
      description: "Acompanhe todo o calendário do Club para planejar sua agenda com antecedência.",
      selector: "#events-card"
    },
    {
      title: "Biblioteca de Masterclasses",
      description: "Acesse rapidamente os conteúdos gravados mais recentes, planilhas de viabilidade (EVTL) e de custos indiretos.",
      selector: "#masterclasses-card"
    },
    {
      title: "Navegação Completa",
      description: "Use a barra lateral para navegar pelas missões técnicas, oportunidades de co-investimento e diretório de membros.",
      selector: ".sidebar"
    }
  ];

  const handleNextStep = () => {
    if (dontShowAgain) {
      localStorage.setItem("cls_skip_tutorial", "true");
    }
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      localStorage.setItem("cls_skip_tutorial", "true");
      setTutorialStep(-1);
    }
  };

  const handleCloseTutorial = () => {
    if (dontShowAgain) {
      localStorage.setItem("cls_skip_tutorial", "true");
    }
    setTutorialStep(-1);
  };

  useEffect(() => {
    if (tutorialStep >= 0 && tutorialStep < tutorialSteps.length) {
      const updateCoords = () => {
        const step = tutorialSteps[tutorialStep];
        if (step.selector) {
          const el = document.querySelector(step.selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            setCoords({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height
            });
          }
        } else {
          setCoords(null);
        }
      };

      // Delay slightly to ensure component is fully mounted/rendered
      const timer = setTimeout(() => {
        updateCoords();
        const step = tutorialSteps[tutorialStep];
        if (step.selector) {
          const el = document.querySelector(step.selector);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 150);

      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateCoords);
        window.removeEventListener("scroll", updateCoords);
      };
    } else {
      setCoords(null);
    }
  }, [tutorialStep]);

  const formatName = (name: string) => {
    if (!name) return "";
    return name
      .split(/[\s._-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    // 1. Calculate greeting based on period of the day
    const hours = new Date().getHours();
    let greet = "Boa noite";
    if (hours >= 5 && hours < 12) {
      greet = "Bom dia";
    } else if (hours >= 12 && hours < 18) {
      greet = "Boa tarde";
    }
    setGreeting(greet);

    // 2. Fetch logged in user name/username from Supabase
    // 3. Fetch upcoming events
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 1. Fetch user's name
          const { data: member } = await supabase
            .from("members")
            .select("name, username")
            .eq("id", user.id)
            .single();
          if (member) {
            const rawName = member.name || "Master";
            const firstName = rawName.trim().split(/\s+/)[0];
            setUserName(firstName);
          }

          // 2. Fetch lesson progress
          const { data: userProgress } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user.id);

          const { data: allLessons } = await supabase
            .from('lessons')
            .select('id, module_id');

          if (allLessons && allLessons.length > 0) {
            const completedCount = userProgress 
              ? userProgress.filter((p: any) => p.completed).length 
              : 0;
            const percent = Math.round((completedCount / allLessons.length) * 100);
            setProgressPercent(percent);

            let lastWatchedModuleId = "";
            if (userProgress && userProgress.length > 0) {
              const sortedProgress = [...userProgress].sort((a: any, b: any) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
              const latestLessonId = sortedProgress[0]?.lesson_id;
              const latestLesson = allLessons.find((l: any) => l.id === latestLessonId);
              if (latestLesson) lastWatchedModuleId = latestLesson.module_id;
            }

            if (lastWatchedModuleId) {
              const { data: moduleData } = await supabase
                .from('modules')
                .select('title')
                .eq('id', lastWatchedModuleId)
                .single();
              if (moduleData) setActiveModuleName(moduleData.title);
            } else {
              const { data: firstModule } = await supabase
                .from('modules')
                .select('title')
                .order('sequence_order', { ascending: true })
                .limit(1)
                .single();
              if (firstModule) setActiveModuleName(firstModule.title);
            }
          }
        }

        // 3. Fetch upcoming events
        const today = new Date().toISOString().split('T')[0];
        
        const { data: eventsData, error } = await supabase
          .from("calendar_events")
          .select("*")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(3);

        if (eventsData && !error) {
          const mapped = eventsData.map((e: any) => {
            const date = new Date(e.event_date);
            const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
            return {
              id: e.id,
              month: monthNames[offsetDate.getMonth()],
              day: String(offsetDate.getDate()).padStart(2, '0'),
              title: e.title,
              time: `${e.start_time.substring(0, 5)} - ${e.end_time.substring(0, 5)} BRT`,
              icon: e.event_type === "mentoria" ? "schedule" : "location_on",
              mentor: {
                name: e.mentor_name,
                role: e.mentor_role,
                avatar: e.mentor_avatar || "/magno.jpg"
              }
            };
          });
          
          if (mapped.length > 0) {
            setNextMentorship(mapped[0]);
            setUpcomingEvents(mapped);
          }
        }

        // 4. Fetch latest 3 courses
        const { data: dbCourses } = await supabase
          .from("courses")
          .select("*")
          .eq("status", "publicado")
          .order("sequence_order", { ascending: true })
          .limit(3);

        if (dbCourses) {
          setLatestCourses(dbCourses);
        }

        // 5. Fetch missions progress
        const { data: dbMissions } = await supabase
          .from("missions")
          .select("id");
        const { data: dbSubsubmissions } = await supabase
          .from("mission_submissions")
          .select("status")
          .eq("student_id", user.id)
          .eq("status", "approved");

        const totalM = dbMissions?.length || 0;
        const approvedM = dbSubsubmissions?.length || 0;
        setMissionsCount(totalM);
        setApprovedMissionsCount(approvedM);
        setMissionsProgress(totalM > 0 ? Math.round((approvedM / totalM) * 100) : 0);

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      } finally {
        setLoading(false);
        const skipTutorial = localStorage.getItem("cls_skip_tutorial") === "true";
        if (!skipTutorial) {
          setTutorialStep(0);
        }
      }
    };
    void fetchDashboardData();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          .dashboard-bento-card {
            grid-column: span 3 !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .dashboard-bento-card {
            grid-column: span 6 !important;
          }
        }
        @media (max-width: 767px) {
          .dashboard-bento-card {
            grid-column: span 12 !important;
          }
        }
      `}} />
      {/* Welcome */}
      <section id="welcome-section" style={{ marginBottom: "40px" }}>
        <h2
          className="font-display-mobile"
          style={{ color: "var(--color-on-surface)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          {loading ? (
            <span className="skeleton" style={{ display: "inline-block", width: "240px", height: "36px", borderRadius: "4px" }} />
          ) : (
            <>
              {greeting}, <span style={{ color: "var(--color-secondary)" }}>{formatName(userName)}</span>.
            </>
          )}
        </h2>
        <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
          Aqui está o seu resumo executivo para hoje.
        </p>
      </section>

      {/* Bento Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "20px",
        }}
      >
        {/* === Row 1: Metrics / Events === */}
        {/* Progress Card */}
        <div
          id="progress-card"
          className="glass-panel dashboard-bento-card"
          style={{
            borderRadius: "4px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", fontSize: "16px" }}>Módulo Atual</h3>
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>trending_up</span>
            </div>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "4px" }}>{activeModuleName}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px" }}>
              <span className="font-headline-md" style={{ color: "var(--color-on-surface)" }}>{progressPercent}%</span>
              <span className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>Concluído</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Next Mentorship Card */}
        <div
          id="mentorship-card"
          className="premium-gradient-bg dashboard-bento-card"
          onClick={() => {
            if (nextMentorship) {
              router.push(`/calendario?event_id=${nextMentorship.id}`);
            }
          }}
          style={{
            borderRadius: "4px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-40px",
              top: "-40px",
              width: "128px",
              height: "128px",
              backgroundColor: "rgba(145, 179, 225, 0.1)",
              borderRadius: "50%",
              filter: "blur(32px)",
            }}
          />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", fontSize: "16px" }}>Próxima Mentoria</h3>
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>event</span>
            </div>
            {nextMentorship ? (
              <>
                <p className="font-headline-sm" style={{ color: "var(--color-secondary)", marginBottom: "4px" }}>
                  {nextMentorship.month} {nextMentorship.day}
                </p>
                <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
                  {nextMentorship.time}
                </p>
              </>
            ) : (
              <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
                Nenhum evento agendado.
              </p>
            )}
          </div>
          
          {nextMentorship && nextMentorship.mentor && (
            <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.1)",
                  flexShrink: 0,
                  backgroundColor: "var(--color-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={nextMentorship.mentor.avatar} alt={nextMentorship.mentor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <p className="font-body-md" style={{ color: "var(--color-on-surface)", fontWeight: 600 }}>{nextMentorship.mentor.name}</p>
                <p className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>{nextMentorship.mentor.role}</p>
              </div>
            </div>
          )}
        </div>

        <div
          id="missions-progress-card"
          className="glass-panel dashboard-bento-card"
          onClick={() => router.push("/missoes")}
          style={{
            borderRadius: "4px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", fontSize: "16px" }}>Suas Missões</h3>
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>military_tech</span>
            </div>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "4px" }}>
              {approvedMissionsCount} de {missionsCount} concluídas
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px" }}>
              <span className="font-headline-md" style={{ color: "var(--color-on-surface)" }}>{missionsProgress}%</span>
              <span className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>Concluído</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${missionsProgress}%` }} />
          </div>
        </div>

        <div
          id="events-card"
          className="glass-panel dashboard-bento-card"
          style={{
            borderRadius: "4px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", fontSize: "16px" }}>Próximos Eventos</h3>
            <button style={{ background: "transparent", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>more_horiz</span>
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
              <div
                key={ev.id}
                onClick={() => router.push(`/calendario?event_id=${ev.id}`)}
                className="hover-bg-transition"
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  padding: "8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  borderBottom: i < upcomingEvents.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                    height: "48px",
                    backgroundColor: "var(--color-surface-container)",
                    borderRadius: "2px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="font-label-caps" style={{ color: i === 0 ? "var(--color-secondary)" : "var(--color-on-surface-variant)", fontSize: "10px" }}>{ev.month}</span>
                  <span className="font-body-md" style={{ fontWeight: 700 }}>{ev.day}</span>
                </div>
                <div>
                  <p className="font-body-md" style={{ color: "var(--color-on-surface)", fontWeight: 600, marginBottom: "4px" }}>{ev.title}</p>
                  <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{ev.icon}</span>
                    {ev.time}
                  </p>
                </div>
              </div>
            )) : (
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "13px" }}>Nenhum evento previsto.</p>
            )}
          </div>

        </div>

        {/* === Row 2: Latest Masterclasses === */}
        <div id="masterclasses-card" style={{ gridColumn: "span 12", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
            <div>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", fontSize: "16px" }}>Últimas Masterclasses</h3>
              <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginTop: "4px", fontSize: "12px" }}>Adicionadas recentemente ao seu currículo.</p>
            </div>
            <Link
              href="/masterclasses"
              className="font-label-caps"
              style={{ color: "var(--color-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s", fontSize: "11px" }}
            >
              VER TUDO
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {latestCourses.length > 0 ? (
              latestCourses.map((mc) => (
                <Link
                  href={`/masterclasses/curso/${mc.slug || mc.id}`}
                  key={mc.id}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card-hover"
                    style={{
                      backgroundColor: "var(--color-surface-container-low)",
                      borderRadius: "4px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      overflow: "hidden",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{ aspectRatio: "16/9", position: "relative", backgroundColor: "var(--color-surface-container)" }}>
                      <div
                        className="hover-opacity"
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: `url('${mc.cover_image_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800"}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.6,
                        }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,17,1) 0%, transparent 60%)" }} />
                    </div>
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4 className="font-body-lg" style={{ color: "var(--color-on-surface)", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                        {mc.title}
                      </h4>
                      <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", fontSize: "12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {mc.description || "Masterclass exclusiva do ecossistema de engenharia e construção."}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ 
                gridColumn: "span 12",
                padding: "48px 24px", 
                textAlign: "center", 
                backgroundColor: "rgba(255,255,255,0.02)", 
                borderRadius: "8px", 
                border: "1px dashed rgba(255,255,255,0.1)" 
              }}>
                <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                  Nenhuma masterclass publicada ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: "48px" }} />

      {/* Tutorial Overlay */}
      {tutorialStep >= 0 && tutorialStep < tutorialSteps.length && (() => {
        // Calculate style for floating popover next to target
        let popoverStyle: React.CSSProperties = {
          position: "fixed",
          zIndex: 10001,
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        };

        if (coords) {
          const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
          const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
          const innerWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
          const innerHeight = typeof window !== "undefined" ? window.innerHeight : 800;

          const viewportTop = coords.top - scrollY;
          const viewportLeft = coords.left - scrollX;
          const isMobileViewport = innerWidth < 768;

          let top = viewportTop + coords.height + 16;
          let left = viewportLeft + (coords.width / 2) - 230; // Center popover under target

          // Maintain on-screen bounds horizontally
          if (left < 20) left = 20;
          if (left + 460 > innerWidth - 20) left = innerWidth - 460 - 20;

          const estimatedHeight = 260; // Approximate onboarding box height
          if (isMobileViewport) {
            popoverStyle = {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10001,
              width: "92vw",
              transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
            };
          } else if (top + estimatedHeight > innerHeight - 20) {
            // Place it above if no space below
            top = viewportTop - estimatedHeight - 16;
            if (top < 20) {
              // Centered fallback
               popoverStyle = {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10001,
                width: "90%",
                maxWidth: "460px",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
              };
            } else {
              popoverStyle.top = `${top}px`;
              popoverStyle.left = `${left}px`;
              popoverStyle.width = "460px";
            }
          } else {
            popoverStyle.top = `${top}px`;
            popoverStyle.left = `${left}px`;
            popoverStyle.width = "460px";
          }
        } else {
          popoverStyle = {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10001,
            width: "90%",
            maxWidth: "460px",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          };
        }

        return (
          <>
            {/* Transparent blocker to prevent interactions while doing the tour */}
            <div style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "transparent"
            }} />

            {/* Glowing cut-out highlight mask */}
            {coords ? (
              <div style={{
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                height: `${coords.height}px`,
                border: "3px solid var(--color-secondary)",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 25px rgba(145, 179, 225, 0.4)",
                borderRadius: "8px",
                pointerEvents: "none",
                zIndex: 9999,
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }} />
            ) : (
              <div style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(4px)",
                zIndex: 9999
              }} />
            )}

            {/* Instruction popover */}
            <div className="glass-panel metallic-edge" style={popoverStyle}>
              <div style={{ padding: "24px 20px", position: "relative" }}>
                {/* Step indicator */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px" }}>
                    TUTORIAL • PASSO {tutorialStep + 1} DE {tutorialSteps.length}
                  </span>
                  <button 
                    onClick={() => handleCloseTutorial()}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                  </button>
                </div>

                {/* Content */}
                <h3 className="font-headline-sm" style={{ color: "#fff", marginBottom: "12px", fontSize: "18px" }}>
                  {tutorialSteps[tutorialStep].title}
                </h3>
                <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "20px", fontSize: "13px", lineHeight: "1.6" }}>
                  {tutorialSteps[tutorialStep].description}
                </p>

                {/* Checkbox Don't show again */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <input 
                    type="checkbox" 
                    id="dontShow" 
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    style={{ accentColor: "var(--color-secondary)", cursor: "pointer" }}
                  />
                  <label htmlFor="dontShow" style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", cursor: "pointer", userSelect: "none" }}>
                    Não mostrar este tutorial novamente
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button 
                    onClick={() => handleCloseTutorial()}
                    className="hover-gold-text"
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    Pular
                  </button>

                  <div style={{ display: "flex", gap: "12px" }}>
                    {tutorialStep > 0 && (
                      <button 
                        onClick={() => setTutorialStep(prev => prev - 1)}
                        className="btn-outline"
                        style={{ fontSize: "11px", padding: "8px 16px" }}
                      >
                        Voltar
                      </button>
                    )}
                    <button 
                      onClick={() => handleNextStep()}
                      className="btn-primary"
                      style={{ fontSize: "11px", padding: "8px 16px" }}
                    >
                      {tutorialStep === tutorialSteps.length - 1 ? "Concluir" : "Próximo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
