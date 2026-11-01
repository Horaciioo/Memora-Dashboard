import { EDITING_MARK } from '@/declarations/ui/variants/controls'

/**
 * Section and panel styles
 * @type {Record<string, string>}
 */

export const SECTION_STYLES = {
  wrapper: 'flex flex-col gap-3',
  header: 'flex flex-wrap items-end justify-between gap-3',
  heading: 'flex items-center gap-3',
  title: 'text-2xl font-bold tracking-tight',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  panel: 'rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface',
  panelPadded: 'p-4 sm:p-6',
  // Visible box
  panelRaised: 'p-4 shadow-[var(--shadow-sm)] sm:p-6',
  // Greyer well inside a box
  well: 'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4',
  wellTitle: 'mt-6 mb-2 text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
} as const

/**
 * Page header styles
 * @type {Record<string, string>}
 */

export const PAGE_STYLES = {
  wrapper: 'mx-auto flex w-full flex-col gap-8',
  header: 'flex flex-col gap-4',
  // Banner across the top of the page: in the flow on a phone
  banner:
    'relative -mx-4 -mt-6 h-[var(--banner-h)] sm:-mx-6 sm:-mt-8 md:absolute md:inset-x-0 md:top-0 md:m-0 print:hidden',
  // Bar on the page colour across the top of the banner, clear of the window rim
  bannerBar:
    'absolute inset-x-0 top-0 z-10 hidden h-11 items-center justify-between gap-3 bg-[var(--color-page)] px-5 text-[var(--color-ink)] sm:px-6 md:flex md:h-14 md:pt-3',
  // Slot the page options are carried into
  bannerOptions: 'flex shrink-0 items-center gap-0.5',
  barButton:
    'inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed',
  barStar: 'size-5',
  barStarDim: 'opacity-40',
  // Title and note laid over the foot of the photograph
  bannerFoot:
    'absolute inset-x-0 bottom-0 flex flex-col gap-1.5 px-5 pb-3 text-[var(--color-on-media)] sm:px-8 sm:pb-7',
  bannerTitleRow: 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:flex-nowrap',
  // Portrait standing before the title
  bannerLead:
    'shrink-0 shadow-[var(--shadow-md)] ring-4 ring-[var(--color-on-media)] !size-14 md:!size-20 xl:!size-28',
  // Letters fade out towards their foot
  bannerTitle:
    'min-w-0 bg-gradient-to-b from-[var(--color-on-media)] from-20% to-[color-mix(in_srgb,var(--color-on-media)_2%,transparent)] to-100% bg-clip-text py-[0.2em] -my-[0.2em] pr-4 text-[clamp(1.5rem,8vw,2.25rem)] leading-none font-bold tracking-tight text-transparent uppercase italic sm:text-5xl md:text-6xl xl:text-8xl',
  bannerTitleText:
    'line-clamp-1 min-w-0 pr-2 text-balance [overflow-wrap:anywhere] md:[overflow-wrap:normal]',
  // Faint two-to-six word line under the title
  bannerHero:
    'relative -mt-1 text-xs leading-none font-bold tracking-tight text-balance text-[var(--color-on-media)] uppercase italic drop-shadow-[0_1px_6px_rgb(0_0_0/0.45)] md:-mt-4 md:text-2xl',
  // Very small line under the title
  bannerNote: 'flex text-xs font-medium',
  // Tab strip centred under the photograph, empty on most pages
  tabsHost: 'relative flex w-full justify-center empty:hidden',
  // Eyebrow left
  headerRow: 'flex flex-wrap items-center justify-between gap-4',
  eyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
  title: 'text-2xl font-bold tracking-tight sm:text-3xl',
  // Title and its glyph sharing one line
  heading: 'flex min-w-0 items-center gap-2',
  headingTitle: 'min-w-0 flex-1',
  titleEditable:
    '-mx-1 cursor-pointer rounded-[var(--radius-sm)] px-1 transition-colors hover:bg-[var(--color-surface)]',
  titleInput: `heading-face -mx-1 rounded-[var(--radius-sm)] px-1 outline-none ${EDITING_MARK}`,
  toolbar: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Art of the page banner
 * @type {Record<string, string>}
 */

export const PAGE_BANNER = {
  art: 'banner-shade absolute inset-0 bg-[image:var(--gradient-frame)]',
  image: 'h-full w-full object-cover dark:brightness-[0.82]',
} as const

/**
 * Centred title of every dialog and drawer
 * @type {Record<string, string>}
 */

export const MODAL_HEADER = {
  root: 'relative flex shrink-0 flex-col items-center gap-3 px-14 pt-7 pb-5 text-center sm:px-16',
  close: 'absolute top-3 right-3',
  glyph:
    'flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink)]',
  glyphIcon: 'size-6',
  title: 'min-w-0 text-lg leading-tight font-bold tracking-wide text-balance uppercase',
} as const

/**
 * Status styles
 * @type {Record<string, string>}
 */

export const STATUS_STYLES = {
  base: 'inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap',
  icon: 'size-3.5 shrink-0',
  // Done or past
  muted: 'opacity-70',
} as const

/**
 * Pastel fill of the accent, ink text
 * @type {string}
 */

export const PASTEL_TAG =
  'inline-flex w-fit items-center rounded-md bg-[color-mix(in_srgb,var(--accent)_58%,var(--color-surface))] px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-[var(--color-ink)]'

/**
 * Creator and project labels
 * @type {Record<string, string>}
 */

export const RECORD_LABEL = {
  row: 'inline-flex min-w-0 items-center gap-2 align-middle',
  group: 'inline-flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 align-middle',
  // A long title takes two lines on a phone
  name: 'line-clamp-2 break-words md:block md:truncate',
  emoji: 'shrink-0 text-base leading-none',
} as const

/**
 * Glyph sizes
 * @type {Record<string, string>}
 */

export const GLYPH_STYLES = {
  base: 'shrink-0 bg-transparent leading-none',
  chip: 'text-xs',
  row: 'text-sm',
  card: 'text-base',
  title: 'text-2xl',
} as const

export type GlyphSize = keyof Omit<typeof GLYPH_STYLES, 'base'>

/**
 * Dialog styles
 * @type {Record<string, string>}
 */

export const DIALOG_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-sm sm:p-6',
  panel:
    'surface-enter relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-line)] bg-[var(--color-surface-raised)]/90 shadow-[var(--shadow-lg)] backdrop-blur-2xl backdrop-saturate-150',
  // Line under the banner
  subheader: 'px-5 pt-4 sm:px-8',
  body: 'flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5 sm:px-8 sm:py-6',
  // Tabs already rule the top
  bodyFlush: 'border-t-0 pt-1',
  footer:
    'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-5 py-3 sm:px-8 sm:py-4',
} as const

