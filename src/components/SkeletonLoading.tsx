"use client";
import { useState, useEffect } from "react";
import Link from "next/link";


/* ──────────────────────────────────────────────────────────────
   SkeletonLoading — premium shimmer skeleton for CLS Community
   Use primitives (SkeletonBox, SkeletonText, SkeletonAvatar)
   or full-page presets (SkeletonDashboard, SkeletonFeed, etc.)
────────────────────────────────────────────────────────────── */

const shimmerCSS = `
  @keyframes cls-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .sk {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.04) 25%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.04) 75%
    );
    background-size: 600px 100%;
    animation: cls-shimmer 1.6s ease-in-out infinite;
    border-radius: 4px;
  }
`;

/* ── Hooks ──────────────────────────────────────────────────── */
function useDeviceType() {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 768) setDevice("mobile");
      else if (w < 1024) setDevice("tablet");
      else setDevice("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return device;
}

/* ── Primitives ─────────────────────────────────────────────── */

interface BoxProps {
  w?: string;
  h?: string;
  radius?: string;
  style?: React.CSSProperties;
}

export function SkeletonBox({ w = "100%", h = "16px", radius = "4px", style }: BoxProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />
      <div className="sk" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
    </>
  );
}

export function SkeletonAvatar({ size = "40px" }: { size?: string }) {
  return <SkeletonBox w={size} h={size} radius="50%" />;
}

export function SkeletonText({ lines = 1, gap = "8px" }: { lines?: number; gap?: string }) {
  const widths = ["100%", "85%", "70%", "90%", "60%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox key={i} w={widths[i % widths.length]} h="12px" />
      ))}
    </div>
  );
}

/* ── Card skeletons ─────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: "var(--color-surface-container-low)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "8px",
      overflow: "hidden",
    }}>
      <SkeletonBox h="160px" radius="0" />
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <SkeletonBox h="14px" w="75%" />
        <SkeletonBox h="11px" w="55%" />
        <SkeletonBox h="11px" w="40%" />
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div style={{
      backgroundColor: "var(--color-surface-container-low)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "8px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <SkeletonBox h="14px" w="40%" />
        <SkeletonBox h="20px" w="20px" radius="50%" />
      </div>
      <SkeletonBox h="32px" w="50%" />
      <SkeletonBox h="6px" w="100%" radius="3px" />
    </div>
  );
}

function SkeletonPostCard() {
  return (
    <div style={{
      backgroundColor: "var(--color-surface-container-low)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "20px",
    }}>
      {/* Author row */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
        <SkeletonAvatar size="44px" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <SkeletonBox h="13px" w="35%" />
          <SkeletonBox h="10px" w="25%" />
        </div>
      </div>
      {/* Body */}
      <SkeletonText lines={3} gap="8px" />
      {/* Actions */}
      <div style={{ display: "flex", gap: "24px", marginTop: "20px" }}>
        <SkeletonBox h="12px" w="50px" />
        <SkeletonBox h="12px" w="60px" />
        <SkeletonBox h="12px" w="50px" />
      </div>
    </div>
  );
}

function SkeletonSidebarMember() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <SkeletonAvatar size="36px" />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <SkeletonBox h="11px" w="90px" />
          <SkeletonBox h="9px" w="70px" />
        </div>
      </div>
      <SkeletonBox h="22px" w="68px" radius="4px" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE-LEVEL SKELETONS
 ══════════════════════════════════════════════════════════════ */

/* ── Dashboard ──────────────────────────────────────────────── */
export function SkeletonDashboard() {
  const device = useDeviceType();
  const cols = device === "mobile" ? "1fr" : device === "tablet" ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Welcome */}
      <div style={{ marginBottom: "40px" }}>
        <SkeletonBox h="32px" w="50%" style={{ marginBottom: "12px" }} />
        <SkeletonBox h="14px" w="35%" />
      </div>

      {/* Bento grid row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "20px", marginBottom: "32px" }}>
        <SkeletonStatCard />
        <SkeletonStatCard />
        {device !== "mobile" && <SkeletonStatCard />}
      </div>

      {/* Masterclasses row */}
      <SkeletonBox h="18px" w="200px" style={{ marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "20px", marginBottom: "32px" }}>
        <SkeletonCard />
        <SkeletonCard />
        {device !== "mobile" && <SkeletonCard />}
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: device === "desktop" ? "1fr 1fr" : "1fr", gap: "20px" }}>
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "20px",
          display: "flex", flexDirection: "column", gap: "12px"
        }}>
          <SkeletonBox h="16px" w="40%" />
          <SkeletonText lines={3} gap="8px" />
          <SkeletonBox h="36px" w="140px" style={{ marginTop: "8px" }} />
        </div>
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "20px",
          display: "flex", flexDirection: "column", gap: "16px"
        }}>
          <SkeletonBox h="16px" w="40%" />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", gap: "12px" }}>
              <SkeletonAvatar size="32px" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <SkeletonBox h="11px" w="80%" />
                <SkeletonBox h="9px" w="35%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Feed / Membros ─────────────────────────────────────────── */
