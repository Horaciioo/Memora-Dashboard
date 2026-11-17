/**
 * Player card: a night panel tinted by the tier, the portrait over its band
 * @type {Record<string, string>}
 */

export const PLAY_CARD = {
  layer: 'fixed inset-0 z-[80] grid place-items-center bg-black/55 p-4 backdrop-blur-sm',
  card: 'play-card-in relative flex max-h-[90dvh] w-full max-w-sm flex-col overflow-y-auto rounded-3xl bg-[color-mix(in_oklab,var(--tier)_16%,var(--play-night))] text-[var(--play-ink)] shadow-[0_24px_60px_rgb(0_0_0/0.55),0_0_48px_color-mix(in_oklab,var(--tier)_35%,transparent)]',
  band: 'h-24 shrink-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--tier)_80%,black),color-mix(in_oklab,var(--tier)_30%,var(--play-night)))]',
  close:
    'absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/35 text-[var(--play-ink)] transition-colors hover:bg-black/55 focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  closeIcon: 'size-5',
  portrait: '-mt-14 flex justify-center',
  body: 'flex flex-col gap-4 px-6 pt-3 pb-6',
  who: 'flex flex-col items-center gap-1 text-center',
  name: 'max-w-full truncate text-2xl font-extrabold tracking-tight',
  tier: 'text-xs font-bold tracking-widest text-[var(--tier)] uppercase',
  track: 'h-2.5 overflow-hidden rounded-full bg-black/40',
  fill: 'block h-full rounded-full bg-[var(--tier)]',
  caption: 'text-center text-xs font-semibold text-[var(--play-ink-soft)]',
  figures: 'grid grid-cols-3 gap-2',
  figure: 'flex flex-col items-center gap-0.5 rounded-2xl bg-[var(--play-chip)] px-2 py-3',
  figureValue: 'text-xl font-extrabold tabular-nums',
  figureLabel: 'text-[0.65rem] font-bold tracking-wider text-[var(--play-ink-faint)] uppercase',
  presence: 'flex items-center justify-center gap-2 text-sm font-bold text-[var(--play-ink-soft)]',
  presenceOn: 'text-[var(--play-ink)]',
  dot: 'size-2 rounded-full bg-[var(--play-ink-faint)]',
  dotOn: 'bg-[var(--play-gold)]',
  section: 'text-xs font-bold tracking-widest text-[var(--play-ink-faint)] uppercase',
  recent: 'flex flex-col gap-1.5',
  game: 'flex items-center gap-3 rounded-2xl bg-[var(--play-chip)] px-3 py-2',
  logo: 'size-9 shrink-0',
  gameText: 'flex min-w-0 flex-1 flex-col',
  gameName: 'truncate text-sm font-extrabold',
  gameMeta: 'truncate text-xs text-[var(--play-ink-soft)]',
  win: 'shrink-0 text-xs font-extrabold text-[var(--play-gold)]',
  draw: 'shrink-0 text-xs font-extrabold text-[var(--play-ink-soft)]',
  loss: 'shrink-0 text-xs font-extrabold text-[var(--play-alert)]',
  empty: 'py-2 text-center text-sm text-[var(--play-ink-soft)] italic',
  actions: 'flex flex-wrap justify-center gap-2',
  key: 'play-key inline-flex items-center px-5 py-2.5 text-sm font-bold',
  keyGhost: 'play-key play-key-ghost inline-flex items-center px-5 py-2.5 text-sm font-bold',
} as const
