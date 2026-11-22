/**
 * Level frame classes, a round portrait inside its laurel
 * @type {Record<string, string>}
 */

export const LEVEL_FRAME_VIEW = {
  root: 'relative inline-grid shrink-0 place-items-center',
  face: '',
  art: 'laurel-art pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible',
} as const
