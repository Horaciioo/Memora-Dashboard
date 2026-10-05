/**
 * Section and panel styles
 * @type {Record<string, string>}
 */

export const SECTION_STYLES = {
  wrapper: 'flex flex-col gap-3',
  header: 'flex flex-wrap items-end justify-between gap-3',
  heading: 'flex flex-col gap-1',
  title: 'text-section font-semibold tracking-tight',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  panel: 'rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface',
  panelPadded: 'p-4 sm:p-6',
  // Visible box
  panelRaised: 'p-4 shadow-[var(--shadow-sm)] sm:p-6',
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
    'relative -mx-4 -mt-6 h-[var(--banner-h)] sm:-mx-6 sm:-mt-8 md:absolute md:inset-x-0 md:top-0 md:m-0',
  // Corner of the banner the page options sit in
  bannerOptions: 'absolute top-3 right-3 z-10 sm:top-4 sm:right-4',
  // Title sitting in the notch cut into the bottom edge of the banner
  notch: 'absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end',
  notchBody:
    'banner-notch-body flex min-w-0 max-w-[min(44rem,70vw)] items-center justify-center px-3 text-center',
  notchTitle: 'min-w-0 text-xl font-bold tracking-wide uppercase md:text-page',
  notchTitleText: 'min-w-0 text-balance md:truncate',
  // Shoulders of the notch
  notchSlopeStart: 'banner-slope banner-slope-start',
  notchSlopeEnd: 'banner-slope banner-slope-end',
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
  titleInput:
    'rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-1 outline-none ring-2 ring-[var(--color-brand-600)]',
  toolbar: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Art of the page banner
 * @type {Record<string, string>}
 */

export const PAGE_BANNER = {
  art: 'absolute inset-0 bg-[var(--color-frame)]',
  image: 'h-full w-full object-cover dark:brightness-[0.82]',
  // Mirror of the photo above it, shown when the page is pulled down past the top
  extension:
    'absolute inset-x-0 bottom-full h-full -scale-y-100 overflow-hidden bg-[var(--color-frame)]',
} as const

/**
 * Status styles
 * @type {Record<string, string>}
 */

export const STATUS_STYLES = {
  base: 'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-[var(--color-ink)]',
  dot: 'size-2 shrink-0 rounded-full',
  icon: 'size-3.5 shrink-0',
  // Done or past
  muted: 'opacity-70',
} as const

/**
 * Creator and project labels
 * @type {Record<string, string>}
 */

export const RECORD_LABEL = {
  row: 'inline-flex min-w-0 items-center gap-2 align-middle',
  name: 'truncate',
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
    'overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-scrim)] sm:items-center sm:p-6',
  panel:
    'surface-enter relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)] sm:rounded-[var(--radius-xl)]',
  header: 'flex items-start gap-3 px-5 pt-5 pb-4 sm:px-6',
  heading: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'text-lg leading-tight font-bold tracking-tight',
  close: '-mt-1 -mr-2 shrink-0',
  body: 'flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5 sm:px-6',
  // Tabs already rule the top
  bodyFlush: 'border-t-0 pt-1',
  footer: 'flex flex-wrap items-center justify-end gap-2 px-5 pt-1 pb-5 sm:px-6',
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
  // Bottom sheet on mobile, floating card from md
  panel:
    'drawer-enter fixed inset-x-0 bottom-0 z-50 flex h-[var(--drawer-mobile-h)] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)] md:top-0 md:right-[var(--drawer-page-right)] md:bottom-0 md:left-auto md:my-auto md:h-[var(--drawer-page-h)] md:w-[var(--drawer-page-w)] md:rounded-[var(--radius-xl)]',
  header: 'flex shrink-0 items-center gap-3 px-5 pt-4 pb-3',
  // Bare glyph
  glyph: 'flex shrink-0 items-center text-[var(--color-ink-accent)]',
  glyphIcon: 'h-5 w-5',
  title: 'min-w-0 flex-1 truncate text-base leading-tight font-bold tracking-tight',
  close: '-mr-2 shrink-0',
  // Section tabs under the header
  sections: 'shrink-0 px-5',
  body: 'min-h-0 flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5',
  // Fields of the section on screen
  section: 'drawer-section-enter',
  footer: 'shrink-0 border-t border-[var(--color-border)] px-2 py-2',
} as const

/**
 * Form drawer footer
 * @type {Record<string, string>}
 */

export const DRAWER_ACTIONS = {
  stack: 'flex flex-col gap-2 p-1',
  // Previous at the far left
  steps: 'flex items-center justify-between gap-2',
  step: 'group flex min-w-0 items-center gap-1 rounded-[var(--radius-md)] px-2 py-2.5 text-sm font-bold transition-colors hover:bg-[var(--color-hover)]',
  stepBack: 'mr-auto',
  stepNext: 'ml-auto',
  stepLabel: 'min-w-0 truncate',
  stepIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-accent)]',
  // Filled gestures
  line: 'flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-4 py-3 text-sm font-bold text-[var(--color-on-brand)] transition-[filter] hover:brightness-90 disabled:pointer-events-none disabled:opacity-60',
  save: 'bg-[var(--color-success)]',
  cancel: 'bg-[var(--color-danger)]',
  icon: 'h-4.5 w-4.5 shrink-0',
  divider: 'mx-1 h-px bg-[var(--color-border)]',
  note: 'mb-4 text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Menu styles
 * @type {Record<string, string>}
 */

