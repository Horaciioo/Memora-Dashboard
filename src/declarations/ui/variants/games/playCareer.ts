import { PLAY_PANEL } from '@/declarations/ui/variants/games/play'
import { PLAY_GOLD_TILE } from '@/declarations/ui/variants/games/play/shared'

/**
 * Own stats page: rank card, record, form, mastery
 * @type {Record<string, string>}
 */

export const PLAY_CAREER = {
  page: 'mx-auto flex w-full max-w-7xl flex-col gap-10',
  // Section boxes, two columns on desktop
  grid: 'grid items-start gap-10 lg:grid-cols-2 lg:gap-x-8',
  cell: 'min-w-0',
  cellWide: 'min-w-0 lg:col-span-2',
  // Rank card in the tier colour
  hero: 'relative isolate flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-[color-mix(in_oklab,var(--tier)_22%,var(--play-night))] p-6 text-white [--ring-gap:color-mix(in_oklab,var(--tier)_22%,var(--play-night))] [--ring-track:rgb(255_255_255/0.18)] sm:p-9',
  heroTop: 'flex flex-col items-center gap-8 text-center sm:flex-row sm:gap-10 sm:text-left',
  heroFacts: 'grid w-full gap-3 sm:ml-auto sm:w-auto sm:min-w-[34rem] sm:grid-cols-2',
  heroFact: 'flex items-center gap-3.5 rounded-2xl bg-white/8 px-4 py-3 text-left',
  heroFactLogo: 'size-12 shrink-0',
  heroFactBody: 'flex min-w-0 flex-col gap-0.5',
  heroFactLabel: 'text-[0.7rem] font-bold tracking-wider text-white/60 uppercase',
  heroFactValue: 'truncate text-base leading-tight font-extrabold',
  heroFactHint: 'truncate text-sm text-white/70',
  // Picker bar: game menu, filter menu
  pickBar: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  heroText: 'flex min-w-0 flex-1 flex-col gap-1.5',
  heroKicker: 'text-xs font-extrabold tracking-widest text-[var(--tier)] uppercase',
  heroName: 'truncate text-4xl font-extrabold tracking-tight sm:text-6xl',
  heroXp: 'text-lg font-extrabold tabular-nums text-white/90',
  heroNext: 'text-sm text-white/75',
  split: 'grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]',
  // Win rate gauge beside the outcomes, stacked when narrow
  record: 'flex flex-col items-center gap-6 py-2 md:flex-row md:gap-10',
  gauge: 'relative grid size-40 shrink-0 place-items-center',
  gaugeSvg: 'absolute inset-0 size-full -rotate-90',
  gaugeTrack: 'fill-none stroke-[var(--play-track)]',
  gaugeFill:
    'fill-none stroke-[color-mix(in_srgb,var(--play-ludo)_62%,white)] transition-[stroke-dashoffset] duration-700',
  gaugeText: 'relative flex items-center justify-center',
  gaugeValue:
    'flex items-baseline gap-0.5 text-5xl leading-none font-extrabold tracking-tight tabular-nums text-[var(--play-ink)]',
  gaugeUnit: 'text-xl leading-none font-extrabold text-[var(--play-ink-soft)]',
  outcomes: 'flex w-full min-w-0 flex-1 flex-col gap-4',
  outcomeBar: 'flex h-5 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--play-track)]',
  outcomeWin: 'bg-[var(--play-golf)]',
  outcomeDraw: 'bg-[var(--play-gold)]',
  outcomeLoss: 'bg-[var(--play-alert)]',
  toneWin: 'text-[var(--play-golf)]',
  toneDraw: 'text-[var(--play-gold)]',
  toneLoss: 'text-[var(--play-alert)]',
  legend: 'grid grid-cols-3 gap-3 text-center',
  legendItem: 'flex flex-col items-center gap-0.5',
  legendValue: 'text-3xl leading-none font-extrabold tabular-nums',
  legendLabel: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-faint)] uppercase',
  counters: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
  counter: `${PLAY_PANEL} flex min-h-32 min-w-0 flex-col items-stretch px-4 py-4 shadow-[var(--shadow-sm)] sm:px-5`,
  counterBody: 'flex min-w-0 flex-1 flex-col-reverse justify-between gap-3',
  counterValue:
    'text-3xl leading-none font-extrabold tracking-tight whitespace-nowrap tabular-nums lg:text-[1.75rem] xl:text-3xl',
  counterLabel:
    'text-[0.7rem] leading-snug font-bold tracking-wider text-balance text-[var(--play-ink-faint)] uppercase',
  boxBody: 'flex flex-col gap-4 px-5 pb-5 sm:px-6 sm:pb-6',
  // Pinned trophies, eight at most
  pins: 'grid grid-cols-4 gap-3 lg:grid-cols-8',
  pin: 'flex min-w-0 flex-col items-center gap-2 text-center',
  pinIcon:
    'grid size-14 place-items-center rounded-2xl bg-[var(--play-chip)] text-[var(--play-ink-faint)] sm:size-16',
  pinIconOn: PLAY_GOLD_TILE,
  pinIdle: 'opacity-55',
  sparkles: 'pointer-events-none absolute inset-0 size-full overflow-visible',
  pinGlyph: 'size-6 sm:size-7',
  pinName: 'line-clamp-2 text-[0.7rem] leading-tight font-extrabold text-[var(--play-ink-soft)]',
  pinMore:
    'min-h-12 w-full text-center text-sm font-extrabold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  // One row per game
  mastery: 'grid gap-3 lg:grid-cols-2 xl:grid-cols-3',
  row: 'flex items-center gap-4 rounded-2xl bg-[var(--play-chip)] p-4',
  rowOff: 'opacity-60',
  rowLogo: 'size-12 shrink-0',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-2',
  rowHead: 'flex items-baseline justify-between gap-3',
  rowName: 'truncate text-base font-extrabold',
  rowLevel:
    'text-sm font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase tabular-nums',
  rowTrack: 'block h-2.5 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  rowFill: 'block h-full rounded-full bg-[var(--game)]',
  rowNote:
    'flex items-center justify-between gap-3 text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  rowRecord: 'flex gap-3 text-sm font-extrabold',
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