/**
 * Floating sheet rising from the bottom edge
 * @type {Record<string, string>}
 */

export const BOTTOM_SHEET = {
  overlay:
    'overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-scrim)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden',
  frame: 'sheet-enter relative flex w-full max-w-lg flex-col items-center gap-4',
  // Title laid on the scrim, over the panel
  figure: 'w-full px-12 text-center text-[var(--color-on-media)]',
  panel:
    'relative flex max-h-[calc(100dvh-9rem)] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-line)] bg-[var(--color-surface-raised)]/95 shadow-[var(--shadow-lg)]',
  // Pulled down to close
  grip: 'flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-1',
  gripBar: 'h-1 w-10 rounded-full bg-[var(--color-ink)]/20',
  close: 'absolute -top-1 right-0 !text-[var(--color-on-media)] hover:!bg-white/15',
  body: 'min-h-0 flex-1 overflow-y-auto p-4',
  figureTitle:
    'text-4xl leading-none font-bold tracking-tight uppercase italic drop-shadow-[0_2px_10px_rgb(0_0_0/0.5)]',
  figureLine: 'text-sm font-medium opacity-80 drop-shadow-[0_1px_6px_rgb(0_0_0/0.5)]',
} as const

/**
 * Panel width per dialog size
 * @type {Record<string, string>}
 */

