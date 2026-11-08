import {
  EDITING_MARK,
  EMPTY_VALUE,
  PROPERTY_LABEL,
  PROPERTY_SPACING,
  PROPERTY_VALUE,
} from '@/declarations/ui/variants/controls'

/**
 * Detail sheet classes
 * @type {Record<string, string>}
 */

export const DETAIL_BLOCK = {
  // Two properties side by side from the narrowest screen
  grid: `grid grid-cols-2 ${PROPERTY_SPACING.rows} ${PROPERTY_SPACING.columns}`,
  // Three on one line from md
  gridInline: `grid grid-cols-2 md:grid-cols-3 ${PROPERTY_SPACING.rows} ${PROPERTY_SPACING.columns}`,
  entry: `flex min-w-0 flex-col ${PROPERTY_SPACING.within}`,
  stack: `flex flex-col ${PROPERTY_SPACING.rows}`,
  // Side by side on a phone, one column from md
  stackPaired: `grid grid-cols-2 ${PROPERTY_SPACING.columns} md:flex md:flex-col ${PROPERTY_SPACING.rows}`,
  // Long text runs edge to edge
  entryWide: `flex min-w-0 flex-col col-span-2 ${PROPERTY_SPACING.within}`,
  label: PROPERTY_LABEL,
  value: `text-sm break-words ${PROPERTY_VALUE}`,
  empty: `text-sm ${EMPTY_VALUE}`,
  // Read value that opens its editor on click
  editable:
    '-mx-1.5 -my-0.5 cursor-pointer rounded-[var(--radius-sm)] px-1.5 py-0.5 transition-colors hover:bg-[var(--color-surface)]',
  // Same box while its editor is open
  editing: `relative ${EDITING_MARK}`,
} as const

/**
 * Statistic strip classes
 * @type {Record<string, string>}
 */

export const METRIC_BLOCK = {
  row: 'flex flex-wrap items-center gap-x-6 gap-y-2',
  entry: 'flex items-baseline gap-1.5',
  value: 'text-lg font-bold tabular-nums',
  label: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Moderator file classes
 * @type {Record<string, string>}
 */

export const MEMBER_BLOCK = {
  frame: 'relative',
  frameCompact: 'relative row-span-3 md:row-auto',
  // Official logo on the portrait's corner
  divisionLogo: 'absolute -right-3 -bottom-3 h-14 w-14 drop-shadow-md',
  // Division stamped on the portrait's corner
  division:
    'absolute -right-1 -bottom-1 flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-brand-600)] px-1.5 text-sm font-bold text-[var(--color-on-brand)] ring-4 ring-[var(--color-surface-raised)]',
  // Role on the portrait's corner
  roleMark: 'absolute -right-3 -bottom-3 drop-shadow-md',
  roleGlyph: 'h-14 w-14',
  // Smaller portrait on a phone
  roleMarkCompact: 'absolute -right-2 -bottom-2 drop-shadow-md md:-right-3 md:-bottom-3',
  roleGlyphCompact: 'h-9 w-9 md:h-14 md:w-14',
  portrait:
    'block shrink-0 rounded-full transition-[filter] enabled:cursor-pointer enabled:hover:brightness-95 disabled:cursor-default',
  // Role glyph pinned to the portrait's corner
  emblem:
    'absolute -right-1 -bottom-1 h-9 w-9 rounded-full bg-[var(--color-surface)] p-1 ring-2 ring-[var(--color-surface)]',
  // Read-only function list
  marks: 'flex flex-wrap items-center gap-x-4 gap-y-2',
  mark: 'inline-flex items-center gap-2',
  // Stacked rows of marks and the rule between them
  rows: 'flex flex-col gap-3',
  divider: 'block h-px w-full bg-[var(--color-border)]',
} as const

/**
 * Green button of an observer, check then words
 * @type {Record<string, string>}
 */

export const OBSERVE_SUCCESS = {
  row: 'inline-flex items-center gap-2',
  // White disc, the green check reads on the green button
  mark: 'flex size-6 items-center justify-center rounded-full bg-white shadow-panel',
  markPop: 'observe-pop',
  glyph: 'size-5',
  textReveal: 'observe-reveal',
  // Green card, its rows share one padding so the divider sits centred between both texts
  box: 'overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-success)] text-sm font-semibold text-[var(--color-on-solid)] md:rounded-[1.25rem]',
  rowButton:
    'flex w-full items-center justify-center px-4 py-2.5 transition-[filter] duration-[var(--motion-duration-fast)] hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus)]',
  fold: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldOpen: 'grid-rows-[1fr]',
  clip: 'min-h-0 overflow-hidden',
  divider: 'border-t border-[color-mix(in_srgb,var(--color-on-solid)_35%,transparent)]',
} as const

/**
 * Moderator file layout: an identity rail that stays put
 * @type {Record<string, string>}
 */

export const MEMBER_FILE = {
  layout: 'grid grid-cols-1 gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start',
  main: 'flex min-w-0 flex-col gap-6',
  // Rail follows the scroll on wide screens only
  railStack: 'flex flex-col gap-3 lg:sticky lg:top-6',
  // Timeline of the rail, shown from lg, below it the overview carries it
  railTimeline: 'hidden lg:block',
  rail: 'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  head: 'grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 px-4 pt-4 text-left md:flex md:flex-col md:gap-2 md:px-5 md:pt-7 md:text-center',
  name: 'text-xl font-bold tracking-tight break-words',
  role: 'text-xs font-bold tracking-wide text-[var(--color-brand-800)] uppercase',
  status:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  // Dismissed or resigned
  departed: 'cursor-help text-xs font-bold tracking-wide text-[var(--color-danger)] uppercase',
  statusGlyph: 'h-4 w-4 shrink-0',
  functions: 'flex items-center gap-2 md:justify-center',
  body: 'mt-3 flex flex-col gap-5 border-t border-[var(--color-border)] p-4 md:mt-5 md:p-5',
  groupTitle: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  lock: 'px-5 pt-3 text-center',
  memoraId: 'font-[family-name:var(--font-mono)] text-xs',
  // Property list of a rail
  railList: 'flex flex-col gap-5',
  railItem: 'flex flex-col gap-1.5',
  factValue: 'text-sm font-medium',
  factEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Note card
  note: 'flex min-h-24 flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 shadow-[var(--shadow-sm)]',
  notePinned: 'border-[var(--color-brand-200)] bg-[var(--color-brand-50)]',
  noteHead: 'flex items-center gap-2 text-xs text-[var(--color-ink-subtle)]',
  noteBody: 'text-sm leading-relaxed whitespace-pre-wrap',
  notesGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  // Pinned note under the rail details
  pinned: 'flex flex-col gap-1.5',
  pinnedNote: 'flex flex-col gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4',
  pinnedLabel: 'text-xs font-bold tracking-wide uppercase',
  // Social tile
  social:
    'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-3 transition-colors hover:bg-[var(--color-hover)]',
  socialLogo:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]',
  socialsGrid: 'grid grid-cols-1 auto-rows-[4.5rem] gap-3 sm:grid-cols-2',
  socialAdd: 'h-full',
  more: 'self-start text-sm font-semibold text-[var(--color-brand-800)] underline-offset-4 hover:underline',
} as const

