/**
 * Live presence styles
 * @type {Record<string, string>}
 */

export const PRESENCE_STYLES = {
  stack: 'mr-1 flex items-center -space-x-1.5',
  seat: 'relative inline-flex rounded-full transition-opacity hover:z-10 focus-visible:z-10',
  seatJump:
    'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-600)]',
  // Cut out of the bar colour
  avatar: 'ring-2 ring-[var(--color-page)]',
  active: '',
  idle: 'opacity-55',
  left: 'opacity-35 grayscale',
  // Socket lost, nothing is sure
  uncertain: 'opacity-45 grayscale-[60%]',
  more: 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-subtle)]',
  down: 'mr-1 inline-flex size-8 items-center justify-center text-[var(--color-ink-subtle)]',
  downGlyph: 'size-4',
  // Spot a collaborator stands on
  flash: 'rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] transition-colors',
} as const

/**
 * Collaborator caret styles
 * @type {Record<string, string>}
 */

export const PEER_CARET_STYLES = {
  layer: 'pointer-events-none absolute inset-0 z-10 overflow-visible',
  // Glides between positions, never jumps
  caret:
    'absolute top-0 left-0 transition-transform duration-150 ease-out will-change-transform motion-reduce:transition-none',
  line: 'absolute top-0 -left-px w-0.5 rounded-full bg-[var(--caret-tint)]',
  face: '!absolute -top-7 -left-3 !size-6 shadow-[var(--shadow-sm)] ring-2 ring-[var(--caret-tint)]',
} as const
