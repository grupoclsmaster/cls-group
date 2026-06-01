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

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchDashboardData();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="animate-fadeIn">
      {/* Welcome */}
      <section style={{ marginBottom: "40px" }}>
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
          gap: "24px",
        }}
      >
        {/* === Row 1: Metrics (8 cols) + Events (4 cols) === */}

        {/* Progress Card */}
        <div
          className="glass-panel metallic-edge"
          style={{
            gridColumn: "span 4",
            borderRadius: "4px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)" }}>Módulo Atual</h3>
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>trending_up</span>
            </div>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "4px" }}>{activeModuleName}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "24px" }}>
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
          className="premium-gradient-bg metallic-edge"
          onClick={() => {
            if (nextMentorship) {
              router.push(`/calendario?event_id=${nextMentorship.id}`);
            }
          }}
          style={{
            gridColumn: "span 4",
            borderRadius: "4px",
            padding: "24px",
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
              backgroundColor: "rgba(237, 192, 102, 0.1)",
              borderRadius: "50%",
              filter: "blur(32px)",
            }}
          />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)" }}>Próxima Mentoria</h3>
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

        {/* Events Panel */}
        <div
          className="glass-panel"
          style={{
            gridColumn: "span 4",
            borderRadius: "4px",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)" }}>Próximos Eventos</h3>
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
        <div style={{ gridColumn: "span 12", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)" }}>Últimas Masterclasses</h3>
              <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginTop: "4px" }}>Adicionadas recentemente ao seu currículo.</p>
            </div>
            <Link
              href="/masterclasses"
              className="font-label-caps"
              style={{ color: "var(--color-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s" }}
            >
              VER TUDO
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {latestCourses.length > 0 ? (
              latestCourses.map((mc) => (
                <Link
                  href={`/masterclasses?course_id=${mc.id}`}
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
                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4 className="font-body-lg" style={{ color: "var(--color-on-surface)", fontWeight: 600, marginBottom: "8px" }}>
                        {mc.title}
                      </h4>
                      <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
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
    </div>
  );
}
