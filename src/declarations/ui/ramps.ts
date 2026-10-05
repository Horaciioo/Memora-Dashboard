import type { GlyphTint } from '@/declarations/members/tints'

/**
 * Leaf green through sky blue into rose, drawn on glyphs
 * @type {GlyphTint}
 */

export const BRAND_RAMP: GlyphTint = {
  fillFrom: 'var(--color-leaf-600)',
  fillMid: 'var(--color-sky-600)',
  fillTo: 'var(--color-brand-700)',
  liftFrom: 'var(--color-leaf-200)',
  liftMid: 'var(--color-sky-200)',
  liftTo: 'var(--color-brand-200)',
  deepFrom: 'var(--color-leaf-700)',
  deepMid: 'var(--color-sky-700)',
  deepTo: 'var(--color-brand-800)',
  cut: 'var(--color-brand-50)',
}

/**
 * Softer pastel pass of the same ramp, drawn on figures
 * @type {GlyphTint}
 */

export const SCENE_RAMP: GlyphTint = {
  fillFrom: 'var(--color-leaf-300)',
  fillMid: 'var(--color-sky-300)',
  fillTo: 'var(--color-brand-400)',
  liftFrom: 'var(--color-leaf-50)',
  liftMid: 'var(--color-sky-50)',
  liftTo: 'var(--color-brand-100)',
  deepFrom: 'var(--color-leaf-500)',
  deepMid: 'var(--color-sky-500)',
  deepTo: 'var(--color-brand-600)',
  cut: 'var(--color-brand-50)',
}
