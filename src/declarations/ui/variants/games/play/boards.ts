import { PROPERTY_LABEL, PROPERTY_SPACING } from '@/declarations/ui/variants/controls'
import {
  LIFT,
  NOTE,
  PANEL,
  SETUP_BLUE,
  SETUP_FIRE,
  SETUP_TILE,
} from '@/declarations/ui/variants/games/play/shared'

/**
 * Baccalaureat board, phase by phase
 * @type {Record<string, string>}
 */

export const BAC_BOARD = {
  // Phase on screen, rising in
  board: 'play-phase flex flex-col gap-5',
  // Header: round, letter, clock
  bar: 'grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl bg-[var(--play-chip)] p-3 sm:p-4',
  roundBlock: 'flex min-w-0 flex-col gap-1.5',
  roundLabel:
    'text-[0.7rem] font-extrabold tracking-[0.25em] text-[var(--play-ink-faint)] uppercase',
  roundFigure:
    'flex items-baseline gap-1.5 text-5xl leading-none font-black tabular-nums text-[var(--play-ink)] sm:text-6xl',
  roundTotal: 'text-lg font-extrabold text-[var(--play-ink-faint)]',
  pips: 'flex flex-wrap gap-1',
  pip: 'h-1.5 w-3 rounded-full bg-[var(--play-line)]',
  pipDone: 'bg-[var(--play-baccalaureat)] opacity-50',
  pipNow: 'bg-[var(--play-baccalaureat)]',
  // Letter tile, bright blue
  letter:
    'play-tick grid size-24 place-items-center rounded-3xl bg-gradient-to-b from-[var(--play-baccalaureat-glow)] to-[var(--play-baccalaureat)] text-7xl leading-none font-black text-white shadow-[0_0.4rem_0_var(--play-baccalaureat-deep)] [text-shadow:0_2px_0_rgb(0_0_0/0.18)] sm:size-28 sm:text-8xl',
  letterHidden:
    'from-[var(--play-panel-strong)] to-[var(--play-chip)] text-[var(--play-ink-faint)]',
  // Clock ring, the number inside
  clockSlot: 'flex items-center justify-end',
  clock: 'relative grid size-20 place-items-center sm:size-24',
  clockSvg: 'absolute inset-0 size-full -rotate-90',
  clockTrack: 'stroke-[var(--play-line)]',
  clockBar:
    'stroke-[var(--play-baccalaureat)] transition-[stroke-dashoffset] duration-1000 ease-linear',
  clockBarLow: 'stroke-[var(--color-danger)]',
  clockNumber: 'relative text-3xl font-black tabular-nums text-[var(--play-ink)] sm:text-4xl',
  clockLow: 'text-[var(--color-danger)]',
  // Countdown in place of the board, no veil behind
  inline: 'grid min-h-[50vh] place-items-center',
  // Spectator waiting for the words
  wait: 'grid min-h-[40vh] place-content-center justify-items-center gap-2 text-center',
  waitLead: 'text-xl font-extrabold text-[var(--play-ink)]',
  waitNote: 'text-sm font-semibold text-[var(--play-ink-soft)]',
  // Countdown over the whole screen, chat and keys included, the veil fading in
  overlay: 'play-count fixed inset-0 z-[60] grid place-items-center',
  stage: 'relative flex flex-col items-center justify-center gap-6 text-center',
  // Glow ring pulsing behind each number
  halo: 'play-halo pointer-events-none absolute top-1/2 left-1/2 size-[min(70vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full',
  stageLead:
    'relative rounded-full bg-[rgb(0_0_0/0.35)] px-5 py-2 text-sm font-extrabold tracking-[0.3em] text-white uppercase',
  figure:
    'play-figure play-figure-blue text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Someone called stop: their face, then the word, in place of the clock
  stop: 'flex items-center justify-end gap-2',
  stopWord:
    'play-stop text-3xl leading-none font-extrabold tracking-tight text-[var(--color-danger)] sm:text-5xl',
  // Writing form
  fields: 'grid gap-3 sm:grid-cols-2',
  field:
    'flex items-center gap-3 rounded-2xl bg-[var(--play-chip)] p-3 transition-shadow focus-within:shadow-[0_0_0_2px_var(--play-baccalaureat)]',
  fieldIndex:
    'grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--play-panel-strong)] text-sm font-black text-[var(--play-ink-faint)]',
  fieldDone: 'bg-[var(--play-baccalaureat)] text-white',
  fieldIcon: 'size-5',
  fieldBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  fieldLabel:
    'text-[0.7rem] leading-tight font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  input:
    'w-full bg-transparent text-lg font-extrabold text-[var(--play-ink)] placeholder:text-base placeholder:font-normal placeholder:text-[var(--play-ink-faint)] focus:outline-none',
  actions: 'flex flex-wrap items-center justify-center gap-3',
  // Line at the bottom, like the Bomb Party hint
  lead: 'text-center text-sm font-semibold text-[var(--play-ink-soft)]',
  leadStrong: 'text-[var(--play-ink)]',
  // Votes and scored words, one card per word
  categories: 'flex flex-col gap-5',
  category: 'flex flex-col gap-2',
  categoryName: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  answers: 'grid gap-2 sm:grid-cols-2',
  card: 'flex items-center gap-3 rounded-2xl bg-[var(--play-chip)] p-2.5',
  cardFace: 'flex shrink-0 flex-col items-center gap-1',
  cardBody: 'flex min-w-0 flex-1 flex-col',
  cardName: 'truncate text-[0.7rem] font-bold text-[var(--play-ink-faint)]',
  cardWord: 'truncate text-base font-extrabold text-[var(--play-ink)]',
  cardWordOff: 'line-through opacity-50',
  cardEmpty: 'text-sm italic text-[var(--play-ink-faint)]',
  cardTag: 'truncate text-[0.7rem] font-bold text-[var(--play-ink-soft)]',
  // Who voted for or against
  voters: 'mt-1 flex flex-wrap items-center gap-y-1',
  voterGroup:
    'flex items-center gap-1 not-first:ml-2 not-first:border-l not-first:border-[var(--play-ink)]/20 not-first:pl-2',
  voterMark: 'grid size-4 place-items-center rounded-full',
  voterIcon: 'size-2.5',
  // Check or cross under the avatar
  verdict: 'grid size-6 place-items-center rounded-full',
  verdictYes: 'bg-[var(--color-success)] text-white',
  verdictNo: 'bg-[var(--color-danger)] text-white',
  verdictNone: 'bg-[var(--play-panel-strong)] text-[var(--play-ink-faint)]',
  verdictIcon: 'size-3.5',
  // Ballot buttons, then the locked vote
  ballots: 'flex shrink-0 items-center gap-1.5',
  ballot:
    'grid size-9 place-items-center rounded-full bg-[var(--play-panel-strong)] text-[var(--play-ink-soft)] transition-transform hover:scale-110 disabled:opacity-50',
  ballotYes: 'hover:bg-[var(--color-success)] hover:text-white',
  ballotNo: 'hover:bg-[var(--color-danger)] hover:text-white',
  ballotOnYes: 'bg-[var(--color-success)] text-white',
  ballotOnNo: 'bg-[var(--color-danger)] text-white',
  ballotOff: 'opacity-35 grayscale',
  ballotIcon: 'size-5',
  points:
    'shrink-0 rounded-full bg-[var(--play-baccalaureat)] px-2.5 py-1 text-sm font-black tabular-nums text-white',
  pointsNone: 'bg-[var(--play-panel-strong)] text-[var(--play-ink-faint)]',
  // Scores, a reward moment
  scores: 'flex flex-col gap-4',
  hero: 'flex flex-col items-center gap-2 py-2 text-center',
  heroFace: 'play-pop relative',
  heroCrown: 'absolute -top-6 left-1/2 size-7 -translate-x-1/2 text-[var(--play-gold-ink)]',
  heroTitle: 'text-xl font-black tracking-tight text-[var(--play-ink)] sm:text-2xl',
  heroPoints: 'text-[var(--play-baccalaureat)]',
  scoreList: 'flex flex-col gap-2',
  scoreRow: 'play-score-row relative flex items-center gap-3 overflow-hidden rounded-2xl p-3',
  scoreRowPlain: 'bg-[var(--play-chip)]',
  // Filled boxes, gold then silver then bronze
  scoreRowMedals: [
    'bg-[var(--play-medal-gold)] [--play-ink:var(--play-medal-ink)] [--play-ink-faint:var(--play-medal-ink)]',
    'bg-[var(--play-medal-silver)] [--play-ink:var(--play-medal-ink)] [--play-ink-faint:var(--play-medal-ink)]',
    'bg-[var(--play-medal-bronze)] [--play-ink:var(--play-medal-ink)] [--play-ink-faint:var(--play-medal-ink)]',
  ],
  scoreBarMedal: 'bg-white/30',
  scoreBar: 'play-score-bar absolute inset-0 origin-left',
  scoreBarPlain: 'bg-[color-mix(in_srgb,var(--play-baccalaureat)_22%,transparent)]',
  scoreRank:
    'relative w-6 text-center text-sm font-black tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'relative min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreGain:
    'play-pop relative rounded-full bg-[var(--play-baccalaureat)] px-2.5 py-1 text-sm font-black tabular-nums text-white',
  scoreSum: 'relative flex items-center gap-2.5',
  scoreDivider: 'h-7 w-0.5 rounded-full bg-[var(--play-ink)] opacity-30',
  scoreTotal: 'relative min-w-12 text-left text-2xl font-black tabular-nums text-[var(--play-ink)]',
  // Final ranking under the podium
  ranks: 'flex flex-col gap-2',
  rank: `${PANEL} flex items-center gap-3 px-3 py-2.5`,
  rankIndex: 'w-6 text-center text-sm font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  rankName: 'min-w-0 flex-1 truncate text-sm font-extrabold',
  rankPoints: 'text-sm font-extrabold tabular-nums text-[var(--play-ink)]',
  // Podium, first place in the middle
  podium: 'relative flex items-end justify-center gap-3 pt-10 sm:gap-5',
  podiumPlace: 'flex w-24 flex-col items-center gap-2 sm:w-32',
  podiumFace: 'relative flex flex-col items-center gap-1',
  podiumCrown: 'absolute -top-7 size-7 text-[var(--play-gold-ink)]',
  podiumName: 'w-full truncate text-center text-sm font-extrabold',
  podiumPoints: NOTE,
  podiumBlock:
    'flex w-full items-start justify-center rounded-t-2xl pt-3 text-3xl font-extrabold tabular-nums text-[var(--play-night)]',
  highlights: 'grid gap-3 sm:grid-cols-2',
  highlight: `${PANEL} flex flex-col gap-1 p-3`,
} as const