export const DIALOG_SIZES = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
} as const

export type DialogSize = keyof typeof DIALOG_SIZES

/**
 * Drawer styles
 * @type {Record<string, string>}
 */

export const DRAWER_STYLES = {
  // Dims the page window only
  overlay:
    'overlay-enter fixed inset-0 z-[45] bg-[var(--color-scrim)] md:inset-y-3 md:right-3 md:left-[var(--shell-sidebar-w)] md:rounded-[var(--radius-xl)]',
  // Floating sheet rising from the bottom on mobile, side card from md
  panel:
    'drawer-enter fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex h-[var(--drawer-mobile-h)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)] md:top-0 md:right-[var(--drawer-page-right)] md:bottom-0 md:left-auto md:my-auto md:h-[var(--drawer-page-h)] md:w-[var(--drawer-page-w)] md:rounded-[var(--radius-xl)]',
  // Wider footprint from md
  wide: 'md:w-[var(--drawer-page-wide-w)]',
  // Form on the left, live result on the right, same width and height
  split:
    'flex min-h-full flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-8',
  // Tabs and the result switch share a line
  subheaderRow: 'flex items-center justify-between gap-3',
  subheaderTabs: 'min-w-0 flex-1',
  asideToggle:
    'min-h-11 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-3 text-xs font-semibold text-[var(--color-ink-subtle)] md:hidden',
  asideToggleOn: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  splitDivider: 'hidden w-px self-stretch bg-[var(--color-border)] md:block',
  // Section tabs under the header
  sections: 'shrink-0 px-6 pb-2',
  body: 'min-h-0 flex-1 overflow-y-auto px-6 py-5',
  // Fields of the section on screen
  section: 'drawer-section-enter',
  footer:
    'shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-3 py-3',
} as const

/**
 * Form drawer footer
 * @type {Record<string, string>}
 */

export const DRAWER_ACTIONS = {
  // One row of glyphs on a phone, stacked lines from md
  stack: 'flex items-center gap-2 p-1 md:flex-col md:items-stretch',
  // Previous at the far left
  steps: 'contents md:flex md:items-center md:justify-between md:gap-2',
  step: 'group flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full px-2 text-sm font-bold transition-colors hover:bg-[var(--color-hover)] md:min-h-0 md:min-w-0 md:justify-start md:rounded-[var(--radius-md)] md:py-2.5',
  stepBack: 'mr-auto',
  stepNext: 'ml-auto',
  stepLabel: 'hidden min-w-0 truncate md:block',
  stepIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-accent)] md:h-4 md:w-4',
  // Filled gestures
  line: 'flex size-11 shrink-0 items-center justify-center gap-2.5 rounded-full text-sm font-bold text-[var(--color-on-brand)] transition-[filter] hover:brightness-90 disabled:pointer-events-none disabled:opacity-60 md:size-auto md:w-full md:rounded-[var(--radius-md)] md:px-4 md:py-3',
  lineLabel: 'hidden md:inline',
  // No glyph: the label stays, the line keeps its width on a phone
  linePlain:
    '!size-auto min-w-0 flex-1 !rounded-[var(--radius-md)] px-4 py-3 md:w-full md:flex-none',
  lineLabelPlain: 'inline',
  save: 'bg-[var(--color-success)] !text-[var(--color-on-solid)]',
  cancel: 'bg-[var(--color-danger)] !text-[var(--color-on-solid)]',
  neutral: 'bg-[var(--color-hover)] !text-[var(--color-ink)]',
  icon: 'h-5 w-5 shrink-0 md:h-4.5 md:w-4.5',
  // One slim row of glyphs at every width, leaves the room to a wide form
  slimStack: 'flex items-center justify-end gap-2 p-1',
  slimSteps: 'contents',
  slimLine:
    'flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--color-on-brand)] transition-[filter] hover:brightness-90 disabled:pointer-events-none disabled:opacity-60',
  slimIcon: 'h-5 w-5 shrink-0',
  divider: 'mx-1 hidden h-px bg-[var(--color-border)] md:block',
  note: 'mb-4 text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Menu styles
 * @type {Record<string, string>}
 */

