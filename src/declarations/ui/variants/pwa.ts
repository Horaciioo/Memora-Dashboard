/**
 * Installed application surfaces: update, offline, install hint
 * @type {Record<string, string>}
 */

export const PWA_STYLES = {
  // New version, floats under the top edge
  update:
    'toast-enter glass-toast fixed inset-x-4 top-3 z-[61] flex items-center gap-3 rounded-[var(--radius-xl)] px-4 py-3 text-sm md:inset-x-auto md:right-6 md:w-[min(26rem,calc(100vw-2rem))] print:hidden',
  updateBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  updateTitle: 'font-semibold',
  updateLead: 'text-xs text-[var(--color-ink-subtle)]',
  // Lost network, a strip above the page
  offline:
    'flex items-center justify-center gap-2 bg-[var(--color-ink)] px-4 py-2 text-center text-xs font-medium text-[var(--color-page)] print:hidden',
  offlineIcon: 'size-4 shrink-0',
  // Install hint, above the dock
  hint: 'sheet-enter glass-panel fixed inset-x-3 bottom-[var(--shell-dock-clearance)] z-40 flex flex-col gap-3 rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-lg)] md:hidden print:hidden',
  hintHead: 'flex items-start gap-3',
  hintIcon: 'size-11 shrink-0 rounded-[var(--radius-md)]',
  hintBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  hintTitle: 'text-sm font-semibold',
  hintLead: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
  hintActions: 'flex flex-wrap items-center justify-end gap-2',
  // Fallback page
  offlinePage:
    'mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-12',
} as const

/**
 * Push settings and console
 * @type {Record<string, string>}
 */

export const PUSH_STYLES = {
  stack: 'flex flex-col gap-4',
  status: 'text-sm text-[var(--color-ink-subtle)]',
  actions: 'flex flex-wrap items-center gap-2',
  categoryLabel: 'flex min-w-0 flex-1 items-start gap-3',
  categoryIcon: 'mt-0.5 size-5 shrink-0 text-[var(--color-ink-subtle)]',
  categoryText: 'flex min-w-0 flex-col gap-0.5',
  categoryName: 'text-sm font-medium',
  categoryLead: 'text-xs text-[var(--color-ink-subtle)]',
  deviceName: 'flex min-w-0 flex-1 flex-col gap-0.5',
  deviceTitle: 'flex items-center gap-2 text-sm font-medium',
  deviceIcon: 'size-4 shrink-0 text-[var(--color-ink-subtle)]',
  deviceMeta: 'text-xs text-[var(--color-ink-subtle)]',
  // Phone mock of one catalogue entry
  preview:
    'flex min-w-0 flex-1 items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-sm)]',
  previewIcon: 'size-9 shrink-0 rounded-[var(--radius-sm)]',
  previewText: 'flex min-w-0 flex-col gap-0.5',
  previewTitle: 'truncate text-sm font-semibold',
  previewBody: 'text-sm leading-snug',
  previewMeta: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  catalogueRow: 'flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center',
  journalMember: 'font-medium',
  journalMuted: 'text-[var(--color-ink-subtle)] italic',
} as const
