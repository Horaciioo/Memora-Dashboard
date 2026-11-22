/**
 * Player card: one plain panel, the same for every player
 * @type {Record<string, string>}
 */

export const PLAY_CARD = {
  layer: 'fixed inset-0 z-80 grid place-items-center bg-play-veil p-4 backdrop-blur-sm',
  card: 'play-card-in play-card-sheet relative flex max-h-[92dvh] w-full max-w-2xl flex-col gap-7 overflow-y-auto rounded-3xl bg-[var(--play-night)] p-6 sm:p-10 text-[var(--play-ink)] shadow-[0_24px_60px_var(--play-drop)] ring-1 ring-[var(--play-line)]',
  close:
    'absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-play-lift hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  closeIcon: 'size-5',
  // Portrait centred over a glow in the tier colour
  head: 'play-raised rounded-b-none relative flex flex-col items-center gap-5 px-6 py-6 text-center sm:flex-row sm:gap-7 sm:px-8 sm:text-left',
  who: 'flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:items-start',
  name: 'max-w-full truncate text-4xl font-bold tracking-tight sm:text-5xl',
  tier: 'text-sm font-bold tracking-[0.2em] text-[var(--tier)] uppercase',
  level: 'text-base font-semibold text-[var(--play-ink-soft)] tabular-nums',
  presence: 'truncate text-base text-[var(--play-ink-faint)]',
  presenceOn: 'font-semibold text-[var(--play-gold-ink)]',
  // One raised group, plain cells inside
  // Flush under the portrait box, split by a hairline
  figures:
    '-mt-7 play-raised grid grid-cols-3 gap-1.5 rounded-t-none border-t border-[var(--play-line)] p-1.5',
  figure: 'flex flex-col items-center gap-1 rounded-xl bg-play-nest px-2 py-5',
  figureValue: 'text-4xl leading-none font-bold tabular-nums',
  figureLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  figureNote: 'text-micro font-semibold text-[var(--play-gold-ink)]',
  block: 'flex flex-col gap-3',
  section: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  // Favourite games: one raised group, a cell per game
  collection: 'play-raised grid grid-cols-3 gap-1.5 p-1.5',
  collect:
    'relative isolate flex flex-col items-center gap-1 overflow-hidden rounded-xl bg-play-nest px-2 py-6 text-center',
  collectArt: '-z-20',
  collectShade: 'absolute inset-0 -z-10 bg-[var(--color-media-shade)]/55',
  collectName: 'w-full truncate text-sm font-bold text-[var(--play-on-art)]',
  collectLevel: 'text-xs font-bold text-[var(--play-gold)] tabular-nums',
  collectMeta: 'text-micro text-[var(--play-on-art)]/70',
  // Last games: one raised group, rows split by hairlines
  list: 'play-raised flex flex-col gap-0.5 p-1.5',
  game: 'flex items-center gap-4 rounded-xl px-3 py-2.5',
  rule: 'mx-2 h-px bg-[var(--play-line)]',
  logo: 'size-11 shrink-0',
  gameText: 'flex min-w-0 flex-1 flex-col',
  gameName: 'truncate text-base font-bold',
  gameMeta: 'truncate text-sm text-[var(--play-ink-faint)]',
  // Last games as a strip of tiles, one per result
  win: 'shrink-0 text-xs font-bold text-[var(--play-gold-ink)]',
  draw: 'shrink-0 text-xs font-bold text-[var(--play-ink-soft)]',
  loss: 'shrink-0 text-xs font-bold text-[var(--play-alert)]',
  empty: 'py-1 text-base text-[var(--play-ink-faint)]',
  actions: 'flex flex-wrap gap-3 [&>*]:flex-1 [&>*]:justify-center',
  key: 'play-key inline-flex min-h-12 items-center px-6 text-base font-bold',
  keyGhost: 'play-key play-key-ghost inline-flex min-h-12 items-center px-6 text-base font-bold',
} as const
