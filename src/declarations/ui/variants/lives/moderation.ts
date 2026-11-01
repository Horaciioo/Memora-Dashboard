import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'
import { SECTION_STYLES } from '@/declarations/ui/variants/surfaces'

/**
 * Livecon in force
 * @type {Record<string, string>}
 */

export const LIVECON_TITLE = {
  row: 'flex flex-wrap items-center justify-between gap-x-6 gap-y-4',
  heading: 'flex min-w-0 items-center gap-4',
  base: 'group flex min-w-0 items-center gap-4 rounded-[var(--radius-lg)] text-left',
  // Only a member allowed to change it feels it as a control
  interactive:
    'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]',
  name: 'text-4xl font-bold tracking-tight sm:text-5xl',
  search: 'w-full sm:w-72',
} as const

/**
 * Sanction panel
 * @type {Record<string, string>}
 */

export const SANCTION_PANEL = {
  wrapper: 'mx-auto flex w-full max-w-6xl flex-col gap-10',
  toolbar: 'flex flex-wrap items-center justify-center gap-3',
  // One gravity
  group: 'flex flex-col gap-4',
  groupHead: 'flex items-center gap-4',
  groupTitle: `${PROPERTY_LABEL} text-[var(--accent)]`,
  groupRule: 'h-px flex-1 bg-[var(--color-border)]',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4',
  // Raised box with a gravity edge
  card: 'group relative flex min-h-24 w-full sm:min-h-28 flex-col items-start justify-between gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-4 pr-4 pl-5 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--motion-duration-moderate)] before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[var(--accent)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none',
  cardName: 'text-body leading-snug font-bold tracking-tight text-balance',
  cardInput:
    'w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-1 text-body font-bold tracking-tight outline-none ring-2 ring-[var(--color-pick)]',
  cardFoot: 'flex w-full flex-col gap-1',
  cardStep: 'flex flex-wrap items-center gap-x-2 text-xs font-semibold',
  cardMuted: 'flex items-center gap-1.5 text-xs text-[var(--color-ink-subtle)] italic',
  cardIcon: 'h-3.5 w-3.5 shrink-0',
  empty: 'text-center text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Legend of the measures
 * @type {Record<string, string>}
 */

export const SANCTION_LEGEND = {
  root: 'flex flex-col gap-3',
  title: PROPERTY_LABEL,
  list: 'flex flex-wrap gap-2',
  item: 'rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--accent)_72%,black)] px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white/95',
} as const

/**
 * One offence opened in full
 * @type {Record<string, string>}
 */

export const OFFENSE_SHEET = {
  body: 'drawer-section-enter flex flex-col gap-8',
  column: 'flex min-w-0 flex-col gap-8',
  properties: 'grid grid-cols-2 gap-5',
  property: 'flex flex-col gap-1.5',
  propertyValue: 'text-sm font-bold',
  // Same well as a task description
  summary: SECTION_STYLES.well,
  block: 'flex flex-col gap-3',
  label: PROPERTY_LABEL,
  ladderLive:
    '-mx-2 -my-1 cursor-pointer rounded-[var(--radius-md)] px-2 py-1 transition-colors hover:bg-[var(--color-surface)]',
  placeholder: 'text-sm text-[var(--color-ink-subtle)] italic',
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
 * Detection tab of an offence
 * @type {Record<string, string>}
 */

export const DETECTION_PANEL = {
  lead: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  chips: 'flex flex-wrap gap-2',
  chip: 'inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] pl-3 text-sm font-semibold md:min-h-8 md:pl-2.5',
  chipPlain: 'pr-3 md:pr-2.5',
  chipRemove:
    'flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] md:min-h-8 md:min-w-8',
  chipIcon: 'h-3.5 w-3.5',
  entry: 'flex items-center gap-2',
  entryField: 'min-w-0 flex-1',
  // A chat line
  lines: 'flex flex-col gap-2',
  line: 'flex items-start justify-between gap-2 border-l-4 bg-[var(--color-surface)] py-1 pl-3 font-[family-name:var(--font-mono)] text-xs break-words',
  lineText: 'min-w-0 flex-1 py-1.5',
  moderate: 'border-[var(--color-danger)]',
  tolerate: 'border-[var(--color-border-strong)]',
  tester:
    'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
  verdict: 'flex flex-col gap-2',
  verdictNote: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Marsha Bot handbook: a search, the families, one quiet row per command opening on demand
 * @type {Record<string, string>}
 */

export const MARSHA_GUIDE = {
  // Families, list and detail side by side from xl, the detail under the list before
  page: 'mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[15rem_20.5rem_minmax(0,1fr)]',
  nav: 'flex flex-col gap-5 lg:row-span-2 xl:row-span-1',
  // Scrolled to when a command is picked below xl
  detailHost: 'scroll-mt-16 min-w-0',
  search: 'h-11',
  navList: 'flex flex-col gap-1',
  navItem:
    'flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-transparent px-3.5 py-2.5 text-left text-body font-semibold transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  navItemOn:
    'border-[var(--color-brand-200)] bg-[var(--color-brand-50)] font-bold hover:bg-[var(--color-brand-50)]',
  navIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-subtle)]',
  navIconOn: 'text-[var(--color-ink)]',
  navFoot: 'flex flex-col gap-3 border-t border-[var(--color-border)] pt-5',
  // Middle column
  column: 'flex flex-col gap-0.5',
  lead: 'px-4 pb-3 text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  group: `px-4 pt-4 pb-1.5 ${PROPERTY_LABEL}`,
  item: 'rounded-[var(--radius-lg)] border border-transparent px-4 py-3 text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
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
  args: 'grid grid-cols-1 gap-x-5 gap-y-4 border-t border-[var(--color-border)] pt-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]',
  argName: 'font-[family-name:var(--font-mono)] text-sm font-bold break-words',
  argKind:
    'mt-0.5 block font-[family-name:var(--font-sans)] text-micro font-bold tracking-wide uppercase',
  argRequired: 'text-[var(--color-brand-800)]',
  argOptional: 'text-[var(--color-ink-subtle)]',
  argText: 'text-body leading-relaxed text-[var(--color-ink-subtle)]',
  example:
    'flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--discord-background)] py-3.5 pr-2 pl-4 text-body leading-snug text-[var(--discord-text)]',
  exampleBody: 'min-w-0 flex-1',
  exampleHead: 'flex items-center gap-2',
  exampleAuthor: 'font-semibold text-[var(--discord-heading)]',
  exampleTime: 'text-micro text-[var(--discord-muted)]',
  exampleLine: 'mt-0.5 break-words',
  mention: 'rounded-[3px] bg-[var(--discord-mention)] px-1 text-[var(--discord-mention-text)]',
  exampleCopy: 'text-[var(--discord-muted)] hover:text-[var(--discord-heading)]',
  notes:
    'flex flex-col divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] text-body leading-relaxed',
  note: 'py-3',
  resources: 'flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5',
} as const
