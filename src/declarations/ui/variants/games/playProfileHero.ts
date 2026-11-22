/**
 * Player profile: one tinted card, identity, gestures, figures
 * @type {Record<string, string>}
 */

export const PLAY_PROFILE_HERO = {
  root: '[--tier:var(--play-key)] relative isolate flex flex-col gap-7 overflow-hidden rounded-3xl bg-[color-mix(in_oklab,var(--tier)_22%,var(--play-night))] p-6 text-[var(--play-ink)] [--ring-gap:color-mix(in_oklab,var(--tier)_22%,var(--play-night))] [--ring-track:color-mix(in_srgb,var(--play-ink)_16%,transparent)] sm:p-9',
  glow: 'pointer-events-none absolute -top-28 -right-20 -z-10 size-96 rounded-full bg-[var(--tier)] opacity-25 blur-3xl',
  main: 'flex flex-col items-center gap-6 text-center md:flex-row md:gap-10 md:text-left',
  body: 'flex min-w-0 flex-1 flex-col items-center gap-2 md:items-start',
  kickers: 'flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-start',
  kicker: 'text-xs font-bold tracking-widest text-[var(--tier)] uppercase',
  presence: 'text-xs font-bold text-[var(--play-ink-soft)]',
  presenceOn: 'text-[var(--play-gold-ink)]',
  name: 'max-w-full truncate text-4xl font-bold tracking-tight sm:text-6xl',
  xp: 'flex w-full max-w-sm flex-col gap-1.5 pt-1',
  track: 'block h-2 w-full overflow-hidden rounded-full bg-[var(--ring-track)]',
  fill: 'block h-full rounded-full bg-[var(--tier)] transition-[width] duration-700',
  xpNote:
    'flex items-baseline justify-between gap-3 text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  // Gestures stacked at the right, the main key first
  actions: 'flex shrink-0 flex-col items-center gap-3 md:items-end',
  row: 'flex flex-wrap items-center justify-center gap-2 md:justify-end',
  link: 'px-1 text-sm font-bold text-[var(--play-ink-soft)] underline underline-offset-4 transition-colors hover:text-[var(--play-ink)] disabled:opacity-50',
  strip:
    'grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--ring-track)] pt-6 sm:grid-flow-col sm:auto-cols-fr',
  stat: 'flex min-w-0 flex-col gap-0.5',
  statValue: 'text-3xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums',
  statLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
} as const

/**
 * Level per game: small tiles dyed in the colour of each game
 * @type {Record<string, string>}
 */

export const PLAY_PROFILE_LEVELS = {
  grid: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-2',
  tile: 'flex items-center gap-3 rounded-2xl bg-[color-mix(in_oklab,var(--game)_22%,var(--play-night))] p-2.5 pr-3.5 transition-colors hover:bg-[color-mix(in_oklab,var(--game)_32%,var(--play-night))] focus-visible:outline-2 focus-visible:outline-[var(--game)]',
  idle: 'opacity-55',
  logo: 'size-10 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col gap-1.5',
  head: 'flex items-baseline justify-between gap-2',
  name: 'truncate text-sm font-bold text-[var(--play-ink)]',
  level: 'shrink-0 text-xs font-bold tabular-nums text-[var(--game)]',
  track: 'block h-1.5 w-full overflow-hidden rounded-full bg-[var(--ring-track,var(--play-track))]',
  fill: 'block h-full rounded-full bg-[var(--game)]',
} as const
