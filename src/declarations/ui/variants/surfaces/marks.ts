import { EDITING_MARK } from '@/declarations/ui/variants/controls'

/**
 * Status styles
 * @type {Record<string, string>}
 */

export const STATUS_STYLES = {
  base: 'inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap',
  icon: 'size-3.5 shrink-0',
  // Done or past
  muted: 'opacity-70',
} as const

/**
 * Pastel fill of the accent, ink text
 * @type {string}
 */

export const PASTEL_TAG =
  'inline-flex w-fit items-center rounded-md bg-[color-mix(in_srgb,var(--accent)_58%,var(--color-surface))] px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-[var(--color-ink)]'

/**
 * Creator and project labels
 * @type {Record<string, string>}
 */

export const RECORD_LABEL = {
  row: 'inline-flex min-w-0 items-center gap-2 align-middle',
  group: 'inline-flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 align-middle',
  // A long title takes two lines on a phone
  name: 'line-clamp-2 break-words md:block md:truncate',
  emoji: 'shrink-0 text-base leading-none',
} as const

/**
 * Glyph sizes
 * @type {Record<string, string>}
 */

export const GLYPH_STYLES = {
  base: 'shrink-0 bg-transparent leading-none',
  chip: 'text-xs',
  row: 'text-sm',
  card: 'text-base',
  title: 'text-2xl',
} as const

export type GlyphSize = keyof Omit<typeof GLYPH_STYLES, 'base'>

/**
 * Avatar styles
 * @type {Record<string, string>}
 */

export const AVATAR_STYLES = {
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-brand-600)] font-semibold text-[var(--color-on-brand)] select-none',
  xs: 'h-6 w-6 text-micro',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
  hero: 'h-36 w-36 text-5xl sm:h-44 sm:w-44',
  stack: 'flex items-center -space-x-2',
  stackWrapped: 'flex flex-wrap items-center gap-y-0.5 pr-2 [&>*]:-mr-2',
  ring: 'ring-2 ring-[var(--color-surface-raised)]',
} as const

export type AvatarSize = Extract<
  keyof typeof AVATAR_STYLES,
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'
>

/**
 * Inline edit styles
 * @type {Record<string, string>}
 */

export const INLINE_EDIT_STYLES = {
  block:
    '-mx-2 -my-1 cursor-text rounded-[var(--radius-sm)] px-2 py-1 transition-colors hover:bg-[var(--color-surface)]',
  text: '-mx-1 cursor-text rounded-[var(--radius-sm)] px-1 transition-colors hover:bg-[var(--color-surface)]',
  input: `rounded-[var(--radius-sm)] outline-none ${EDITING_MARK}`,
  // Input laid exactly over its read text
  line: '-mx-1 max-w-full field-sizing-content px-1 py-0 text-inherit [text-align:inherit]',
  area: 'block -mx-2 -my-1 w-full field-sizing-content resize-none px-2 py-1 text-inherit [text-align:inherit]',
  blockEditing: `-mx-2 -my-1 rounded-[var(--radius-sm)] px-2 py-1 ${EDITING_MARK}`,
  // Dashed field standing in for a creation row
  create:
    'w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-brand-400)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-solid focus:ring-2 focus:ring-[var(--color-focus)]',
  createTile: 'min-h-16 text-center',
  placeholder: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Blank markdown, same size as its editor line
  placeholderBlock: 'leading-[1.65] text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Personal settings page styles
 * @type {Record<string, string>}
 */

export const PREFERENCE_STYLES = {
  layout:
    'mx-auto grid grid-cols-1 w-full max-w-5xl items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]',
  stack: 'flex flex-col gap-6',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
  label: 'flex items-center gap-2 text-sm font-medium',
  notice: 'pt-3 text-xs text-[var(--color-ink-subtle)]',
  footer: 'flex pt-5',
} as const
