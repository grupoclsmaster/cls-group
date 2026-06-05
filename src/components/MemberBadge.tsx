'use client';

import React from 'react';

interface MemberBadgeProps {
  name: string;
  img?: string | null;
  initials?: string | null;
  memberType?: 'admin' | 'master' | 'mentor' | 'mentorado' | null;
  size?: number;
  showLabel?: boolean;
  isOnline?: boolean;
}

const MEMBER_CONFIG = {
  master: {
    color: '#C0C0C0',
    label: 'Master',
    icon: '★',
    gradient: 'linear-gradient(135deg, #C0C0C0, #EAEAEA, #9E9E9E, #CCCCCC)',
    shadow: 'rgba(192, 192, 192, 0.45)',
  },
  mentor: {
    color: '#7C4DFF',
    label: 'Mentor',
    icon: '🎓',
    gradient: 'linear-gradient(135deg, #7C4DFF, #B388FF, #651FFF)',
    shadow: 'rgba(124, 77, 255, 0.45)',
  },
  admin: {
    color: '#0A52B9',
    label: 'Admin',
    icon: '✓',
    gradient: 'linear-gradient(135deg, #0A52B9, #3B82F6, #1E40AF)',
    shadow: 'rgba(10, 82, 185, 0.45)',
  },
  mentorado: {
    color: '#C0C0C0',
    label: 'Mentorado',
    icon: '✓',
    gradient: 'linear-gradient(135deg, #C0C0C0, #EAEAEA, #9E9E9E, #CCCCCC)',
    shadow: 'rgba(192, 192, 192, 0.45)',
  },
} as const;

function getInitials(name: string, initialsProp?: string | null): string {
  if (initialsProp) return initialsProp;
  return name
    .trim()
    .slice(0, 2)
    .toUpperCase();
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 50%, 35%)`;
}

const MemberBadge: React.FC<MemberBadgeProps> = ({
  name,
  img,
  initials,
  memberType,
  size = 40,
  showLabel = false,
  isOnline = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const resolvedType = memberType || 'mentorado';
  const config = MEMBER_CONFIG[resolvedType];
  const borderWidth = 2.5;
  const badgeSize = Math.round(size * 0.35);
  const badgeFontSize = Math.round(badgeSize * 0.55);
  const displayInitials = getInitials(name, initials);
  const avatarBg = hashColor(name);

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  };

  // Outer ring — uses a slightly larger container with gradient background
  const ringSize = size + borderWidth * 2 + (config ? 2 : 0);

  const ringStyle: React.CSSProperties = {
    position: 'relative',
    width: ringSize,
    height: ringSize,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: config ? config.gradient : 'rgba(255,255,255,0.1)',
    boxShadow: config
      ? `0 0 ${size * 0.2}px ${config.shadow}, 0 0 ${size * 0.05}px ${config.shadow}`
      : 'none',
    transition: 'box-shadow 0.3s ease',
    flexShrink: 0,
  };

  const avatarContainerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: img ? '#1a1a2e' : avatarBg,
    border: `2px solid ${config ? 'rgba(0,0,0,0.4)' : 'transparent'}`,
    flexShrink: 0,
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    display: 'block',
  };

  const initialsStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 700,
    fontSize: size * 0.36,
    lineHeight: 1,
    letterSpacing: 0.5,
    userSelect: 'none',
    textTransform: 'uppercase',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };

  // Badge icon positioned bottom-right
  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: config ? -1 : 0,
    right: config ? -1 : 0,
    width: badgeSize,
    height: badgeSize,
    borderRadius: '50%',
    background: config ? config.gradient : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid #111118`,
    boxShadow: config
      ? `0 2px 6px ${config.shadow}`
      : 'none',
    zIndex: 2,
  };

  const badgeIconStyle: React.CSSProperties = {
    fontSize: badgeFontSize,
    lineHeight: 1,
    color: resolvedType === 'mentor' ? '#fff' : '#111118',
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: Math.max(9, size * 0.24),
    fontWeight: 700,
    color: config ? config.color : 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    lineHeight: 1,
    marginTop: 2,
  };

  const onlineDotStyle: React.CSSProperties = {
    position: 'absolute',
    top: 2,
    right: 2,
    width: Math.max(10, Math.round(size * 0.22)),
    height: Math.max(10, Math.round(size * 0.22)),
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    border: '2px solid #111118',
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)',
    zIndex: 10,
  };

  return (
    <div style={wrapperStyle}>
      <div style={ringStyle}>
        {isOnline && <div style={onlineDotStyle} title="Online" />}
        <div style={avatarContainerStyle}>
          {img && !imgError ? (
            <img
              src={img}
              alt={name}
              style={imgStyle}
              loading="lazy"
              draggable={false}
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={initialsStyle}>{displayInitials}</span>
          )}
        </div>

        {config && (
          <div style={badgeStyle}>
            <span style={badgeIconStyle}>
              {resolvedType === 'admin' ? (
                <svg
                  width={badgeFontSize}
                  height={badgeFontSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.5 14.5l-3.5-3.5 1.41-1.41L10.5 13.67l5.59-5.59L17.5 9.5l-7 7z"
                    fill="#2a1f00"
                  />
                </svg>
              ) : resolvedType === 'mentor' ? (
                <svg
                  width={badgeFontSize}
                  height={badgeFontSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
                    fill="#fff"
                  />
                </svg>
              ) : resolvedType === 'master' ? (
                <span style={{ fontSize: badgeFontSize, lineHeight: 1 }}>★</span>
              ) : (
                <svg
                  width={badgeFontSize}
                  height={badgeFontSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="#fff"
                  />
                </svg>
              )}
            </span>
          </div>
        )}
      </div>

      {showLabel && config && (
        <span style={labelStyle}>
          {resolvedType === 'admin'
            ? (name.toLowerCase().includes('magno') ? 'Mentor' : name.toLowerCase().includes('mayara') ? 'Mentora' : config.label)
            : config.label}
        </span>
      )}
    </div>
  );
};

export default MemberBadge;