/**
 * Bomb Party board: letters column, the bomb ringed by its players
 * @type {Record<string, string>}
 */

/**
 * Row of lives shared by the games: hearts that pop when won and empty when lost
 * @type {Record<string, string>}
 */

export const PLAY_HEARTS = {
  hearts: 'relative flex items-center gap-0.5',
  heartsMax: 'play-hearts-max',
  heartCell: 'relative grid',
  heartShine: 'play-heart-shine',
  heartGain: 'play-heart-gain',
  heartLose: 'play-heart-lose',
  heartBurst: 'play-heart-burst',
  heartTag: 'play-heart-tag',
  heart: 'size-6 drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]',
  heartOn: 'text-[var(--play-heart)]',
  heartOff: 'text-[var(--play-ink-faint)] opacity-50',
  // Small row under a golf bumper
  heartsSmall: 'pointer-events-none select-none',
  heartSmall: 'size-4 drop-shadow-[0_1px_2px_rgb(0_0_0/0.35)]',
}

export const BOMB_BOARD = {
  board: 'relative grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]',
  figure:
    'play-figure play-figure-fire text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Bonus letters, a column on the left
  letters: 'flex gap-1 max-sm:flex-wrap max-sm:justify-center sm:flex-col',
  letter:
    'grid size-7 place-items-center rounded-lg bg-[var(--play-chip)] text-xs font-extrabold transition-opacity duration-[var(--motion-duration-fast)]',
  letterFree: 'text-[var(--play-ink)]',
  // Used: struck through and faded
  letterUsed:
    'text-[var(--play-ink-faint)] line-through decoration-2 decoration-[var(--play-bomb)] opacity-45',
  // Clear of the dock at the bottom
  stage: 'flex min-w-0 flex-col items-center gap-4 pb-16 in-[.play-boxfull]:pb-0',
  // Square table, seats on an orbit
  table: 'play-bomb-table relative aspect-square w-full max-w-[min(34rem,60dvh)]',
  center: 'absolute top-1/2 left-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2',
  bomb: 'play-bomb',
  bombBlast: 'play-bomb-blast',
  bombArt: 'block h-auto w-full',
  bombTremble: 'play-bomb-tremble',
  heatTint: 'play-bomb-heat',
  sparkGrow: 'play-bomb-spark-grow',
  shockwave: 'play-bomb-shockwave',
  debris: 'play-bomb-debris',
  prompt:
    'absolute top-[59%] left-[48%] -translate-x-1/2 -translate-y-1/2 text-[clamp(1.5rem,6cqi,3rem)] leading-none font-black tracking-wider text-[var(--play-on-art)] uppercase',
  spark: 'play-bomb-spark',
  arrow: 'play-bomb-arrow',
  seat: 'play-bomb-seat flex w-28 flex-col items-center gap-1 text-center transition-opacity duration-[var(--motion-duration-panel)]',
  seatTurn: 'play-bomb-seat-turn',
  seatOut: 'opacity-40 grayscale',
  seatBlast: 'play-bomb-shake play-bomb-hit',
  seatNote: NOTE,
  ...PLAY_HEARTS,
  // Live typing under the player on turn
  draft:
    'max-w-36 truncate rounded-lg bg-[var(--play-chip)] px-2 py-0.5 text-sm font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  draftMiss: 'text-[var(--color-danger)] line-through',
  // Last word a player got through, kept until the next one
  lastWord:
    'max-w-36 truncate rounded-lg bg-[var(--play-chip)] px-2 py-0.5 text-sm font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  missReason: 'text-[0.7rem] font-bold text-[var(--color-danger)]',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  leadPrompt: 'font-black tracking-wider text-[var(--play-bomb-glow)] uppercase',
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-wide text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  // Final screen
  result: 'flex flex-col items-center gap-5',
} as const

