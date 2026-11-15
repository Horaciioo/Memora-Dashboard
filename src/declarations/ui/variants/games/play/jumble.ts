import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { RESULT, SETUP_VIOLET } from '@/declarations/ui/variants/games/play/shared'

/**
 * Jumble board
 * @type {Record<string, string>}
 */

export const JUMBLE_BOARD = {
  board:
    'relative flex size-full flex-col items-center justify-center gap-[min(2.5dvh,1.5rem)] overflow-hidden px-4 pt-24 pb-28 max-md:pb-20',
  figure:
    'play-figure play-figure-jumble text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-jumble-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  // Tiles and slots
  tiles: 'flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3',
  tile: 'play-jumble-tile w-[clamp(2.2rem,min(8vw,9dvh),4.6rem)] text-[clamp(1.3rem,min(5vw,5.6dvh),2.8rem)] uppercase',
  tileFlip: 'play-jumble-flip',
  tileWon: 'play-jumble-won',
  tileLost: 'play-jumble-lost',
  slots: 'flex flex-wrap items-end justify-center gap-1.5',
  slot: 'play-jumble-slot w-[clamp(1.2rem,min(4.2vw,4.4dvh),2.2rem)] text-[clamp(1rem,min(3vw,3.2dvh),1.6rem)] leading-tight',
  slotHint: 'play-jumble-slot-hint',
  // Fixed height, the board never jumps between phases
  zone: 'flex min-h-[min(14rem,22dvh)] w-full flex-col items-center justify-start gap-4',
  // Answer field
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-widest text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  shake: 'play-jumble-shake',
  // Reveal banner
  reveal:
    'play-hud-block flex max-w-full items-center justify-center gap-4 px-5 py-2 text-center max-md:flex-wrap max-md:gap-2',
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  gain: 'play-jumble-gain text-3xl font-black tabular-nums text-[var(--play-ink-soft)]',
  ribbons: 'flex flex-wrap items-center justify-center gap-2',
  ribbon:
    'rounded-full bg-[var(--play-jumble)] px-3 py-1 text-[0.7rem] font-extrabold tracking-widest text-white uppercase',
  ribbonFlash: 'play-jumble-flash bg-[var(--play-gold)] text-[var(--play-jumble-tile-ink)]',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: 'text-xs text-[var(--play-ink-faint)]',
  result: RESULT,
} as const

/**
 * Setup drawer of a new Jumble game
 * @type {PlaySetupStyles}
 */

export const JUMBLE_SETUP = setupStyles(SETUP_VIOLET)
