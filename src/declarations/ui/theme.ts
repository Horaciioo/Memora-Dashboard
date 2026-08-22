import type { IconName } from '@/declarations/ui/icons'

export type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

/**
 * Tone class set
 * @typedef {Object} ToneStyles
 * @property {string} text - Foreground colour
 * @property {string} soft - Tinted background
 * @property {string} border - Border colour
 * @property {string} dot - Status dot background
 */

export interface ToneStyles {
  text: string
  soft: string
  border: string
  dot: string
}

/**
 * Classes per tone
 * @type {Record<Tone, ToneStyles>}
 */

export const TONES: Record<Tone, ToneStyles> = {
  brand: {
    text: 'text-[var(--color-brand-600)]',
    soft: 'bg-[var(--color-brand-soft)]',
    border: 'border-[var(--color-brand-400)]',
    dot: 'bg-[var(--color-brand-600)]',
  },
  success: {
    text: 'text-[var(--color-success)]',
    soft: 'bg-[var(--color-success-soft)]',
    border: 'border-[var(--color-success)]',
    dot: 'bg-[var(--color-success)]',
  },
  warning: {
    text: 'text-[var(--color-warning)]',
    soft: 'bg-[var(--color-warning-soft)]',
    border: 'border-[var(--color-warning)]',
    dot: 'bg-[var(--color-warning)]',
  },
  danger: {
    text: 'text-[var(--color-danger)]',
    soft: 'bg-[var(--color-danger-soft)]',
    border: 'border-[var(--color-danger)]',
    dot: 'bg-[var(--color-danger)]',
  },
  info: {
    text: 'text-[var(--color-info)]',
    soft: 'bg-[var(--color-info-soft)]',
    border: 'border-[var(--color-info)]',
    dot: 'bg-[var(--color-info)]',
  },
  neutral: {
    text: 'text-[var(--color-ink-subtle)]',
    soft: 'bg-[var(--color-neutral-soft)]',
    border: 'border-[var(--color-border-strong)]',
    dot: 'bg-[var(--color-ink-subtle)]',
  },
}

/**
 * Icon per tone, read by the toaster and the overlay headers
 * @type {Record<Tone, IconName>}
 */

export const TONE_ICON: Record<Tone, IconName> = {
  brand: 'spark',
  success: 'success',
  warning: 'warning',
  danger: 'failure',
  info: 'info',
  neutral: 'help',
}

/**
 * Border color per notification tone
 * @type {Record<Tone, string>}
 */

export const TONE_BORDER: Record<Tone, string> = {
  brand: TONES.brand.border,
  success: TONES.success.border,
  warning: TONES.warning.border,
  danger: TONES.danger.border,
  info: TONES.info.border,
  neutral: TONES.neutral.border,
}

/**
 * Resolve a stored accent to a tone
 * @param {string | null | undefined} accent - Stored accent key
 * @param {Tone} [fallback] - Tone used when unknown
 * @return {Tone} - Tone key
 */

export const toTone = (accent: string | null | undefined, fallback: Tone = 'neutral'): Tone =>
  accent !== null && accent !== undefined && accent in TONES ? (accent as Tone) : fallback

/**
 * Every selectable tone
 * @type {Tone[]}
 */

export const TONE_KEYS = Object.keys(TONES) as Tone[]

/**
 * Display label per tone
 * @type {Record<Tone, string>}
 */

export const TONE_LABELS: Record<Tone, string> = {
  brand: 'Rose',
  success: 'Vert',
  warning: 'Orange',
  danger: 'Rouge',
  info: 'Bleu',
  neutral: 'Gris',
}
