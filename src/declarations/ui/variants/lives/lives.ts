import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Livecon page
 * @type {Record<string, string>}
 */

export const LIVE_BOARD = {
  wrapper: 'mx-auto flex w-full max-w-6xl flex-col gap-10',
  list: 'flex flex-col gap-6',
  group: 'flex flex-col gap-4',
  groupTitle: `${PROPERTY_LABEL} px-1`,
  tiles: 'grid grid-cols-1 gap-6 lg:grid-cols-2',
  dotPulse: 'live-pulse h-3 w-3',
  // Coordinator and times on one line
  facts: 'flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-[var(--color-border)] py-4',
  fact: 'flex min-w-0 flex-col gap-0.5',
  factDivider: 'hidden h-10 w-px bg-[var(--color-border)] sm:block',
  factArrow: 'hidden h-6 w-58 shrink-0 text-[var(--color-ink-subtle)] sm:block',
  factLabel: PROPERTY_LABEL,
  factClock: 'text-2xl leading-none font-bold tracking-tight tabular-nums',
  factClockLive: 'text-[var(--color-danger)]',
  factDay: 'text-xs font-semibold text-[var(--color-ink-subtle)] first-letter:uppercase',
  coordinator: 'flex items-center gap-3',
  coordinatorPortrait: 'relative shrink-0',
  coordinatorBadge:
    'absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]',
  coordinatorGlyph: 'h-4 w-4',
  coordinatorName: 'truncate text-lg leading-tight font-bold tracking-tight',
  coordinatorEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Buttons side by side with dividers
  actions: 'flex flex-wrap items-center gap-x-1 gap-y-2',
  actionDivider: 'h-5 w-px shrink-0 bg-[var(--color-border-strong)]',
  confirm: 'w-full text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Poster of the live on air: the creator's banner as the backdrop
 * @type {Record<string, string>}
 */

export const LIVE_STAGE = {
  root: 'relative isolate flex min-h-[26rem] flex-col justify-between gap-10 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-media-shade)] p-5 text-[var(--color-on-media)] shadow-[var(--shadow-lg)] sm:p-8',
  backdrop: 'absolute inset-0 -z-20 h-full w-full scale-110 object-cover blur-2xl saturate-150',
  wash: 'absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_20%_30%,transparent,color-mix(in_srgb,var(--color-media-shade)_70%,transparent))]',
  halo: 'absolute -top-24 -left-24 -z-10 h-80 w-80 rounded-full bg-[var(--color-danger)] opacity-30 blur-3xl',
  hero: 'flex min-w-0 flex-col items-start gap-6 sm:flex-row sm:items-end',
  titleRow: 'flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-4',
  // Black pill on the poster, far from the creator
  cta: 'group inline-flex shrink-0 items-center gap-3 rounded-full bg-[var(--color-media-shade)] px-7 py-4 text-lg font-bold tracking-tight text-[var(--color-on-media)] ring-1 ring-[color-mix(in_srgb,var(--color-on-media)_25%,transparent)] shadow-[var(--shadow-lg)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-xl,var(--shadow-lg))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-on-media)]',
  ctaArrow: 'h-5 w-5 transition-transform group-hover:translate-x-1',
  portrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-4 ring-[var(--color-on-media)]',
  identity: 'flex min-w-0 flex-1 flex-col gap-3 self-stretch justify-end',
  creator: 'text-5xl leading-none font-bold tracking-tight sm:text-7xl',
  title: 'min-w-0 max-w-2xl text-lg opacity-90 sm:text-xl',
  // Every fact takes its share of the box, centred
  facts:
    'w-full justify-between border-t-0 pt-0 [&>div]:flex-1 [&>div]:items-center [&>div]:text-center [&_ul]:items-center',
  actions: 'w-full justify-center gap-3',
  dock: 'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-[var(--color-ink)] sm:p-5',
} as const

/**
 * Tile of a live still to come
 * @type {Record<string, string>}
 */

export const LIVE_TILE = {
  root: 'relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
  cover: 'relative h-36 shrink-0 overflow-hidden bg-[image:var(--gradient-soft)]',
  coverImage: 'h-full w-full scale-125 object-cover blur-xl saturate-150',
  body: 'flex flex-1 flex-col gap-5 px-6 pb-6',
  // Portrait and bubble side by side, straddling the cover edge
  head: 'relative z-10 -mt-28 mb-16 flex items-center gap-4',
  portrait:
    'relative shrink-0 translate-y-12 shadow-[var(--shadow-md)] ring-4 ring-[var(--color-surface)]',
  // The creator "says" the title: a speech bubble, two small ones trailing left to the portrait, the bubble riding over the banner
  speech: 'relative ml-8 translate-y-[4.5rem] flex min-w-0 flex-1 flex-col gap-0.5',
  bubble:
    'relative rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] px-5 py-3 shadow-[var(--shadow-md)] ring-1 ring-[var(--color-border)]',
  bubbleDotNear:
    'absolute top-1/2 -left-4 size-3.5 -translate-y-1/2 rounded-full bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-border)]',
  bubbleDotFar:
    'absolute top-[38%] -left-7 size-2.5 -translate-y-1/2 rounded-full bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-border)]',
  identity: 'flex min-w-0 flex-1 flex-col gap-0.5 pb-1',
  creator: 'flex items-center gap-2.5 text-2xl leading-tight font-bold tracking-tight break-words',
  titleGlyph: 'size-6 shrink-0',
  // Indented past the platform glyph (size-6 + gap-2.5) to line up with the title
  title: 'pl-[2.125rem] text-sm text-[var(--color-ink-subtle)] italic',
  // Coordination sits in its own inset box
  panel:
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)] p-4',
  actions:
    'mt-auto grid grid-cols-2 gap-x-2 gap-y-5 *:w-full [&>*:first-child]:relative [&>*:first-child]:col-span-2 [&>*:last-child:nth-child(even)]:col-span-2 [&>*:first-child]:after:absolute [&>*:first-child]:after:inset-x-0 [&>*:first-child]:after:-bottom-2.5 [&>*:first-child]:after:h-px [&>*:first-child]:after:bg-[var(--color-border)] [&>*:not(:first-child)]:border [&>*:not(:first-child)]:border-[var(--color-border)]',
} as const

