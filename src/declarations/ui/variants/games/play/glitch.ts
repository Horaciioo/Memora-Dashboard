import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, PANEL, SETUP_PINK } from '@/declarations/ui/variants/games/play/shared'

/**
 * Glitch board
 * @type {Record<string, string>}
 */

export const GLITCH_BOARD = {
  board: 'relative flex flex-col items-center gap-5 pb-16 in-[.play-boxfull]:pb-0',
  figure:
    'play-figure play-figure-glitch text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Round line and clock
  head: 'flex w-full max-w-3xl flex-col gap-2',
  round: 'text-center text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-glitch-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  // Progress of the viewer: one pip per difference
  pips: 'flex items-center justify-center gap-1.5',
  pip: 'play-glitch-pip size-3 rounded-full bg-[var(--play-chip)] transition-colors',
  pipOn: 'bg-[var(--play-gold)]',
  pipText: 'ml-2 text-xs font-extrabold tabular-nums text-[var(--play-ink-soft)]',
  // The two pictures, side by side when there is room
  pictures:
    'flex w-full max-w-6xl flex-col items-center justify-center gap-4 lg:flex-row lg:items-start lg:gap-6',
  slot: 'flex w-full max-w-xl flex-col items-center gap-2 lg:flex-1',
  caption: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  picture: 'play-glitch-picture block w-full touch-manipulation select-none',
  pictureOpen: 'cursor-crosshair',
  pictureLocked: 'play-glitch-locked',
  item: 'play-glitch-item',
  // Marks drawn over the pictures
  ring: 'play-glitch-ring',
  ringMissed: 'play-glitch-ring-missed',
  burst: 'play-glitch-burst',
  // Verdict under the pictures
  zone: 'flex min-h-24 w-full flex-col items-center gap-3',
  locked: 'play-glitch-lockedtext text-sm font-extrabold text-[var(--play-glitch-glow)]',
  reveal: `${PANEL} flex w-full max-w-md flex-col items-center gap-2 px-5 py-4 text-center`,
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  gain: 'play-glitch-gain text-5xl font-black tabular-nums text-[var(--play-gold)]',
  ribbon:
    'rounded-full bg-[var(--play-glitch)] px-3 py-1 text-[0.7rem] font-extrabold tracking-widest text-white uppercase',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: NOTE,
  // Scoreboard
  scores: `${PANEL} flex w-full max-w-md flex-col gap-1 p-2`,
  score: 'flex items-center gap-3 rounded-xl px-2 py-1.5 transition-opacity',
  scoreScored: 'play-glitch-scored',
  scoreLeft: 'opacity-50',
  scoreRank: 'w-5 text-center text-xs font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreFound: 'text-xs font-extrabold tabular-nums text-[var(--play-ink-soft)]',
  scoreDone: 'text-xs font-extrabold tabular-nums text-[var(--play-gold)]',
  scoreValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  result: 'flex flex-col items-center gap-5',
} as const

/**
 * Setup drawer of a new Glitch game
 * @type {PlaySetupStyles}
 */

export const GLITCH_SETUP = setupStyles(SETUP_PINK)