export const MENU_STYLES = {
  panel:
    'surface-enter fixed z-[70] min-w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel py-1 shadow-[var(--shadow-lg)]',
  item: 'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-40',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-4 w-4 shrink-0 opacity-70',
  separator: 'my-1 h-px bg-[var(--color-border)]',
  label: 'px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  shortcut: 'ml-auto text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Tab styles
 * @type {Record<string, string>}
 */

export const TABS_STYLES = {
  list: 'relative flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-[var(--color-surface-sunken)] p-1',
  // Strip centred over its panel from sm
  listCentered: 'sm:mx-auto',
  tab: 'relative z-10 shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Open tab sits on the rose pill
  active:
    'font-semibold text-[var(--color-on-brand)] hover:bg-transparent hover:text-[var(--color-on-brand)]',
  flagged: 'text-[var(--color-danger)]',
  // Rose pill gliding under the open tab
  indicator:
    'tab-indicator pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-[var(--color-brand-600)] shadow-[var(--shadow-sm)]',
  panel: 'pt-4',
  content: 'flex items-center',
  icon: 'h-4 w-4 shrink-0',
  // Track sized on the real label width
  labelTrack:
    'grid transition-[grid-template-columns,opacity] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  labelOpen: 'grid-cols-[1fr] opacity-100',
  labelShut: 'grid-cols-[0fr] opacity-0',
  labelShutMobile: 'grid-cols-[0fr] opacity-0 sm:grid-cols-[1fr] sm:opacity-100',
  label: 'min-w-0 overflow-hidden whitespace-nowrap',
  // Gap folds away with the label
  labelBeside: 'pl-1.5',
} as const

/**
 * Command palette styles
 * @type {Record<string, string>}
 */

export const PALETTE_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-[80] flex items-start justify-center bg-[var(--color-ink)]/50 p-4 pt-[12vh] backdrop-blur-sm',
  panel:
    'surface-enter flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] glass-panel shadow-[var(--shadow-lg)]',
  field: 'flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3',
  input: 'w-full bg-transparent text-base outline-none placeholder:text-[var(--color-ink-subtle)]',
  results: 'flex-1 overflow-y-auto py-2',
  group: 'px-4 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  result: 'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
  resultActive: 'bg-[var(--color-brand-soft)]',
  hint: 'flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-ink-subtle)]',
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
  stack: 'flex items-center -space-x-2',
  ring: 'ring-2 ring-[var(--color-surface-raised)]',
} as const

export type AvatarSize = Extract<keyof typeof AVATAR_STYLES, 'xs' | 'sm' | 'md' | 'lg' | 'xl'>

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
  input:
    'w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-1 outline-none ring-2 ring-[var(--color-brand-600)]',
  area: 'block min-h-20 resize-y rounded-[var(--radius-md)] px-3 py-2 leading-relaxed',
  // Dashed field standing in for a creation row
  create:
    'w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-brand-400)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-solid focus:ring-2 focus:ring-[var(--color-brand-600)]',
  createTile: 'min-h-24 text-center',
  placeholder: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Personal settings page styles
 * @type {Record<string, string>}
 */

export const PREFERENCE_STYLES = {
  column: 'mx-auto flex w-full max-w-3xl flex-col gap-8',
  // Who is signed in
  hero: 'flex flex-col items-center gap-3 text-center',
  heroName: 'text-3xl font-bold tracking-tight',
  heroMeta: 'flex flex-col items-center gap-2',
  stack: 'flex flex-col gap-6',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
  label: 'text-sm font-medium',
  notice: 'pt-3 text-xs text-[var(--color-ink-subtle)]',
  footer: 'flex justify-center pt-5',
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
  page: 'grid min-h-screen grid-cols-1 gap-2 p-2 lg:grid-cols-[40fr_60fr]',
  banner:
    'relative isolate flex h-56 flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)] p-6 sm:h-72 lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)] lg:p-8',
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
  frame:
    'mt-2 flex w-full flex-col gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3',
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
    'glass-panel flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-ink)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-600)] motion-reduce:transition-none',
  buttonOpen: 'scale-105',
  icon: 'h-5 w-5',
  panel:
    'popover-enter glass-panel absolute top-[calc(100%+0.5rem)] right-0 z-[60] flex w-72 flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-2 text-sm shadow-[var(--shadow-lg)]',
  title:
    'px-2.5 pt-1.5 pb-1 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  row: 'flex items-center justify-between gap-4 rounded-[var(--radius-md)] px-2.5 py-2 font-semibold',
  // Many choices take the line under their label
  rowStacked: 'flex-col items-stretch gap-2',
} as const
