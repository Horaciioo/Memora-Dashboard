const BLOCK = 'play-hud-block'
const CAPTION =
  'text-[0.65rem] leading-none font-black tracking-widest text-[var(--play-ink)] uppercase'
const FIGURE = 'text-2xl leading-none font-black tabular-nums text-[var(--play-ink-soft)]'

/**
 * Screen HUD: blocks laid over the table, skinned per game
 * @type {Record<string, string>}
 */

export const PLAY_HUD = {
  root: 'pointer-events-none absolute inset-0 z-20 select-none',
  // Stage under the HUD, fills the screen
  stage: 'relative flex min-h-0 w-full flex-1 flex-col items-center justify-center',
  // Top row: players, info card, keys
  top: 'play-hud-top absolute inset-x-3 top-3 flex items-start justify-between gap-3 max-md:items-stretch max-md:top-[calc(0.75rem+env(safe-area-inset-top))] md:inset-x-5 md:top-4',
  // Phone, keys alone against the right edge
  topFlush:
    'play-hud-top absolute inset-x-3 top-3 flex items-start justify-between gap-3 max-md:inset-x-0 max-md:top-0 md:inset-x-5 md:top-4',
  strip: `${BLOCK} pointer-events-auto hidden items-center gap-2.5 px-2.5 py-1.5 md:order-1 md:flex`,
  player: 'relative flex flex-col items-center gap-1',
  playerFace: 'rounded-[13%]',
  playerValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  playerGone: 'opacity-40 grayscale',
  card: `${BLOCK} pointer-events-auto flex w-fit max-w-full md:min-w-[26rem] items-center gap-3 px-5 py-2.5 max-md:w-auto max-md:min-w-0 max-md:flex-1 max-md:gap-1.5 max-md:px-2 max-md:py-2.5 md:order-2`,
  // No strip beside it: centred on the screen
  cardAlone: `${BLOCK} pointer-events-auto flex w-fit max-w-full md:min-w-[26rem] items-center gap-3 px-5 py-2.5 max-md:w-auto max-md:min-w-0 max-md:flex-1 max-md:gap-1.5 max-md:px-2 max-md:py-2.5 md:absolute md:left-1/2 md:-translate-x-1/2`,
  // Same card pushed to the left edge, off the board's way
  cardStart: `${BLOCK} pointer-events-auto flex w-fit max-w-full md:min-w-[26rem] items-center gap-3 px-5 py-2.5 max-md:w-auto max-md:min-w-0 max-md:flex-1 max-md:gap-1.5 max-md:px-2 max-md:py-2.5 md:absolute md:left-0`,
  // Wide card centred, leaves room for the keys on both sides
  cardWide: `${BLOCK} pointer-events-auto flex w-[56rem] max-w-[calc(100%-26rem)] items-center gap-6 px-8 py-3.5 max-md:w-auto max-md:max-w-full max-md:flex-1 max-md:gap-1.5 max-md:px-2 max-md:py-2.5 md:absolute md:left-1/2 md:-translate-x-1/2`,
  // Clock alone, small and centred
  cardSlim: `${BLOCK} pointer-events-auto flex items-center px-4 py-1.5 max-md:flex-1 md:absolute md:left-1/2 md:-translate-x-1/2`,
  block:
    'flex min-w-0 flex-auto items-baseline justify-center gap-2 max-md:flex-col max-md:items-center max-md:gap-1',
  caption: `${CAPTION} shrink-0 whitespace-nowrap max-md:text-center max-md:text-[0.55rem] max-md:tracking-wide`,
  figure: `${FIGURE} whitespace-nowrap max-md:text-xl`,
  divider: 'w-px self-stretch bg-[var(--play-line)]',
  rule: 'my-1 h-px bg-[var(--play-line)]',
  // Keys and the settings card hanging under them
  // Phone: as tall as the info card beside it
  keys: 'pointer-events-auto relative ml-auto flex md:order-3',
  keyRow: `${BLOCK} flex items-center gap-0.5 p-1`,
  keyRowFlush: 'rounded-t-none rounded-r-none',
  key: 'grid size-9 place-items-center rounded-full text-[var(--play-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--play-chip)]',
  // Active key tints its glyph, no square behind
  keyOn: 'text-[var(--play-accent)]',
  keyIcon: 'size-4',
  keyDesktop: 'max-md:hidden',
  keyPhone: 'md:hidden',
  phoneOnly: 'flex md:hidden',
  settings: `${BLOCK} absolute top-full right-0 z-10 mt-2 flex w-64 max-w-[calc(100vw-1.5rem)] flex-col gap-0.5 p-2.5`,
  setting:
    'flex items-center justify-between gap-3 px-1 py-1 text-left text-sm font-extrabold text-[var(--play-ink)]',
  // Icon then label, flush left like the switch labels
  action:
    'flex items-center justify-start gap-3 px-1 py-1 text-left text-sm font-extrabold text-[var(--play-ink)]',
  soundRow: 'flex flex-col gap-1 px-1 py-1 text-sm font-extrabold text-[var(--play-ink)]',
  // Game boxes, set aside on the left
  lead: 'absolute top-1/2 left-3 -translate-y-1/2 max-md:hidden md:left-5',
  // Score card, resting on the chat whatever its height, under the top row on a phone
  corner:
    'absolute right-3 bottom-[calc(var(--play-chat-h,0px)+2rem)] flex w-64 max-w-[40%] flex-col items-end [&>*]:w-full max-md:hidden md:right-5',
  panel: `${BLOCK} pointer-events-auto flex w-60 max-w-full flex-col gap-1 overflow-hidden px-3 py-2`,
  title:
    'text-base leading-none font-black tracking-tight whitespace-nowrap text-[var(--play-ink)] uppercase',
  // Inside the scores dropdown of a phone
  panelBare: 'flex w-full flex-col gap-1 px-1 py-1',
  rows: 'flex flex-col gap-0.5',
  row: 'flex items-center gap-2 px-1 py-0.5 text-xs font-extrabold text-[var(--play-ink)]',
  rowMe: 'text-[var(--play-ink-soft)]',
  rowRank: 'w-4 text-center text-xs tabular-nums text-[var(--play-ink-faint)]',
  rowName: 'min-w-0 flex-1 truncate',
  rowValue: 'tabular-nums',
} as const
