/**
 * Quests page: streak and chest in a lit hero, a poster for the main quest, rings for the rest
 * @type {Record<string, string>}
 */

export const PLAY_QUESTS = {
  page: 'flex flex-col gap-8',
  // Hero
  hero: 'quest-hero relative grid gap-6 overflow-hidden rounded-3xl p-5 shadow-[var(--shadow-sm)] sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8',
  streak: 'flex flex-col gap-6',
  streakTop: 'flex items-center gap-4 sm:gap-6',
  streakValue:
    'bg-gradient-to-b from-[var(--play-gold)] to-[var(--play-key)] bg-clip-text text-7xl leading-none font-bold tabular-nums text-transparent sm:text-8xl',
  streakLabel: 'mt-1 text-sm font-bold tracking-wide text-[var(--play-ink)] uppercase',
  streakBonus: 'mt-2 text-sm font-bold text-[var(--play-key)]',
  note: 'text-sm text-[var(--play-ink-soft)]',
  track: 'relative grid grid-cols-7 gap-1.5',
  trackLine: 'absolute inset-x-[7%] top-[1.1rem] h-0.5 rounded-full bg-play-lift sm:top-[1.3rem]',
  dayCell:
    'relative flex flex-col items-center gap-1.5 text-xs font-bold text-[var(--play-ink-soft)] uppercase',
  dayDot: 'grid size-9 place-items-center rounded-full ring-2 transition-colors sm:size-11',
  dayDotOff:
    'bg-[var(--play-panel-strong)] text-[var(--play-ink-soft)] ring-[color-mix(in_srgb,var(--play-ink)_18%,transparent)]',
  dayDotOn: 'bg-[var(--play-gold)] text-[var(--play-night)] ring-[var(--play-gold)]',
  dayDotToday: 'ring-[var(--play-key)]',
  dayGlyph: 'size-5',
  // Chest side of the hero
  chest:
    'flex flex-col items-center justify-center gap-4 rounded-2xl bg-play-nest p-5 text-center sm:p-6',
  chestTitle: 'text-xl font-bold text-[var(--play-ink)]',
  chestPips: 'flex items-center gap-2',
  pip: 'size-3.5 rounded-full bg-play-press transition-colors',
  pipOn: 'bg-[var(--play-gold)]',
  chestReward: 'text-3xl font-bold tabular-nums text-[var(--play-ink)]',
  // Sections
  section: 'flex flex-col gap-3',
  sectionTitle: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  sides: 'grid gap-3 sm:grid-cols-2',
  // Main poster
  poster:
    'quest-rise relative flex flex-col gap-6 overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:gap-8 sm:p-8',
  posterShade:
    'pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent',
  posterArt:
    'pointer-events-none absolute -right-10 -bottom-16 size-56 rotate-12 opacity-[0.16] sm:size-72',
  posterKicker: 'text-xs font-bold tracking-wide uppercase text-white/80',
  posterText: 'relative flex min-w-0 flex-1 flex-col gap-3',
  posterName: 'text-2xl leading-tight font-bold sm:text-4xl',
  posterHint: 'text-sm text-white/80',
  posterRing: 'relative size-24 sm:size-32',
  posterCount: 'text-2xl font-bold tabular-nums sm:text-3xl',
  posterFoot: 'relative flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end',
  posterReward: 'text-3xl font-bold tabular-nums',
  // Side tiles
  tile: 'quest-rise relative flex items-center gap-4 rounded-2xl bg-play-nest p-4 shadow-[var(--shadow-sm)] transition-colors hover:bg-play-lift sm:p-5',
  tileDone: 'bg-play-lift',
  tileNumber:
    'absolute -top-2 -left-2 grid size-6 place-items-center rounded-full bg-[var(--play-panel-strong)] text-xs font-bold text-[var(--play-ink)] ring-2 ring-[color-mix(in_srgb,var(--play-ink)_18%,transparent)]',
  tileRing: 'size-16 sm:size-[4.5rem]',
  tileLogo: 'size-10 sm:size-12',
  tileGlyph: 'size-7 text-[var(--play-key)]',
  tileText: 'flex min-w-0 flex-1 flex-col gap-1',
  tileName: 'text-base font-bold text-[var(--play-ink)]',
  tileHint: 'text-xs text-[var(--play-ink-soft)]',
  tileFoot: 'mt-1 flex items-center justify-between gap-3',
  count: 'text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  reward: 'text-lg font-bold tabular-nums text-[var(--play-ink)]',
  rewardNote: 'text-xs text-[var(--play-ink-soft)]',
  claim:
    'rounded-full bg-[var(--play-key)] px-5 py-2 text-sm font-bold text-[var(--play-key-ink)] shadow-[0_0.2rem_0_var(--play-key-deep)] transition-transform hover:-translate-y-px active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)] disabled:opacity-50',
  claimOnPoster:
    'rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[var(--play-night)] shadow-[0_0.2rem_0_rgb(0_0_0/0.3)] transition-transform hover:-translate-y-px active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50',
  claimed: 'text-sm font-bold text-[var(--play-ink-soft)]',
  claimedOnPoster: 'text-sm font-bold text-white/85',
  reset: 'pb-10 text-center text-xs text-[var(--play-ink-soft)]',
} as const