export const MENU_STYLES = {
  panel:
    'surface-enter fixed z-[70] min-w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel py-1 shadow-[var(--shadow-lg)]',
  item: 'flex min-h-11 w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-40 md:min-h-0',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-4 w-4 shrink-0 opacity-70',
  separator: 'my-1 h-px bg-[var(--color-border)]',
  label: 'px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  shortcut: 'ml-auto text-xs text-[var(--color-ink-subtle)]',
  search:
    'mx-2 mt-1 mb-1.5 w-[calc(100%-1rem)] rounded-[var(--radius-sm)] border border-[var(--color-pick)] bg-[var(--color-field)] px-2.5 py-1.5 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  heading: 'px-3 pt-1.5 pb-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  chevron: 'ml-auto h-4 w-4 shrink-0 opacity-60',
  empty: 'px-3 py-2 text-sm text-[var(--color-ink-subtle)]',
  scroll: 'max-h-[min(70vh,28rem)] overflow-y-auto',
} as const

/**
 * Selection menu styles
 * @type {Record<string, string>}
 */

export const SELECTION_MENU_STYLES = {
  panel:
    'surface-enter fixed z-[60] flex w-64 flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-1.5 shadow-[var(--shadow-lg)]',
  search:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-pick)] bg-[var(--color-field)] px-2.5 py-1.5 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  heading: 'px-2.5 pt-2 pb-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  item: 'flex min-h-9 w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-4 w-4 shrink-0 opacity-70',
  separator: 'mx-1 my-0.5 h-px bg-[var(--color-border)]',
  shortcut: 'ml-auto text-xs text-[var(--color-ink-subtle)]',
  footer: 'px-2.5 pt-1 pb-1.5 text-xs text-[var(--color-ink-subtle)]',
  empty: 'px-2.5 py-2 text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Tab styles
 * @type {Record<string, string>}
 */

export const TABS_STYLES = {
  list: 'relative flex w-fit max-w-full gap-1 overflow-x-auto rounded-[var(--radius-lg)] glass-soft p-1',
  // Strip centred over its panel from sm
  listCentered: 'sm:mx-auto',
  tab: 'relative z-10 min-h-11 shrink-0 rounded-[calc(var(--radius-lg)-0.25rem)] px-3 py-1.5 text-sm font-medium sm:px-3.5 md:min-h-0 text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Open tab sits on the glass pill
  active:
    'font-semibold text-[var(--color-ink)] hover:bg-transparent hover:text-[var(--color-ink)]',
  flagged: 'text-[var(--color-danger)]',
  // Administration tab
  danger: 'text-[var(--color-danger)] hover:text-[var(--color-danger)]',
  activeDanger:
    'font-semibold text-[var(--color-danger)] hover:bg-transparent hover:text-[var(--color-danger)]',
  // Glass pill gliding under the open tab
  indicator:
    'tab-indicator glass-pill pointer-events-none absolute top-1 bottom-1 left-0 rounded-[calc(var(--radius-lg)-0.25rem)]',
  // Pulse ringing the open tab
  arrive: 'tab-arrive',
  panel: 'pt-4',
  content: 'flex items-center',
  icon: 'h-5 w-5 shrink-0 md:h-4 md:w-4',
  // Dark grey glyph, red tabs keep their tone
  iconTone: 'text-[var(--color-ink)]/80',
  label: 'whitespace-nowrap',
  // A tab with a glyph shows no words on a phone, the name stays on its aria-label
  labelBeside: 'hidden pl-1.5 md:inline',
} as const

/**
 * Command palette styles
 * @type {Record<string, string>}
 */