/**
 * Live closed within the day, a smaller box
 * @type {Record<string, string>}
 */

export const LIVE_RECENT = {
  list: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
  root: 'flex flex-wrap items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface px-4 py-3 shadow-[var(--shadow-sm)]',
  identity: 'flex min-w-0 flex-1 flex-col',
  title: 'truncate font-bold tracking-tight',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  hint: 'text-xs text-[var(--color-caution)]',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
} as const

/**
 * Live entry on the rail
 * @type {Record<string, string>}
 */

export const LIVE_NAV = {
  dotPulse: 'live-pulse',
} as const

/**
 * Urgent live call on the home
 * @type {Record<string, string>}
 */

export const LIVE_URGENT = {
  section: 'flex flex-col gap-3',
  label: PROPERTY_LABEL,
  list: 'flex flex-col gap-2',
  row: 'flex items-center gap-4 rounded-[var(--radius-lg)] border card-surface px-4 py-3 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  rowLive: 'border-[var(--color-danger)]',
  rowAnnounced: 'border-[var(--color-border)]',
  dot: 'h-7 w-7 shrink-0',
  text: 'min-w-0 flex-1 truncate font-bold tracking-tight',
  go: 'shrink-0 text-sm font-bold text-[var(--color-danger)]',
} as const

/**
 * Coordinator requests on the home and seats on a live
 * @type {Record<string, string>}
 */

export const LIVE_COORDINATION = {
  answer: 'flex flex-col gap-6',
  infosGroup: 'flex flex-col gap-3',
  infos: PROPERTY_LABEL,
  label: PROPERTY_LABEL,
  lead: 'text-body font-bold tracking-tight',
  meta: 'text-sm text-[var(--color-ink-subtle)]',
  times: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  timeField: 'flex flex-col gap-1.5',
  timeLabel: PROPERTY_LABEL,
  facts: 'flex flex-col gap-3',
  fact: 'flex items-center gap-3 text-sm font-semibold',
  factGlyph: 'size-5 shrink-0 text-[var(--color-ink-subtle)]',
  // Seats listed on a live
  // Two per line, a vertical divider between them
  seats: 'grid grid-cols-1 gap-y-4 sm:grid-cols-2',
  seat: 'flex min-w-0 items-center gap-3 sm:odd:border-r sm:odd:border-[var(--color-border)] sm:odd:pr-4 sm:even:pl-4 sm:odd:last:border-r-0',
  seatText: 'flex min-w-0 flex-col',
  seatName: 'truncate font-bold tracking-tight',
  seatMeta: 'text-xs text-[var(--color-ink-subtle)]',
  seatWindow: 'italic',
  // Several coordinators on the poster: portraits piled, one line for all
  pile: 'flex flex-col items-center gap-2',
  seatMuted: 'opacity-60',
  gap: 'mt-4 rounded-[var(--radius-lg)] bg-gradient-to-br from-red-500 via-red-600 to-red-800 px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] ring-1 ring-white/30 ring-inset',
} as const

