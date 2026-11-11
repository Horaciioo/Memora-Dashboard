import { setupStyles } from '@/declarations/ui/variants/games/play'

// Name under a player plate
const NAME =
  'max-w-[6rem] truncate text-xs font-extrabold text-[var(--play-ink)] drop-shadow-sm sm:max-w-[9rem] sm:text-base'

/**
 * Ludo table: a plate at each corner, the die beside the player on turn
 * @type {Record<string, string>}
 */

export const LUDO_BOARD = {
  // Phones: plates over and under the board; wide screens: plates in the four corners around it
  board:
    'relative mx-auto grid w-full grid-cols-2 gap-x-3 gap-y-2 px-2 pb-6 select-none sm:gap-x-6 sm:gap-y-3 sm:px-0 sm:pb-16 [grid-template-areas:"tl_tr"_"board_board"_"status_status"_"bl_br"] lg:w-fit lg:grid-cols-[minmax(11rem,1fr)_auto_minmax(11rem,1fr)] lg:grid-rows-[1fr_1fr_auto] lg:[grid-template-areas:"tl_board_tr"_"bl_board_br"_"._status_."]',
  figure: 'play-figure text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Same size on every turn, so the table never moves
  status:
    'my-2 min-h-7 max-w-full self-center justify-self-center truncate text-center text-lg leading-7 font-extrabold text-[var(--play-ink)] [grid-area:status]',
  // The viewer's turn: blue text, no box
  statusCall: 'text-[var(--play-ludo-call)]',
  frame:
    'ludo-frame [grid-area:board] max-lg:-mx-2 max-lg:w-auto lg:w-[min(36rem,calc(100dvh-13rem))]',
  // The viewer's turn: the frame lights in their colour
  frameMine: 'ludo-frame-mine',
  // Call over the board as the turn comes
  banner: 'ludo-banner',
  bannerText: 'ludo-banner-text',
  surface: 'ludo-board',
  grid: 'absolute inset-0 size-full',
  starCell: 'ludo-star-cell',
  starLit: 'ludo-star-lit',
  starShape: 'ludo-star-shape',
  starShapeLit: 'ludo-star-shape-lit',
} as const

/**
 * Grid place of each screen corner, clockwise from the top left
 * @type {readonly string[]}
 */

export const LUDO_SLOTS = [
  'self-start [grid-area:tl]',
  'self-start justify-self-end [grid-area:tr]',
  'self-end justify-self-end [grid-area:br]',
  'self-end [grid-area:bl]',
] as const

/**
 * One player beside the board
 * @type {Record<string, string>}
 */

export const LUDO_PLATE = {
  plate:
    'ludo-plate flex min-w-0 flex-col gap-1.5 transition-opacity duration-[var(--motion-duration-panel)]',
  // Player on turn: lifted, ringed in their colour, tagged
  plateTurn: 'ludo-plate-turn',
  tagSlot: 'flex h-5 items-center sm:h-6',
  tag: 'ludo-turn-tag',
  plateRight: 'ludo-plate-right items-end',
  // Die beside the avatar, level with it
  dieSlot: 'mt-0.5 shrink-0 scale-[0.72] origin-top sm:mt-1 sm:scale-100',
  off: 'opacity-45 grayscale',
  row: 'flex items-start gap-1.5 sm:gap-3',
  // Avatar, name and home count share one centred column
  core: 'flex min-w-0 flex-col items-center gap-1',
  rowRight: 'flex-row-reverse',
  // Avatar inside the turn clock
  ring: 'ludo-ring grid size-12 shrink-0 place-items-center rounded-full p-[0.18rem] sm:size-[4.6rem] sm:p-[0.25rem]',
  ringAlert: 'ludo-ring-alert',
  face: 'size-full rounded-full text-sm ring-[0.15rem] ring-[var(--play-ludo-felt)] sm:text-xl sm:ring-[0.2rem]',
  chip: 'mt-1 w-6 shrink-0 sm:mt-2 sm:w-11',
  nameRow: 'flex items-center justify-center gap-1 px-1 sm:gap-1.5',
  name: NAME,
  crown: 'size-3 shrink-0 sm:size-4 text-[var(--play-ludo-crown)]',
  dot: 'size-2 shrink-0 sm:size-2.5 rounded-full',
  online: 'bg-[var(--play-ludo-online)]',
  away: 'bg-[var(--play-ludo-away)]',
  note: 'text-center text-[0.7rem] font-bold sm:text-xs text-[var(--play-ink-soft)] tabular-nums',
  place:
    'rounded-full bg-[var(--play-ludo-crown)] px-2 py-0.5 text-xs font-black text-[var(--play-ludo-felt)]',
} as const

/**
 * Die and pawn pieces
 * @type {Record<string, string>}
 */

export const LUDO_PIECES = {
  die: 'ludo-die',
  dieReady: 'ludo-die-ready',
  dieRolling: 'ludo-die-rolling',
  pip: 'ludo-pip',
  dieButton:
    'rounded-[24%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--play-ludo-board)] disabled:cursor-default',
  pawn: 'ludo-pawn',
  pawnPick: 'ludo-pawn-pick',
  pawnArt: 'ludo-pawn-art',
  pawnHop: 'ludo-pawn-hop',
  pawnHit: 'ludo-pawn-hit',
  pawnFly: 'ludo-pawn-fly',
  rank: 'ludo-rank',
  rankLeft: 'ludo-rank-left',
  trail: 'ludo-trail',
  ghost: 'ludo-ghost',
  pawnButton:
    'block w-full rounded-full focus-visible:outline-2 focus-visible:outline-[var(--play-ludo-board)]',
} as const

/**
 * Burst where a pawn is eaten
 * @type {Record<string, string>}
 */

export const LUDO_IMPACT = {
  burst: 'ludo-burst',
  ring: 'ludo-burst-ring',
  spark: 'ludo-burst-spark',
  label: 'ludo-burst-label',
} as const

/**
 * Setup drawer of a new Ludo game
 * @type {PlaySetupStyles}
 */

export const LUDO_SETUP = setupStyles(
  'border-[var(--play-ludo-blue)] bg-[var(--play-ludo-blue)] text-white hover:border-[var(--play-ludo-blue)]'
)

/**
 * Ludo hub ground, pawns hopping on rows of squares
 * @type {Record<string, string>}
 */

export const LUDO_HUB = {
  field: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  walker: 'ludo-walker',
  surprise: 'ludo-surprise',
  shadow: 'ludo-walker-shadow',
  hopper: 'ludo-hopper block',
  pawn: 'w-full',
} as const
