"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const tabItems = [
  { icon: "dashboard", iconFilled: "dashboard", label: "Painel", href: "/dashboard" },
  { icon: "feed", iconFilled: "feed", label: "Feed", href: "/membros" },
  { icon: "play_lesson", iconFilled: "play_lesson", label: "Aulas", href: "/masterclasses" },
  { icon: "folder_shared", iconFilled: "folder_shared", label: "Recursos", href: "/recursos" },
  { icon: "calendar_month", iconFilled: "calendar_month", label: "Agenda", href: "/calendario" },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav
      className="bottom-tabbar-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: "rgba(7, 7, 50, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(145, 179, 225, 0.12)",
        display: "flex",
        alignItems: "stretch",
        zIndex: 100,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {tabItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const isPressed = pressedItem === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onMouseDown={() => setPressedItem(item.href)}
            onMouseUp={() => setPressedItem(null)}
            onTouchStart={() => setPressedItem(item.href)}
            onTouchEnd={() => setPressedItem(null)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              textDecoration: "none",
              position: "relative",
              paddingTop: "10px",
              paddingBottom: "6px",
              transform: isPressed ? "scale(0.9)" : "scale(1)",
              transition: "transform 0.1s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Active pill indicator */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "32px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "linear-gradient(90deg, var(--color-secondary), var(--color-primary))",
                  boxShadow: "0 0 8px rgba(145, 179, 225, 0.5)",
                  transition: "all 0.3s ease",
                }}
              />
            )}

            {/* Icon */}
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "24px",
                color: isActive ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 300",
                transition: "color 0.2s ease, font-variation-settings 0.2s ease",
                marginTop: "4px",
                filter: isActive ? "drop-shadow(0 0 6px rgba(145, 179, 225, 0.4))" : "none",
              }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              style={{
                fontSize: "10px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                letterSpacing: "0.02em",
                transition: "color 0.2s ease",
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Profile tab */}
      <Link
        href="/perfil"
        onMouseDown={() => setPressedItem("/perfil")}
        onMouseUp={() => setPressedItem(null)}
        onTouchStart={() => setPressedItem("/perfil")}
        onTouchEnd={() => setPressedItem(null)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          textDecoration: "none",
          position: "relative",
          paddingTop: "10px",
          paddingBottom: "6px",
          transform: pressedItem === "/perfil" ? "scale(0.9)" : "scale(1)",
          transition: "transform 0.1s ease",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {(pathname === "/perfil" || pathname.startsWith("/perfil/")) && (
          <span
            style={{
              position: "absolute",
              top: "6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "32px",
              height: "3px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, var(--color-secondary), var(--color-primary))",
              boxShadow: "0 0 8px rgba(145, 179, 225, 0.5)",
            }}
          />
        )}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "24px",
            color: (pathname === "/perfil" || pathname.startsWith("/perfil/"))
              ? "var(--color-secondary)"
              : "var(--color-on-surface-variant)",
            fontVariationSettings: (pathname === "/perfil" || pathname.startsWith("/perfil/"))
              ? "'FILL' 1, 'wght' 500"
              : "'FILL' 0, 'wght' 300",
            transition: "color 0.2s ease",
            marginTop: "4px",
            filter: (pathname === "/perfil" || pathname.startsWith("/perfil/"))
              ? "drop-shadow(0 0 6px rgba(145, 179, 225, 0.4))"
              : "none",
          }}
        >
          account_circle
        </span>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: (pathname === "/perfil" || pathname.startsWith("/perfil/")) ? 600 : 400,
            color: (pathname === "/perfil" || pathname.startsWith("/perfil/"))
              ? "var(--color-secondary)"
              : "var(--color-on-surface-variant)",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          Perfil
        </span>
      </Link>
    </nav>
  );
}
