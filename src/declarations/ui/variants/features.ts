/**
 * Features console
 * @type {Record<string, string>}
 */

export const FEATURE_STYLES = {
  column: 'mx-auto flex w-full max-w-6xl flex-col gap-6',
  layout: 'grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]',
  sections: 'flex min-w-0 flex-col gap-8',
  nav: 'flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:pb-0',
  navLink:
    'flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm font-medium text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  navIcon: 'size-4 shrink-0',
  navCut: 'ml-auto pl-2 text-xs font-bold text-[var(--color-danger)]',
  section: 'flex scroll-mt-6 flex-col gap-3',
  sectionText: 'flex min-w-0 items-start gap-3',
  sectionIcon: 'mt-0.5 size-5 shrink-0 text-[var(--color-ink-subtle)]',
  sectionLead: 'text-sm text-[var(--color-ink-subtle)]',
  now: 'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
  nowRow: 'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1',
  nowName: 'text-sm font-medium text-[var(--color-ink)]',
  nowState: 'ml-2 text-xs text-[var(--color-ink-subtle)]',
  familyList: 'flex flex-col divide-y divide-[var(--color-border)]',
  family: 'px-4 pt-3 pb-1 text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  toolbar: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
  search:
    'min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3.5 py-2 text-sm text-[var(--color-on-field)] placeholder:text-[var(--color-on-field-subtle)] hover:border-[var(--color-field-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] sm:max-w-xs',
  filters: 'flex flex-wrap items-center gap-2',
  sectionHead: 'flex flex-wrap items-start justify-between gap-3 px-1',
  sectionTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  sectionActions: 'flex items-center gap-1',
  panel:
    'flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]',
  row: 'flex flex-col gap-2 px-4 py-3',
  rowMain: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
  rowText: 'flex min-w-0 items-start gap-2',
  rowName: 'font-medium text-[var(--color-ink)]',
  rowNameOff: 'font-medium text-[var(--color-ink-subtle)] line-through',
  rowKind: 'text-xs text-[var(--color-ink-subtle)]',
  rowHint: 'text-sm text-[var(--color-ink-subtle)]',
  rowInherited: 'text-xs text-[var(--color-ink-subtle)] italic',
  rowTitle: 'flex flex-wrap items-baseline gap-x-2',
  fold: 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-transform hover:bg-[var(--color-hover)]',
  foldOpen: 'rotate-90',
  foldSpacer: 'size-5 shrink-0',
  children:
    'ml-7 flex flex-col divide-y divide-[var(--color-border)] border-l border-[var(--color-border)]',
  lock: 'inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-subtle)]',
  lockIcon: 'size-4',
  note: 'min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-sm text-[var(--color-on-field)] placeholder:text-[var(--color-on-field-subtle)] hover:border-[var(--color-field-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
} as const
