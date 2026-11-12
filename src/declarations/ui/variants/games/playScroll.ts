/**
 * Scroll title and its box
 * @type {Record<string, string>}
 */

export const PLAY_SCROLL = {
  root: 'play-scroll flex w-full flex-col',
  ribbon: 'play-ribbon',
  tail: 'play-ribbon-tail',
  tailLeft: 'play-ribbon-tail-left',
  tailRight: 'play-ribbon-tail-right',
  tailBody: 'play-ribbon-tail-body',
  tailBack: 'play-ribbon-tail-back',
  tailLip: 'play-ribbon-tail-lip',
  plate: 'play-ribbon-plate',
  title: 'play-ribbon-text text-2xl sm:text-3xl',
  box: 'play-scroll-box flex flex-col gap-4',
} as const

/**
 * Medal sizes
 * @type {Record<string, string>}
 */

export const PLAY_MEDAL = {
  base: 'play-medal',
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-14',
} as const
