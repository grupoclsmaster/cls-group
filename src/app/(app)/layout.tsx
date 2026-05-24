"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Initial check
    const collapsed = localStorage.getItem("cls_sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);

    // Event listener for toggle updates
    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem("cls_sidebar_collapsed") === "true");
    };

    window.addEventListener("cls_sidebar_toggle", handleToggle);
    return () => window.removeEventListener("cls_sidebar_toggle", handleToggle);
  }, []);

  const sidebarWidth = isCollapsed ? "80px" : "280px";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <Sidebar />
      <div
        className="main-with-sidebar"
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          minWidth: 0 // Prevent layout overflow
        }}
      >
        <TopBar />
        <main style={{ marginTop: "80px", flex: 1, padding: "40px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
