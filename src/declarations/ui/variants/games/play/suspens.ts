import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { NOTE, PANEL, SETUP_WOOD } from '@/declarations/ui/variants/games/play/shared'

/**
 * Suspens board
 * @type {Record<string, string>}
 */

export const SUSPENS_BOARD = {
  board: 'relative flex flex-col items-center gap-5 pb-16 in-[.play-boxfull]:pb-0',
  figure:
    'play-figure play-figure-suspens text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Round line and clock
  head: 'flex w-full max-w-3xl flex-col gap-2',
  round: 'text-center text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  clockTrack: 'h-3 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  clock: 'play-suspens-clock h-full w-full rounded-full',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  leadStrong: 'text-center text-base font-extrabold text-[var(--play-ink)]',
  // Gallows beside the word
  stage: `${PANEL} flex w-full max-w-3xl flex-col items-center gap-4 p-4 sm:flex-row sm:items-center sm:gap-8 sm:px-8`,
  gallows: 'play-suspens-gallows h-auto w-40 shrink-0 sm:w-52',
  partWood: 'play-suspens-wood',
  partRope: 'play-suspens-rope',
  partBody: 'play-suspens-body',
  partIn: 'play-suspens-part-in',
  eyes: 'play-suspens-eyes',
  side: 'flex min-w-0 flex-1 flex-col items-center gap-4',
  // Word as cells
  word: 'flex flex-wrap items-end justify-center gap-1.5',
  cell: 'play-suspens-cell grid w-[clamp(1.5rem,5.2vw,2.6rem)] place-items-center text-[clamp(1.2rem,4vw,2rem)] leading-tight font-black',
  cellFound: 'play-suspens-cell-found',
  cellSecret: 'play-suspens-cell-secret',
  meta: 'flex flex-wrap items-center justify-center gap-x-4 gap-y-1',
  count: NOTE,
  wrongLabel: 'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  wrongList: 'flex min-h-8 flex-wrap items-center justify-center gap-1.5',
  wrongLetter:
    'play-suspens-wrong grid size-8 place-items-center rounded-lg text-sm font-black text-white',
  // Fixed height, the board never jumps between phases
  zone: 'flex min-h-48 w-full max-w-3xl flex-col items-center gap-4',
  // Letter keys
  keys: 'grid w-full max-w-xl grid-cols-[repeat(auto-fit,minmax(2.5rem,1fr))] gap-1.5',
  key: 'play-suspens-key grid h-11 place-items-center rounded-xl text-base font-black transition-transform enabled:active:scale-95 disabled:cursor-not-allowed',
  keyIdle: 'play-suspens-key-idle',
  keyHit: 'play-suspens-key-hit',
  keyMiss: 'play-suspens-key-miss',
  // Fields: secret word and whole-word guess
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-widest text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  pick: `${PANEL} flex w-full max-w-md flex-col items-center gap-3 p-4`,
  pickActions: 'flex w-full items-center gap-2',
  secret:
    'play-suspens-secret text-3xl font-black tracking-widest text-[var(--play-suspens-glow)] uppercase',
  kicker: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  guess: 'flex w-full max-w-md flex-col items-center gap-1',
  guessHint: NOTE,
  // Reveal banner
  reveal: `${PANEL} flex w-full max-w-md flex-col items-center gap-2 px-5 py-4 text-center`,
  revealName: 'text-sm font-extrabold text-[var(--play-ink)]',
  revealWord:
    'play-suspens-gain text-4xl font-black tracking-widest text-[var(--play-suspens-glow)] uppercase',
  itWas: NOTE,
  // Scoreboard
  scores: `${PANEL} flex w-full max-w-md flex-col gap-1 p-2`,
  score: 'flex items-center gap-3 rounded-xl px-2 py-1.5 transition-opacity',
  scoreOn: 'play-suspens-on',
  scoreLeft: 'opacity-50',
  scoreRank: 'w-5 text-center text-xs font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreState:
    'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-suspens-glow)] uppercase',
  scoreValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  result: 'flex flex-col items-center gap-5',
} as const

/**
 * Setup drawer of a new Suspens game
 * @type {PlaySetupStyles}
 */

export const SUSPENS_SETUP = setupStyles(SETUP_WOOD)