/**
 * Creator bilan: a poster, giant numbers, then a lede
 * @type {Record<string, string>}
 */

export const CREATOR_BILAN = {
  hero: 'relative isolate flex min-h-[18rem] flex-col justify-end gap-4 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-media-shade)] p-6 text-[var(--color-on-media)] shadow-[var(--shadow-lg)] sm:p-10',
  backdrop: 'absolute inset-0 -z-20 h-full w-full scale-110 object-cover blur-2xl saturate-150',
  wash: 'absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_20%_30%,transparent,color-mix(in_srgb,var(--color-media-shade)_75%,transparent))]',
  halo: 'absolute -top-24 -right-24 -z-10 h-80 w-80 rounded-full bg-[var(--color-brand-600)] opacity-35 blur-3xl',
  heroRow: 'flex flex-wrap items-end gap-6',
  portrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-4 ring-[var(--color-on-media)]',
  eyebrow: 'text-xs font-bold tracking-widest uppercase opacity-80',
  name: 'text-5xl leading-none font-bold tracking-tight sm:text-7xl',
  day: 'text-lg font-semibold opacity-90',
  // By the numbers: type does the work, thin lines split the figures
  numbers:
    'grid grid-cols-2 gap-y-10 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface px-6 py-10 shadow-[var(--shadow-md)] md:grid-cols-3 md:px-10',
  number:
    'flex flex-col gap-2 px-4 first:pl-0 md:border-l md:border-[var(--color-border)] md:first:border-l-0 md:[&:nth-child(4)]:border-l-0 md:[&:nth-child(n+4)]:pt-0',
  numberValue:
    'text-5xl leading-none font-bold tracking-tight tabular-nums text-[var(--tone)] md:text-7xl',
  numberLabel: 'text-xs font-bold tracking-widest uppercase text-[var(--color-ink-subtle)]',
  // Story: four cards, a big line each, a short hint under it
  storyGrid: 'grid grid-cols-1 gap-4 md:grid-cols-2',
  storyCard:
    'relative isolate flex min-h-40 flex-col justify-between gap-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 shadow-[var(--shadow-md)]',
  storyBlob:
    'pointer-events-none absolute -right-12 -bottom-12 -z-10 size-48 rounded-full bg-[var(--tone)] opacity-[0.12] blur-2xl',
  storyHead: 'flex items-center justify-between gap-3',
  storyKicker: 'text-xs font-bold tracking-widest uppercase text-[var(--color-ink-subtle)]',
  storyGlyph: 'size-7 text-[var(--tone)]',
  storyBig: 'text-3xl leading-tight font-bold tracking-tight text-[var(--tone)] md:text-4xl',
  storyHint: 'text-sm text-[var(--color-ink-subtle)]',
  storyTimes:
    'flex flex-wrap items-baseline gap-x-3 text-4xl leading-none font-bold tracking-tight tabular-nums md:text-5xl',
  storyTimesArrow: 'text-2xl font-semibold text-[var(--color-ink-subtle)]',
} as const

/**
 * Report of a live: figures, timeline, moderators, log
 * @type {Record<string, string>}
 */

