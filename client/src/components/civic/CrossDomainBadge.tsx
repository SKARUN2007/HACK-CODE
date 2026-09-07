import React from 'react';

interface CrossDomainBadgeProps {
  primaryDomain?: string;
  relatedDomains?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export const CrossDomainBadge: React.FC<CrossDomainBadgeProps> = ({
  primaryDomain,
  relatedDomains = [],
  size = 'md'
}) => {
  const padding = size === 'sm' ? '0.2rem 0.5rem' : size === 'lg' ? '0.5rem 1rem' : '0.35rem 0.75rem';
  const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.9rem' : '0.8rem';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        color: '#166534',
        padding,
        borderRadius: '20px',
        fontWeight: 800,
        fontSize,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      <span>🧩</span>
      <span>COORDINATED REVIEW</span>
      {primaryDomain && relatedDomains.length > 0 && (
        <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 700 }}>
          ({primaryDomain} + {relatedDomains.join(', ')})
        </span>
      )}
    </div>
  );
};
