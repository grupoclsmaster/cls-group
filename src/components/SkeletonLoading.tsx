"use client";

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
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Welcome */}
      <div style={{ marginBottom: "40px" }}>
        <SkeletonBox h="32px" w="50%" style={{ marginBottom: "12px" }} />
        <SkeletonBox h="14px" w="35%" />
      </div>

      {/* Bento grid row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Masterclasses row */}
      <SkeletonBox h="18px" w="200px" style={{ marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "24px",
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
          padding: "24px",
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
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <SkeletonBox h="28px" w="45%" style={{ marginBottom: "10px" }} />
        <SkeletonBox h="13px" w="65%" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        {/* Left: posts */}
        <div>
          {/* New post box */}
          <div style={{
            backgroundColor: "var(--color-surface-container-low)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
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
          <SkeletonPostCard />
        </div>

        {/* Right: sidebar */}
        <div>
          <SkeletonBox h="16px" w="70px" style={{ marginBottom: "16px" }} />
          <SkeletonBox h="36px" style={{ marginBottom: "20px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonSidebarMember key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Masterclasses list ─────────────────────────────────────── */
export function SkeletonMasterclasses() {
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SkeletonBox h="28px" w="250px" />
          <SkeletonBox h="13px" w="400px" />
        </div>
        <SkeletonBox h="36px" w="120px" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
        {[80, 110, 100, 90].map((w, i) => <SkeletonBox key={i} h="32px" w={`${w}px`} radius="4px" />)}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

/* ── Single Masterclass ─────────────────────────────────────── */
export function SkeletonMasterclassDetail() {
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      {/* Back button */}
      <SkeletonBox h="20px" w="120px" style={{ marginBottom: "24px" }} />

      {/* Hero */}
      <SkeletonBox h="400px" radius="8px" style={{ marginBottom: "32px" }} />

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
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
            padding: "24px",
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
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "32px" }}>
        {/* Left: profile card */}
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "32px",
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
            {[1, 2, 3, 4].map(i => (
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
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "28px", paddingBottom: "2px" }}>
            {[100, 140, 130].map((w, i) => <SkeletonBox key={i} h="32px" w={`${w}px`} radius="4px 4px 0 0" />)}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                backgroundColor: "var(--color-surface-container-low)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "20px",
                display: "flex", gap: "12px",
              }}>
                <SkeletonAvatar size="44px" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <SkeletonBox h="14px" w="40%" />
                  <SkeletonBox h="11px" w="60%" />
                  <SkeletonBox h="11px" w="30%" />
                </div>
                <SkeletonBox h="32px" w="100px" radius="4px" />
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
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ marginBottom: "32px" }}>
        <SkeletonBox h="28px" w="220px" style={{ marginBottom: "10px" }} />
        <SkeletonBox h="13px" w="380px" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
        {/* Calendar grid */}
        <div style={{
          backgroundColor: "var(--color-surface-container-low)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "24px",
        }}>
          {/* Month nav */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            <SkeletonBox h="20px" w="160px" />
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
            {Array.from({ length: 35 }).map((_, i) => <SkeletonBox key={i} h="56px" w="100%" />)}
          </div>
        </div>

        {/* Sidebar */}
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
                  <SkeletonBox h="10px" w="40%" />
                </div>
              </div>
            ))}
          </div>
          <SkeletonBox h="40px" w="100%" />
        </div>
      </div>
    </div>
  );
}

/* ── Oportunidades / Recursos / Projetos (generic grid) ─────── */
export function SkeletonGenericGrid({ cols = 2, rows = 3 }: { cols?: number; rows?: number }) {
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ marginBottom: "32px" }}>
        <SkeletonBox h="28px" w="40%" style={{ marginBottom: "10px" }} />
        <SkeletonBox h="13px" w="60%" />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "24px",
      }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} style={{
            backgroundColor: "var(--color-surface-container-low)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "24px",
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
  return (
    <div className="animate-fadeIn">
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />

      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <SkeletonBox h="28px" w="280px" style={{ marginBottom: "10px" }} />
          <SkeletonBox h="13px" w="420px" />
        </div>
        <SkeletonBox h="40px" w="200px" />
      </div>

      <div style={{
        backgroundColor: "var(--color-surface-container-low)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
        padding: "32px",
        marginBottom: "32px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SkeletonBox h="18px" w="60%" />
            <SkeletonText lines={3} gap="8px" />
            <SkeletonBox h="40px" w="100%" />
            <SkeletonBox h="40px" w="100%" />
            <SkeletonBox h="44px" w="100%" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <SkeletonBox h="18px" w="55%" />
            <SkeletonText lines={2} gap="8px" />
            {[1, 2, 3].map(i => (
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
