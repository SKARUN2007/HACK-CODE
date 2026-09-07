import React from 'react';

export const EVIDENCE_FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150" fill="none"><rect width="200" height="150" fill="%23002B49" rx="8"/><rect x="10" y="10" width="180" height="130" fill="%230f172a" rx="6"/><path d="M40 100 L70 60 L100 90 L130 50 L160 100 Z" fill="%231e293b" stroke="%233b82f6" stroke-width="2"/><circle cx="65" cy="45" r="10" fill="%23f59e0b"/><text x="100" y="125" fill="%2338bdf8" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">GROUND EVIDENCE PHOTO</text></svg>`;

/**
 * Event handler for img onError to display SVG evidence fallback gracefully
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== EVIDENCE_FALLBACK_SVG) {
    target.onerror = null; // Prevent infinite loop
    target.src = EVIDENCE_FALLBACK_SVG;
  }
};

/**
 * Safely extracts an evidence image URL from an object (supporting fileUrl, photoUrl, url)
 */
export const getEvidenceImageUrl = (evidence: any): string => {
  if (!evidence) return EVIDENCE_FALLBACK_SVG;
  const url = evidence.fileUrl || evidence.photoUrl || evidence.url;
  if (!url) return EVIDENCE_FALLBACK_SVG;
  return url;
};
