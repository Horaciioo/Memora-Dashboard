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
 * Level frame classes, the portrait cut as a hexagon inside its ornaments
 * @type {Record<string, string>}
 */

export const LEVEL_FRAME_VIEW = {
  root: 'relative inline-grid shrink-0 place-items-center',
  // Regular hexagon, points up and down
  face: 'rounded-none [clip-path:polygon(50%_0,93.3%_25%,93.3%_75%,50%_100%,6.7%_75%,6.7%_25%)]',
  art: 'pointer-events-none absolute inset-0 size-full overflow-visible',
} as const
