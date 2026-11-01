/**
 * Reduced motion asked
 * @return {boolean} - Calm mode
 */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fallback glide duration
const GLIDE_FALLBACK_MS = 260

/**
 * Glide duration from the motion token
 * @return {number} - Milliseconds
 */

export const glideDurationMs = (): number => {
  if (typeof window === 'undefined') return GLIDE_FALLBACK_MS

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--motion-duration-glide')
    .trim()
  const parsed = Number.parseFloat(raw)
  if (!Number.isFinite(parsed)) return GLIDE_FALLBACK_MS

  // The build may rewrite 260ms as .26s
  return raw.endsWith('ms') ? parsed : parsed * 1000
}

/**
 * Ease-out curve of the motion token
 * @param {number} progress - From 0 to 1
 * @return {number} - Eased progress
 */

export const easeOut = (progress: number): number => 1 - (1 - progress) ** 4
