import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, PANEL, SETUP_TEAL } from '@/declarations/ui/variants/games/play/shared'

/**
 * Echo board
 * @type {Record<string, string>}
 */

export const ECHO_BOARD = {
  board: 'relative flex flex-col items-center gap-6 pb-16 in-[.play-boxfull]:pb-0',
  figure:
    'play-figure play-figure-echo text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Round line and clock
  head: 'flex w-full max-w-3xl flex-col gap-2',
  round: 'text-center text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-echo-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  // Center card and own card
  table:
    'flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:items-start sm:gap-10',
  slot: 'flex w-[min(78vw,21rem)] flex-col items-center gap-2',
  caption: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  // Round card and its symbols
  card: 'play-echo-card relative aspect-square w-full rounded-full',
  cardSmall: 'play-echo-card-small',
  symbol:
    'play-echo-symbol absolute aspect-square -translate-x-1/2 -translate-y-1/2 rotate-[var(--angle)] cursor-pointer rounded-full transition-transform enabled:hover:scale-110 enabled:active:scale-95 disabled:cursor-not-allowed',
  symbolAnswer: 'play-echo-answer',
  art: 'size-full',
  // Other hands
  hands: 'flex w-full max-w-3xl flex-wrap items-start justify-center gap-4',
  hand: 'flex w-24 flex-col items-center gap-1 transition-opacity sm:w-28',
  handDone: 'opacity-60',
  handName:
    'flex w-full items-center justify-center gap-1 text-xs font-bold text-[var(--play-ink)]',
  // Reveal banner
  reveal: `${PANEL} flex w-full max-w-md flex-col items-center gap-2 px-5 py-4 text-center`,
  revealArt: 'size-14',
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  gain: 'play-echo-gain text-5xl font-black tabular-nums text-[var(--play-gold)]',
  ribbon:
    'rounded-full bg-[var(--play-echo)] px-3 py-1 text-[0.7rem] font-extrabold tracking-widest text-white uppercase',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: NOTE,
  // Scoreboard
  scores: `${PANEL} flex w-full max-w-md flex-col gap-1 p-2`,
  score: 'flex items-center gap-3 rounded-xl px-2 py-1.5 transition-opacity',
  scoreScored: 'play-echo-scored',
  scoreLeft: 'opacity-50',
  scoreRank: 'w-5 text-center text-xs font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreGain: 'text-xs font-extrabold tabular-nums text-[var(--play-gold)]',
  scoreValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  result: 'flex flex-col items-center gap-5',
} as const

/**
 * Setup drawer of a new Echo game
 * @type {PlaySetupStyles}
 */

export const ECHO_SETUP = setupStyles(SETUP_TEAL)
