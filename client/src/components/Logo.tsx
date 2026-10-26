import React from 'react';
import { TnEmblem } from './TnEmblem';

interface LogoProps {
  size?: number;
  showText?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  subtext?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 52,
  showText = true,
  layout = 'horizontal',
  className = '',
  theme = 'dark',
  subtext,
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
        textDecoration: 'none',
      }}
    >
      {/* 3D Embossed Civic Seal */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <TnEmblem size={size} variant="seal" />
        {/* Subtle Indian Saffron-Green Tricolor Edge Accent */}
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: size * 0.38,
            height: size * 0.38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
            border: '1.5px solid #ffffff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Official Government Verification Platform"
        >
          <div
            style={{
              width: size * 0.16,
              height: size * 0.16,
              borderRadius: '50%',
              backgroundColor: '#002B49',
            }}
          />
        </div>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: layout === 'vertical' ? 'center' : 'left' }}>
          {/* Top Line: State Masthead */}
          <span
            style={{
              fontSize: Math.max(size * 0.19, 10),
              fontWeight: 800,
              color: isDarkTheme ? '#FBBF24' : '#D97706',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>தமிழ்நாடு அரசு</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span style={{ fontSize: '0.88em' }}>GOVT OF TAMIL NADU</span>
          </span>

          {/* Main Brand Title */}
          <span
            style={{
              fontWeight: 900,
              fontSize: Math.max(size * 0.42, 19),
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '4px',
              marginTop: '1px',
            }}
          >
            <span style={{ color: isDarkTheme ? '#FFFFFF' : '#002B49' }}>MAKKAL</span>
            <span
              style={{
                color: '#10B981',
                textShadow: isDarkTheme ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
              }}
            >
              SAANTRU
            </span>
            <span
              style={{
                fontSize: '0.55em',
                fontWeight: 700,
                color: isDarkTheme ? '#94A3B8' : '#64748B',
                fontFamily: "'Mukta Malar', 'Noto Sans Tamil', sans-serif",
                marginLeft: '2px',
              }}
            >
              (மக்கள்சான்று)
            </span>
          </span>

          {/* Department Subtitle */}
          <span
            style={{
              fontSize: Math.max(size * 0.17, 9.5),
              fontWeight: 600,
              color: isDarkTheme ? '#CBD5E1' : '#475569',
              letterSpacing: '0.02em',
              marginTop: '1px',
            }}
          >
            {subtext || 'Civil Works & Public Infrastructure Oversight Portal'}
          </span>
        </div>
      )}
    </div>
  );
};
