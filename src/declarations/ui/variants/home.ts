import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Home page layout
 * @type {Record<string, string>}
 */

export const HOME_STYLES = {
  // Two columns past lg
  grid: 'grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]',
  column: 'flex min-w-0 flex-col gap-8',
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex items-center gap-3 px-4 py-3 text-sm',
  rowLink:
    'flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  rowTitle: 'truncate font-semibold',
  rowMeta: 'text-xs text-[var(--color-ink-subtle)]',
  // Mono day stamp
  stamp:
    'flex w-12 shrink-0 flex-col items-center font-[family-name:var(--font-mono)] leading-none tabular-nums',
  stampDay: 'text-lg font-bold',
  stampMonth: 'text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Today's row
  rowToday: 'bg-[var(--color-brand-50)]',
  marker: `flex shrink-0 items-center gap-1.5 ${PROPERTY_LABEL}`,
  markerIcon: 'h-3.5 w-3.5',
  empty: 'px-4 py-6 text-sm text-[var(--color-ink-subtle)] italic',
  // Rows without a frame
  rows: 'flex flex-col',
  // Hairline under each line but the last
  item: 'relative after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:h-px after:w-3/5 after:bg-[var(--color-border)] last:after:hidden',
  line: 'flex w-full items-center gap-4 rounded-[var(--radius-lg)] px-3 py-3 text-left transition-colors',
  lineLink:
    'cursor-pointer hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  chip: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]',
  chipIcon: 'h-5 w-5',
  // Glyph opening a dated row
  rowGlyph: 'h-6 w-6 shrink-0',
  consoleIcon: 'h-6 w-6 shrink-0',
  // Urgent tiles
  urgentGrid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
  urgentTile:
    'flex w-full cursor-pointer items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  urgentTitle: 'font-bold tracking-tight',
  urgentScope: 'text-xs font-semibold text-[var(--color-ink-subtle)]',
  urgentText: 'line-clamp-2 text-sm text-[var(--color-ink-subtle)]',
  // Urgent box
  urgentChip: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
  urgentReason: 'truncate text-xs text-[var(--color-ink-subtle)] italic',
  more: 'self-start rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  quiet: 'px-3 text-sm text-[var(--color-ink-subtle)]',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  actions: 'flex shrink-0 items-center gap-1',
} as const

/**
 * Home flow: the lives strip, the one thing to do now, what follows, what is coming
 * @type {Record<string, string>}
 */

export const HOME_FLOW = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-12',
  grid: 'grid gap-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]',
  column: 'flex min-w-0 flex-col gap-6',
  label: PROPERTY_LABEL,
  // Lives
  lives: 'grid gap-3 sm:flex sm:flex-wrap',
  liveTile:
    'flex w-full min-w-0 cursor-pointer items-center sm:w-auto sm:min-w-52 gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface py-2.5 pr-6 pl-3 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  livePortrait: 'relative shrink-0',
  liveLevel:
    'absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-raised)]',
  liveLevelIcon: 'h-4 w-4',
  liveName: 'font-bold tracking-tight',
  liveState: 'text-xs text-[var(--color-ink-subtle)]',
  // Focus
  focus:
    'course-pop flex flex-col gap-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-7',
  focusTop: 'flex items-start justify-between gap-4',
  focusGlyph: 'h-12 w-12 shrink-0 text-[var(--color-brand-600)]',
  focusDue: 'text-sm font-semibold text-[var(--color-ink-subtle)]',
  focusBody: 'flex flex-col gap-2',
  focusTitle: 'text-2xl font-bold tracking-tight',
  focusMeta: 'text-body text-[var(--color-ink-subtle)]',
  focusNote:
    'flex max-w-lg flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3',
  focusNoteTitle: 'text-micro font-bold tracking-wide uppercase',
  focusNoteText: 'text-body leading-relaxed',
  focusActions: 'flex flex-wrap gap-3',
  // What follows
  queue: 'flex flex-col',
  queueRow:
    'flex w-full cursor-pointer items-center gap-4 rounded-[var(--radius-lg)] px-3 py-3 text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  queueGlyph: 'h-6 w-6 shrink-0 text-[var(--color-ink-subtle)]',
  queueBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  queueTitle: 'truncate font-semibold',
  queueMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  queueDue: 'shrink-0 text-xs font-semibold text-[var(--color-ink-subtle)]',
  more: 'self-start rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Nothing waits
  calm: 'flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-strong)] px-6 py-14 text-center',
  calmGlyph: 'course-check mb-2 h-12 w-12 text-[var(--color-success)]',
  calmTitle: 'text-xl font-bold tracking-tight',
  calmLead: 'max-w-xs text-sm text-[var(--color-ink-subtle)]',
  // Agenda
  agenda: 'flex flex-col gap-6',
  day: 'flex flex-col gap-1',
  dayHead: 'px-2 pb-1 text-sm font-bold',
  dayToday: 'text-[var(--color-brand-700)]',
  agendaRow:
    'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm transition-colors',
  agendaLink:
    'cursor-pointer hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  agendaTime:
    'w-12 shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)] tabular-nums',
  agendaGlyph: 'h-5 w-5 shrink-0',
  agendaTitle: 'min-w-0 flex-1 truncate font-semibold',
  quiet: 'text-sm text-[var(--color-ink-subtle)]',
} as const
