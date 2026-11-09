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
    'popover-enter glass-panel absolute top-[calc(100%+0.5rem)] right-0 z-[60] flex w-72 max-w-[calc(100vw-1.5rem)] flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-2 text-sm shadow-[var(--shadow-lg)]',
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
