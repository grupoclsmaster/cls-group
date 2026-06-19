"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonDashboard } from "@/components/SkeletonLoading";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BottomTabBar from "@/components/BottomTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (pathname === "/sem-permissao") {
        setCheckingAccess(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: member } = await supabase
          .from("members")
          .select("status")
          .eq("id", user.id)
          .single();

        if (!member || member.status !== "Ativo") {
          router.push("/sem-permissao");
          return;
        }

        setCheckingAccess(false);
      } catch (err) {
        console.error("Error verifying membership:", err);
        router.push("/sem-permissao");
      }
    }

    void checkAccess();
  }, [pathname, router]);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  useEffect(() => {
    if (isTablet) {
      // Force collapsed on tablet
      setIsCollapsed(true);
      localStorage.setItem("cls_sidebar_collapsed", "true");
      window.dispatchEvent(new Event("cls_sidebar_toggle"));
      return;
    }

    // Desktop: restore saved state
    const collapsed = localStorage.getItem("cls_sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);

    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem("cls_sidebar_collapsed") === "true");
    };

    window.addEventListener("cls_sidebar_toggle", handleToggle);
    return () => window.removeEventListener("cls_sidebar_toggle", handleToggle);
  }, [isTablet]);

  const sidebarWidth = isCollapsed ? "72px" : "280px";

  if (checkingAccess) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)", padding: "40px" }}>
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
      }}
    >
      {/* Sidebar: only visible on tablet and desktop */}
      {!isMobile && <Sidebar />}

      {/* Main content area */}
      <div
        className="main-with-sidebar"
        style={{
          marginLeft: isMobile ? "0" : sidebarWidth,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          minWidth: 0,
        }}
      >
        <TopBar />
        <main
          style={{
            marginTop: isMobile ? "60px" : "80px",
            flex: 1,
            padding: isMobile ? "16px 16px 88px 16px" : isTablet ? "24px" : "40px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>

      {/* Bottom Tab Bar: only on mobile */}
      {isMobile && <BottomTabBar />}
    </div>
  );
}
