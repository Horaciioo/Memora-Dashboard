import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Chart frame, readout, legend and axis
 * @type {Record<string, string>}
 */

export const CHART = {
  root: 'flex flex-col gap-3',
  readout: 'min-h-5 text-sm font-semibold tabular-nums',
  readoutMuted: 'font-normal text-[var(--color-ink-subtle)]',
  plot: 'relative h-44 w-full',
  plotTall: 'h-60',
  grid: 'pointer-events-none absolute inset-x-0 border-t border-dashed border-[color-mix(in_srgb,var(--color-border)_60%,transparent)]',
  gridLabel:
    'absolute -top-2 left-0 bg-[var(--color-surface-raised)] pr-1 text-micro text-[var(--color-ink-subtle)] tabular-nums',
  axis: 'flex justify-between text-xs text-[var(--color-ink-subtle)] tabular-nums',
  legend: 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-ink-subtle)]',
  legendItem: 'inline-flex items-center gap-1.5',
  swatch: 'size-2.5 shrink-0 rounded-full',
  // Stacked bars
  bars: 'absolute inset-0 flex items-end gap-1 border-b border-[var(--color-border)] pl-7 [&:has(:hover)>*:not(:hover)]:opacity-40',
  barColumn:
    'flex h-full min-w-0 flex-1 cursor-default flex-col-reverse gap-px overflow-hidden rounded-t-[6px] transition-opacity',
  barSegment: 'w-full',
  // Area chart
  svg: 'absolute inset-0 h-full w-full overflow-visible',
  hits: 'absolute inset-0 flex',
  hit: 'h-full flex-1',
  cursor: 'pointer-events-none absolute inset-y-0 w-px bg-[var(--color-ink-subtle)]',
  cursorDot:
    'pointer-events-none absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-[var(--color-surface-raised)]',
  // Donut
  donut: 'flex flex-wrap items-center gap-6',
  donutSvg: 'size-40 shrink-0 -rotate-90',
  donutCentre: 'absolute inset-0 flex flex-col items-center justify-center',
  donutValue: 'text-2xl font-bold tracking-tight tabular-nums',
  donutLabel: PROPERTY_LABEL,
  donutList: 'flex min-w-0 flex-1 flex-col gap-1.5',
  donutRow: 'flex items-center gap-2 text-sm',
  donutName: 'min-w-0 flex-1 truncate',
  donutNumber: 'font-bold tabular-nums',
  donutShare: 'w-10 text-right text-xs text-[var(--color-ink-subtle)] tabular-nums',
  // Ranked bars
  ranks: 'flex flex-col gap-2',
  rank: 'grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm',
  rankName: 'flex min-w-0 flex-col truncate',
  rankDetail: 'truncate text-xs text-[var(--color-ink-subtle)]',
  rankTrack: 'h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]',
  rankFill: 'block h-full rounded-full',
  rankValue: 'text-right font-bold tabular-nums',
  // Comparison against the average
  versus: 'flex flex-col gap-5',
  versusRow:
    'grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[13rem_minmax(0,1fr)_4.5rem_5rem]',
  versusLabel: 'col-span-3 flex flex-col sm:col-span-1',
  versusTrack: 'relative col-span-1 h-2.5 rounded-full bg-[var(--color-border)]',
  versusFill: 'absolute inset-y-0 left-0 rounded-full bg-[var(--color-brand-600)]',
  versusMark: 'absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-[var(--color-ink)]',
  versusValue: 'text-right text-base font-bold tabular-nums',
  versusDelta: 'text-right text-sm font-semibold tabular-nums',
  versusUp: 'text-[var(--color-success)]',
  versusDown: 'text-[var(--color-danger)]',
  versusFlat: 'text-[var(--color-ink-subtle)]',
  versusNote: 'text-xs text-[var(--color-ink-subtle)]',
  // Section of figures
  deck: 'grid grid-cols-1 gap-6 lg:grid-cols-2',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const
