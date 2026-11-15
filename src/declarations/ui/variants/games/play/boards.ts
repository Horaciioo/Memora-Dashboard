import { PROPERTY_LABEL, PROPERTY_SPACING } from '@/declarations/ui/variants/controls'
import {
  LIFT,
  NOTE,
  PANEL,
  RESULT,
  SETUP_BLUE,
  SETUP_FIRE,
  SETUP_TILE,
} from '@/declarations/ui/variants/games/play/shared'

// Paper sheet the phase lives on: navy outline, hard blue drop, navy ink
const SHEET =
  'rounded-2xl bg-white p-[min(2.4dvh,1.5rem)] [--play-ink:var(--play-baccalaureat-ink)] [--play-ink-soft:var(--play-baccalaureat-deep)] [--play-ink-faint:rgb(28_59_143/0.5)] shadow-[0_0_0_0.18rem_var(--play-baccalaureat-deep),0.4rem_0.4rem_0_0.18rem_var(--play-baccalaureat)]'

/**
 * Baccalaureat board, phase by phase
 * @type {Record<string, string>}
 */

export const BAC_BOARD = {
  // Phase on screen, rising in
  board:
    'relative flex size-full flex-col items-center justify-center gap-[min(2dvh,1rem)] overflow-hidden px-4 pt-24 pb-28 max-md:pb-20 md:pr-[23rem]',
  // HUD figures: the letter, the clock bar
  hudLetter: 'text-3xl leading-none font-black text-[var(--play-ink-soft)]',
  hudClockTrack: 'block h-2 w-24 overflow-hidden rounded-full bg-[var(--play-chip)]',
  hudClockBar:
    'block h-full rounded-full bg-[var(--play-ink-soft)] transition-[width] duration-1000 ease-linear',
  hudClockLow: 'bg-[var(--color-danger)]',
  hudLow: 'text-[var(--color-danger)]',
  // Countdown in place of the board, no veil behind
  inline: 'grid place-items-center',
  // Spectator waiting for the words
  wait: 'grid place-content-center justify-items-center gap-2 text-center',
  waitLead: 'text-xl font-extrabold text-[var(--play-ink)]',
  waitNote: 'text-sm font-semibold text-[var(--play-ink-soft)]',
  // Countdown centred in the game box, nothing tinted behind it
  overlay: 'pointer-events-none absolute inset-0 z-30 m-0! grid place-items-center',
  stage: 'relative flex flex-col items-center justify-center gap-6 text-center',
  stageLead:
    'relative rounded-full bg-[rgb(0_0_0/0.35)] px-5 py-2 text-sm font-extrabold tracking-[0.3em] text-white uppercase',
  figure:
    'play-figure play-figure-blue text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Someone called stop: their face, then the word, in place of the clock
  stop: 'flex items-center justify-end gap-2',
  stopWord:
    'play-stop text-3xl leading-none font-extrabold tracking-tight text-[var(--color-danger)]',
  // Writing sheet: one lined field per category, as many columns as fit
  sheet: 'flex min-h-0 w-full flex-col items-center',
  // One page of fields, spread evenly
  fields: 'flex min-h-0 flex-col justify-center gap-[min(1.6dvh,0.8rem)]',
  field:
    'flex items-center gap-3 rounded-xl border-2 border-[var(--play-baccalaureat-glow)] bg-[color-mix(in_srgb,var(--play-baccalaureat-glow)_14%,white)] px-3 transition-colors focus-within:border-[var(--play-baccalaureat-deep)] focus-within:bg-white',
  fieldIndex:
    'grid size-8 shrink-0 place-items-center rounded-full bg-[var(--play-baccalaureat-deep)] text-sm font-black text-white',
  fieldDone: 'bg-[var(--color-success)]',
  fieldIcon: 'size-5',
  fieldBody: 'flex min-w-0 flex-1 items-center gap-3',
  fieldLabel:
    'w-[6.5rem] shrink-0 truncate text-xs leading-tight font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  input:
    'w-full bg-transparent text-lg font-extrabold text-[var(--play-ink)] placeholder:text-base placeholder:font-normal placeholder:text-[var(--play-ink-faint)] focus:outline-none',
  stopButton:
    'rounded-xl bg-white px-8 py-2 text-lg font-black text-[var(--play-baccalaureat-ink)] shadow-[0_0.25rem_0_var(--play-baccalaureat-glow)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-45',
  actions: 'flex flex-wrap items-center justify-center gap-3',
  // Line at the bottom, like the Bomb Party hint
  lead: 'text-center text-sm font-semibold text-[var(--play-ink-soft)]',
  leadStrong: 'font-black text-white',
  // Review table: a row per category, a column per player
  table:
    'grid min-h-0 w-full grid-cols-[minmax(4.5rem,0.9fr)_repeat(var(--cols),minmax(0,1fr))] auto-rows-[minmax(3rem,min(4.2rem,7.5dvh))] items-stretch gap-1.5',
  tableHead:
    'flex items-center justify-center gap-1.5 px-1 text-xs font-bold text-[var(--play-ink-soft)]',
  tableName: 'truncate',
  categoryName:
    'flex items-center text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  card: 'flex min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 border-[var(--play-baccalaureat-glow)] bg-[color-mix(in_srgb,var(--play-baccalaureat-glow)_14%,white)] px-1.5 text-center',
  cardYes: 'border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_16%,white)]',
  cardNo: 'border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_12%,white)]',
  cardBody: 'flex w-full min-w-0 flex-col items-center',
  cardWord: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  cardWordOff: 'line-through opacity-50',
  cardEmpty: 'truncate text-xs italic text-[var(--play-ink-faint)]',
  cardTag: 'truncate text-[0.6rem] leading-none font-bold text-[var(--play-ink-soft)]',
  // Check or cross under the avatar
  verdict: 'grid size-6 place-items-center rounded-full',
  verdictYes: 'bg-[var(--color-success)] text-white',
  verdictNo: 'bg-[var(--color-danger)] text-white',
  verdictNone: 'bg-[var(--play-panel-strong)] text-[var(--play-ink-faint)]',
  verdictIcon: 'size-3.5',
  // Ballot buttons, then the locked vote
  ballots: 'flex shrink-0 items-center gap-1',
  ballot:
    'grid size-6 place-items-center rounded-full bg-[var(--play-panel-strong)] text-[var(--play-ink-soft)] transition-transform hover:scale-110 disabled:opacity-50',
  ballotYes: 'hover:bg-[var(--color-success)] hover:text-white',
  ballotNo: 'hover:bg-[var(--color-danger)] hover:text-white',
  ballotOnYes: 'bg-[var(--color-success)] text-white',
  ballotOnNo: 'bg-[var(--color-danger)] text-white',
  ballotOff: 'opacity-35 grayscale',
  ballotIcon: 'size-3.5',
  points:
    'shrink-0 rounded-full bg-[var(--play-baccalaureat)] px-2 py-0.5 text-xs font-black tabular-nums text-white',
  pointsNone: 'bg-[var(--play-panel-strong)] text-[var(--play-ink-faint)]',
  // Winner line of the round
  roundLine: 'text-center',
  heroPoints: 'text-[var(--play-baccalaureat-glow)]',
  // Final ranking under the podium
  ranks: 'grid w-full max-w-5xl grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-2',
  rank: `${PANEL} flex items-center gap-3 px-3 py-2.5`,
  rankIndex: 'w-6 text-center text-sm font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  rankName: 'min-w-0 flex-1 truncate text-sm font-extrabold',
  rankPoints: 'text-sm font-extrabold tabular-nums text-[var(--play-ink)]',
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
  board:
    'relative flex min-h-[min(40rem,100dvh)] flex-1 flex-col items-center justify-center gap-3 px-4 pt-28 pb-6',
  figure:
    'play-figure play-figure-fire text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Bonus letters, a plate set aside on the left
  fuseTrack: 'block h-3 w-36 overflow-hidden rounded-full bg-[var(--play-bomb-shell-deep)]',
  fuseBar: 'play-bomb-fuse block h-full rounded-full',
  letters:
    'play-hud-block pointer-events-auto absolute top-1/2 left-7 flex -translate-y-1/2 flex-col gap-2 p-3 max-md:inset-x-3 max-md:top-auto max-md:bottom-3 max-md:right-3 max-md:translate-y-0',
  lettersGrid: 'flex flex-col gap-1 max-md:flex-row max-md:flex-wrap max-md:justify-center',
  letter:
    'grid size-6 place-items-center rounded-md bg-[var(--play-chip)] text-xs font-extrabold transition-opacity duration-[var(--motion-duration-fast)]',
  letterFree: 'text-[var(--play-ink)]',
  // Used: struck through and faded
  letterUsed:
    'text-[var(--play-ink-faint)] line-through decoration-2 decoration-[var(--play-bomb)] opacity-45',
  // Clear of the dock at the bottom
  stage: 'flex min-w-0 flex-col items-center gap-4',
  // Square table, seats on an orbit
  table: 'play-bomb-table relative aspect-square w-full max-w-[min(34rem,50dvh)]',
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
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-wide text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  // Final screen
  result: RESULT,
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
 * Final podium, sized from the screen height so it fills the room
 * @type {Record<string, string>}
 */

export const PLAY_PODIUM = {
  stage:
    'relative flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-[clamp(1rem,4dvh,2.5rem)] px-4 py-6 sm:px-10',
  row: 'flex w-full max-w-5xl items-end justify-center gap-[clamp(0.5rem,2.5vw,2rem)]',
  place: 'flex max-w-72 min-w-0 flex-1 basis-0 flex-col items-center gap-2',
  face: 'relative flex flex-col items-center gap-2 pt-[clamp(1.75rem,5dvh,3rem)]',
  crown: 'absolute top-0 size-[clamp(1.75rem,5dvh,3rem)] text-[var(--play-gold-ink)]',
  name: 'w-full truncate text-center text-[clamp(1rem,2.8dvh,1.6rem)] font-extrabold',
  points:
    'text-[clamp(0.85rem,2.2dvh,1.2rem)] font-semibold tabular-nums text-[var(--play-ink-soft)]',
  block:
    'flex w-full items-start justify-center rounded-t-3xl pt-4 text-3xl font-extrabold tabular-nums text-[var(--play-night)]',
}

/**
 * Podium block by place
 * @type {Record<number, string>}
 */

export const PLAY_PODIUM_BLOCKS: Record<number, string> = {
  1: 'h-[min(34dvh,18rem)] bg-[var(--play-medal-first)]',
  2: 'h-[min(24dvh,13rem)] bg-[var(--play-medal-second)]',
  3: 'h-[min(16dvh,9rem)] bg-[var(--play-medal-third)]',
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
  page: 'relative w-full pb-6',
  // Table alone on the screen, the side column slides over it from the right
  pageFull: 'play-room fixed inset-0 z-50 overflow-hidden',
  mainFull: 'flex h-full min-w-0 flex-col',
  // Empty marker carrying the game ground into the full screen room
  groundMark: 'hidden',
  // Chat open beside the table, never over it on wide screens
  mainBeside:
    'transition-[padding] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] lg:pr-[min(var(--play-side-open),100vw)] motion-reduce:transition-none',
  exitIcon: 'size-4',
  // Full screen table scrolls when taller than the screen
  boxFull: 'play-boxfull flex min-h-0 flex-1 flex-col overflow-y-auto',
  // Same panel as the page so the ink stays readable, content centred as one group, dock margin dropped
  boxFullPad: `${PANEL} ${LIFT} backdrop-blur-none! backdrop-saturate-100! m-4 mt-20 gap-5 p-5 sm:m-6 sm:mt-24 sm:p-6 *:first:mt-auto *:last:mb-auto *:pb-0!`,
  // Own HUD: the table is the whole page, no panel and no margin
  boxFullHud: 'size-full overflow-hidden!',
  // Chat laid over a HUD table, last lines in the corner opposite the score card
  hudChat: 'fixed right-3 bottom-3 z-[60] w-80 max-w-[40%] md:right-7 md:bottom-7',
  // Stage keys: in the top bar, then floating over the table, shifted by the open chat
  keys: 'flex items-center gap-2',
  keysFull:
    'fixed top-8 right-8 z-50 sm:top-10 sm:right-10 transition-[right] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Inside the table's top corner, left of the open chat
  keysShifted:
    'right-[calc(min(var(--play-side-open),100vw)+2rem)] sm:right-[calc(min(var(--play-side-open),100vw)+2.5rem)]',
  // Full screen, chat open: the keys top the chat column
  keysDocked: 'shrink-0 justify-center px-4 pt-1 pb-3',
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
  // Column flush against the right edge, under the shell bar
  side: 'mt-4 flex min-w-0 flex-col gap-3 lg:fixed lg:top-[var(--play-bar-h)] lg:right-0 lg:bottom-0 lg:z-40 lg:mt-0 lg:pb-28',
  // Full screen: flush right over the table, slides in and out
  sideFull:
    'fixed right-0 z-40 mt-0 w-[min(var(--play-side-open),100vw)]! transition-transform duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Same top and foot as the padded table
  sideFullPad: 'top-4! bottom-4! pb-0! sm:top-6! sm:bottom-6!',
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
  feedAction: 'mt-1.5 flex',
  feedText: 'min-w-0 flex-1 text-[var(--play-ink-soft)]',
  feedTime: 'text-[0.7rem] font-semibold tabular-nums text-[var(--play-ink-faint)]',
  feedMark:
    'grid size-6 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-blue-ink)]',
  feedMarkIcon: 'size-3.5',
  // Memora's own line: loading of the table
  feedBrain: 'size-6 shrink-0 object-contain',
  feedFailed: 'font-bold text-[var(--play-danger,var(--color-danger))]',
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