export const PALETTE_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-[80] flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-sm',
  panel:
    'surface-enter flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-line)] bg-[var(--color-surface-raised)]/90 shadow-[var(--shadow-lg)] backdrop-blur-2xl backdrop-saturate-150',
  field: 'flex items-center gap-3 px-5 py-4',
  input: 'w-full bg-transparent text-lg outline-none placeholder:text-[var(--color-ink-subtle)]',
  divider: 'mx-5 h-px shrink-0 bg-[var(--color-border)]',
  results: 'flex-1 overflow-y-auto p-2',
  group:
    'px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  result:
    'flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-left text-sm transition-colors duration-150',
  resultActive: 'bg-[var(--color-hover)]',
  hint: 'flex items-center justify-between px-5 py-2.5 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Avatar styles
 * @type {Record<string, string>}
 */

export const AVATAR_STYLES = {
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-brand-600)] font-semibold text-[var(--color-on-brand)] select-none',
  xs: 'h-6 w-6 text-micro',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
  hero: 'h-36 w-36 text-5xl sm:h-44 sm:w-44',
  stack: 'flex items-center -space-x-2',
  stackWrapped: 'flex flex-wrap items-center gap-y-0.5 pr-2 [&>*]:-mr-2',
  ring: 'ring-2 ring-[var(--color-surface-raised)]',
} as const

export type AvatarSize = Extract<
  keyof typeof AVATAR_STYLES,
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'
>

/**
 * Corner ribbon styles
 * @type {Record<string, string>}
 */

export const RIBBON_STYLES = {
  wrap: 'pointer-events-none absolute top-0 right-0 h-28 w-28 overflow-hidden',
  band: 'absolute top-6 -right-8 flex w-[150px] items-center justify-center gap-1 rotate-45 py-1.5 text-micro font-bold tracking-wide uppercase',
  fold: 'absolute -bottom-1.5 h-0 w-0 border-[6px] border-transparent border-t-[var(--color-ink)]/30',
  foldLeft: 'left-0',
  foldRight: 'right-0',
} as const

/**
 * Inline edit styles
 * @type {Record<string, string>}
 */