export function SkeletonFeed() {
  const device = useDeviceType();

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <SkeletonBox h="28px" w="45%" style={{ marginBottom: "10px" }} />
        <SkeletonBox h="13px" w="65%" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: device === "desktop" ? "2fr 1fr" : "1fr", gap: "24px" }}>
        {/* Left: posts */}
        <div>
          {/* New post box */}
          <div style={{
            backgroundColor: "var(--color-surface-container-low)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex", flexDirection: "column", gap: "12px"
          }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <SkeletonAvatar size="40px" />
              <SkeletonBox h="40px" style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SkeletonBox h="32px" w="100px" />
            </div>
          </div>
          {/* Post cards */}
          <SkeletonPostCard />
          <SkeletonPostCard />
          {device === "desktop" && <SkeletonPostCard />}
        </div>

        {/* Right: sidebar */}
        {device === "desktop" && (
          <div>
            <SkeletonBox h="16px" w="70px" style={{ marginBottom: "16px" }} />
            <SkeletonBox h="36px" style={{ marginBottom: "20px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[1, 2, 3, 4, 5].map(i => <SkeletonSidebarMember key={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Masterclasses list ─────────────────────────────────────── */
export function SkeletonMasterclasses() {
  const device = useDeviceType();
  const cols = device === "mobile" ? "1fr" : device === "tablet" ? "repeat(2, 1fr)" : "repeat(3, 1fr)";

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", flexDirection: device === "mobile" ? "column" : "row", justifyContent: "space-between", alignItems: device === "mobile" ? "flex-start" : "flex-end", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <SkeletonBox h="28px" w="200px" />
          <SkeletonBox h="13px" w="300px" />
        </div>
        <SkeletonBox h="36px" w="120px" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
        {[80, 110, 100, 90].map((w, i) => <SkeletonBox key={i} h="32px" w={`${w}px`} radius="4px" style={{ flexShrink: 0 }} />)}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "20px" }}>
        {Array.from({ length: device === "mobile" ? 3 : 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

/* ── Single Masterclass ─────────────────────────────────────── */
export function SkeletonMasterclassDetail() {
  const device = useDeviceType();

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Back button */}
      <SkeletonBox h="20px" w="120px" style={{ marginBottom: "20px" }} />

      {/* Hero */}
      <SkeletonBox h={device === "mobile" ? "200px" : "350px"} radius="8px" style={{ marginBottom: "24px" }} />

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: device === "desktop" ? "2fr 1fr" : "1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SkeletonBox h="28px" w="70%" />
          <SkeletonText lines={4} gap="8px" />
          <SkeletonBox h="1px" style={{ background: "rgba(255,255,255,0.06)", marginTop: "8px" }} />
          <SkeletonBox h="18px" w="40%" />
          <SkeletonText lines={6} gap="8px" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            backgroundColor: "var(--color-surface-container-low)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex", flexDirection: "column", gap: "16px"
          }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <SkeletonAvatar size="48px" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <SkeletonBox h="14px" w="120px" />
                <SkeletonBox h="10px" w="90px" />
              </div>
            </div>
            <SkeletonText lines={3} gap="8px" />
            <SkeletonBox h="40px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Perfil / Profile ───────────────────────────────────────── */
export function SkeletonPerfil() {
  const device = useDeviceType();

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ display: "grid", gridTemplateColumns: device === "desktop" ? "340px 1fr" : "1fr", gap: "24px" }}>
        {/* Left: profile card */}
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "24px",
          display: "flex", flexDirection: "column", gap: "20px",
          alignItems: "center",
          alignSelf: "start",
        }}>
          <SkeletonAvatar size="100px" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", alignItems: "center" }}>
            <SkeletonBox h="20px" w="60%" />
            <SkeletonBox h="12px" w="45%" />
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", gap: "10px" }}>
                <SkeletonBox h="14px" w="14px" radius="3px" />
                <SkeletonBox h="12px" w="70%" />
              </div>
            ))}
          </div>
          <SkeletonBox h="36px" w="100%" />
        </div>

        {/* Right: tabs + content */}
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px", paddingBottom: "2px", overflowX: "auto" }}>
            {[100, 140, 130].map((w, i) => <SkeletonBox key={i} h="32px" w={`${w}px`} radius="4px 4px 0 0" style={{ flexShrink: 0 }} />)}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                backgroundColor: "var(--color-surface-container-low)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "16px",
                display: "flex", gap: "12px",
                alignItems: "center",
                flexWrap: device === "mobile" ? "wrap" : "nowrap"
              }}>
                <SkeletonAvatar size="44px" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "150px" }}>
                  <SkeletonBox h="14px" w="40%" />
                  <SkeletonBox h="11px" w="60%" />
                </div>
                <SkeletonBox h="32px" w="100px" radius="4px" style={{ width: device === "mobile" ? "100%" : "100px", marginTop: device === "mobile" ? "8px" : "0" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Calendário ─────────────────────────────────────────────── */
export function SkeletonCalendario() {
  const device = useDeviceType();

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ marginBottom: "24px" }}>
        <SkeletonBox h="28px" w="220px" style={{ marginBottom: "10px" }} />
        <SkeletonBox h="13px" w="300px" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: device === "desktop" ? "1fr 340px" : "1fr", gap: "24px" }}>
        {/* Calendar grid */}
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: device === "mobile" ? "12px" : "24px",
        }}>
          {/* Month nav */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <SkeletonBox h="20px" w="120px" />
            <div style={{ display: "flex", gap: "8px" }}>
              <SkeletonBox h="32px" w="32px" radius="4px" />
              <SkeletonBox h="32px" w="32px" radius="4px" />
            </div>
          </div>
          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonBox key={i} h="20px" w="100%" />)}
          </div>
          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {Array.from({ length: 35 }).map((_, i) => <SkeletonBox key={i} h={device === "mobile" ? "50px" : "75px"} w="100%" />)}
          </div>
        </div>

        {/* Sidebar - hidden on mobile main, similar to the main calendar layout */}
        {device === "desktop" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{
              backgroundColor: "var(--color-surface-container-low)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "24px",
              display: "flex", flexDirection: "column", gap: "16px"
            }}>
              <SkeletonBox h="16px" w="150px" />
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: "12px" }}>
                  <SkeletonBox h="48px" w="48px" radius="4px" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <SkeletonBox h="13px" w="80%" />
                    <SkeletonBox h="10px" w="50%" />
                  </div>
                </div>
              ))}
            </div>
            <SkeletonBox h="40px" w="100%" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Oportunidades / Recursos / Projetos (generic grid) ─────── */
