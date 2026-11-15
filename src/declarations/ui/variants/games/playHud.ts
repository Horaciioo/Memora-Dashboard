const BLOCK = 'play-hud-block'
const CAPTION = 'text-xs leading-none font-black tracking-widest text-[var(--play-ink)] uppercase'
const FIGURE = 'text-3xl leading-none font-black tabular-nums text-[var(--play-ink-soft)]'

/**
 * Screen HUD: blocks laid over the table, skinned per game
 * @type {Record<string, string>}
 */

export const PLAY_HUD = {
  root: 'pointer-events-none absolute inset-0 z-20 select-none',
  // Stage under the HUD, fills the screen
  stage: 'relative flex min-h-0 w-full flex-1 flex-col items-center justify-center',
  // Top row: players, info card, keys
  top: 'absolute inset-x-3 top-3 flex items-start justify-between gap-3 max-md:top-[calc(0.75rem+env(safe-area-inset-top))] max-md:pr-[3.75rem] md:inset-x-7 md:top-6',
  strip: `${BLOCK} pointer-events-auto hidden items-center gap-3 px-3 py-2 md:order-1 md:flex`,
  player: 'relative flex flex-col items-center gap-1',
  playerFace: 'overflow-hidden rounded-full',
  playerValue: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  playerGone: 'opacity-40 grayscale',
  card: `${BLOCK} pointer-events-auto flex w-[40rem] max-w-full items-center gap-4 px-6 py-3.5 max-md:w-auto max-md:flex-1 max-md:gap-2 max-md:px-3 max-md:py-2.5 md:order-2`,
  // No strip beside it: centred on the screen
  cardAlone: `${BLOCK} pointer-events-auto flex w-[32rem] max-w-full items-center gap-4 px-6 py-3.5 max-md:w-auto max-md:flex-1 max-md:gap-2 max-md:px-3 max-md:py-2.5 md:absolute md:left-1/2 md:-translate-x-1/2`,
  block:
    'flex min-w-0 flex-1 basis-0 items-baseline justify-center gap-2 max-md:flex-col max-md:items-center max-md:gap-1',
  caption: `${CAPTION} max-md:text-[0.65rem] max-md:text-center`,
  figure: `${FIGURE} whitespace-nowrap max-md:text-xl`,
  divider: 'w-px self-stretch bg-[var(--play-line)]',
  rule: 'my-1 h-px bg-[var(--play-line)]',
  // Keys and the settings card hanging under them
  keys: 'pointer-events-auto relative ml-auto md:order-3',
  keyRow: `${BLOCK} flex items-center gap-1 p-1.5`,
  key: 'grid size-11 place-items-center rounded-full text-[var(--play-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--play-chip)]',
  // Active key tints its glyph, no square behind
  keyOn: 'text-[var(--play-accent)]',
  keyIcon: 'size-5',
  keyDesktop: 'max-md:hidden',
  settings: `${BLOCK} absolute top-full right-0 z-10 mt-3 flex w-72 max-w-[calc(100vw-1.5rem)] flex-col gap-1 p-3`,
  setting:
    'flex items-center justify-start gap-3 px-1 py-1.5 text-left text-base font-extrabold text-[var(--play-ink)]',
  soundRow: 'flex flex-col gap-1 px-1 py-1.5 text-base font-extrabold text-[var(--play-ink)]',
  // Game boxes, set aside on the left
  lead: 'absolute top-1/2 left-3 -translate-y-1/2 max-md:hidden md:left-7',
  // Score card, always resting on the chat
  corner:
    'absolute right-3 bottom-[22.5rem] flex w-80 max-w-[40%] flex-col items-end [&>*]:w-full max-md:hidden md:right-7',
  panel: `${BLOCK} pointer-events-auto flex w-72 max-w-full flex-col overflow-hidden`,
  head: 'flex items-center justify-between gap-2 px-4 py-3',
  title:
    'text-lg leading-none font-black tracking-tight whitespace-nowrap text-[var(--play-ink)] uppercase',
  fold: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  foldOpen: 'grid-rows-[1fr]',
  foldClip: 'min-h-0 overflow-hidden',
  rows: 'flex flex-col gap-1 px-3 pt-3 pb-1',
  row: 'flex items-center gap-2 px-1 py-0.5 text-sm font-extrabold text-[var(--play-ink)]',
  rowMe: 'text-[var(--play-ink-soft)]',
  rowRank: 'w-4 text-center text-xs tabular-nums text-[var(--play-ink-faint)]',
  rowName: 'min-w-0 flex-1 truncate',
  rowValue: 'tabular-nums',
} as const
