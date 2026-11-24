import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, RESULT, SETUP_AMBER } from '@/declarations/ui/variants/games/play/shared'

/**
 * Croquis board
 * @type {Record<string, string>}
 */

export const CROQUIS_BOARD = {
  board:
    'relative flex size-full flex-col items-center justify-center gap-[min(2dvh,1rem)] overflow-hidden px-4 pt-24 pb-28 max-md:pb-20',
  figure:
    'play-figure play-figure-croquis text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Clock bar, shown in the HUD
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
  // Paper sized on the window height, tools beside it
  stage: 'relative w-[min(100%,48rem,calc((100dvh-23rem)*4/3))]',
  paper: 'play-croquis-paper relative w-full overflow-hidden rounded-2xl',
  canvas: 'block aspect-[4/3] w-full touch-none select-none',
  canvasDraw: 'cursor-crosshair',
  blank: 'play-croquis-blank absolute inset-0 grid place-items-center text-sm font-bold',
  tools:
    'play-hud-block z-10 mt-3 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 p-2 xl:absolute xl:inset-x-auto xl:mt-0 xl:w-56 xl:top-1/2 xl:right-full xl:bottom-auto xl:mr-4 xl:-translate-y-1/2 xl:flex-col xl:gap-3 xl:p-3',
  toolPens: 'grid grid-cols-9 gap-1.5 xl:grid-cols-4 xl:justify-items-center',
  toolSizes: 'flex items-center gap-1.5',
  toolShapes:
    'flex flex-wrap items-center justify-center gap-1.5 xl:grid xl:w-full xl:grid-cols-2 *:min-w-0',
  toolActions: 'flex items-center gap-1.5 xl:w-full xl:flex-col xl:items-stretch',
  pen: 'play-croquis-pen size-9 rounded-full xl:size-8',
  penOn: 'play-croquis-pen-on',
  size: 'grid size-9 xl:size-8 place-items-center rounded-xl bg-[var(--play-chip)] transition-colors hover:bg-[var(--play-panel-strong)]',
  sizeOn: 'ring-2 ring-[var(--play-ink-soft)]',
  sizeDot: 'rounded-full bg-[var(--play-ink)]',
  action:
    'rounded-xl bg-[var(--play-chip)] px-2 py-2 text-xs font-extrabold tracking-wide text-[var(--play-ink)] uppercase transition-colors hover:bg-[var(--play-panel-strong)] disabled:opacity-40',
  actionOn: 'ring-2 ring-[var(--play-ink-soft)]',
  // Fixed height, the board never jumps between phases
  zone: 'flex min-h-16 w-full flex-col items-center justify-center gap-3',
  // Answer field
  // Phone: the key under the field, full width
  form: 'flex w-full max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-widest text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  shake: 'play-croquis-shake',
  found: 'play-croquis-found text-2xl font-black text-[var(--play-croquis)]',
  // Reveal banner
  reveal:
    'play-hud-block flex w-full max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-3 text-center',
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  revealWord:
    'play-croquis-gain text-3xl font-black tracking-widest text-[var(--play-ink-soft)] uppercase',
  timeout: 'text-sm font-bold text-[var(--play-ink-soft)]',
  itWas: NOTE,
  result: RESULT,
} as const

/**
 * Setup drawer of a new Croquis game
 * @type {PlaySetupStyles}
 */

export const CROQUIS_SETUP = setupStyles(SETUP_AMBER)
