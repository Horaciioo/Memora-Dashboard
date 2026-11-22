// Box of a column panel
const COLUMN_BOX = 'rounded-2xl border border-[var(--play-line)] bg-play-shade px-4 pt-6 pb-4'

/**
 * Top bar of the desktop launcher: account, history, page tabs, player
 * @type {Record<string, string>}
 */

export const PLAY_TOPBAR = {
  root: 'relative z-30 flex h-14 shrink-0 items-center gap-2 px-3 max-md:hidden',
  account:
    'flex h-10 items-center gap-1.5 rounded-xl px-2 text-[var(--play-ink)] transition-colors hover:bg-play-nest focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  brandMark: 'h-8 w-auto shrink-0',
  brandName: 'h-2.5 w-auto shrink-0',
  // Left end of the bar: logo and the app switch
  apps: 'relative shrink-0',
  appsMenu: '',
  chevron: 'size-4 text-[var(--play-ink-faint)]',
  go: 'grid size-9 shrink-0 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-play-nest hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  goIcon: 'size-5',
  // Tabs sit in one strip, the pill glides behind the open one
  tabs: 'relative ml-2 flex min-w-0 items-center gap-1',
  pill: 'pointer-events-none absolute top-0 left-0 rounded-xl bg-play-lift',
  tab: 'relative z-10 flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  tabOn: 'text-[var(--play-ink)]',
  icon: 'size-5 shrink-0',
  // Narrow screens keep the label of the open tab only
  label: 'max-xl:sr-only max-xl:group-aria-[current=page]/tab:not-sr-only',
  rule: 'mx-1.5 h-5 w-px shrink-0 bg-[var(--play-line)]',
  badge: 'absolute top-1.5 right-1.5 size-2.5 rounded-full bg-[var(--play-alert)]',
  menu: 'absolute top-full left-0 z-50 mt-2 flex w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
} as const

/**
 * Column resize handle
 * @type {Record<string, string>}
 */

export const PLAY_HANDLE = {
  base: 'absolute inset-y-0 z-30 w-2 cursor-col-resize touch-none after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-[var(--play-key)] after:opacity-0 after:transition-opacity hover:after:opacity-60 focus-visible:after:opacity-100 data-[drag]:after:opacity-100 focus-visible:outline-none',
  right: '-right-1',
  left: '-left-1',
} as const

/**
 * Friends column docked on the right
 * @type {Record<string, string>}
 */

export const PLAY_FRIENDS = {
  // Same box as the friends list, as tall as its content
  live: `flex max-h-72 flex-col gap-2 ${COLUMN_BOX}`,
  liveBody: 'flex min-h-0 flex-col gap-0.5 overflow-y-auto overscroll-contain',
  // Blurred fade at the bottom edge, more below
  fade: '[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]',
  recent:
    'group relative flex shrink-0 items-center rounded-xl transition-colors hover:bg-play-nest',
  recentLink:
    'flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2.5 py-1 focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  recentLogo: 'size-7 shrink-0',
  recentName: 'min-w-0 flex-1 truncate text-sm font-bold text-[var(--play-ink)]',
  recentGlyph: 'size-4 shrink-0 text-[var(--play-ink-faint)]',
  recentForget:
    'mr-2 inline-flex size-7 shrink-0 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-play-press focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--play-key)] group-hover:opacity-100',
  column: 'relative z-20 flex w-[var(--col-w)] shrink-0 flex-col gap-3 max-lg:hidden',
  root: `flex min-h-0 flex-1 flex-col gap-4 ${COLUMN_BOX}`,
  title: 'px-1 text-lg font-bold tracking-tight text-[var(--play-ink)]',
  head: 'flex items-center justify-between gap-2 px-1',
  headKeys: 'flex items-center gap-2',
  headKey:
    'inline-flex size-8 items-center justify-center rounded-lg bg-play-nest text-[var(--play-ink)] transition-colors hover:bg-play-press focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  headKeyOn: 'bg-play-press',
  headGlyph: 'size-4',
  tabs: 'flex w-full items-stretch',
  tab: 'flex-1 rounded-lg py-1.5 text-center text-lg font-bold tracking-tight text-[var(--play-ink-faint)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)] not-first:border-l not-first:border-[var(--play-line)]',
  tabOn: 'text-[var(--play-key)] hover:text-[var(--play-key)]',
  field:
    'h-10 w-full rounded-xl bg-play-nest px-3 text-sm text-[var(--play-ink)] placeholder:text-[var(--play-ink-faint)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  scroll: 'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain',
  section: 'flex flex-col gap-1',
  sectionTitle:
    'px-3 pb-1 text-micro font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  row: 'group relative flex min-h-14 items-center gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-play-nest',
  rowOff: 'opacity-65',
  rowWho:
    'flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-sm font-bold text-[var(--play-ink)]',
  rowNote: 'truncate text-xs text-[var(--play-ink-faint)]',
  rowLive: 'truncate text-xs font-semibold text-[var(--play-gold-ink)]',
  rowActions: 'flex shrink-0 items-center gap-1.5',
  small:
    'inline-flex h-8 items-center rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--play-key)] disabled:opacity-50',
  smallGhost: 'bg-play-lift text-[var(--play-ink)] hover:bg-play-press',
  smallMain: 'bg-[var(--play-key)] text-[var(--play-key-ink)] hover:brightness-110',
  // Request: raised card, keys side by side under the name
  requestsRow:
    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-play-nest focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  requestsFaces: 'flex shrink-0 items-center',
  requestsFace: 'not-first:-ml-3',
  requestsText: 'flex min-w-0 flex-1 flex-col',
  requestsBadge:
    'inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--play-key)] px-1.5 text-xs font-bold text-[var(--play-key-ink)]',
  requestsCaret: 'size-4 shrink-0 text-[var(--play-ink-faint)] transition-transform',
  requestsCaretOpen: 'rotate-90',
  requestsDivider: 'border-b border-[var(--play-line)] pb-3',
  request: 'flex flex-col gap-3 rounded-2xl bg-play-nest p-3',
  requestNew: 'bg-[color-mix(in_srgb,var(--play-key)_12%,transparent)]',
  requestKeys: 'grid grid-cols-2 gap-2',
  requestKeysOne: 'grid grid-cols-1 gap-2',
  requestKey:
    'inline-flex h-9 items-center justify-center rounded-xl bg-play-lift px-3 text-sm font-bold text-[var(--play-ink)] transition-colors hover:bg-play-press focus-visible:outline-2 focus-visible:outline-[var(--play-key)] disabled:opacity-50',
  requestKeyMain:
    'inline-flex h-9 items-center justify-center rounded-xl bg-[var(--play-key)] px-3 text-sm font-bold text-[var(--play-key-ink)] transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--play-key)] disabled:opacity-50',
  empty: 'px-3 py-4 text-center text-sm text-[var(--play-ink-faint)]',
  results: 'flex flex-col gap-1',
} as const

