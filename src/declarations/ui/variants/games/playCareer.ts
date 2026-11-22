/**
 * Own stats page: rank card, record, form, mastery
 * @type {Record<string, string>}
 */

export const PLAY_CAREER = {
  // Rank card in the tier colour
  hero: '[--tier:var(--play-key)] relative isolate flex flex-col gap-4 overflow-hidden rounded-3xl bg-[color-mix(in_oklab,var(--tier)_22%,var(--play-night))] p-4 text-[var(--play-ink)] [--ring-gap:color-mix(in_oklab,var(--tier)_22%,var(--play-night))] [--ring-track:color-mix(in_srgb,var(--play-ink)_18%,transparent)] sm:p-5',
  heroTop: 'flex items-center gap-4 text-left sm:gap-6',
  // Picker bar: game menu, filter menu
  pickBar: 'grid grid-cols-2 gap-2 sm:gap-3',
  heroText: 'flex min-w-0 flex-1 flex-col gap-1',
  heroKicker: 'text-xs font-bold tracking-widest text-[var(--tier)] uppercase',
  heroName: 'truncate text-2xl font-bold tracking-tight sm:text-4xl',
  heroXp: 'text-base font-bold tabular-nums text-[var(--play-ink)]',
  heroNext: 'text-sm text-[var(--play-ink-soft)]',
  // Win rate gauge beside the outcomes, stacked when narrow
  record: 'flex items-center gap-4 py-1 md:gap-10 md:py-2',
  gauge: 'relative grid size-28 shrink-0 place-items-center md:size-40',
  gaugeSvg: 'absolute inset-0 size-full -rotate-90',
  gaugeTrack: 'fill-none stroke-[var(--play-track)]',
  gaugeFill: 'fill-none stroke-[var(--play-golf-glow)] transition-[stroke-dashoffset] duration-700',
  gaugeText: 'relative flex items-center justify-center',
  gaugeValue:
    'flex items-baseline gap-0.5 text-3xl leading-none md:text-5xl font-bold tracking-tight tabular-nums text-[var(--play-ink)]',
  gaugeUnit: 'text-xl leading-none font-bold text-[var(--play-ink-soft)]',
  outcomes: 'flex w-full min-w-0 flex-1 flex-col gap-3 md:gap-4',
  outcomeBar: 'flex h-5 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--play-track)]',
  outcomeWin: 'bg-[var(--play-golf)]',
  outcomeDraw: 'bg-[var(--play-gold)]',
  outcomeLoss: 'bg-[var(--play-alert)]',
  toneWin: 'text-[var(--play-golf)]',
  toneDraw: 'text-[var(--play-gold)]',
  toneLoss: 'text-[var(--play-alert)]',
  legend: 'grid grid-cols-3 gap-2 text-center md:gap-3',
  legendItem: 'flex flex-col items-center gap-0.5',
  legendValue: 'text-2xl leading-none md:text-3xl font-bold tabular-nums',
  legendLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  counters: 'grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4',
  counter:
    'flex min-h-20 min-w-0 flex-col items-stretch rounded-[var(--radius-lg)] bg-play-nest px-4 py-3 sm:min-h-32 sm:px-5 sm:py-4',
  counterBody: 'flex min-w-0 flex-1 flex-col-reverse justify-between gap-1.5 sm:gap-3',
  counterValue:
    'text-2xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums sm:text-3xl lg:text-[1.75rem] xl:text-3xl',
  counterLabel:
    'text-micro leading-snug font-bold tracking-wider text-balance text-[var(--play-ink-faint)] uppercase',
  sparkles: 'pointer-events-none absolute inset-0 size-full overflow-visible',
  // One row per game
  mastery: 'grid gap-3 lg:grid-cols-2 xl:grid-cols-3',
  row: 'flex items-center gap-4 rounded-[var(--radius-lg)] bg-play-nest p-4',
  rowOff: 'opacity-60',
  rowLogo: 'size-12 shrink-0',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-2',
  rowHead: 'flex items-baseline justify-between gap-3',
  rowName: 'truncate text-base font-bold',
  rowLevel: 'text-sm font-bold tracking-wide text-[var(--play-ink-soft)] uppercase tabular-nums',
  rowTrack: 'block h-2.5 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  rowFill: 'block h-full rounded-full bg-[var(--game)]',
  rowNote:
    'flex items-center justify-between gap-3 text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  rowRecord: 'flex gap-3 text-sm font-bold',
} as const
