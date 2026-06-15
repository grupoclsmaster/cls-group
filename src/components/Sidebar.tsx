"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { icon: "dashboard", label: "Painel", href: "/dashboard" },
  { icon: "feed", label: "Feed", href: "/membros" },
  { icon: "play_lesson", label: "Masterclasses", href: "/masterclasses" },
  { icon: "folder_shared", label: "Recursos", href: "/recursos" },
  { icon: "calendar_month", label: "Calendário", href: "/calendario" },
  { icon: "assignment", label: "Missões", href: "/missoes" },
  { icon: "shopping_bag", label: "Oportunidades", href: "/oportunidades", comingSoon: true },
  { icon: "architecture", label: "Projetos", href: "/projetos", comingSoon: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Detect tablet breakpoint
  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };
    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  // Sync state with localStorage on mount and listen to changes
  useEffect(() => {
    // On tablet, always force collapsed
    if (isTablet) {
      setIsCollapsed(true);
      return;
    }

    const collapsed = localStorage.getItem("cls_sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);

    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem("cls_sidebar_collapsed") === "true");
    };

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const emailLower = user?.email?.toLowerCase();
      if (user && (emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com")) {
        setIsAdmin(true);
      }
    };
    void checkAdmin();

    window.addEventListener("cls_sidebar_toggle", handleToggle);
    return () => window.removeEventListener("cls_sidebar_toggle", handleToggle);
  }, [supabase, isTablet]);

  const handleToggleClick = () => {
    const nextState = !isCollapsed;
    localStorage.setItem("cls_sidebar_collapsed", String(nextState));
    window.dispatchEvent(new Event("cls_sidebar_toggle"));
  };

  // On tablet, always use 72px collapsed width
  const effectiveCollapsed = isTablet ? true : isCollapsed;
  const sidebarWidth = effectiveCollapsed ? "72px" : "280px";

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
            padding: effectiveCollapsed ? "0 12px" : "0 24px", 
            marginBottom: "40px",
            display: "flex",
            flexDirection: effectiveCollapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: effectiveCollapsed ? "center" : "space-between",
            gap: effectiveCollapsed ? "16px" : "8px"
          }}
        >
          <Link 
            href="/dashboard" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "clamp(4px, 1vw, 8px)",
              textDecoration: "none",
              cursor: "pointer"
            }}
          >
            <img 
              src="/logo-cls.png" 
              alt="CLUB PRO CLS" 
              style={{ 
                height: effectiveCollapsed ? "36px" : "72px",
                width: effectiveCollapsed ? "36px" : "auto",
                objectFit: "contain"
              }} 
            />
          </Link>
          
          {/* Hide toggle button on tablet — tablet is always collapsed */}
          {!isTablet && (
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
              title={effectiveCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {effectiveCollapsed ? "menu" : "menu_open"}
              </span>
            </button>
          )}
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
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0", 
                    fontWeight: 300,
                    marginRight: effectiveCollapsed ? "0" : "12px"
                  }}
                >
                  {item.icon}
                </span>
                {!effectiveCollapsed && <span className="font-body-md" style={{ flexGrow: 1 }}>{item.label}</span>}
                {!effectiveCollapsed && item.comingSoon && (
                  <span
                    style={{
                      fontSize: "9px",
                      backgroundColor: "rgba(145, 179, 225, 0.15)",
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
                    justifyContent: effectiveCollapsed ? "center" : "flex-start",
                    padding: effectiveCollapsed ? "12px 0" : "12px 16px",
                    cursor: "not-allowed",
                    opacity: isActive ? 1 : 0.6,
                  }}
                  title={effectiveCollapsed ? `${item.label} (Em Breve)` : undefined}
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
                  justifyContent: effectiveCollapsed ? "center" : "flex-start",
                  padding: effectiveCollapsed ? "12px 0" : "12px 16px",
                }}
                title={effectiveCollapsed ? item.label : undefined}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* Ecosystem CTA — hidden on tablet */}
        {!effectiveCollapsed && (
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
            { icon: "help_outline", label: "Suporte", href: "https://wa.me/5511965066820", onClick: undefined, external: true },
            { icon: "logout", label: "Sair", href: "/login", onClick: handleLogout },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="nav-link"
              style={{ 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: effectiveCollapsed ? "center" : "flex-start",
                padding: effectiveCollapsed ? "12px 0" : "12px 16px",
              }}
              title={effectiveCollapsed ? item.label : undefined}
            >
              <span
                className="material-symbols-outlined"
                style={{ 
                  fontSize: "20px", 
                  fontVariationSettings: "'FILL' 0", 
                  fontWeight: 300,
                  marginRight: effectiveCollapsed ? "0" : "12px"
                }}
              >
                {item.icon}
              </span>
              {!effectiveCollapsed && <span className="font-body-md">{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
