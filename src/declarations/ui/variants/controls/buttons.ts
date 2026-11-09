/**
 * Value followed by its copy glyph
 * @type {Record<string, string>}
 */

export const COPY_VALUE = {
  root: 'inline-flex items-center gap-1.5',
  button:
    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  glyph: 'h-3.5 w-3.5',
} as const

/**
 * Button styles
 * @type {Record<string, string>}
 */

export const BUTTON_STYLES = {
  base: 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 text-sm font-semibold md:min-h-0 transition-[background-color,border-color,color,filter] duration-[var(--motion-duration-fast)] disabled:pointer-events-none disabled:opacity-50',
  primary:
    'rounded-[var(--radius-md)] md:rounded-full bg-[var(--color-brand-600)] px-4 py-2 text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  secondary:
    'rounded-[var(--radius-md)] md:rounded-full border border-[var(--color-border-strong)] bg-[var(--color-background)] px-3 py-2 hover:bg-[var(--color-surface-sunken)]',
  ghost:
    'rounded-[var(--radius-md)] md:rounded-full px-3 py-2 text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Hover deepens
  success:
    'rounded-[var(--radius-md)] md:rounded-full bg-[var(--color-success)] px-4 py-2 text-[var(--color-on-solid)] hover:brightness-90',
  danger:
    'rounded-[var(--radius-md)] md:rounded-full bg-[var(--color-danger)] px-4 py-2 text-[var(--color-on-solid)] hover:brightness-90',
  // 44px hit area on touch
  icon: 'h-9 w-9 min-h-11 min-w-11 rounded-full p-0 text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] md:min-h-0 md:min-w-0',
  link: 'min-h-0 p-0 text-[var(--color-ink-accent)] underline-offset-2 hover:underline',
  // Memora Play keys, painted in play/arcade.css
  arcade: 'play-key px-5 py-3 text-base! font-bold!',
  arcadeGhost: 'play-key play-key-ghost px-5 py-3 text-base! font-bold!',
  // Compact keys of the dock bubbles
  arcadeSmall: 'play-key px-3.5 py-1.5 text-sm! font-bold!',
  arcadeGhostSmall: 'play-key play-key-ghost px-3.5 py-1.5 text-sm! font-bold!',
  // No fill, no depth: text on the room
  arcadeText:
    'rounded-full px-5 py-3 text-base! font-bold! text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  arcadeHero: 'play-key play-key-hero px-6 py-4 text-lg! font-extrabold!',
  arcadeOrange: 'play-key play-key-orange px-5 py-3 text-base! font-bold!',
  arcadeDanger: 'play-key play-key-danger px-5 py-3 text-base! font-bold!',
  // Square footprint for a label-less button
  square: 'h-9 w-9 min-h-11 min-w-11 shrink-0 p-0 md:min-h-0 md:min-w-0',
} as const

export type ButtonVariant = keyof Omit<typeof BUTTON_STYLES, 'base'>

/**
 * Play key, locked quietly while it works
 * @param {ButtonVariant} variant - Button variant
 * @return {boolean} - Arcade key
 */

export const isArcadeVariant = (variant: ButtonVariant): boolean => variant.startsWith('arcade')

/**
 * Segmented styles
 * @type {Record<string, string>}
 */

export const SEGMENTED_STYLES = {
  group:
    'flex max-w-full items-center gap-1 overflow-x-auto rounded-[var(--radius-lg)] glass-soft p-1',
  option:
    'min-h-11 shrink-0 rounded-[calc(var(--radius-lg)-0.25rem)] px-2.5 py-1.5 text-xs font-semibold md:min-h-0 md:px-3 whitespace-nowrap transition-colors',
  full: 'w-full',
  optionFull: 'flex-1 text-center',
  selected: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  idle: 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
} as const

/**
 * Segmented switch of Memora Play: one key per choice, the pick in colour
 * @type {Record<string, string>}
 */

export const SEGMENTED_PLAY = {
  group: 'flex w-full items-center gap-2 pb-1.5',
  option: 'play-key min-h-11 flex-1 px-3 py-2 text-center text-sm whitespace-nowrap',
  selected: '',
  idle: 'play-key-ghost',
} as const

/**
 * Checkbox and switch styles
 * @type {Record<string, string>}
 */

export const TOGGLE_STYLES = {
  row: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm',
  // Exclusive states
  track:
    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-duration-panel)]',
  trackOff: 'bg-[var(--color-track-off)]',
  trackOn: 'bg-[var(--color-brand-600)]',
  trackSuccess: 'bg-[var(--color-success)]',
  trackDanger: 'bg-[var(--color-danger)]',
  knob: 'inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--color-knob)] shadow-[var(--shadow-sm)] transition-transform duration-[var(--motion-duration-panel)] motion-reduce:transition-none',
  knobOff: 'translate-x-1',
  knobOn: 'translate-x-6',
  knobGlyph: 'h-2.5 w-2.5',
  checkbox:
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border transition-colors',
  checkboxOff: 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]',
  checkboxOn:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
} as const

/**
 * Tri-state switch styles — one track holding a denied
 * @type {Record<string, string>}
 */

export const TRI_TOGGLE_STYLES = {
  group:
    'inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5',
  slot: 'flex h-6 w-7 items-center justify-center rounded-full text-[var(--color-ink-subtle)] transition-colors',
  slotIdle: 'hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  glyph: 'h-3.5 w-3.5',
  denied: 'bg-[var(--color-danger)] text-[var(--color-on-solid)]',
  inherited: 'bg-[var(--color-neutral)] text-[var(--color-on-solid)]',
  allowed: 'bg-[var(--color-success)] text-[var(--color-on-solid)]',
  disabled: 'pointer-events-none opacity-50',
} as const
