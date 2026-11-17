import { HEADING } from '@/declarations/ui/variants/games/play/shared'

/**
 * Desktop hub: games bar, featured games and cards, players column
 * @type {Record<string, string>}
 */

export const PLAY_DESK = {
  // Bar | stage | players, the bars appear once the width allows
  layout: 'grid w-full items-start gap-6 xl:grid-cols-[13rem_minmax(0,1fr)_17rem]',
  side: 'play-glass sticky top-8 flex max-h-[calc(100dvh-9rem)] min-h-0 flex-col gap-3 rounded-3xl p-3',
  sideTitle:
    'px-2 pt-1 text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  // Stage is a container so the games count follows its own width
  stage: '@container flex min-w-0 flex-col gap-8',
  // Games bar
  nav: 'flex min-h-0 flex-col gap-1 overflow-y-auto',
  navItem:
    'flex min-h-12 items-center gap-3 rounded-2xl px-2 py-1.5 text-sm font-bold text-[var(--play-ink)] transition-colors hover:bg-[var(--play-chip)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  navLogo: 'size-9',
  navName: 'truncate',
  // Featured games, side by side once the stage is wide
  heroes: 'grid gap-4 @3xl:grid-cols-2',
  hero: 'group relative isolate flex h-72 flex-col justify-end overflow-hidden rounded-3xl text-[var(--play-on-art)] shadow-[var(--shadow-sm)] ring-1 ring-white/15 transition-transform duration-200 hover:-translate-y-1 @3xl:h-[clamp(20rem,42dvh,30rem)]',
  heroArt: '-z-10 transition-transform duration-500 group-hover:scale-105',
  heroShade:
    'absolute inset-0 -z-10 bg-linear-to-t from-[var(--play-night)] from-5% via-[var(--play-night)]/60 via-35% to-transparent to-70%',
  heroBody: 'flex flex-col items-start gap-1.5 p-6',
  heroKicker: 'text-xs font-extrabold tracking-[0.2em] text-[var(--play-gold)] uppercase',
  heroName: 'text-4xl font-extrabold tracking-tight uppercase',
  heroTagline: 'line-clamp-2 max-w-lg text-sm text-[var(--play-on-art)]/85',
  heroFoot: 'mt-2 flex items-center gap-4',
  heroPlay: 'play-key inline-flex items-center px-6 py-2.5 text-sm font-bold',
  heroSeats: 'text-xs font-extrabold tabular-nums text-[var(--game)]',
  // Other games, art over its name like the store cards
  cardsTitle: HEADING,
  cards: 'grid grid-cols-2 gap-x-4 gap-y-6 @3xl:grid-cols-3 @6xl:grid-cols-4',
  card: 'group relative flex min-w-0 flex-col gap-2.5',
  cardMedia:
    'relative aspect-video overflow-hidden rounded-2xl shadow-[var(--shadow-sm)] ring-1 ring-white/15 transition-transform duration-200 group-hover:-translate-y-1',
  cardArt: 'transition-transform duration-500 group-hover:scale-105',
  cardText: 'flex min-w-0 flex-col px-1',
  cardName: 'truncate text-base font-extrabold text-[var(--play-ink)]',
  cardNote: 'line-clamp-2 text-sm text-[var(--play-ink-soft)]',
  cardLink:
    'absolute inset-0 z-10 rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
  // Players column
  tabs: 'flex justify-center gap-1 rounded-full bg-[var(--play-chip)] p-1',
  tab: 'flex-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)]',
  tabOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)] shadow-[var(--shadow-sm)]',
  scroll: 'flex min-h-0 flex-col gap-1 overflow-y-auto',
  friend:
    'flex min-h-14 items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-[var(--play-chip)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  friendText: 'flex min-w-0 flex-col',
  friendName: 'truncate text-sm font-bold text-[var(--play-ink)]',
  friendNote: 'truncate text-xs text-[var(--play-ink-soft)]',
  friendLive: 'truncate text-xs font-bold text-[var(--play-gold-ink)]',
  empty: 'px-2 py-6 text-center text-sm italic text-[var(--play-ink-faint)]',
} as const