/**
 * Session lines of the Participation box
 * @type {Record<string, string>}
 */

export const PARTICIPATION_BOX = {
  list: 'flex flex-col gap-3',
  box: 'flex w-full flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-4 py-3 text-left transition-colors',
  link: 'cursor-pointer hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  // Access taken back, the glass turns red
  revoked: 'card-danger',
  head: 'flex items-center gap-3',
  body: 'flex min-w-0 flex-col gap-1.5',
  tabs: 'mb-4',
  title: 'min-w-0 truncate font-semibold',
  period: 'text-sm font-normal text-[var(--color-ink-subtle)]',
  facts: 'flex flex-col gap-1 text-sm text-[var(--color-ink-subtle)]',
  fact: 'flex gap-1.5',
  factLabel: 'font-semibold text-[var(--color-ink)]',
} as const

/**
 * Vertical list of stages joined by a rail
 * @type {Record<string, string>}
 */

export const STAGE_LIST = {
  stage: 'relative flex gap-4 pb-7 last:pb-0',
  // Thread running between two bare glyphs
  stageRail: 'absolute top-9 bottom-1 left-3 w-px -translate-x-1/2 bg-[var(--color-border-strong)]',
  stageRailDone: 'bg-[var(--color-success)]/50',
  stageChip:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-info)]',
  stageChipDone:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-success)]',
  stageChipLate:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-danger)]',
  stageChipOff:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-ink-subtle)]/60 opacity-50 grayscale',
  stageGlyph: 'h-6 w-6',
  stageBody: 'flex min-w-0 flex-1 flex-col gap-1.5',
  stageHead: 'flex min-w-0 flex-wrap items-center gap-2.5',
  stageTitle: 'text-base font-bold tracking-tight',
  stageTitleCurrent: 'text-[var(--color-info)]',
  stageLead: 'text-sm text-[var(--color-ink-subtle)]',
  stageActions: 'flex flex-wrap items-center gap-3',
} as const

/**
 * Discreet timeline laid in a corner
 * @type {Record<string, string>}
 */

