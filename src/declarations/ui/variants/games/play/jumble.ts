import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, PANEL, SETUP_VIOLET } from '@/declarations/ui/variants/games/play/shared'

/**
 * Jumble board
 * @type {Record<string, string>}
 */

export const JUMBLE_BOARD = {
  board: 'relative flex flex-col items-center gap-6 pb-16 in-[.play-boxfull]:pb-0',
  figure:
    'play-figure play-figure-jumble text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Round line and clock
  head: 'flex w-full max-w-3xl flex-col gap-2',
  round: 'text-center text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-jumble-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  // Tiles and slots
  tiles: 'flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3',
  tile: 'play-jumble-tile w-[clamp(2.4rem,9vw,4.4rem)] text-[clamp(1.4rem,5.6vw,2.7rem)] uppercase',
  tileFlip: 'play-jumble-flip',
  tileWon: 'play-jumble-won',
  tileLost: 'play-jumble-lost',
  slots: 'flex flex-wrap items-end justify-center gap-1.5',
  slot: 'play-jumble-slot w-[clamp(1.3rem,4.2vw,2.2rem)] text-[clamp(1rem,3vw,1.6rem)] leading-tight',
  slotHint: 'play-jumble-slot-hint',
  // Fixed height, the board never jumps between phases
  zone: 'flex min-h-56 w-full flex-col items-center gap-4',
  // Answer field
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-widest text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  shake: 'play-jumble-shake',
  // Reveal banner
  reveal: `${PANEL} flex w-full max-w-md flex-col items-center gap-2 px-5 py-4 text-center`,
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  gain: 'play-jumble-gain text-5xl font-black tabular-nums text-[var(--play-gold)]',
  ribbons: 'flex flex-wrap items-center justify-center gap-2',
  ribbon:
    'rounded-full bg-[var(--play-jumble)] px-3 py-1 text-[0.7rem] font-extrabold tracking-widest text-white uppercase',
  ribbonFlash: 'play-jumble-flash bg-[var(--play-gold)] text-[var(--play-jumble-tile-ink)]',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: NOTE,
  // Scoreboard
  scores: `${PANEL} flex w-full max-w-md flex-col gap-1 p-2`,
  score: 'flex items-center gap-3 rounded-xl px-2 py-1.5 transition-opacity',
  scoreScored: 'play-jumble-scored',
  scoreLeft: 'opacity-50',
  scoreRank: 'w-5 text-center text-xs font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreStreak: 'text-xs font-extrabold tabular-nums text-[var(--play-bomb)]',
  scoreValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  result: 'flex flex-col items-center gap-5',
} as const

/**
 * Setup drawer of a new Jumble game
 * @type {PlaySetupStyles}
 */

export const JUMBLE_SETUP = setupStyles(SETUP_VIOLET)
