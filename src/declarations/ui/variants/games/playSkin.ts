/**
 * Level badge classes
 * @type {Record<string, string>}
 */

export const LEVEL_BADGE = {
  root: 'relative inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold tabular-nums whitespace-nowrap shadow-[var(--shadow-sm)]',
  // Chip hanging on the corner of an avatar
  corner:
    'absolute! left-1/2 -bottom-1 -translate-x-1/2 px-2.5 py-0.5 text-xs ring-2 ring-[var(--color-surface-raised)]',
} as const

/**
 * Level frame classes, a round portrait inside its laurel
 * @type {Record<string, string>}
 */

export const LEVEL_FRAME_VIEW = {
  root: 'relative inline-grid shrink-0 place-items-center',
  face: '',
  art: 'laurel-art pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible',
} as const
