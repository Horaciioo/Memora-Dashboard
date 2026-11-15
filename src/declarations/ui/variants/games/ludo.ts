import { setupStyles } from '@/declarations/ui/variants/games/play'

/**
 * Ludo table: the board, the die under it
 * @type {Record<string, string>}
 */

export const LUDO_BOARD = {
  // One column: players on phones, the board, the die, the sentence
  board:
    'relative mx-auto my-auto flex w-full flex-col items-center gap-3 px-2 select-none sm:px-0 in-[.play-boxfull]:pt-20',
  boardStar:
    'relative mx-auto my-auto flex w-full flex-col items-center gap-3 px-2 select-none sm:px-0 in-[.play-boxfull]:pt-20',
  // Players on a phone, where the corner card is hidden
  phoneRow: 'md:hidden',
  // Die under the board, room kept for a double throw
  dieSlot: 'flex min-h-[4.6rem] items-center justify-center',
  figure: 'play-figure text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Same size on every turn, so the table never moves
  status:
    'min-h-7 max-w-full truncate text-center text-lg leading-7 font-extrabold text-[var(--play-ink)]',
  // Full screen: the board takes the height left
  frameFull: 'lg:w-[min(64rem,calc(100dvh-16rem),calc(100vw-24rem))]!',
  // The viewer's turn: blue text, no box
  statusCall: 'text-[var(--play-ludo-call)]',
  frame:
    'ludo-frame max-lg:w-[min(calc(100%+1rem),calc(100dvh-18rem))] lg:w-[min(36rem,calc(100dvh-13rem))]',
  // The star is larger, so its frame is too
  frameStar:
    'ludo-frame max-lg:w-[min(calc(100%+1rem),calc(100dvh-18rem))] lg:w-[min(46rem,calc(100dvh-13rem))]',
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
 * Players in a line
 * @type {Record<string, string>}
 */

export const LUDO_PLATE = {
  // Players in a line, in the HUD block skin
  row: 'play-hud-block pointer-events-auto flex flex-col items-center gap-4 px-3 py-3 max-md:flex-row max-md:flex-wrap',
  plate:
    'ludo-plate relative flex min-w-0 flex-col items-center gap-1 transition-opacity duration-[var(--motion-duration-panel)]',
  off: 'opacity-45 grayscale',
  // Avatar inside the turn clock, in the colour of the player
  ring: 'ludo-ring grid size-12 shrink-0 place-items-center rounded-full p-[0.25rem]',
  ringAlert: 'ludo-ring-alert',
  face: '!size-full rounded-full text-xs',
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