export function SkeletonGenericGrid({ cols = 2, rows = 3 }: { cols?: number; rows?: number }) {
  const device = useDeviceType();
  const responsiveCols = device === "mobile" ? 1 : device === "tablet" ? Math.min(cols, 2) : cols;

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ marginBottom: "28px" }}>
        <SkeletonBox h="28px" w="40%" style={{ marginBottom: "10px" }} />
        <SkeletonBox h="13px" w="60%" />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${responsiveCols}, 1fr)`,
        gap: "20px",
      }}>
        {Array.from({ length: responsiveCols * rows }).map((_, i) => (
          <div key={i} style={{
            backgroundColor: "var(--color-surface-container-low)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex", flexDirection: "column", gap: "14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <SkeletonBox h="14px" w="55%" />
              <SkeletonBox h="22px" w="60px" radius="4px" />
            </div>
            <SkeletonText lines={2} gap="8px" />
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <SkeletonAvatar size="28px" />
              <SkeletonBox h="11px" w="40%" style={{ alignSelf: "center" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Manutenção ─────────────────────────────────────────────── */
export function SkeletonManutencao() {
  const device = useDeviceType();

  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ marginBottom: "28px", display: "flex", flexDirection: device === "mobile" ? "column" : "row", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <SkeletonBox h="28px" w="240px" style={{ marginBottom: "10px" }} />
          <SkeletonBox h="13px" w="320px" />
        </div>
        <SkeletonBox h="40px" w="180px" />
      </div>

      <div style={{
        backgroundColor: "var(--color-surface-container-low)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: device === "desktop" ? "1fr 1fr" : "1fr", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SkeletonBox h="18px" w="60%" />
            <SkeletonText lines={3} gap="8px" />
            <SkeletonBox h="40px" w="100%" />
            <SkeletonBox h="40px" w="100%" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: device === "desktop" ? "0" : "16px" }}>
            <SkeletonBox h="18px" w="55%" />
            <SkeletonText lines={2} gap="8px" />
            {[1, 2].map(i => (
              <div key={i} style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "4px",
                padding: "16px",
                display: "flex", flexDirection: "column", gap: "10px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <SkeletonBox h="16px" w="45%" />
                  <SkeletonBox h="12px" w="100px" />
                </div>
                <SkeletonBox h="12px" w="60%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Ecossistema (Windows Store style) ─────────────────────── */
export function SkeletonEcossistema() {
  const device = useDeviceType();
  const isMobile = device === "mobile";
  const isTablet = device === "tablet";
  const isDesktop = device === "desktop";

  const gridCols = isDesktop ? "2.2fr 1fr" : "1fr";
  const sidebarDirection = isDesktop ? "column" : "row";

  return (
    <div className="animate-fadeIn" style={{ minHeight: "100vh", backgroundColor: "var(--color-primary-container)", color: "var(--color-on-surface)", overflowX: "hidden", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />
      
      {/* Standalone navigation header skeleton matching the live nav bar */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "80px",
        backgroundColor: "var(--topbar-bg)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--topbar-border)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 20px" : "0 40px"
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: "var(--color-on-surface)", fontSize: "18px", fontWeight: 800, letterSpacing: "0.06em", fontFamily: "'Outfit', sans-serif" }}>
            GRUPO CLS
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SkeletonBox w="120px" h="34px" radius="4px" />
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: isMobile ? "100px 20px 60px 20px" : "120px 40px 80px 40px",
        position: "relative",
        zIndex: 1
      }}>
        
        {/* Featured Slider Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: "24px",
          marginBottom: "48px"
        }}>
          
          {/* Left Large Slide Card Shimmer */}
          <div style={{
            position: "relative",
            aspectRatio: isMobile ? "4/3" : "16/9",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
            backgroundColor: "var(--color-surface-container-low)"
          }}>
            <SkeletonBox w="100%" h="100%" radius="0" />
            
            {/* Gradient Overlay mirroring live slide layout */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: isMobile 
                ? "linear-gradient(to top, rgba(19, 19, 22, 0.98) 0%, rgba(19, 19, 22, 0.5) 60%, transparent 100%)"
                : "linear-gradient(to right, rgba(19, 19, 22, 0.95) 0%, rgba(19, 19, 22, 0.5) 60%, transparent 100%)",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: isMobile ? "24px" : "40px"
            }}>
              {/* Badge Shimmer */}
              <SkeletonBox w="80px" h="16px" radius="20px" style={{ marginBottom: "16px" }} />
              
              {/* Title Shimmer */}
              <SkeletonBox w={isMobile ? "85%" : "60%"} h={isMobile ? "24px" : "36px"} style={{ marginBottom: "12px" }} />
              
              {/* Description Shimmers */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
                <SkeletonBox w={isMobile ? "95%" : "70%"} h="12px" />
                <SkeletonBox w={isMobile ? "85%" : "60%"} h="12px" />
                {!isMobile && <SkeletonBox w="45%" h="12px" />}
              </div>

              {/* Button Shimmer */}
              <SkeletonBox w="140px" h="38px" radius="4px" />
            </div>
          </div>

          {/* Right Selector Column Shimmer */}
          <div style={{
            display: "flex",
            flexDirection: sidebarDirection,
            gap: "12px",
            overflowX: isDesktop ? "visible" : "auto",
            paddingBottom: isDesktop ? "0" : "8px"
          }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexShrink: isDesktop ? 0 : "0 0 260px",
                  width: isDesktop ? "100%" : "260px"
                }}
              >
                {/* Image Thumbnail Shimmer */}
                <SkeletonBox w="44px" h="44px" radius="6px" />
                
                {/* Text column Shimmers */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <SkeletonBox w="50px" h="10px" />
                  <SkeletonBox w="100%" h="12px" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Skeleton */}
        <footer style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}>
          <SkeletonBox w="100px" h="16px" style={{ marginBottom: "16px" }} />
          <SkeletonBox w="300px" h="12px" style={{ marginBottom: "8px" }} />
          <SkeletonBox w="240px" h="10px" style={{ marginTop: "16px" }} />
        </footer>

      </main>
      
      <div style={{ height: "40px" }} />
    </div>
  );
}


