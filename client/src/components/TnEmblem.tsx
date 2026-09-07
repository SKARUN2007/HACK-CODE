import React from 'react';

interface TnEmblemProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TnEmblem: React.FC<TnEmblemProps> = ({ size = 28, className = '', style = {} }) => {
  return (
    <img
      src="/tn_emblem.png"
      alt="Government of Tamil Nadu Official Emblem"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        padding: '1px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
};
