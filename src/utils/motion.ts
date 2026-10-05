/**
 * Reduced motion asked
 * @return {boolean} - Calm mode
 */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fallback panel duration
const PANEL_FALLBACK_MS = 220

/**
 * Panel duration from the motion token
 * @return {number} - Milliseconds
 */

export const panelDurationMs = (): number => {
  if (typeof window === 'undefined') return PANEL_FALLBACK_MS

  const raw = getComputedStyle(document.documentElement).getPropertyValue('--motion-duration-panel')
  const parsed = Number.parseFloat(raw)

  return Number.isFinite(parsed) ? parsed : PANEL_FALLBACK_MS
}

/**
 * Ease-out curve of the motion token
 * @param {number} progress - From 0 to 1
 * @return {number} - Eased progress
 */

export const easeOut = (progress: number): number => 1 - (1 - progress) ** 4