export const STAGE_COMPACT = {
  root: 'opacity-80',
  stage: 'relative flex gap-2.5 pb-3 last:pb-0',
  stageRail:
    'absolute top-6 bottom-1 left-2 w-0 -translate-x-1/2 border-l border-dashed border-[var(--color-border-strong)]',
  stageRailDone: 'border-[var(--color-success)]/50',
  // Room a list takes when it does not fill its card
  stageSpaced: 'pb-8',
  stageChip: 'z-10 flex h-4 w-4 shrink-0 items-center justify-center',
  stageGlyph: 'h-4 w-4',
  stageTitle: 'text-sm leading-4 font-semibold',
  stageTitleDone: 'line-through decoration-[var(--color-ink-subtle)]/60',
  stageTitleCurrent: 'text-[var(--color-info)]',
  tone: {
    done: 'text-[var(--color-success)]',
    current: 'text-[var(--color-info)]',
    late: 'text-[var(--color-danger)]',
    upcoming: 'text-[var(--color-ink-subtle)]/60',
  },
} as const

/**
 * Anchored responsables classes
 * @type {Record<string, string>}
 */

export const LEAD_BLOCK = {
  panel: 'flex flex-col gap-4',
  row: 'flex min-w-0 items-center gap-3',
  name: 'min-w-0 flex-1 truncate text-sm font-medium',
  note: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Divider classes
 * @type {Record<string, string>}
 */

export const DIVIDER_BLOCK = {
  row: 'flex items-center gap-4 py-6',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  label: 'shrink-0 text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Standalone rule between two list rows
  medium: 'h-px w-full bg-[var(--color-border-strong)]',
} as const

/**
 * Creator file, identity box beside the teams
 * @type {Record<string, string>}
 */

export const CREATOR_FILE = {
  root: 'flex flex-col gap-6',
  designStack: 'flex flex-col divide-y divide-[var(--color-border)]',
  designTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  designTop: 'flex flex-wrap items-start divide-x divide-[var(--color-border)] pb-6',
  designCell: 'flex flex-col gap-3 px-6 first:pl-0 last:pr-0',
  designGallery: 'flex flex-col gap-3 pt-6',
  bannerGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5',
  designCard:
    'group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--motion-duration-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] disabled:cursor-default disabled:hover:translate-y-0',
  designBanner: 'aspect-[3/1] w-full',
  designBannerTall: 'aspect-[3/4] w-full',
  designCaption:
    'absolute inset-x-0 bottom-0 bg-[var(--color-media-shade)] px-3 py-2 text-xs font-semibold text-[var(--color-on-media)]',
  designAvatar: 'size-24',
  designLogo: 'aspect-[2/1] h-24',
  designImage: 'h-full w-full object-cover',
  designLogoImage: 'h-full w-full object-contain p-3',
  designAvatarImage: 'h-full w-full object-cover',
  designEmpty:
    'flex-col gap-2 border-dashed text-sm text-[var(--color-ink-subtle)] shadow-none hover:translate-y-0 hover:bg-[var(--color-hover)]',
  grid: 'grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3',
  column: 'flex flex-col gap-3',
  railHead:
    'relative isolate flex items-center gap-4 overflow-hidden bg-[var(--color-media-shade)] p-4 text-[var(--color-on-media)] md:p-5',
  railBody: 'flex flex-col gap-6 p-4 md:p-5',
  railPortrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-4 ring-[var(--color-on-media)]',
  railName: 'min-w-0 text-xl font-bold tracking-tight break-words',
  box: 'flex min-w-0 flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  boxHead:
    'flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-[var(--radius-xl)] p-3 text-left transition-colors hover:bg-[var(--color-hover)]',
  boxName: 'min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-ink)]',
  boxMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  boxMetaEmpty: 'truncate text-xs text-[var(--color-ink-subtle)] italic',
  chevron: 'size-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  fold: 'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldOpen:
    'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldClip: 'min-h-0 overflow-hidden',
  foldBody: 'flex flex-col gap-2 px-3 pb-3',
  stack: 'flex flex-col gap-4',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
}

/**
 * Creator group of the moderator list: a wide banner, then the box of its moderators
 * @type {Record<string, string>}
 */

export const CREATOR_GROUP = {
  root: 'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-md)]',
  banner:
    'relative isolate flex min-h-24 w-full cursor-pointer items-center gap-4 overflow-hidden bg-[var(--color-media-shade)] px-4 py-3 text-left text-[var(--color-on-media)] sm:px-6',
  portrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-2 ring-[var(--color-on-media)]',
  name: 'min-w-0 flex-1 truncate text-xl font-bold tracking-tight sm:text-2xl',
  chevron:
    'size-5 shrink-0 transition-transform duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)]',
  chevronOpen: 'rotate-180',
  // Rows slide, the content fades and settles a beat later
  fold: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  foldOpen:
    'grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  foldClip: 'min-h-0 overflow-hidden',
  box: 'card-surface p-4 opacity-0 -translate-y-3 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none sm:p-5',
  boxOpen:
    'card-surface p-4 opacity-100 translate-y-0 transition-[opacity,translate] delay-100 duration-400 ease-out motion-reduce:transition-none sm:p-5',
  // Sections inside a box
  sections: 'flex flex-col gap-5',
  section: 'flex flex-col gap-3',
  sectionHeading: 'text-xs font-bold tracking-wider text-[var(--color-ink-subtle)] uppercase',
} as const
