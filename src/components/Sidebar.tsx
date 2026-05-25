"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { icon: "dashboard", label: "Painel", href: "/dashboard" },
  { icon: "feed", label: "Feed", href: "/membros" },
  { icon: "play_lesson", label: "Masterclasses", href: "/masterclasses" },
  { icon: "folder_shared", label: "Recursos", href: "/recursos" },
  { icon: "calendar_month", label: "Calendário", href: "/calendario" },
  { icon: "shopping_bag", label: "Oportunidades", href: "/oportunidades", comingSoon: true },
  { icon: "architecture", label: "Projetos", href: "/projetos", comingSoon: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync state with localStorage on mount and listen to changes
  useEffect(() => {
    const collapsed = localStorage.getItem("cls_sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);

    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem("cls_sidebar_collapsed") === "true");
    };

    window.addEventListener("cls_sidebar_toggle", handleToggle);
    return () => window.removeEventListener("cls_sidebar_toggle", handleToggle);
  }, []);

  const handleToggleClick = () => {
    const nextState = !isCollapsed;
    localStorage.setItem("cls_sidebar_collapsed", String(nextState));
    window.dispatchEvent(new Event("cls_sidebar_toggle"));
  };

  const sidebarWidth = isCollapsed ? "80px" : "280px";

  return (
    <nav 
      className="sidebar"
      style={{
        width: sidebarWidth,
        transition: "width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        overflowX: "hidden"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 0" }}>
        
        {/* Brand & Toggle Button Header */}
        <div 
          style={{ 
            padding: isCollapsed ? "0 12px" : "0 24px", 
            marginBottom: "40px",
            display: "flex",
            flexDirection: isCollapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: isCollapsed ? "16px" : "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 1vw, 8px)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "clamp(16px, 3vw, 24px)" }}>diamond</span>
            {!isCollapsed && (
              <h1 className="font-headline-sm" style={{ color: "var(--color-secondary-fixed)", letterSpacing: "-0.01em", margin: 0, fontSize: "clamp(12px, 2.5vw, 18px)" }}>
                CLUB PRO CLS
              </h1>
            )}
          </div>
          
          <button
            onClick={handleToggleClick}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-on-surface-variant)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.03)"
            }}
            className="hover-gold-text"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {isCollapsed ? "menu" : "menu_open"}
            </span>
          </button>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const content = (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ 
                    fontSize: "22px", 
                    fontVariationSettings: "'FILL' 0", 
                    fontWeight: 300,
                    marginRight: isCollapsed ? "0" : "12px"
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="font-body-md" style={{ flexGrow: 1 }}>{item.label}</span>}
                {!isCollapsed && item.comingSoon && (
                  <span
                    style={{
                      fontSize: "9px",
                      backgroundColor: "rgba(237, 192, 102, 0.15)",
                      color: "var(--color-secondary)",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                    className="font-label-caps"
                  >
                    Breve
                  </span>
                )}
              </>
            );

            if (item.comingSoon) {
              return (
                <div
                  key={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    padding: isCollapsed ? "12px 0" : "12px 16px",
                    cursor: "not-allowed",
                    opacity: isActive ? 1 : 0.6,
                  }}
                  title={isCollapsed ? `${item.label} (Em Breve)` : undefined}
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  padding: isCollapsed ? "12px 0" : "12px 16px",
                }}
                title={isCollapsed ? item.label : undefined}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* Ecosystem CTA */}
        {!isCollapsed && (
          <div style={{ padding: "0 16px", marginBottom: "24px" }}>
            <Link href="/ecossistema" style={{ textDecoration: "none", width: "100%" }}>
              <button className="btn-outline" style={{ width: "100%" }}>
                Ver todo o ecossistema
              </button>
            </Link>
          </div>
        )}

        {/* Footer Links */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {[
            { icon: "help_outline", label: "Suporte", href: "#" },
            { icon: "logout", label: "Sair", href: "/login" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-link"
              style={{ 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: isCollapsed ? "12px 0" : "12px 16px",
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span
                className="material-symbols-outlined"
                style={{ 
                  fontSize: "20px", 
                  fontVariationSettings: "'FILL' 0", 
                  fontWeight: 300,
                  marginRight: isCollapsed ? "0" : "12px"
                }}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="font-body-md">{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
