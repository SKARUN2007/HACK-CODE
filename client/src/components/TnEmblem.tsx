import React from 'react';

interface TnEmblemProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'seal' | 'classic';
}

export const TnEmblem: React.FC<TnEmblemProps> = ({
  size = 32,
  className = '',
  style = {},
  variant = 'seal',
}) => {
  const imgSrc = variant === 'seal' ? '/tn_civic_seal.jpg' : '/tn_emblem.png';

  return (
    <img
      src={imgSrc}
      alt="Government of Tamil Nadu Official Emblem"
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        // Fallback to tn_emblem.png if seal fails
        const target = e.currentTarget;
        if (target.src.indexOf('tn_emblem.png') === -1) {
          target.src = '/tn_emblem.png';
        }
      }}
      style={{
        objectFit: 'contain',
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        padding: '1px',
        border: '1.5px solid #d97706',
        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
};
