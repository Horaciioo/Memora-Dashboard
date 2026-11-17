/**
 * Play admin: figures, player boxes, journal, bulk bar, player file
 * @type {Record<string, string>}
 */

export const PLAY_ADMIN = {
  page: 'flex w-full flex-col gap-6',
  // Figures, one slim strip above the players
  strip: 'grid grid-cols-2 gap-3 sm:grid-cols-4',
  figure: 'flex min-w-0 flex-col gap-1 rounded-2xl bg-[var(--play-chip)] px-4 py-3',
  figureValue: 'truncate text-2xl leading-none font-extrabold tabular-nums',
  figureLabel: 'text-[0.7rem] font-bold tracking-wider text-[var(--play-ink-faint)] uppercase',
  statGrid: 'grid grid-cols-2 gap-3 lg:grid-cols-5',
  statLogo: 'size-9 shrink-0',
  statText: 'flex min-w-0 flex-1 flex-col',
  // One panel holds the filters and the creators, like the moderator list
  panel:
    'flex flex-col gap-4 rounded-3xl bg-[var(--play-panel)] p-3 ring-1 ring-[var(--play-line)] backdrop-blur-xl sm:p-5',
  sections: 'flex flex-col gap-5',
  section: 'flex flex-col gap-3',
  sectionHeading: 'text-xs font-extrabold tracking-wider text-[var(--play-ink-faint)] uppercase',
  // Filter bar, copy of the moderator one in Play colours
  bar: 'flex flex-wrap items-center gap-2',
  iconButton:
    'play-key-ghost relative flex size-11 shrink-0 items-center justify-center rounded-xl focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  iconButtonActive: 'ring-2 ring-[var(--play-ink-soft)]',
  glyph: 'size-5',
  tally:
    'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-[var(--play-ink)] px-1 text-[0.65rem] font-extrabold text-[var(--play-panel-strong)] tabular-nums',
  searchGroup: 'flex items-center gap-2',
  searchInput:
    'search-expand min-h-11 w-0 shrink-0 overflow-hidden rounded-xl bg-[var(--play-chip)] py-2 text-sm text-[var(--play-ink)] opacity-0 outline-none placeholder:text-[var(--play-ink-faint)]',
  searchInputOpen: 'w-48 px-3 opacity-100 sm:w-64',
  trailing: 'ml-auto flex items-center gap-2',
  filterPanel: 'mt-3 flex flex-wrap items-start gap-3 border-t border-[var(--play-line)] pt-4',
  filterOptions: 'flex flex-1 flex-wrap items-start gap-3',
  filterField: 'flex w-full flex-col gap-1.5 sm:w-72',
  filterLabel: 'text-xs font-extrabold tracking-wider text-[var(--play-ink-faint)] uppercase',
  chip: 'play-key-ghost min-h-11 rounded-xl px-4 text-sm font-semibold',
  chipOn: 'ring-2 ring-[var(--play-ink-soft)]',
  flatHeading:
    'flex w-full items-center gap-2 text-left text-sm font-extrabold text-[var(--play-ink)]',
  // Moderator box
  cardExtra: 'flex shrink-0 items-center gap-2',
  // Players
  filters: 'flex flex-col gap-3 sm:flex-row sm:items-center',
  groups: 'flex flex-col gap-4',
  // Creator: a photo banner, the players in a box beneath
  group:
    'flex flex-col overflow-hidden rounded-3xl ring-1 ring-[var(--play-line)] shadow-[var(--shadow-sm)]',
  groupBanner:
    'relative isolate flex min-h-20 w-full cursor-pointer items-center gap-4 overflow-hidden bg-[var(--play-panel-strong)] px-4 py-3 text-left text-white focus-visible:outline-3 focus-visible:outline-[var(--play-key)] sm:px-6',
  groupBackdrop: 'absolute inset-0 -z-20 h-full w-full object-cover',
  groupWash: 'absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/10 to-transparent',
  groupPortrait: 'shrink-0 ring-2 ring-white shadow-[var(--shadow-lg)]',
  groupName: 'min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight sm:text-2xl',
  groupChevron:
    'size-5 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none',
  groupChevronOpen: 'rotate-180',
  groupFold:
    'grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  groupFoldOpen:
    'grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  groupClip: 'min-h-0 overflow-hidden',
  groupBox:
    'bg-[var(--play-chip)] p-3 opacity-0 -translate-y-3 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none sm:p-4',
  groupBoxOpen:
    'bg-[var(--play-chip)] p-3 opacity-100 translate-y-0 transition-[opacity,translate] delay-100 duration-400 ease-out motion-reduce:transition-none sm:p-4',
  grid: 'grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3',
  card: 'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl bg-[var(--play-panel)] px-3 py-2 text-left transition-colors hover:bg-[var(--play-panel-strong)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  cardChosen: 'bg-[var(--play-panel-strong)] ring-2 ring-[var(--play-ink-soft)]',
  cardText: 'flex min-w-0 flex-1 flex-col gap-0.5',
  cardName: 'min-w-0 flex-1 truncate text-sm font-extrabold',
  cardNote: 'truncate text-xs font-semibold text-[var(--play-ink-soft)]',
  cardXp: 'hidden shrink-0 text-xs font-bold tabular-nums sm:block text-[var(--play-ink-soft)]',
  cardBanned: 'shrink-0 text-xs font-extrabold text-[var(--play-alert)]',
  online: 'size-2 shrink-0 rounded-full bg-[var(--play-gold)]',
  empty: 'py-6 text-center text-sm text-[var(--play-ink-soft)] italic',
  skeleton:
    'h-20 w-full animate-pulse rounded-3xl bg-[var(--play-chip)] motion-reduce:animate-none',
  // Lines of a list
  list: 'flex flex-col gap-2',
  line: 'flex items-center gap-3 rounded-xl bg-[var(--play-chip)] px-4 py-2.5',
  lineText: 'flex min-w-0 flex-1 flex-col gap-0.5',
  lineName: 'truncate text-sm font-extrabold',
  lineTitle: 'text-sm font-bold',
  lineNote: 'text-xs text-[var(--play-ink-soft)]',
  lineAdmin: 'text-xs font-extrabold text-[var(--play-gold)]',
  subtitle: 'text-lg font-extrabold',
  // Gestures on the chosen players
  bulk: 'sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-2xl bg-[var(--play-panel-strong)] px-4 py-3 shadow-[0_12px_30px_rgb(0_0_0/0.4)]',
  bulkCount: 'mr-auto text-sm font-extrabold',
  // File of one player, copy of the moderator file in Play colours
  file: 'grid grid-cols-1 gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start',
  main: 'flex min-w-0 flex-col gap-6',
  railStack: 'flex flex-col gap-3 lg:sticky lg:top-4',
  rail: 'flex flex-col overflow-hidden rounded-3xl bg-[var(--play-panel)] ring-1 ring-[var(--play-line)] shadow-[var(--shadow-sm)] backdrop-blur-xl',
  railHead: 'flex flex-col items-center gap-1.5 px-5 pt-6 text-center',
  railName: 'text-xl font-extrabold tracking-tight break-words',
  railLevel: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  railBody: 'mt-4 flex flex-col gap-3 border-t border-[var(--play-line)] p-4',
  railGroup: 'flex flex-col gap-2',
  railGroupTitle:
    'text-[0.7rem] font-extrabold tracking-wider text-[var(--play-ink-faint)] uppercase',
  railItem: 'flex flex-col gap-0.5',
  railItemLabel: 'text-xs font-bold text-[var(--play-ink-faint)]',
  // Overview: big headings over boxes, like the moderator overview
  overview: 'flex flex-col gap-8',
  overviewSection: 'flex flex-col gap-4',
  overviewTitle: 'text-2xl font-extrabold tracking-tight sm:text-3xl',
  overviewBox:
    'flex flex-col gap-4 rounded-3xl bg-[var(--play-panel)] p-4 ring-1 ring-[var(--play-line)] shadow-[var(--shadow-sm)] backdrop-blur-xl sm:p-5',
  overviewLine: 'flex items-center gap-3 px-1 py-2',
  overviewGlyph: 'size-6 shrink-0 text-[var(--play-key)]',
  overviewLineText: 'min-w-0 flex-1 text-base font-semibold',
  facts: 'grid grid-cols-2 gap-2 sm:grid-cols-3',
  fact: 'flex flex-col gap-0.5 rounded-2xl bg-[var(--play-panel)] px-4 py-3 ring-1 ring-[var(--play-line)]',
  railValue: 'text-sm font-semibold tabular-nums',
  railEmpty: 'text-sm text-[var(--play-ink-faint)] italic',
  railId:
    'flex items-center gap-2 text-left font-[family-name:var(--font-mono)] text-xs break-all hover:text-[var(--play-ink)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  // Tab strip with glyphs, like the moderator file
  railLink:
    'text-xs font-bold text-[var(--play-ink-soft)] underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  // Back link level with the tabs, over the rail column, like the recruitment sessions
  fileBar: 'relative flex w-full flex-col items-center gap-3',
  back: 'hidden cursor-pointer items-center gap-2 py-2 text-sm font-semibold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)] md:absolute md:top-1/2 md:left-0 md:flex md:-translate-y-1/2 lg:w-[21rem] lg:justify-center',
  backInline:
    'flex cursor-pointer items-center gap-2 py-1 text-sm font-semibold text-[var(--play-ink-soft)] md:hidden',
  backGlyph: 'size-4 shrink-0',
} as const
