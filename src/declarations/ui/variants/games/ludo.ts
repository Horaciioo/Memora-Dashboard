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
    'relative mx-auto grid w-full grid-cols-2 gap-x-3 gap-y-2 px-2 pb-6 select-none sm:gap-x-6 sm:gap-y-3 sm:px-0 sm:pb-16 in-[.play-boxfull]:pt-20 in-[.play-boxfull]:pb-0 [grid-template-areas:"tl_tr"_"board_board"_"status_status"_"bl_br"] lg:w-fit lg:grid-cols-[minmax(11rem,1fr)_auto_minmax(11rem,1fr)] lg:grid-rows-[1fr_1fr_auto] lg:[grid-template-areas:"tl_board_tr"_"bl_board_br"_"._status_."]',
  // Star board: six plates, the side ones in a row beside the board
  boardStar:
    'relative mx-auto grid w-full grid-cols-2 gap-x-3 gap-y-2 px-2 pb-6 select-none sm:gap-x-6 sm:gap-y-3 sm:px-0 sm:pb-16 in-[.play-boxfull]:pt-20 in-[.play-boxfull]:pb-0 [grid-template-areas:"tl_tr"_"l_r"_"board_board"_"status_status"_"bl_br"] lg:w-fit lg:grid-cols-[minmax(11rem,1fr)_auto_minmax(11rem,1fr)] lg:grid-rows-[1fr_1fr_1fr_auto] lg:[grid-template-areas:"tl_board_tr"_"l_board_r"_"bl_board_br"_"._status_."]',
  figure: 'play-figure text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Same size on every turn, so the table never moves
  status:
    'my-2 min-h-7 max-w-full self-center justify-self-center truncate text-center text-lg leading-7 font-extrabold text-[var(--play-ink)] [grid-area:status]',
  // Full screen: the board takes the height left, less the chat when open
  frameFull: 'lg:w-[min(64rem,calc(100dvh-12rem),calc(100vw-30rem))]!',
  frameFullChat: 'lg:w-[min(64rem,calc(100dvh-12rem),calc(100vw-58rem))]!',
  // The viewer's turn: blue text, no box
  statusCall: 'text-[var(--play-ludo-call)]',
  frame:
    'ludo-frame [grid-area:board] max-lg:-mx-2 max-lg:w-auto lg:w-[min(36rem,calc(100dvh-13rem))]',
  // The star is larger, so its frame is too
  frameStar:
    'ludo-frame [grid-area:board] max-lg:-mx-2 max-lg:w-auto lg:w-[min(46rem,calc(100dvh-13rem))]',
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
  'self-start -translate-x-2 sm:-translate-x-4 [grid-area:tl]',
  'self-start justify-self-end translate-x-2 sm:translate-x-4 [grid-area:tr]',
  'self-end justify-self-end translate-x-2 sm:translate-x-4 [grid-area:br]',
  'self-end -translate-x-2 sm:-translate-x-4 [grid-area:bl]',
] as const

/**
 * Grid place of each arm of the star on screen, clockwise from the top left
 * @type {readonly string[]}
 */

export const LUDO_STAR_SLOTS = [
  LUDO_SLOTS[0],
  LUDO_SLOTS[1],
  'self-center justify-self-end translate-x-2 sm:translate-x-4 [grid-area:r]',
  LUDO_SLOTS[2],
  LUDO_SLOTS[3],
  'self-center -translate-x-2 sm:-translate-x-4 [grid-area:l]',
] as const

/**
 * One player beside the board
 * @type {Record<string, string>}
 */

export const LUDO_PLATE = {
  plate:
    'ludo-plate relative z-20 flex min-w-0 flex-col gap-1.5 transition-opacity duration-[var(--motion-duration-panel)]',
  // Player on turn: lifted, ringed in their colour, tagged
  plateTurn: 'ludo-plate-turn',
  tagSlot: 'flex h-5 items-center sm:h-6',
  tag: 'ludo-turn-tag',
  plateRight: 'ludo-plate-right items-end',
  // Out of flow on the board side, so the avatar never moves
  dieSlot:
    'absolute top-5 left-full ml-2 -translate-y-1/2 scale-[0.6] origin-left sm:top-[2.3rem] sm:ml-3 sm:scale-100',
  dieSlotRight:
    'absolute top-5 right-full mr-2 -translate-y-1/2 scale-[0.6] origin-right sm:top-[2.3rem] sm:mr-3 sm:scale-100',
  off: 'opacity-45 grayscale',
  row: 'relative flex items-start gap-1.5 sm:gap-3',
  // Avatar, name and home count share one centred column
  // Core as wide as the avatar, so every avatar sits at the same spot whatever the name
  core: 'relative flex w-10 shrink-0 flex-col items-center gap-1 sm:w-[4.6rem]',
  rowRight: 'flex-row-reverse',
  // Avatar inside the turn clock
  ring: 'ludo-ring grid size-10 shrink-0 place-items-center rounded-full p-[0.14rem] sm:size-[4.6rem] sm:p-[0.25rem]',
  ringAlert: 'ludo-ring-alert',
  face: '!size-full rounded-full text-xs ring-[0.15rem] ring-[var(--play-ludo-felt)] sm:text-xl sm:ring-[0.2rem]',
  chip: 'mt-0.5 w-5 shrink-0 sm:mt-2 sm:w-11',
  nameRow: 'flex w-max items-center justify-center gap-1 px-1 sm:gap-1.5',
  name: NAME,
  crown: 'size-3 shrink-0 sm:size-4 text-[var(--play-ludo-crown)]',
  dot: 'size-2 shrink-0 sm:size-2.5 rounded-full',
  online: 'bg-[var(--play-ludo-online)]',
  away: 'bg-[var(--play-ludo-away)]',
  chaosRow: 'flex w-max max-w-[6.5rem] flex-wrap items-center justify-center gap-1',
  place:
    'w-max rounded-full bg-[var(--play-ludo-crown)] px-2 py-0.5 text-xs font-black text-[var(--play-ludo-felt)]',
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
  ghostButton: 'ludo-ghost-button',
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

/**
 * Faces of the launch vote: pawns hopping from square to square
 * @type {Record<string, string>}
 */

export const LUDO_VOTE = {
  face: 'flex size-full flex-col items-center justify-center gap-[8%] px-[6%]',
  dice: 'flex gap-[6%]',
  die: 'grid size-[calc(var(--vote-card)*0.28)] place-items-center rounded-[24%] bg-white text-[calc(var(--vote-card)*0.18)] leading-none font-black text-[var(--play-night)] shadow-[0_0.2rem_0_rgb(0_0_0/0.25)]',
  track: 'relative grid w-full',
  cell: 'aspect-square rounded-[24%] bg-white/15 ring-1 ring-white/30',
  // Rides over the squares, one square wide
  traveller: 'ludo-vote-travel absolute inset-y-0 left-0 p-[3%]',
  jumper: 'ludo-vote-jump p-[6%]',
  pawn: 'w-full',
} as const
