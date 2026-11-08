import { PLAY_PANEL } from '@/declarations/ui/variants/play'

/**
 * Own stats page: rank card, record, form, mastery
 * @type {Record<string, string>}
 */

export const PLAY_CAREER = {
  page: 'flex w-full flex-col gap-6',
  // Rank card in the tier colour
  hero: 'relative isolate flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-[color-mix(in_oklab,var(--tier)_22%,var(--play-night))] p-6 text-white [--ring-gap:color-mix(in_oklab,var(--tier)_22%,var(--play-night))] [--ring-track:rgb(255_255_255/0.18)] sm:p-9',
  heroTop: 'flex flex-col items-center gap-8 text-center sm:flex-row sm:gap-10 sm:text-left',
  heroText: 'flex min-w-0 flex-1 flex-col gap-1.5',
  heroKicker: 'text-xs font-extrabold tracking-widest text-[var(--tier)] uppercase',
  heroName: 'truncate text-4xl font-extrabold tracking-tight sm:text-6xl',
  heroXp: 'text-lg font-extrabold tabular-nums text-white/90',
  heroNext: 'text-sm text-white/75',
  // One rung per tier, the current one filling
  ladder: 'grid grid-cols-5 gap-2 sm:gap-3',
  rung: 'flex min-w-0 flex-col gap-2',
  rungTrack: 'h-2.5 overflow-hidden rounded-full bg-white/15',
  rungFill: 'block h-full rounded-full bg-[var(--rung)]',
  rungName:
    'truncate text-[0.65rem] font-extrabold tracking-wide text-white/55 uppercase sm:text-xs',
  rungNow: 'text-white',
  split: 'grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]',
  // Page not built yet
  construction: `${PLAY_PANEL} p-10 text-center text-lg font-bold text-[var(--play-ink-soft)]`,
  // Game buttons
  picker: 'flex gap-2 overflow-x-auto pb-1',
  pick: 'play-glass flex min-h-12 shrink-0 items-center gap-2.5 rounded-full px-5 text-sm font-extrabold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)]',
  pickOn:
    'bg-[var(--play-ink)] text-[var(--play-panel-strong)] hover:text-[var(--play-panel-strong)]',
  pickGame: 'bg-[var(--game)] text-[var(--play-night)] hover:text-[var(--play-night)]',
  pickLogo: 'size-7',
  // Win rate gauge, outcomes bar, four counters
  record: `${PLAY_PANEL} flex flex-col gap-7 p-6 sm:p-8`,
  recordTop: 'flex flex-col items-center gap-8 sm:flex-row',
  gauge: 'relative grid size-44 shrink-0 place-items-center',
  gaugeSvg: 'absolute inset-0 size-full -rotate-90',
  gaugeTrack: 'fill-none stroke-[var(--play-track)]',
  gaugeFill: 'fill-none stroke-[var(--play-gold-deep)] transition-[stroke-dashoffset] duration-700',
  gaugeText: 'relative flex flex-col items-center',
  gaugeValue: 'text-5xl font-extrabold tracking-tight tabular-nums text-[var(--play-ink)]',
  gaugeLabel: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  outcomes: 'flex w-full min-w-0 flex-1 flex-col gap-4',
  outcomeBar: 'flex h-5 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--play-track)]',
  outcomeWin: 'bg-[var(--play-golf)]',
  outcomeDraw: 'bg-[var(--play-gold)]',
  outcomeLoss: 'bg-[var(--play-alert)]',
  legend: 'grid grid-cols-3 gap-3',
  legendItem: 'flex flex-col gap-0.5',
  legendKey: 'mb-1 h-1 w-8 rounded-full',
  legendValue: 'text-3xl leading-none font-extrabold tabular-nums',
  legendLabel: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-faint)] uppercase',
  counters: 'grid grid-cols-2 gap-4 content-start',
  counter: `${PLAY_PANEL} flex min-w-0 flex-col items-start gap-4 p-5`,
  counterBody: 'flex min-w-0 flex-col-reverse gap-1',
  counterIcon:
    'grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--play-chip)] text-[var(--play-ink-soft)]',
  counterGlyph: 'size-5',
  counterValue: 'truncate text-3xl font-extrabold tabular-nums',
  counterLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  // One row per game
  mastery: 'grid gap-3 lg:grid-cols-2',
  row: `${PLAY_PANEL} flex items-center gap-4 p-4 sm:p-5`,
  rowOff: 'opacity-60',
  rowLogo: 'size-14 shrink-0',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-2',
  rowHead: 'flex items-baseline justify-between gap-3',
  rowName: 'truncate text-base font-extrabold',
  rowLevel: 'text-2xl leading-none font-extrabold tabular-nums',
  rowTrack: 'block h-2.5 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  rowFill: 'block h-full rounded-full bg-[var(--game)]',
  rowNote: 'text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
} as const

/**
 * Avatar wrapped in its level ring
 * @type {Record<string, string>}
 */

export const PLAY_RING = {
  root: 'relative inline-grid shrink-0 place-items-center rounded-full p-1.5 bg-[conic-gradient(var(--ring,var(--play-gold))_var(--share),var(--ring-track,var(--play-track))_0)]',
  face: 'rounded-full ring-4 ring-[var(--ring-gap,var(--play-panel-strong))]',
  level:
    'absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--ring,var(--play-gold))] px-3 py-0.5 text-xs font-extrabold whitespace-nowrap tabular-nums text-[var(--play-night)] ring-2 ring-[var(--ring-gap,var(--play-panel-strong))]',
} as const