export const LIVE_REPORT = {
  wrapper: 'mx-auto flex w-full max-w-7xl flex-col gap-10',
  // Title of the bilan, the creator and the day
  heading: 'text-3xl leading-tight font-bold tracking-tight md:text-4xl',
  toolbar: 'flex flex-wrap items-center justify-center gap-3 print:hidden',
  notice:
    'rounded-[var(--radius-lg)] border-l-4 border-[var(--color-caution)] bg-[var(--color-caution-soft)] px-4 py-3 text-sm',
  // Key figures: three big ones, then the audience, then the team
  figures: 'flex flex-col gap-8',
  figureGroup: 'flex flex-col gap-3',
  figureGroupTitle: PROPERTY_LABEL,
  figureHero: 'grid grid-cols-1 gap-4 md:grid-cols-3',
  heroCard:
    'relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 shadow-[var(--shadow-md)]',
  heroCardMain: 'bg-[image:var(--gradient-soft)]',
  heroGlyph: 'absolute top-5 right-5 size-8 opacity-80',
  heroLabel: PROPERTY_LABEL,
  heroValue: 'text-5xl leading-none font-bold tracking-tight tabular-nums md:text-6xl',
  figureRow: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
  figureRowThree: 'grid grid-cols-1 gap-3 sm:grid-cols-3',
  figure:
    'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-5 py-4 shadow-[var(--shadow-sm)]',
  figureLabel: PROPERTY_LABEL,
  figureValue: 'text-2xl font-bold tracking-tight tabular-nums md:text-3xl',
  // Stat card: tone colour through --tone, a soft blob, a bare glyph
  statCard:
    'group relative isolate flex flex-col gap-2 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
  statCardPickable:
    'cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  statCardHero: 'gap-3 p-6 shadow-[var(--shadow-md)]',
  statBlob:
    'pointer-events-none absolute -top-10 -right-10 -z-10 size-36 rounded-full bg-[var(--tone)] opacity-[0.14] blur-xl transition-opacity group-hover:opacity-25',
  statIcon: 'absolute top-5 right-5 text-[var(--tone)] opacity-90',
  statGlyph: 'size-6',
  statLabel: 'pr-12 text-xs font-bold tracking-wide uppercase text-[var(--color-ink-subtle)]',
  statValue:
    'text-3xl leading-none font-bold tracking-tight tabular-nums text-[var(--tone)] md:text-4xl',
  statValueHero: 'text-5xl md:text-6xl',
  // Timeline
  chart: 'flex h-40 items-end gap-0.5',
  bar: 'group relative flex h-full flex-1 items-end',
  barFill:
    'w-full rounded-t-sm bg-[var(--color-brand-600)] transition-colors group-hover:bg-[var(--color-brand-800)]',
  barEmpty: 'h-px w-full bg-[var(--color-border)]',
  barTip:
    'pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-2 py-1 text-xs whitespace-nowrap text-[var(--color-surface)] group-hover:block',
  axis: 'mt-2 flex justify-between text-xs text-[var(--color-ink-subtle)] tabular-nums',
  peak: 'mt-4 text-sm text-[var(--color-ink-subtle)]',
  // Livecon frise under the timeline
  friseBlock: 'mt-6 flex flex-col gap-3 border-t border-[var(--color-border)] pt-5',
  frise: 'flex h-2.5 gap-0.5',
  friseSlice: 'h-full first:rounded-l-full last:rounded-r-full',
  friseLegend: 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-ink-subtle)]',
  friseKey: 'inline-flex items-center gap-1.5',
  friseDot: 'h-2.5 w-2.5 rounded-full',
  // Ranking of sanctions
  rankGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3',
  rankCard:
    'relative flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)]',
  rankTop: 'bg-[image:var(--gradient-soft)] shadow-[var(--shadow-md)]',
  rankPlace:
    'absolute top-4 right-5 text-3xl font-bold tabular-nums text-[var(--color-ink-subtle)]',
  rankWho: 'flex min-w-0 items-center gap-3 pr-10 font-bold tracking-tight',
  rankCount: 'text-5xl leading-none font-bold tracking-tight tabular-nums',
  rankCountLabel: PROPERTY_LABEL,
  rankKinds: 'flex flex-wrap gap-2',
  rankKind:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] px-2 py-1 text-xs font-semibold tabular-nums',
  rankKindGlyph: 'size-4 shrink-0',
  // Roll-call against what was done
  compare: 'w-full text-left text-sm',
  compareHead:
    'border-b border-[var(--color-border)] pb-2 text-xs font-bold tracking-wide uppercase text-[var(--color-ink-subtle)]',
  compareRow: 'border-b border-[var(--color-border)] last:border-b-0',
  compareCell: 'py-3 pr-4 align-middle tabular-nums',
  compareWho: 'flex items-center gap-3 font-semibold',
  compareExtra: 'font-semibold text-[var(--color-success)]',
  compareMissed: 'inline-flex items-center gap-1.5 font-semibold text-[var(--color-danger)]',
  compareInside: 'inline-flex items-center gap-1.5 text-[var(--color-ink-subtle)]',
  compareGlyph: 'size-4 shrink-0',
  // Notes left on viewers
  noteTotal: 'text-5xl leading-none font-bold tracking-tight tabular-nums',
  noteTotalRow: 'flex flex-wrap items-baseline gap-3 pb-4',
  noteGrid: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
  noteBox:
    'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 shadow-[var(--shadow-sm)]',
  noteAuthor: 'flex items-center gap-3 font-semibold',
  noteAuthorCount: 'ml-auto text-xs font-bold text-[var(--color-ink-subtle)]',
  noteList: 'flex flex-col divide-y divide-[var(--color-border)]',
  noteItem: 'flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0',
  noteOn: 'text-xs font-bold text-[var(--color-ink-subtle)] tabular-nums',
  noteBody: 'text-sm',
  // Moderator picker and the page of one moderator
  picker: 'flex flex-wrap items-center justify-center gap-2',
  pick: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] card-surface px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  pickOn:
    'border-transparent bg-[var(--color-brand-600)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  detailHead:
    'flex flex-wrap items-center gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 shadow-[var(--shadow-md)]',
  detailWho: 'flex min-w-0 flex-col gap-1',
  detailName: 'flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight',
  detailColumns: 'grid grid-cols-1 gap-6 lg:grid-cols-2',
  tabs: 'flex justify-center',
  // Who moderated and for how long
  // One line per moderator: who and time on the left, their stretch on the live on the right
  team: 'flex flex-col divide-y divide-[var(--color-border)]',
  teamRow:
    'grid grid-cols-1 items-center gap-x-8 gap-y-3 py-5 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]',
  teamIdentity: 'flex min-w-0 items-center gap-4',
  teamPickable:
    'cursor-pointer rounded-[var(--radius-lg)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  teamText: 'flex min-w-0 flex-col gap-1',
  teamWho: 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-lg font-bold tracking-tight',
  teamTags: 'flex flex-wrap items-center gap-x-3 gap-y-1',
  // Track: hour lines, the hours given as a tinted zone, the time done in blue, the extra in green
  teamTrackBox: 'flex min-w-0 flex-col gap-1',
  teamTrack:
    'relative h-9 w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]',
  teamGrid: 'absolute inset-y-0 w-px bg-[var(--color-border)]',
  teamZone: 'absolute inset-y-0 bg-[var(--color-info-soft)]',
  teamZoneMissed:
    'absolute inset-y-0 bg-[var(--color-danger-soft)] bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(184_58_58/0.16)_6px_12px)]',
  teamStretch: 'absolute inset-y-2.5 rounded-full bg-[var(--color-info)]',
  teamExtra: 'absolute inset-y-2.5 rounded-full bg-[var(--color-success)]',
  teamMarks: 'relative h-4',
  teamMark:
    'absolute -translate-x-1/2 text-micro font-bold tabular-nums text-[var(--color-ink-subtle)]',
  teamMarkMissed: 'text-[var(--color-danger)]',
  teamAxis: 'mb-2 hidden grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-x-8 md:grid',
  teamAxisTrack: 'relative h-4',
  teamAxisLabel:
    'absolute -translate-x-1/2 text-micro font-semibold tabular-nums text-[var(--color-ink-subtle)]',
  teamNote: 'text-xs font-normal text-[var(--color-ink-subtle)]',
  teamSpan: 'text-sm text-[var(--color-ink-subtle)] tabular-nums',
  spanTotal: 'font-bold text-[var(--color-info)]',
  spanHour: 'font-bold text-[var(--color-ink)]',
  spanAbsent:
    'inline-flex flex-wrap items-center gap-x-2 text-sm font-semibold text-[var(--color-danger)] tabular-nums [&_strong]:text-[var(--color-danger)]',
  spanAbsentGlyph: 'size-4 shrink-0',
  reinforcementTag:
    'inline-flex shrink-0 items-center rounded-[var(--radius-sm)] bg-[var(--color-info)] px-2 py-0.5 text-micro font-bold tracking-wide text-[var(--color-on-solid)] uppercase',
  spanExtra: 'block text-xs font-semibold italic text-[var(--color-success)]',
  // Moderators
  rows: 'flex flex-col',
  row: 'grid grid-cols-1 items-baseline gap-x-6 gap-y-1 border-t border-[var(--color-border)] py-4 first:border-t-0 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]',
  rowName: 'truncate font-semibold',
  rowNameMuted: 'truncate font-semibold text-[var(--color-ink-subtle)]',
  rowTrack: 'h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]',
  rowFill: 'block h-full rounded-full bg-[var(--color-brand-600)]',
  rowValue: 'text-right text-sm tabular-nums',
  // Sentence of a moderator: colours and bold on the figures
  rowSentence: 'text-base leading-relaxed',
  sentenceActive: 'font-bold text-[var(--color-info)]',
  sentenceScreen: 'font-bold text-[var(--color-mauve-600)]',
  sentenceActions: 'font-bold text-[var(--color-brand-700)]',
  rowMeta: 'block text-xs text-[var(--color-ink-subtle)]',
  kinds: 'grid grid-cols-1 gap-2 sm:grid-cols-2',
  kind: 'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2',
  kindIcon: 'h-6 w-6 shrink-0',
  kindLabel: 'flex-1 text-sm',
  kindCount: 'text-sm font-bold tabular-nums',
  exports: 'flex flex-wrap gap-3 print:hidden',
  // Log
  logHead: 'flex flex-wrap items-center justify-between gap-3',
  log: 'flex flex-col',
  line: 'grid grid-cols-[3.5rem_minmax(0,9rem)_minmax(0,1fr)] items-start gap-3 border-t border-[var(--color-border)] py-2.5 text-sm first:border-t-0',
  lineTime: 'text-xs text-[var(--color-ink-subtle)] tabular-nums pt-0.5',
  lineActor: 'truncate font-semibold',
  lineBody: 'flex min-w-0 flex-col gap-0.5',
  lineWhat: 'flex flex-wrap items-center gap-x-2',
  lineIcon: 'h-4 w-4 shrink-0',
  lineDetail: 'truncate text-xs text-[var(--color-ink-subtle)]',
  lineFailed: 'text-xs font-semibold text-[var(--color-danger)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Past lives on the lives page
  pastWrap: 'mx-auto w-full max-w-7xl',
  past: 'flex flex-col',
  pastRow:
    'flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] py-3 first:border-t-0',
  pastWho: 'flex min-w-0 items-center gap-3',
  pastName: 'font-semibold',
  pastMeta: 'text-sm text-[var(--color-ink-subtle)]',
  pastLinks: 'flex flex-wrap gap-2',
  // Creator report reads like a letter
  letter: 'mx-auto flex w-full max-w-3xl flex-col gap-8',
  sentence: 'text-lg leading-relaxed',
} as const

