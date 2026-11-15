import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, PANEL, RESULT, SETUP_TEAL } from '@/declarations/ui/variants/games/play/shared'

/**
 * Echo board
 * @type {Record<string, string>}
 */

export const ECHO_BOARD = {
  board:
    'relative flex min-h-[min(40rem,100dvh)] flex-1 flex-col items-center justify-center gap-4 px-4 pt-28 pb-6',
  figure:
    'play-figure play-figure-echo text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-echo-clock h-full w-full rounded-full',
  lead: 'text-center text-base font-bold text-[var(--play-echo-glow)] sm:text-lg',
  // Center card and own card
  table:
    'play-echo-stage relative flex w-full flex-col items-center justify-center gap-7 sm:flex-row sm:items-start sm:gap-14',
  slot: 'flex w-[min(80vw,27rem,40dvh)] flex-col items-center gap-3',
  caption: 'text-sm font-black tracking-[0.18em] uppercase',
  captionCenter: 'text-[var(--echo-rim-center)]',
  captionMine: 'text-[var(--echo-rim-mine)]',
  // Round card and its symbols
  card: 'play-echo-card relative aspect-square w-full rounded-full',
  cardSmall: 'play-echo-card-small',
  cardCenter: 'play-echo-card-center',
  cardMine: 'play-echo-card-mine',
  symbol:
    'play-echo-symbol absolute aspect-square -translate-x-1/2 -translate-y-1/2 rotate-[var(--angle)] cursor-pointer rounded-full transition-transform enabled:hover:scale-[1.14] enabled:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
  symbolAnswer: 'play-echo-answer',
  art: 'play-echo-art size-full',
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
  result: RESULT,
} as const

/**
 * Setup drawer of a new Echo game
 * @type {PlaySetupStyles}
 */

export const ECHO_SETUP = setupStyles(SETUP_TEAL)
