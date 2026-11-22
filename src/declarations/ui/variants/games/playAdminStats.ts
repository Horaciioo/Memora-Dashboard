/**
 * Play figures, Health style: tinted cards with a big value over a small chart
 * @type {Record<string, string>}
 */

export const PLAY_HEALTH = {
  page: 'flex flex-col gap-6',
  grid: 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3',
  card: 'flex min-w-0 flex-col gap-3 rounded-[var(--radius-lg)] bg-play-nest p-4',
  cardWide: 'md:col-span-2',
  cardHead: 'flex items-center gap-2 text-sm font-bold text-[color:var(--tone)]',
  cardGlyph: 'size-5 shrink-0',
  cardWhen: 'ml-auto text-xs font-semibold text-[var(--play-ink-faint)]',
  value: 'flex items-baseline gap-1.5',
  valueNumber: 'text-4xl leading-none font-bold tracking-tight tabular-nums',
  valueUnit: 'text-sm font-bold text-[var(--play-ink-soft)]',
  caption: 'text-xs font-semibold text-[var(--play-ink-faint)]',
  // Bars and line
  chart: 'relative h-28 w-full',
  bars: 'flex h-full w-full items-end gap-[3px]',
  barSlot: 'flex h-full min-w-0 flex-1 cursor-crosshair items-end',
  bar: 'w-full min-h-[3px] rounded-t-md bg-[color:var(--tone)] transition-opacity duration-150',
  barDim: 'opacity-35',
  svg: 'absolute inset-0 h-full w-full overflow-visible',
  slots: 'absolute inset-0 flex',
  slot: 'h-full min-w-0 flex-1 cursor-crosshair',
  dot: 'pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--play-panel-strong)] bg-[color:var(--tone)]',
  axis: 'flex justify-between text-micro font-semibold text-[var(--play-ink-faint)] tabular-nums',
  // Share of each game
  share: 'flex h-4 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  shareCut: 'h-full min-w-[2px]',
  legend: 'grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3',
  legendRow: 'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-play-lift',
  legendLogo: 'size-8 shrink-0',
  legendText: 'flex min-w-0 flex-1 flex-col',
  legendName: 'truncate text-sm font-bold',
  legendNote: 'text-xs font-semibold text-[var(--play-ink-soft)] tabular-nums',
  legendShare: 'text-sm font-bold tabular-nums',
  // Ranking
  rank: 'flex flex-col gap-2',
  rankRow: 'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-play-lift',
  rankNumber:
    'w-5 shrink-0 text-center text-sm font-bold text-[var(--play-ink-faint)] tabular-nums',
  rankName: 'min-w-0 flex-1 truncate text-sm font-bold',
  rankXp: 'text-sm font-bold tabular-nums',
} as const