// Idle chip of a difficulty, faded; picked one raised
const LEVEL_CHIP =
  'min-h-11 rounded-[var(--radius-md)] px-3.5 text-sm font-semibold tabular-nums transition-[opacity,box-shadow] duration-[var(--motion-duration-fast)]'

/**
 * Setup chip of a Bomb Party difficulty
 * @param {string} colour - Fill and ink classes
 * @param {string} raised - Shadow of the picked chip
 * @return {{ idle: string, on: string }} - Classes
 */

const levelChip = (colour: string, raised: string) => ({
  idle: `${LEVEL_CHIP} ${colour} opacity-55 hover:opacity-90`,
  on: `${LEVEL_CHIP} ${colour} opacity-100 ${raised}`,
})

/**
 * Colour of each Bomb Party difficulty button
 * @type {Record<string, { idle: string, on: string }>}
 */

export const BOMB_LEVEL_CHIPS = {
  beginner: levelChip(
    'bg-[var(--play-level-beginner)] text-[var(--play-level-light-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-beginner)_55%,black)]'
  ),
  easy: levelChip(
    'bg-[var(--play-level-easy)] text-[var(--play-level-light-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-easy)_55%,black)]'
  ),
  medium: levelChip(
    'bg-[var(--play-level-medium)] text-[var(--play-level-dark-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-medium)_55%,black)]'
  ),
  hard: levelChip(
    'bg-[var(--play-level-hard)] text-[var(--play-level-dark-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-hard)_55%,black)]'
  ),
  extreme: levelChip(
    'bg-[var(--play-level-extreme)] text-[var(--play-level-light-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-extreme)_55%,black)]'
  ),
} as const

