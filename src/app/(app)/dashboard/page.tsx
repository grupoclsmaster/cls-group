"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

import { SkeletonDashboard } from "@/components/SkeletonLoading";

const masterclasses = [
  {
    title: "Engenharia de Custos Aplicada",
    duration: "18 MIN",
    badge: "NOVO",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Análise de Viabilidade Imobiliária",
    duration: "24 MIN",
    img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "BIM e Virtual Design in Construction (VDC)",
    duration: "15 MIN",
    img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800",
  },
];

const events = [
  { month: "MAI", day: "28", title: "Mentoria: Viabilidade de Landbanks", time: "14:00 - 15:30", icon: "schedule" },
  { month: "JUN", day: "05", title: "Mastermind: Soluções BIM & ConTech", time: "10:00 - 11:30", icon: "schedule" },
  { month: "JUN", day: "12", title: "Networking: Visita à Grande Obra SP", time: "São Paulo, BR", icon: "location_on" },
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Olá");
  const [userName, setUserName] = useState("Master");
  const [loading, setLoading] = useState(true);

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
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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
        }
      } catch (err) {
        console.error("Erro ao buscar usuário no dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchUser();
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
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "4px" }}>Engenharia de Custos e Viabilidade</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "24px" }}>
              <span className="font-headline-md" style={{ color: "var(--color-on-surface)" }}>68%</span>
              <span className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>Concluído</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "68%" }} />
          </div>
        </div>

        {/* Next Mentorship Card */}
        <div
          className="premium-gradient-bg metallic-edge"
          style={{
            gridColumn: "span 4",
            borderRadius: "4px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
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
            <p className="font-headline-sm" style={{ color: "var(--color-secondary)", marginBottom: "4px" }}>Mai 28, 2026</p>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>14:00 - 15:30 BRT</p>
          </div>
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
              <img src="/magno.jpg" alt="Eng. Magno Santos" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <p className="font-body-md" style={{ color: "var(--color-on-surface)", fontWeight: 600 }}>Eng. Magno Santos</p>
              <p className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>Mentor Sênior</p>
            </div>
          </div>
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
            {events.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  paddingBottom: i < events.length - 1 ? "16px" : 0,
                  borderBottom: i < events.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
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
            ))}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {masterclasses.map((mc, i) => (
              <div
                key={i}
                className="card-hover"
                style={{
                  backgroundColor: "var(--color-surface-container-low)",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div style={{ aspectRatio: "16/9", position: "relative", backgroundColor: "var(--color-surface-container)" }}>
                  <div
                    className="hover-opacity"
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `url('${mc.img}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.6,
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,17,1) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    {mc.badge && (
                      <span
                        className="font-label-caps"
                        style={{
                          backgroundColor: "rgba(7,7,50,0.8)",
                          color: "var(--color-secondary)",
                          fontSize: "10px",
                          padding: "4px 8px",
                          borderRadius: "2px",
                          border: "1px solid rgba(237,192,102,0.2)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {mc.badge}
                      </span>
                    )}
                    <span
                      className="font-label-caps"
                      style={{
                        color: "white",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        fontSize: "10px",
                        padding: "4px 8px",
                        borderRadius: "2px",
                        backdropFilter: "blur(4px)",
                        marginLeft: "auto",
                      }}
                    >
                      {mc.duration}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <h4 className="font-body-lg" style={{ color: "var(--color-on-surface)", fontWeight: 600, marginBottom: "8px" }}>
                    {mc.title}
                  </h4>
                  <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
                    Masterclass exclusiva do ecossistema de engenharia e construção.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        </div>
      </div>

      <div style={{ height: "48px" }} />
    </div>
  );
}