/**
 * Moderation view of a member's file
 * @type {Record<string, string>}
 */

export const MEMBER_MODERATION = {
  stack: 'flex flex-col gap-6',
  switch: 'flex justify-center',
  stats:
    'grid grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0',
  stat: 'flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0',
  statLabel: PROPERTY_LABEL,
  statValue: 'text-2xl font-bold tracking-tight tabular-nums',
  list: 'flex flex-col',
  item: 'border-t border-[var(--color-border)] first:border-t-0',
  row: 'flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-[var(--radius-md)] px-2 py-3 text-left transition-colors hover:bg-[var(--color-hover)]',
  rowAvatar: 'relative shrink-0',
  rowPlatform:
    'absolute -right-1 -bottom-1 size-5 rounded-full bg-[var(--color-surface)] p-0.5 ring-2 ring-[var(--color-surface)]',
  rowMain: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'font-semibold',
  rowMeta: 'text-sm text-[var(--color-ink-subtle)]',
  rowDate: 'text-sm text-[var(--color-ink-subtle)]',
  rowTime: 'text-sm tabular-nums',
  rowTimeValue: 'font-bold',
  details: 'course-erase-in flex flex-col gap-3 px-2 pb-4',
  detailsLink: 'self-start text-sm font-semibold text-[var(--color-ink-accent)] hover:underline',
} as const

