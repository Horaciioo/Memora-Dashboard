import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Livecon in force
 * @type {Record<string, string>}
 */

export const LIVECON_TITLE = {
  row: 'flex flex-wrap items-center justify-between gap-x-6 gap-y-4',
  base: 'group flex min-w-0 items-center gap-4 rounded-[var(--radius-lg)] text-left',
  // Only a member allowed to change it feels it as a control
  interactive:
    'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-ink-accent)]',
  icon: 'h-14 w-14 shrink-0 transition-transform duration-[var(--motion-duration-moderate)] group-hover:-rotate-6 group-hover:scale-110',
  name: 'text-4xl font-bold tracking-tight sm:text-5xl',
  search: 'w-full sm:w-72',
} as const

/**
 * Sanction panel
 * @type {Record<string, string>}
 */

export const SANCTION_PANEL = {
  wrapper: 'mx-auto flex w-full max-w-6xl flex-col gap-14',
  toolbar: 'flex flex-wrap items-center justify-center gap-3',
  // One gravity
  group: 'flex flex-col gap-5',
  groupTitle: `${PROPERTY_LABEL} text-[var(--accent)]`,
  grid: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // Raised box
  card: 'group relative flex min-h-16 w-full items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 pl-5 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--motion-duration-moderate)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-accent)]',
  cardRule: 'absolute inset-y-0 left-0 w-1 bg-[var(--accent)]',
  cardName: 'text-sm leading-snug font-bold tracking-tight text-balance',
  cardInput:
    'w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-1 text-sm font-bold tracking-tight outline-none ring-2 ring-[var(--color-brand-600)]',
  empty: 'text-center text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * One offence opened in full
 * @type {Record<string, string>}
 */

export const OFFENSE_SHEET = {
  body: 'flex flex-col gap-8',
  block: 'flex flex-col gap-3',
  label: PROPERTY_LABEL,
  gravity: `flex items-center gap-2 text-left ${PROPERTY_LABEL}`,
  gravityLabel: 'text-[var(--accent)]',
  // A label a manager can open is underlined on hover
  gravityLabelLive: 'cursor-pointer underline-offset-4 hover:underline',
  ladderLive:
    '-mx-2 -my-1 cursor-pointer rounded-[var(--radius-md)] px-2 py-1 transition-colors hover:bg-[var(--color-surface)]',
  placeholder: 'text-sm text-[var(--color-ink-subtle)] italic',
  // A chat line
  message:
    'border-l-4 bg-[var(--color-surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-xs break-words',
  moderate: 'border-[var(--color-danger)]',
  tolerate: 'border-[var(--color-success)]',
  ladder: 'flex flex-col',
  rung: 'relative flex gap-3 pb-4 pl-7 last:pb-0',
  rungRail: 'absolute top-2 bottom-0 left-[9px] w-0.5 bg-[var(--color-border)]',
  rungDot:
    'absolute top-1 left-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] font-[family-name:var(--font-mono)] text-micro font-bold',
  rungBody: 'flex min-w-0 flex-1 flex-col gap-2',
  rungCondition: 'text-sm font-bold',
  measures: 'flex flex-wrap gap-1.5',
  // Pastel ground
  measure: 'rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-semibold text-[var(--color-ink)]',
  command:
    'flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pr-1 pl-3',
  commandText: 'min-w-0 truncate font-[family-name:var(--font-mono)] text-xs',
  how: 'text-xs text-[var(--color-ink-subtle)]',
  warning:
    'flex items-start justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm',
  editor: 'flex flex-col gap-3',
  editorRung:
    'flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3',
  editorRow: 'flex items-center gap-2',
  actions: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Marsha Bot handbook: a search, the families, one quiet row per command opening on demand
 * @type {Record<string, string>}
 */

export const MARSHA_GUIDE = {
  page: 'mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[15rem_20.5rem_minmax(0,1fr)] lg:items-start',
  nav: 'flex flex-col gap-5',
  search: 'h-11',
  navList: 'flex flex-col gap-1',
  navItem:
    'flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-transparent px-3.5 py-2.5 text-left text-body font-semibold transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-accent)]',
  navItemOn:
    'border-[var(--color-brand-200)] bg-[var(--color-brand-50)] font-bold hover:bg-[var(--color-brand-50)]',
  navIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-subtle)]',
  navIconOn: 'text-[var(--color-ink-accent)]',
  navFoot: 'flex flex-col gap-3 border-t border-[var(--color-border)] pt-5',
  // Middle column
  column: 'flex flex-col gap-0.5',
  lead: 'px-4 pb-3 text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  group: `px-4 pt-4 pb-1.5 ${PROPERTY_LABEL}`,
  item: 'rounded-[var(--radius-lg)] border border-transparent px-4 py-3 text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-accent)]',
  itemOn:
    'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-surface-raised)]',
  itemName: 'block font-[family-name:var(--font-mono)] text-body font-bold',
  itemText: 'mt-0.5 block text-caption leading-snug text-[var(--color-ink-subtle)]',
  empty: 'px-4 py-10 text-center text-sm text-[var(--color-ink-subtle)] italic',
  // Detail of the one picked
  detail:
    'surface-enter flex min-w-0 flex-col gap-7 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 sm:p-8',
  detailHead: 'flex items-center gap-4',
  detailName:
    'min-w-0 flex-1 truncate font-[family-name:var(--font-mono)] text-4xl font-bold tracking-tight',
  detailTitle: 'min-w-0 flex-1 text-3xl leading-tight font-bold tracking-tight text-balance',
  summary: 'text-lg leading-relaxed',
  block: 'flex flex-col gap-2.5',
  label: PROPERTY_LABEL,
  code: 'flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-ink)] py-3 pr-2 pl-5 font-[family-name:var(--font-mono)] text-body text-[var(--color-background)]',
  codeText: 'min-w-0 flex-1 break-words',
  codeWord: 'text-[var(--color-brand-300)]',
  args: 'grid gap-x-5 gap-y-4 border-t border-[var(--color-border)] pt-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]',
  argName: 'font-[family-name:var(--font-mono)] text-sm font-bold break-words',
  argKind:
    'mt-0.5 block font-[family-name:var(--font-sans)] text-micro font-bold tracking-wide uppercase',
  argRequired: 'text-[var(--color-brand-800)]',
  argOptional: 'text-[var(--color-ink-subtle)]',
  argText: 'text-body leading-relaxed text-[var(--color-ink-subtle)]',
  example:
    'flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--discord-background)] py-3.5 pr-2 pl-4 text-body leading-snug text-[var(--discord-text)]',
  exampleBody: 'min-w-0 flex-1',
  exampleAuthor: 'font-semibold text-[var(--discord-heading)]',
  exampleTime: 'ml-2 text-micro text-[var(--discord-muted)]',
  exampleLine: 'mt-0.5 break-words',
  mention: 'rounded-[3px] bg-[var(--discord-mention)] px-1 text-[var(--discord-mention-text)]',
  exampleCopy: 'text-[var(--discord-muted)] hover:text-[var(--discord-heading)]',
  notes:
    'flex flex-col divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] text-body leading-relaxed',
  note: 'py-3',
  resources: 'flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5',
} as const
