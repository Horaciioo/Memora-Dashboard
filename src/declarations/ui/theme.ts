export type Tone = 'success' | 'warning' | 'danger' | 'info'

/**
 * Border color per notification tone
 * @type {Record<Tone, string>}
 */

export const TONE_BORDER: Record<Tone, string> = {
  success: 'border-emerald-500',
  warning: 'border-amber-500',
  danger: 'border-red-500',
  info: 'border-[var(--color-border)]',
}
