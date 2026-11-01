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
  hint: 'sheet-enter bg-[var(--color-surface)] fixed inset-x-3 bottom-[var(--shell-dock-clearance)] z-40 flex flex-col gap-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-lg)] isolate md:hidden print:hidden',
  hintWash: 'pointer-events-none absolute inset-0 -z-10 bg-[image:var(--gradient-soft)] opacity-30',
  hintHead: 'flex items-center gap-4',
  hintIcon:
    'size-14 shrink-0 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-md)]',
  hintBody: 'flex min-w-0 flex-1 flex-col gap-1',
  hintTitle: 'text-base font-semibold leading-tight',
  hintLead: 'text-sm leading-snug text-[var(--color-ink-subtle)]',
  hintActions: 'flex flex-col gap-1',
  hintSecondary: 'flex items-center justify-center gap-2',
  // Fallback page
  offlinePage:
    'mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-12',
} as const

/**
 * Push device card, shared by the settings and the home
 * @type {Record<string, string>}
 */

export const PUSH_INVITE = {
  card: 'card-surface relative isolate flex flex-wrap items-center gap-x-5 gap-y-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)] sm:p-6',
  wash: 'pointer-events-none absolute inset-0 -z-10 bg-[image:var(--gradient-soft)] opacity-40',
  orb: 'relative grid size-16 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-figure)] text-[var(--color-on-brand)] shadow-[var(--shadow-md)]',
  ring: 'push-orb-ring pointer-events-none absolute inset-0 rounded-full border border-[var(--color-brand-600)]',
  phone: 'h-10 w-auto',
  body: 'flex min-w-0 flex-1 basis-64 flex-col gap-1',
  title: 'text-section font-semibold tracking-tight',
  lead: 'text-sm leading-snug text-[var(--color-ink-subtle)]',
  hint: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  cta: 'push-cta-sheen',
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

/**
 * iPhone mock of the dock
 * @type {Record<string, string>}
 */

export const DOCK_PHONE = {
  host: 'hidden shrink-0 justify-center md:flex',
  device:
    'relative aspect-[9/19.5] w-[15.5rem] shrink-0 rounded-[2.6rem] bg-[var(--color-ink)] p-[0.45rem] shadow-[var(--shadow-lg)]',
  // Hardware buttons
  buttonLeft: 'absolute top-24 -left-[3px] h-9 w-[3px] rounded-l bg-[var(--color-ink)]',
  buttonLeftTall: 'absolute top-36 -left-[3px] h-14 w-[3px] rounded-l bg-[var(--color-ink)]',
  buttonRight: 'absolute top-32 -right-[3px] h-20 w-[3px] rounded-r bg-[var(--color-ink)]',
  screen:
    'relative flex size-full flex-col gap-3 overflow-hidden rounded-[2.2rem] bg-[var(--color-page)] px-4 pt-3',
  island: 'absolute top-2.5 left-1/2 z-10 h-5 w-[4.6rem] -translate-x-1/2 rounded-full bg-black',
  status: 'flex h-6 items-center justify-between px-2',
  statusIcons: 'flex items-center gap-1',
  // Page behind the dock
  content: 'flex flex-1 flex-col gap-3 overflow-hidden',
  bar: 'dock-glass absolute inset-x-2.5 bottom-5 z-10 flex h-[var(--shell-dock-h)] items-center justify-around rounded-full border px-1',
  indicator:
    'absolute bottom-1.5 left-1/2 z-10 h-1 w-20 -translate-x-1/2 rounded-full bg-[var(--color-ink)]',
  // Entries are not links here
  item: 'flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full',
} as const
