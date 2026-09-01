/**
 * Section and panel styles
 * @type {Record<string, string>}
 */

export const SECTION_STYLES = {
  wrapper: 'flex flex-col gap-3',
  header: 'flex flex-wrap items-end justify-between gap-3',
  heading: 'flex flex-col gap-1',
  title: 'text-xl font-bold tracking-tight italic sm:text-2xl',
  description: 'text-sm italic text-[var(--color-ink-subtle)]',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  panel:
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  panelPadded: 'p-4 sm:p-5',
} as const

/**
 * Page header styles
 * @type {Record<string, string>}
 */

export const PAGE_STYLES = {
  wrapper: 'flex flex-col gap-8',
  header: 'flex flex-wrap items-start justify-between gap-4',
  eyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
  title: 'text-2xl font-extrabold tracking-tight italic sm:text-3xl',
  // Title and its glyph sharing one line
  heading: 'flex min-w-0 items-center gap-2',
  headingTitle: 'min-w-0 flex-1',
  titleEditable:
    '-mx-1 cursor-pointer rounded-[var(--radius-sm)] px-1 transition-colors hover:bg-[var(--color-surface)]',
  titleInput:
    'rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-1 outline-none ring-2 ring-[var(--color-brand-600)]',
  lead: 'max-w-2xl text-sm italic text-[var(--color-ink-subtle)]',
  toolbar: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Badge styles
 * @type {Record<string, string>}
 */

export const BADGE_STYLES = {
  base: 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  outline: 'border',
  dot: 'h-1.5 w-1.5 rounded-full',
  icon: 'h-3 w-3',
} as const

/**
 * Glyph sizes, a record's emoji sitting on the surface without a frame
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
    'overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/50 p-4 backdrop-blur-md sm:p-6',
  panel:
    'surface-enter relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  header: 'flex items-start gap-3 px-5 pt-5 pb-4 sm:px-6',
  heading: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'text-lg leading-tight font-bold tracking-tight',
  description: 'line-clamp-1 text-sm text-[var(--color-ink-subtle)] italic',
  close: '-mt-1 -mr-2 shrink-0',
  body: 'flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5 sm:px-6',
  // Tabs already rule the top, drop the body border
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
  overlay: 'overlay-enter fixed inset-0 z-50 bg-[var(--color-ink)]/40 backdrop-blur-sm',
  panel:
    'drawer-enter fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
} as const

/**
 * Menu styles, shared by context menu and dropdown
 * @type {Record<string, string>}
 */

export const MENU_STYLES = {
  panel:
    'surface-enter fixed z-[70] min-w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1 shadow-[var(--shadow-lg)]',
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
  list: 'relative flex gap-1 overflow-x-auto border-b border-[var(--color-border)]',
  tab: 'shrink-0 px-3 py-2 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  active: 'text-[var(--color-brand-600)]',
  flagged: 'text-[var(--color-danger)]',
  indicator:
    'tab-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 bg-[var(--color-brand-600)]',
  panel: 'pt-4',
} as const

/**
 * Command palette styles
 * @type {Record<string, string>}
 */

export const PALETTE_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-[80] flex items-start justify-center bg-[var(--color-ink)]/50 p-4 pt-[12vh] backdrop-blur-sm',
  panel:
    'surface-enter flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
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
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  stack: 'flex items-center -space-x-2',
  ring: 'ring-2 ring-[var(--color-surface-raised)]',
} as const

export type AvatarSize = Extract<keyof typeof AVATAR_STYLES, 'xs' | 'sm' | 'md' | 'lg'>

/**
 * Corner ribbon styles, a folded band cutting across a card's corner
 * @type {Record<string, string>}
 */

export const RIBBON_STYLES = {
  wrap: 'pointer-events-none absolute top-0 right-0 h-28 w-28 overflow-hidden',
  band: 'absolute top-6 -right-8 flex w-[150px] items-center justify-center gap-1 rotate-45 py-1.5 text-[11px] font-bold tracking-wide uppercase',
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
  placeholder: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Personal settings page styles
 * @type {Record<string, string>}
 */

export const PREFERENCE_STYLES = {
  stack: 'flex flex-col gap-6',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
  label: 'text-sm font-medium',
  notice: 'pt-3 text-xs text-[var(--color-ink-subtle)] italic',
  identity: 'flex items-center gap-4 pb-4',
  footer: 'flex justify-end pt-4',
} as const

/**
 * Sign-in screen styles
 * @type {Record<string, string>}
 */

export const SIGN_IN_STYLES = {
  stack: 'flex flex-col gap-5',
  alert:
    'rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-danger)]',
  divider: 'flex items-center gap-3 text-[11px] text-[var(--color-ink-subtle)] uppercase',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  notice: 'text-xs text-[var(--color-ink-subtle)] italic',
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
  card: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm',
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
  // Both answers sit centred on one column, the rule between them matching their width
  actions: 'mx-auto flex w-full max-w-xs flex-col items-stretch gap-3 pt-2',
  action: 'w-full justify-center',
  divider: 'h-px w-full bg-[var(--color-border)]',
  error: 'text-center text-xs text-[var(--color-danger)]',
} as const

/**
 * Wizard styles — a progress header, one step on screen, a footer of two moves
 * @type {Record<string, string>}
 */

export const WIZARD_STYLES = {
  frame: 'flex flex-col gap-7',
  header: 'flex flex-col gap-4',
  heading: 'flex flex-col gap-1',
  counter:
    'font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-[var(--color-ink-accent)] uppercase',
  title: 'text-xl font-extrabold tracking-tight italic sm:text-2xl',
  hint: 'text-sm text-[var(--color-ink-subtle)] italic',
  body: 'flex min-h-64 flex-col gap-4',
  footer: 'flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6',
  // The rail only fits on a wide viewport, the bar carries the progress on a narrow one
  rail: 'hidden sm:block',
} as const

/**
 * Public integration form styles — a standing creator banner, the form bare beside it
 * @type {Record<string, string>}
 */

export const ONBOARDING_STYLES = {
  // A gutter of its own, so the banner never welds itself to the window edge
  page: 'grid min-h-screen grid-cols-1 gap-2 p-2 lg:grid-cols-[40fr_60fr]',
  banner:
    'relative isolate flex h-56 flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)] p-6 sm:h-72 lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)] lg:p-8',
  bannerImage: 'absolute inset-0 -z-20 h-full w-full object-cover',
  // The scrim is what makes the title legible whatever the picture underneath
  bannerScrim: 'absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/20',
  bannerMark: 'w-28 opacity-90 brightness-0 invert lg:w-32',
  bannerFoot: 'flex flex-col gap-2',
  bannerEyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-white/70 uppercase',
  bannerTitle: 'text-2xl font-extrabold tracking-tight text-white italic sm:text-3xl lg:text-4xl',
  bannerLead: 'max-w-sm text-sm text-white/75 italic',
  // No frame, no card: the form stands on the page itself
  panel: 'flex min-w-0 flex-col justify-center px-2 py-8 sm:px-6 lg:px-12 lg:py-14',
  form: 'mx-auto flex w-full max-w-xl flex-col gap-8',
  identity:
    'flex items-center gap-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]',
  identityName: 'text-base font-semibold',
  // The identifier sits under the name, smaller and quieter
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
  outcomeTitle: 'text-xl font-extrabold tracking-tight italic',
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
