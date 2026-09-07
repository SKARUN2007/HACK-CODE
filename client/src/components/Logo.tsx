import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  size = 48,
  showText = true,
  layout = 'horizontal',
  className = '',
  theme = 'dark',
}) => {
  const isDarkTheme = theme === 'dark';

  return (
    <div
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: layout === 'vertical' ? '0.6rem' : '0.85rem',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 320 290"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
      >
        <defs>
          {/* Gold Crest Gradient */}
          <linearGradient id="tnGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Left Cyan Gradient */}
          <linearGradient id="tnCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#00838F" />
          </linearGradient>

          {/* Middle Blue Gradient */}
          <linearGradient id="tnBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Right Green Gradient */}
          <linearGradient id="tnGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Transparent Heart Cutout */}
          <mask id="tnHeartCutout">
            <rect width="320" height="290" fill="#FFFFFF" />
            <path
              d="M 135,160 C 150,185 160,195 160,195 C 160,195 170,185 185,160 C 195,190 175,230 160,250 C 145,230 125,190 135,160 Z"
              fill="#000000"
            />
          </mask>
        </defs>

        {/* Outer Official Gold Shield Ring */}
        <circle cx="160" cy="145" r="135" stroke="url(#tnGoldGrad)" strokeWidth="6" fill="none" strokeDasharray="8 4" opacity="0.35" />
        <circle cx="160" cy="145" r="126" stroke="url(#tnGoldGrad)" strokeWidth="3" fill="none" opacity="0.8" />

        {/* Tamil Nadu Temple Gopuram Tower Silhouette Crest (Top Center Background) */}
        <g transform="translate(100, 24) scale(0.6)" opacity="0.95">
          {/* Gopuram Tower Tier Blocks */}
          <polygon points="100,5 94,20 106,20" fill="url(#tnGoldGrad)" />
          <path d="M 90,22 L 110,22 L 108,36 L 92,36 Z" fill="url(#tnGoldGrad)" />
          <path d="M 85,39 L 115,39 L 112,58 L 88,58 Z" fill="url(#tnGoldGrad)" />
          <path d="M 80,61 L 120,61 L 117,85 L 83,85 Z" fill="url(#tnGoldGrad)" />
          <path d="M 75,88 L 125,88 L 122,115 L 78,115 Z" fill="url(#tnGoldGrad)" />
        </g>

        {/* 3 Citizen Unity Figures */}
        <g transform="translate(0, 5)">
          {/* Heads */}
          <circle cx="105" cy="75" r="28" fill="url(#tnCyanGrad)" />
          <circle cx="160" cy="55" r="32" fill="url(#tnBlueGrad)" />
          <circle cx="215" cy="75" r="28" fill="url(#tnGreenGrad)" />

          {/* Bodies Grouped under Transparent Mask */}
          <g mask="url(#tnHeartCutout)">
            {/* Center Blue Body */}
            <path
              d="M 120,105 C 135,95 185,95 200,105 C 225,135 230,170 160,230 C 90,170 95,135 120,105 Z"
              fill="url(#tnBlueGrad)"
            />

            {/* Left Cyan Arm Arc */}
            <path
              d="M 105,105 C 75,120 60,160 80,205 C 100,245 160,270 160,270 C 160,270 105,235 85,195 C 65,155 85,120 105,105 Z"
              fill="url(#tnCyanGrad)"
            />
            <path
              d="M 105,105 C 125,140 145,180 160,270 C 135,235 100,190 80,150 C 85,125 95,110 105,105 Z"
              fill="url(#tnCyanGrad)"
            />

            {/* Right Green Arm Arc */}
            <path
              d="M 215,105 C 245,120 260,160 240,205 C 220,245 160,270 160,270 C 160,270 215,235 235,195 C 255,155 235,120 215,105 Z"
              fill="url(#tnGreenGrad)"
            />
            <path
              d="M 215,105 C 195,140 175,180 160,270 C 185,235 220,190 240,150 C 235,125 225,110 215,105 Z"
              fill="url(#tnGreenGrad)"
            />
          </g>
        </g>
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: size * 0.44,
              letterSpacing: '-0.02em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <span style={{ color: isDarkTheme ? '#FFFFFF' : '#003882' }}>MAKKAL</span>
            <span style={{ color: '#10B981' }}>SAANTRU</span>
          </span>
          <span
            style={{
              fontSize: size * 0.2,
              fontWeight: 700,
              color: isDarkTheme ? '#FBBF24' : '#D97706',
              letterSpacing: '0.04em',
              marginTop: '3px',
            }}
          >
            தமிழ்நாடு அரசு • GOVT OF TAMIL NADU
          </span>
        </div>
      )}
    </div>
  );
};