export const INLINE_EDIT_STYLES = {
  block:
    '-mx-2 -my-1 cursor-text rounded-[var(--radius-sm)] px-2 py-1 transition-colors hover:bg-[var(--color-surface)]',
  text: '-mx-1 cursor-text rounded-[var(--radius-sm)] px-1 transition-colors hover:bg-[var(--color-surface)]',
  input: `rounded-[var(--radius-sm)] outline-none ${EDITING_MARK}`,
  // Input laid exactly over its read text
  line: '-mx-1 max-w-full field-sizing-content px-1 py-0 text-inherit [text-align:inherit]',
  area: 'block -mx-2 -my-1 w-full field-sizing-content resize-none px-2 py-1 text-inherit [text-align:inherit]',
  blockEditing: `-mx-2 -my-1 rounded-[var(--radius-sm)] px-2 py-1 ${EDITING_MARK}`,
  // Dashed field standing in for a creation row
  create:
    'w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-brand-400)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-solid focus:ring-2 focus:ring-[var(--color-focus)]',
  createTile: 'min-h-16 text-center',
  placeholder: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Blank markdown, same size as its editor line
  placeholderBlock: 'leading-[1.65] text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Personal settings page styles
 * @type {Record<string, string>}
 */

export const PREFERENCE_STYLES = {
  layout:
    'mx-auto grid grid-cols-1 w-full max-w-5xl items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]',
  stack: 'flex flex-col gap-6',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
  label: 'flex items-center gap-2 text-sm font-medium',
  notice: 'pt-3 text-xs text-[var(--color-ink-subtle)]',
  footer: 'flex pt-5',
} as const

/**
 * Sign-in screen styles
 * @type {Record<string, string>}
 */

export const SIGN_IN_STYLES = {
  stack: 'flex flex-col gap-5',
  alert:
    'rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-danger)]',
  divider: 'flex items-center gap-3 text-micro text-[var(--color-ink-subtle)] uppercase',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  notice: 'text-xs text-[var(--color-ink-subtle)]',
  footer: 'pt-1 text-center text-xs',
  link: 'text-[var(--color-ink-subtle)] underline underline-offset-2 hover:text-[var(--color-ink)]',
} as const

/**
 * Privacy notice styles
 * @type {Record<string, string>}
 */

export const PRIVACY_STYLES = {
  page: 'mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12',
  section: 'flex flex-col gap-3',
  heading: 'text-lg font-bold tracking-tight',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  card: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-sm',
  scroller: 'overflow-x-auto',
  table: 'w-full min-w-[40rem] border-collapse text-left text-sm',
  head: 'border-b border-[var(--color-border)] pb-2 text-xs font-semibold uppercase text-[var(--color-ink-subtle)]',
  cell: 'border-b border-[var(--color-border)] py-3 pr-4 align-top',
  footer: 'text-sm',
} as const

/**
 * History consent screen styles
 * @type {Record<string, string>}
 */

export const CONSENT_STYLES = {
  stack: 'flex flex-col gap-4',
  heading: 'text-base font-bold tracking-tight',
  body: 'flex flex-col gap-3 text-sm text-[var(--color-ink-subtle)]',
  choice: 'flex items-start gap-3 text-sm',
  // Both answers sit centred on one column
  actions: 'mx-auto flex w-full max-w-xs flex-col items-stretch gap-3 pt-2',
  action: 'w-full justify-center',
  divider: 'h-px w-full bg-[var(--color-border)]',
  error: 'text-center text-xs text-[var(--color-danger)]',
} as const

/**
 * Wizard styles — a progress header
 * @type {Record<string, string>}
 */

export const WIZARD_STYLES = {
  frame: 'flex flex-col gap-7',
  header: 'flex flex-col gap-4',
  heading: 'flex flex-col gap-1',
  counter:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
  title: 'text-xl font-bold tracking-tight sm:text-2xl',
  body: 'flex min-h-64 flex-col gap-4',
  footer: 'flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6',
  // The rail only fits on a wide viewport
  rail: 'hidden sm:block',
} as const

/**
 * Public integration form styles — a standing creator banner
 * @type {Record<string, string>}
 */

export const ONBOARDING_STYLES = {
  // A gutter of its own
  page: 'grid min-h-dvh grid-cols-1 gap-2 p-2 lg:grid-cols-[40fr_60fr]',
  banner:
    'relative isolate flex h-56 flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)] p-6 sm:h-72 lg:sticky lg:top-2 lg:h-[calc(100dvh-1rem)] lg:p-8',
  bannerImage: 'absolute inset-0 -z-20 h-full w-full object-cover',
  // The scrim is what makes the title legible whatever the picture underneath
  bannerScrim:
    'absolute inset-0 -z-10 bg-gradient-to-t from-[var(--color-media-shade)]/85 via-[var(--color-media-shade)]/45 to-[var(--color-media-shade)]/20',
  bannerMark: 'w-28 opacity-90 brightness-0 invert lg:w-32',
  bannerFoot: 'flex flex-col gap-2',
  bannerEyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-on-media)]/70 uppercase',
  bannerTitle:
    'text-2xl font-bold tracking-tight text-[var(--color-on-media)] sm:text-3xl lg:text-4xl',
  // No frame
  panel: 'flex min-w-0 flex-col justify-center px-2 py-8 sm:px-6 lg:px-12 lg:py-14',
  form: 'mx-auto flex w-full max-w-xl flex-col gap-8',
  identity:
    'flex items-center gap-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]',
  identityName: 'text-base font-semibold',
  // The identifier sits under the name
  identityHandle: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  notice:
    'flex flex-col gap-1 rounded-[var(--radius-md)] border-l-2 border-[var(--color-brand-600)] bg-[var(--color-brand-soft)] px-4 py-3 text-xs text-[var(--color-ink-subtle)]',
  noticeTitle: 'text-xs font-semibold text-[var(--color-ink)]',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  heading: 'font-medium',
  body: 'flex flex-col gap-4',
  intro: 'flex flex-col gap-1',
  actions: 'flex flex-wrap items-center gap-3',
  outcome: 'flex flex-col gap-2 text-center',
  outcomeTitle: 'text-xl font-bold tracking-tight',
  // Admitted candidate
  admission: 'flex flex-col gap-1 border-l-4 border-[var(--color-success)] py-1 pl-4',
  admissionEyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-success)] uppercase',
} as const

