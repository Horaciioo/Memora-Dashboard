import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { RESULT, SETUP_PINK } from '@/declarations/ui/variants/games/play/shared'

/**
 * Glitch board
 * @type {Record<string, string>}
 */

export const GLITCH_BOARD = {
  board:
    'relative flex size-full flex-col items-center justify-center gap-2 overflow-hidden px-4 pt-24 pb-28 max-md:pb-20 lg:pr-[25rem]',
  figure:
    'play-figure play-figure-glitch text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-glitch-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  // The two pictures, sized on the height left by the HUD
  pictures: 'mt-10 flex w-full items-center justify-center gap-3 max-lg:flex-col max-lg:gap-12',
  divider: '-my-[0.3rem] w-1.5 self-stretch rounded-full bg-[var(--play-glitch)] max-lg:hidden',
  slot: 'relative flex w-[min(calc((100vw-27rem)/2),calc((100dvh-23rem)*1.333))] flex-col items-center max-lg:w-[min(80vw,calc((100dvh-27rem)*1.333))]',
  caption:
    'absolute inset-x-0 bottom-full mb-3 text-center text-xl font-black tracking-widest text-[var(--play-glitch-glow)] uppercase sm:text-2xl',
  picture: 'play-glitch-picture block w-full touch-manipulation select-none',
  pictureOpen: 'cursor-crosshair',
  pictureLocked: 'play-glitch-locked',
  item: 'play-glitch-item',
  // Marks drawn over the pictures
  ring: 'play-glitch-ring',
  ringMissed: 'play-glitch-ring-missed',
  burst: 'play-glitch-burst',
  // Verdict under the pictures
  zone: 'flex min-h-14 w-full flex-col items-center justify-center gap-2',
  locked: 'play-glitch-lockedtext text-sm font-extrabold text-[var(--play-glitch-glow)]',
  reveal:
    'play-hud-block flex max-w-full items-center justify-center gap-4 px-5 py-2 text-center max-md:flex-wrap max-md:gap-2',
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  gain: 'play-glitch-gain text-3xl font-black tabular-nums text-[var(--play-ink-soft)]',
  ribbon:
    'rounded-full bg-[var(--play-glitch)] px-3 py-1 text-[0.7rem] font-extrabold tracking-widest text-white uppercase',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: 'text-xs text-[var(--play-ink-faint)]',
  result: RESULT,
} as const

/**
 * Setup drawer of a new Glitch game
 * @type {PlaySetupStyles}
 */

export const GLITCH_SETUP = setupStyles(SETUP_PINK)
