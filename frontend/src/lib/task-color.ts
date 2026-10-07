import type { CSSProperties } from "react";

/** Normalise #RGB / #RRGGBB → #RRGGBB */
export function normalizeHexColor(color: string): string | null {
  const raw = color.trim();
  const m = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1];
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  return `#${h.toLowerCase()}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHexColor(hex);
  if (!n) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

/**
 * Pastille simple : fond pastel + fine bordure teintée (pas de barre / ombre).
 */
export function taskColorChipStyle(color: string): CSSProperties {
  const rgb = hexToRgb(color);
  const hex = normalizeHexColor(color) ?? color;
  if (!rgb) {
    return {
      backgroundColor: hex,
      borderColor: hex,
      borderWidth: 1,
      borderStyle: "solid",
      color: "#0f172a",
    };
  }
  return {
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`,
    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`,
    borderWidth: 1,
    borderStyle: "solid",
    color: "#0f172a",
    boxShadow: "none",
  };
}