/**
 * Podium block by place
 * @type {Record<number, string>}
 */

export const BAC_PODIUM_BLOCKS: Record<number, string> = {
  1: 'h-32 bg-[var(--play-medal-first)]',
  2: 'h-24 bg-[var(--play-medal-second)]',
  3: 'h-16 bg-[var(--play-medal-third)]',
}

/**
 * Confetti falling over the podium
 * @type {Record<string, string>}
 */

export const PLAY_CONFETTI_UI = {
  layer: 'pointer-events-none fixed inset-0 z-30 overflow-hidden',
  piece: 'play-confetti absolute top-0 block',
} as const

/**
 * End of a game: replay, new game and hub under the result
 * @type {Record<string, string>}
 */

export const PLAY_END = {
  bar: 'flex flex-wrap items-center justify-center gap-2 px-4 pb-4',
  count: 'w-full text-center text-sm font-semibold text-[var(--play-ink-soft,inherit)] opacity-80',
  action: 'gap-2 px-4! py-2.5! text-sm!',
} as const

/**
 * Session page of a running game: the table, and a column flush right holding crowd, chat and feed
 * @type {Record<string, string>}
 */

export const BAC_SESSION = {
  page: 'relative w-full pb-6 transition-[padding] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  pageOpen: 'lg:pr-[calc(var(--play-side-open)+1.5rem)]',
  pageFolded: 'lg:pr-[calc(var(--play-side-folded)+1.5rem)]',
  // Table alone on the screen, the side column slides over it from the right
  pageFull: 'play-room fixed inset-0 z-50 overflow-hidden p-0!',
  main: 'flex min-w-0 flex-col gap-4',
  mainFull: 'h-full gap-0',
  // Empty marker carrying the game ground into the full screen room
  groundMark: 'hidden',
  // Chat open beside the table, never over it on wide screens
  mainBeside:
    'transition-[padding] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] lg:pr-[min(var(--play-side-open),100vw)] motion-reduce:transition-none',
  // Way out on the left, game identity on the right
  top: 'flex items-center justify-between gap-3',
  exits: 'flex flex-wrap items-center gap-2',
  exit: 'gap-2 px-3.5! py-2! text-sm!',
  exitIcon: 'size-4',
  identity: 'flex items-center gap-3',
  titles: 'flex min-w-0 flex-col items-end',
  title: 'truncate text-lg font-extrabold tracking-tight text-[var(--play-ink)]',
  logo: 'size-14',
  // Full screen table scrolls when taller than the screen
  boxFull: 'play-boxfull flex min-h-0 flex-1 flex-col overflow-y-auto',
  // Same panel as the page so the ink stays readable, content centred as one group, dock margin dropped
  boxFullPad: `${PANEL} ${LIFT} m-4 mt-20 gap-5 p-5 sm:m-6 sm:mt-24 sm:p-6 *:first:mt-auto *:last:mb-auto *:pb-0!`,
  // No panel on a phone: the table runs edge to edge, centred as one group
  boxFullBare: '*:first:mt-auto *:last:mb-auto',
  // Stage keys: in the top bar, then floating over the table, shifted by the open chat
  keys: 'flex items-center gap-2',
  keysFull:
    'fixed top-8 right-8 z-50 sm:top-10 sm:right-10 transition-[right] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Inside the table's top corner, left of the open chat
  keysShifted:
    'right-[calc(min(var(--play-side-open),100vw)+2rem)] sm:right-[calc(min(var(--play-side-open),100vw)+2.5rem)]',
  keysIcon: 'size-5',
  exitKey: 'play-key play-key-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-bold',
  keyButton: 'px-3! py-2!',
  // Sound card hanging under the sound key
  keyHolder: 'relative',
  volumeCard:
    'absolute top-full right-0 z-10 mt-2 flex w-64 max-w-[calc(100vw-1.5rem)] flex-col gap-1 rounded-[var(--radius-md)] bg-[var(--play-panel,var(--color-surface))] p-3 shadow-lg ring-1 ring-[var(--play-line,var(--color-border))]',
  // Game menu card hanging under the menu key, one row per way out
  menuCard:
    'absolute top-full right-0 z-10 mt-2 flex w-64 max-w-[calc(100vw-1.5rem)] flex-col gap-1 rounded-[var(--radius-md)] bg-[var(--play-panel,var(--color-surface))] p-2 shadow-lg ring-1 ring-[var(--play-line,var(--color-border))]',
  menuRow:
    'flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-sm font-bold text-[var(--play-ink)] transition-colors hover:bg-black/5',
  box: `${PANEL} ${LIFT} flex flex-col gap-5 p-5 sm:p-6`,
  // Column flush against the right edge, under the shell bar
  side: 'mt-4 flex min-w-0 flex-col gap-3 lg:fixed lg:top-[var(--play-bar-h)] lg:right-0 lg:bottom-0 lg:z-40 lg:mt-0 lg:pb-28',
  sideOpen: 'lg:w-[var(--play-side-open)]',
  // Level with the table, its height and no dock room
  sideSpan: 'lg:pb-0!',
  sideFolded: 'lg:w-[var(--play-side-folded)]',
  // Full screen: flush right over the table, slides in and out
  sideFull:
    'fixed right-0 z-40 mt-0 w-[min(var(--play-side-open),100vw)]! transition-transform duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Same top and foot as the padded table
  sideFullPad: 'top-4! bottom-4! pb-0! sm:top-6! sm:bottom-6!',
  // Golf course edge to edge, the column too
  sideFullBleed: 'top-0! bottom-0! pb-6!',
  sideShown: 'translate-x-0',
  sideHidden: 'pointer-events-none translate-x-full',
  // Crowd window: players, then spectators when there are some
  crowd: `${PANEL} ${LIFT} flex shrink-0 flex-col gap-3 p-4 lg:rounded-r-none`,
  group: 'flex min-w-0 flex-col gap-2',
  groupTitle: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  stack: 'flex flex-wrap items-center -space-x-2.5',
  stacked: 'rounded-full ring-2 ring-[var(--play-ring)]',
  faceAway: 'opacity-40 grayscale',
  empty: 'text-sm italic text-[var(--play-ink-faint)]',
  fold: 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  foldIcon: 'size-5',
  // Avatars in a row, done or still writing
  progress: 'flex flex-wrap items-center justify-center gap-5',
  progressItem: 'relative',
  badge:
    'absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full ring-2 ring-[var(--play-ring)]',
  badgeDone: 'bg-[var(--play-baccalaureat)] text-[var(--play-on-art)]',
  badgeWriting: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)]',
  badgeIcon: 'size-3.5',
  // Feed of the session, under the chat
  feedBox: `${PANEL} ${LIFT} flex max-h-60 min-h-0 shrink-0 flex-col gap-3 p-4 lg:rounded-r-none`,
  feedTitle: 'text-sm font-extrabold tracking-wide uppercase',
  feed: 'flex min-h-0 flex-col gap-1 overflow-y-auto',
  feedLine: 'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[var(--play-ink)]',
  feedName: 'font-extrabold',
  feedText: 'min-w-0 flex-1 text-[var(--play-ink-soft)]',
  feedTime: 'text-[0.7rem] font-semibold tabular-nums text-[var(--play-ink-faint)]',
  feedMark:
    'grid size-6 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-blue-ink)]',
  feedMarkIcon: 'size-3.5',
  // Folded side: one button on the right edge
  rail: `${PANEL} ${LIFT} flex items-center justify-center p-2 lg:rounded-r-none`,
} as const

