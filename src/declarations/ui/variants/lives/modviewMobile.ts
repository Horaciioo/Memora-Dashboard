/**
 * Mod View on a phone
 * @type {Record<string, string>}
 */

export const MODVIEW_MOBILE = {
  root: 'fixed inset-0 z-[45] flex flex-col overflow-hidden bg-[var(--twitch-background)] pt-[env(safe-area-inset-top)] text-[var(--color-ink)] md:hidden',
  header: 'flex h-12 shrink-0 items-center gap-2 px-3',
  headerTitle: 'min-w-0 flex-1 truncate text-sm font-bold',
  // Glyph of the page on a soft tile, as the desktop panels
  headerTile:
    'flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-selection)] text-[var(--color-on-selection)]',
  headerIcon: 'size-[1.125rem]',
  slot: 'flex items-center gap-1',
  teamTab:
    'touch-target relative flex items-center justify-center rounded-full text-[var(--twitch-muted)] active:text-[var(--color-ink)]',
  exit: 'touch-target flex items-center justify-center rounded-full text-[var(--twitch-muted)] active:text-[var(--color-ink)]',
  exitIcon: 'size-5',
  pager:
    'flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  page: 'relative flex h-full w-full shrink-0 snap-center snap-always flex-col overflow-hidden',
  pageBody: 'flex min-h-0 flex-1 flex-col',
  scroll: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-4',
  stream: 'relative shrink-0 bg-black',
  streamEmbed: 'size-full border-0',
  streamTap: 'absolute inset-0 touch-pan-x',
  streamInfo:
    'overlay-enter pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-3 text-white',
  streamTitle: 'truncate text-sm font-bold',
  streamMeta: 'flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/80',
  streamMetaIcon: 'size-3.5',
  tabs: 'shrink-0 pt-2',
  box: 'flex flex-col gap-2 rounded-[var(--radius-md)] bg-[var(--twitch-head)] p-3',
  // Boxes keep their size, the gaps between them are equal
  scrollEven: 'justify-evenly',
  boxTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-accent)] uppercase',
  boxEmpty: 'text-sm text-[var(--twitch-muted)] italic',
  // Information banner: gradient to catch the eye, the message runs right to left
  ticker:
    'relative mx-3 mt-1.5 flex shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[linear-gradient(100deg,var(--color-brand-700),var(--color-brand-500),var(--color-apple-green))] py-2 text-left text-sm font-bold text-white',
  tickerTrack: 'info-ticker-run flex w-max shrink-0',
  tickerText: 'shrink-0 pr-16 whitespace-nowrap',
  // Page placement: dashed page blocks dragged along the swipe
  pagesHint: 'text-sm text-[var(--color-ink-subtle)]',
  pagesStage: 'relative h-44 shrink-0 touch-none select-none',
  pagesSlot: 'absolute top-0 h-full w-1/4 p-1 transition-[left] duration-300 ease-out',
  pagesSlotHeld: 'z-10 cursor-grabbing transition-none',
  pagesCard:
    'flex size-full cursor-grab items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-ink-subtle)] px-1 text-center text-xs font-bold transition-[transform,box-shadow,background-color] duration-200',
  pagesCardHeld:
    'scale-110 rotate-3 border-solid border-transparent bg-[var(--color-selection)] text-[var(--color-on-selection)] shadow-xl',
  pagesSteps: 'flex justify-between px-1 text-xs font-bold text-[var(--color-ink-subtle)]',
  // Actions: tidy rows, a handle to drag, a touch opens the sheet
  actions: 'flex flex-col gap-2',
  actionRow:
    'glass-thick flex items-center gap-2 rounded-[var(--radius-lg)] border py-2 pr-3 pl-0 transition-[transform,box-shadow] duration-200',
  actionRowHeld: 'scale-[1.02] shadow-xl',
  // Narrow handle, as tall as the row so it stays easy to grab
  actionGrip:
    'flex w-5 shrink-0 touch-none items-center justify-center self-stretch text-[var(--color-ink-subtle)]',
  // Dashed box under the rows, as the other add boxes
  actionNew:
    'touch-target flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-strong)] py-4 text-sm font-bold text-[var(--color-ink-subtle)] enabled:active:bg-[var(--color-hover)] disabled:opacity-50',
  // Glyph alone, in the tone of its kind
  actionGlyph: 'size-6 shrink-0 text-[var(--tone)]',
  actionGlyphOff: 'opacity-40',
  actionOpen: 'flex min-w-0 flex-1 items-center gap-3 py-1 text-left',
  actionTitle: 'text-base leading-tight font-bold break-words',
  actionLine: 'text-sm break-words text-[var(--color-ink-subtle)]',
  actionSheet: 'flex flex-col gap-4',
  actionSheetTitle: 'text-lg font-bold',
  tags: 'flex shrink-0 gap-1.5 overflow-x-auto px-3 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  tag: 'shrink-0 rounded-[var(--radius-xs)] bg-[var(--twitch-head)] px-1.5 py-0.5 text-[0.625rem] leading-tight font-bold whitespace-nowrap',
  teamBar: 'flex shrink-0 items-center justify-between gap-2 px-3 pb-2',
  teamIcon: 'size-4',
  teamBody: 'flex min-h-0 flex-1 flex-col',
  settings: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4',
  profile:
    'role-tint-box relative flex shrink-0 items-center justify-center rounded-t-[var(--radius-xl)] border px-4 py-4',
  // Box and figures band stuck together
  profileGroup: 'flex shrink-0 flex-col',
  profileStats:
    'grid grid-cols-3 divide-x divide-[color-mix(in_srgb,var(--color-ink)_16%,transparent)] rounded-b-[var(--radius-xl)] border border-t-0 border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] py-3',
  profileAvatar: 'absolute left-4',
  profileName: 'truncate px-20 text-lg font-bold text-[var(--color-ink)]',
  settingsEntry: 'touch-target flex w-full items-center gap-3 py-4 text-left text-base font-medium',
  settingsBack:
    'touch-target flex items-center gap-2 self-start text-sm font-bold text-[var(--color-ink-accent)]',
  settingsFoot: 'flex shrink-0 justify-end gap-2 px-3 py-2',
  window: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  // Unban desk: names, chat, reason, then the actions
  unban: 'flex min-h-0 flex-1 flex-col gap-3',
  // Panes of the carousel share one cell, the one leaving over the one coming
  unbanStackName: 'grid min-w-0 flex-1 overflow-hidden [perspective:600px]',
  unbanStackBody:
    'grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden [perspective:1000px]',
  unbanPane: 'col-start-1 row-start-1 flex min-h-0 min-w-0 flex-col gap-3',
  unbanLeaving: 'pointer-events-none',
  unbanEnter: { next: 'unban-enter-next', previous: 'unban-enter-previous' },
  unbanLeave: { next: 'unban-leave-next', previous: 'unban-leave-previous' },
  unbanNav: 'flex shrink-0 items-center justify-between gap-2',
  unbanArrow:
    'touch-target flex items-center justify-center rounded-full text-[var(--color-ink)] enabled:active:bg-[var(--color-hover)] disabled:opacity-30',
  unbanArrowIcon: 'size-5',
  unbanName: 'flex min-w-0 flex-1 items-center justify-center gap-2 text-base font-bold',
  unbanNameText: 'truncate',
  unbanChat:
    'flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto rounded-[var(--radius-md)] bg-[var(--twitch-head)] p-3 text-sm',
  unbanReason: 'shrink-0 border-l-2 border-[var(--color-ink-subtle)] pl-3 text-sm break-words',
  unbanActions: 'grid shrink-0 grid-cols-2 gap-2',
  sheet:
    'course-pop absolute inset-0 z-20 flex flex-col overflow-hidden bg-[var(--twitch-background)] pt-[env(safe-area-inset-top)]',
  highlights: 'mx-4 mb-4 grid grid-cols-2 gap-2',
  highlight: 'flex flex-col gap-0.5 rounded-[var(--radius-md)] bg-[var(--twitch-head)] px-3 py-2',
  highlightHot: 'ring-1 ring-[var(--color-danger)]',
  highlightLabel: 'text-[0.6875rem] font-bold tracking-wide text-[var(--twitch-muted)] uppercase',
  highlightValue: 'text-2xl leading-none font-bold tabular-nums',
  highlightHint: 'truncate text-xs text-[var(--twitch-muted)]',
} as const