/**
 * Roll-call board of a live: three columns
 * @type {Record<string, string>}
 */

export const LIVE_ROSTER = {
  root: 'flex w-full flex-col gap-4 border-t border-[var(--color-border)] pt-5',
  head: 'flex flex-wrap items-baseline justify-between gap-2',
  title: PROPERTY_LABEL,
  lead: 'text-xs text-[var(--color-ink-subtle)]',
  columns: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3',
  column:
    'flex min-h-28 min-w-0 flex-col gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-3 transition-colors',
  columnOver: 'border-[var(--color-border-strong)] bg-[var(--color-hover)]',
  columnHead: 'flex min-w-0 items-center gap-2 text-xs font-bold tracking-wide uppercase',
  columnGlyph: 'h-4 w-4 shrink-0',
  columnEmpty: 'text-xs text-[var(--color-ink-subtle)] italic',
  person:
    'flex w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-sm font-semibold',
  name: 'min-w-0 truncate',
  personMovable: 'cursor-grab active:cursor-grabbing',
  personDragged: 'opacity-40',
  junior: 'ml-auto text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  toggle: 'self-start',
} as const

/**
 * Instructions screen read before the Mod View
 * @type {Record<string, string>}
 */

export const LIVE_GATE = {
  screen: 'flex min-h-0 flex-1 flex-col',
  head: 'flex flex-col gap-1',
  title: 'text-2xl font-bold tracking-tight',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  // Facts on the left, divider, instructions on the right
  body: 'grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,18rem)_auto_minmax(0,1fr)]',
  side: 'flex min-w-0 flex-col gap-6',
  group: 'flex min-w-0 flex-col gap-3',
  label: PROPERTY_LABEL,
  people: 'flex flex-col gap-3',
  person: 'flex min-w-0 items-center gap-3 text-sm font-semibold',
  personName: 'min-w-0 truncate',
  personText: 'flex min-w-0 flex-col',
  creator: 'text-xl leading-tight font-bold tracking-tight',
  divider: 'h-px w-full bg-[var(--color-border)] md:h-auto md:w-px',
  instructions: 'flex min-w-0 flex-col gap-3',
  // Only the text of the instructions, shadowed like a course box
  instructionsBox:
    'min-w-0 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-md)]',
  presence: 'mt-6 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6',
  choices: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  choice:
    'rounded-[var(--radius-lg)] px-4 py-4 text-center text-sm font-bold text-[var(--color-on-solid)] transition-[filter,opacity] hover:brightness-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  choiceSuccess: 'bg-[var(--color-success)]',
  choiceDanger: 'bg-[var(--color-danger)]',
  choiceNeutral:
    'border border-[var(--color-border-strong)] bg-[var(--color-background)] !text-[var(--color-ink)]',
  choicesStacked: 'sm:grid-cols-1',
  choiceTag: 'mt-1 block text-xs font-semibold opacity-90',
  // Centered box: drawn figure with its check, the sentence, then the edit button
  answeredBlock:
    'mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-6 text-center',
  answeredFigure: 'relative inline-flex',
  answered: 'text-sm',
  answeredGlyph: 'size-14',
  answeredBadge: 'absolute -right-1 -bottom-1 size-6',
  // The other one steps back once a pick is made
  choiceMuted: 'opacity-50',
  choiceOn:
    'ring-2 ring-[var(--color-ink)] ring-offset-2 ring-offset-[var(--color-surface-raised)]',
} as const

/**
 * Bubble telling a live just started
 * @type {Record<string, string>}
 */

export const LIVE_STARTED_BUBBLE = {
  // Pill beside the entry, one shadow over pill and tip
  root: 'rail-reset nudge-enter absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 cursor-pointer rounded-full bg-[var(--color-surface-raised)] px-4 py-2 text-left text-caption font-semibold whitespace-nowrap text-[var(--color-ink)] [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.3))_drop-shadow(0_0.5rem_1rem_rgb(0_0_0/0.14))] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  tail: 'pointer-events-none absolute top-1/2 -left-[0.5625rem] h-[1.125rem] w-3 -translate-y-1/2 text-[var(--color-surface-raised)]',
} as const
