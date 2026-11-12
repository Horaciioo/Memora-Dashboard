import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, PANEL, SETUP_AMBER } from '@/declarations/ui/variants/games/play/shared'

/**
 * Croquis board
 * @type {Record<string, string>}
 */

export const CROQUIS_BOARD = {
  board: 'relative flex flex-col items-center gap-5 pb-16 in-[.play-boxfull]:pb-0',
  figure:
    'play-figure play-figure-croquis text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Round line and clock
  head: 'flex w-full max-w-3xl flex-col gap-2',
  round: 'text-center text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-croquis-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  // Word line, slots for the guessers and the word itself for the drawer
  word: 'flex min-h-16 w-full max-w-3xl flex-col items-center justify-center gap-1',
  wordKicker: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  wordBig:
    'play-croquis-word text-4xl font-black tracking-widest text-[var(--play-ink)] uppercase sm:text-5xl',
  slots: 'flex flex-wrap items-end justify-center gap-x-5 gap-y-2',
  slotGroup: 'flex items-end gap-1.5',
  slot: 'play-croquis-slot w-[clamp(1.3rem,4.2vw,2.2rem)] text-[clamp(1rem,3vw,1.6rem)] leading-tight',
  slotHint: 'play-croquis-slot-hint',
  // Paper and its tools
  stage: 'flex w-full max-w-3xl flex-col gap-3',
  paper: 'play-croquis-paper relative w-full overflow-hidden rounded-2xl',
  canvas: 'block aspect-[4/3] w-full touch-none select-none',
  canvasDraw: 'cursor-crosshair',
  blank: 'play-croquis-blank absolute inset-0 grid place-items-center text-sm font-bold',
  tools: `${PANEL} flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-2`,
  toolGroup: 'flex items-center gap-1.5',
  pen: 'play-croquis-pen size-8 rounded-full',
  penOn: 'play-croquis-pen-on',
  size: 'grid size-9 place-items-center rounded-xl bg-[var(--play-chip)] transition-colors hover:bg-[var(--play-panel-strong)]',
  sizeOn: 'ring-2 ring-[var(--play-croquis)]',
  sizeDot: 'rounded-full bg-[var(--play-ink)]',
  action:
    'rounded-xl bg-[var(--play-chip)] px-3 py-2 text-xs font-extrabold tracking-wide text-[var(--play-ink)] uppercase transition-colors hover:bg-[var(--play-panel-strong)] disabled:opacity-40',
  actionOn: 'ring-2 ring-[var(--play-croquis)]',
  // Fixed height, the board never jumps between phases
  zone: 'flex min-h-40 w-full flex-col items-center gap-4',
  // Answer field
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-widest text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  shake: 'play-croquis-shake',
  found: 'play-croquis-found text-2xl font-black text-[var(--play-croquis)]',
  // Reveal banner
  reveal: `${PANEL} flex w-full max-w-md flex-col items-center gap-2 px-5 py-4 text-center`,
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  revealWord:
    'play-croquis-gain text-4xl font-black tracking-widest text-[var(--play-croquis)] uppercase',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: NOTE,
  // Scoreboard
  scores: `${PANEL} flex w-full max-w-md flex-col gap-1 p-2`,
  score: 'flex items-center gap-3 rounded-xl px-2 py-1.5 transition-opacity',
  scoreScored: 'play-croquis-scored',
  scoreLeft: 'opacity-50',
  scoreRank: 'w-5 text-center text-xs font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreState: 'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-croquis)] uppercase',
  scoreValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  result: 'flex flex-col items-center gap-5',
} as const

/**
 * Setup drawer of a new Croquis game
 * @type {PlaySetupStyles}
 */

export const CROQUIS_SETUP = setupStyles(SETUP_AMBER)