/**
 * Controls of the timeline step that hands out the integration form
 * @type {Record<string, string>}
 */

export const INTEGRATION_STEP_STYLES = {
  frame: 'mt-1 flex w-full flex-col gap-2',
  row: 'flex flex-wrap items-center gap-2',
  meta: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Folding panel styles
 * @type {Record<string, string>}
 */

export const COLLAPSIBLE_PANEL = {
  frame: 'flex flex-col',
  head: 'flex items-center gap-2',
  toggle:
    'flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] py-1.5 text-left transition-colors hover:text-[var(--color-ink)]',
  icon: 'h-4 w-4 shrink-0',
  title: 'truncate text-sm font-bold tracking-wide uppercase',
  // Mono marker
  count: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)] tabular-nums',
  chevron: 'ml-auto h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
  chevronOpen: 'rotate-0',
  chevronShut: '-rotate-90',
  actions: 'flex shrink-0 items-center gap-1',
  body: 'pt-3',
} as const

/**
 * Page options styles
 * @type {Record<string, string>}
 */

export const PAGE_OPTIONS = {
  host: 'relative',
  button:
    'flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none',
  buttonOpen: 'relative z-[60] bg-[var(--color-hover)]',
  // Blurs the page behind on a phone
  backdrop: 'fixed inset-0 z-[55] bg-[var(--color-scrim)]/30 backdrop-blur-sm md:hidden',
  icon: 'size-4',
  panel:
    'popover-enter glass-panel absolute top-[calc(100%+0.5rem)] right-0 z-[60] flex w-72 flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-2 text-sm shadow-[var(--shadow-lg)]',
  title:
    'px-2.5 pt-1.5 pb-1 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  row: 'flex items-center justify-between gap-4 rounded-[var(--radius-md)] px-2.5 py-2 font-semibold',
  // Block drawn on a phone only, scrolls inside the panel
  content: 'flex max-h-[60dvh] flex-col gap-2 overflow-y-auto px-2.5 py-2 md:hidden',
  contentTitle: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Read-only line on every screen
  note: 'flex flex-col gap-1 px-2.5 py-2 text-caption leading-snug text-[var(--color-ink-subtle)]',
  // Person with avatar and small lines
  profile: 'flex items-center gap-2.5 px-2.5 py-2',
  profileText: 'flex min-w-0 flex-col text-xs text-[var(--color-ink-subtle)] italic',
  profileName: 'text-sm font-semibold text-[var(--color-ink)] not-italic',
  // One gesture on its own line
  action:
    'flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left font-medium transition-colors hover:bg-[var(--color-hover)]',
  actionDanger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  actionIcon: 'size-4 shrink-0 opacity-70',
  // Group heading and the rule above it
  heading:
    'px-2.5 pt-1 pb-0.5 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  divider: 'mx-1 my-1 border-0 border-t border-[var(--color-border)]',
  // Many choices take the line under their label
  rowStacked:
    'flex-col items-stretch gap-2 [&_[role=group]]:w-full [&_[role=group]>button]:flex-1 [&_[role=group]>button]:px-2',
} as const

/**
 * Items of one line split by a drawn dot
 * @type {Record<string, string>}
 */

export const DOTTED = {
  root: 'inline-flex flex-wrap items-center gap-x-2 gap-y-0.5',
  dot: 'size-1 shrink-0 rounded-full bg-current opacity-40',
  // Between two inline pieces of text
  mark: 'mx-2 inline-block size-1 rounded-full bg-current align-middle opacity-40',
} as const