/**
 * Setup drawer classes, picked in one colour
 * @param {string} picked - Picked tile class
 * @return {Record<string, string>} - Classes
 */

export const setupStyles = (picked: string) =>
  ({
    body: `flex flex-col ${PROPERTY_SPACING.rows}`,
    head: 'flex items-center justify-between gap-4',
    // Label left, switch right
    switchRow: 'flex min-h-11 items-center justify-between gap-4',
    switchLabel: 'text-sm font-medium text-[var(--color-ink)]',
    count: 'shrink-0 text-sm font-bold tabular-nums text-[var(--color-ink-subtle)]',
    value: 'text-sm font-semibold text-[var(--color-ink)]',
    letters: 'flex flex-wrap gap-1.5',
    // Unchecked greyed, checked in colour, white letter both ways
    letter:
      'grid size-9 place-items-center rounded-[var(--radius-md)] border border-transparent bg-[var(--color-border-strong)] text-sm font-semibold text-white transition-colors hover:brightness-95',
    letterOn: picked,
    quick: 'flex gap-2',
    quickButton:
      'rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
    // Preset chips
    chips: 'flex flex-wrap gap-2',
    chip: `${SETUP_TILE} min-h-11 px-3.5 text-sm font-semibold tabular-nums`,
    chipOn: picked,
    // Stepper
    stepper: 'flex items-center gap-3',
    step: `${SETUP_TILE} grid size-11 place-items-center disabled:pointer-events-none disabled:opacity-40`,
    stepIcon: 'size-4',
    stepValue: 'min-w-10 text-center text-xl font-bold tabular-nums text-[var(--color-ink)]',
    // Choice cards
    cards: 'grid grid-cols-2 gap-3',
    card: `${SETUP_TILE} flex flex-col items-start gap-0.5 px-3.5 py-2.5 text-left`,
    cardOn: picked,
    cardTitle: 'text-sm font-semibold',
    cardNote: 'text-xs opacity-70',
  }) as const

export type PlaySetupStyles = ReturnType<typeof setupStyles>

/**
 * Setup drawer of a new Baccalaureat game
 * @type {PlaySetupStyles}
 */

export const BAC_SETUP = setupStyles(SETUP_BLUE)

/**
 * Setup drawer of a new Bomb Party game
 * @type {PlaySetupStyles}
 */

export const BOMB_SETUP = setupStyles(SETUP_FIRE)

/**
 * Rules of a game, read only, in a page drawer
 * @type {Record<string, string>}
 */

export const BAC_RULES = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-col gap-1 py-3 first:pt-0 last:pb-0',
  label: PROPERTY_LABEL,
  value: 'text-sm text-[var(--color-ink)]',
} as const