/**
 * Launcher home page
 * @type {Record<string, string>}
 */

export const PLAY_HOME = {
  root: 'mx-auto flex w-full max-w-[84rem] flex-col gap-10 max-md:hidden',
  tool: 'min-h-11 px-6 text-sm',
  sectionHead: 'flex flex-wrap items-end justify-between gap-3',
  section: 'flex flex-col gap-4',
  sectionTitle: 'text-lg font-bold tracking-tight text-[var(--play-ink)]',
  tiles: 'grid grid-cols-2 gap-5 @3xl:grid-cols-3 @6xl:grid-cols-4',
  stage: '@container flex min-w-0 flex-col gap-10',
  // Banner slider
  banners: 'flex flex-col gap-2',
  arrow:
    'grid size-8 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-play-lift hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)] disabled:pointer-events-none disabled:opacity-30',
  arrowIcon: 'size-4',
  dots: 'flex items-center justify-center gap-3 @5xl:hidden',
  dot: 'size-2 rounded-full bg-play-press transition-all hover:bg-[var(--play-ink-faint)]',
  dotOn: 'w-6 bg-[var(--play-key)] hover:bg-[var(--play-key)]',
  // Game tile, art edge to edge with its name over it
  card: 'group relative isolate aspect-video min-w-0 overflow-hidden rounded-2xl bg-play-shade ring-1 ring-[var(--play-line)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_1.2rem_2.4rem_var(--play-drop)] hover:ring-[var(--play-on-art)]/30',
  cardArt: '-z-10 transition-transform duration-500 group-hover:scale-110',
  cardShade:
    'absolute inset-0 -z-10 bg-linear-to-t from-[var(--color-media-shade)]/85 via-[var(--color-media-shade)]/25 via-50% to-transparent',
  cardPlay:
    'absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-[var(--game)] text-[var(--play-night)] opacity-0 shadow-[0_0.5rem_1.5rem_var(--play-drop)] transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100',
  cardPlayIcon: 'size-6',
  cardText: 'absolute inset-x-0 bottom-0 flex min-w-0 flex-col px-4 pb-3.5',
  cardName: 'truncate text-xl leading-tight font-bold tracking-tight text-[var(--play-on-art)]',
  cardNote: 'truncate text-xs text-[var(--play-on-art)]/70',
  cardFaces: 'absolute right-3 bottom-3.5 flex items-center -space-x-2',
  cardLink:
    'absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
} as const

/**
 * Own player box at the top of the friends column
 * @type {Record<string, string>}
 */

export const PLAY_ME_BOX = {
  host: 'relative rounded-2xl border border-[var(--play-line)] bg-play-shade p-3',
  root: 'flex w-full items-center gap-3 rounded-xl p-1 text-left focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  text: 'flex min-w-0 flex-1 flex-col gap-1',
  head: 'flex items-baseline justify-between gap-2',
  name: 'truncate text-sm leading-tight font-bold text-[var(--play-ink)]',
  level: 'shrink-0 text-xs leading-tight font-bold text-[var(--play-key)] tabular-nums',
  track: 'h-1.5 w-full overflow-hidden rounded-full bg-play-lift',
  fill: 'h-full rounded-full bg-[var(--play-key)] transition-[width] duration-500 motion-reduce:transition-none',
  xp: 'truncate text-micro leading-tight font-semibold text-[var(--play-ink-faint)] tabular-nums',
  menu: 'right-0 left-0 w-auto',
} as const
