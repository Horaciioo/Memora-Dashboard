import {
  BUBBLE,
  HEADING,
  LIFT,
  NOTE,
  PANEL,
  SOLID,
} from '@/declarations/ui/variants/games/play/shared'

/**
 * Lobby chat bubble stuck to the right edge, vertically centred
 * @type {Record<string, string>}
 */

export const PLAY_CHAT_BUBBLE = {
  open: 'play-side-in mt-4 flex min-h-80 w-full flex-col lg:fixed lg:top-1/2 lg:right-0 lg:z-40 lg:mt-0 lg:w-[var(--play-side-open)] lg:-translate-y-1/2',
  folding: 'play-side-out',
  // Centred over the chat box, desktop only
  above: 'absolute bottom-full left-0 mb-3 flex w-full justify-center max-lg:hidden',
  closed:
    'play-glass play-pop fixed top-1/2 right-0 z-40 grid size-14 -translate-y-1/2 place-items-center rounded-l-full text-[var(--play-ink)] hover:text-[var(--play-gold-ink)]',
  icon: 'size-6',
} as const

/**
 * Play invitation hung under the rail shortcut
 * @type {Record<string, string>}
 */

export const PLAY_NOTICE = {
  wrap: 'relative mx-4 pt-3 pb-1',
  caret: 'pointer-events-none absolute top-1.5 h-3 w-3 rotate-45 rounded-sm bg-[var(--play-dusk)]',
  bubble:
    'play-sky rail-reset relative z-10 block rounded-[var(--radius-lg)] p-3.5 pr-10 shadow-[var(--shadow-md)] ring-1 ring-[var(--play-gold)]/50',
  titleRow: 'flex flex-wrap items-center gap-2',
  title: 'block text-sm font-extrabold text-[var(--play-gold-ink)]',
  lead: 'mt-0.5 block text-sm font-semibold text-[var(--play-ink)]',
  dismiss:
    'absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-white/15 hover:text-[var(--play-ink)]',
  dismissIcon: 'h-3.5 w-3.5',
} as const

/**
 * Featured game banner over the row
 * @type {Record<string, string>}
 */

export const PLAY_FEATURE = {
  root: 'relative w-full max-md:hidden',
  slide:
    'play-feature-in relative flex h-72 items-center overflow-hidden rounded-[2rem] ring-[0.4rem] ring-[var(--game)] lg:h-80',
  backdrop: 'scale-125 blur-md',
  shade:
    'absolute inset-0 bg-linear-to-r from-[var(--play-night)] from-10% via-[var(--play-night)]/70 via-45% to-transparent',
  body: 'relative flex max-w-sm flex-col items-start gap-2 pl-10 text-[var(--play-on-art)]',
  // Corner window matching the ring's outer curve, the sash is cut by it so it wraps the card
  badgeClip:
    'pointer-events-none absolute -top-[0.4rem] -left-[0.4rem] z-10 size-44 overflow-hidden rounded-tl-[2.4rem]',
  badge:
    'absolute top-[3.7rem] left-[3.7rem] flex h-9 w-48 -translate-x-1/2 -translate-y-1/2 -rotate-45 items-center justify-center bg-linear-to-b from-[color-mix(in_srgb,var(--play-gold)_70%,white)] via-[var(--play-gold)] to-[color-mix(in_srgb,var(--play-gold)_75%,black)] text-xs font-extrabold tracking-[0.25em] text-[var(--play-night)] uppercase shadow-[0_0.3rem_0.6rem_rgb(0_0_0/0.45),inset_0_0.1rem_0_rgb(255_255_255/0.55),inset_0_-0.1rem_0_rgb(0_0_0/0.2)] [text-shadow:0_1px_0_rgb(255_255_255/0.4)]',
  name: 'text-5xl font-extrabold tracking-tight uppercase',
  tagline: 'text-sm text-[var(--play-on-art)]/85',
  seats: 'text-xs font-extrabold tabular-nums text-[var(--game)]',
  play: 'mt-2 rounded-2xl bg-[var(--game)] px-6 py-2.5 text-sm font-extrabold text-[var(--play-night)] shadow-[0_0.3rem_0_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
  poster:
    'play-feature-poster absolute z-20 top-1/2 right-12 aspect-[3/4] w-52 -translate-y-1/2 rotate-3 cursor-pointer [transform-style:preserve-3d] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--play-key)] lg:w-60',
  flip: 'play-feature-flip absolute inset-0 block [transform-style:preserve-3d]',
  front:
    'absolute inset-0 block overflow-hidden rounded-3xl ring-[0.3rem] ring-white/70 shadow-[0_1.5rem_3rem_rgb(0_0_0/0.45)] [backface-visibility:hidden]',
  back: 'absolute inset-0 flex flex-col justify-center gap-2.5 overflow-hidden rounded-3xl bg-[var(--play-night)] p-5 text-left text-[var(--play-on-art)] ring-[0.3rem] ring-[var(--game)] shadow-[0_1.5rem_3rem_rgb(0_0_0/0.45)] [backface-visibility:hidden] [transform:rotateY(180deg)]',
  backTitle: 'text-lg font-extrabold tracking-tight text-[var(--game)] uppercase',
  backStep:
    'block text-xs leading-snug text-[var(--play-on-art)]/85 [&>strong]:block [&>strong]:text-[var(--play-on-art)]',
  dots: 'mt-3 flex justify-center gap-2',
  dot: 'h-2 w-2 rounded-full bg-[var(--play-ink-faint)] transition-[width,background-color] duration-300 aria-[current=true]:w-6 aria-[current=true]:bg-[var(--play-ink)]',
} as const

/**
 * Game choice laid as a row of tall posters
 * @type {Record<string, string>}
 */

export const PLAY_CROSS = {
  stage: 'mx-auto flex w-full max-w-4xl flex-col gap-6 pb-28',
  games: 'flex min-w-0 flex-col items-center gap-6',
  heading: `${HEADING} text-center max-md:sr-only sm:text-3xl`,
  // Three by three on desktop, one column on a phone
  cross: 'grid w-full gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3',
  card: 'relative z-10 min-h-0! w-[var(--card)] shrink-0',
  // Phone keeps the plain list
  list: 'flex flex-col gap-4 md:hidden',
  // One row of cards, the middle one larger
  row: 'flex w-full flex-col gap-4 max-md:hidden md:w-[calc(100%+12rem)] md:max-w-[100vw]',
  rowTitle: 'text-center text-lg font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  frame: 'flex items-center gap-3',
  track:
    'relative min-w-0 flex-1 overflow-hidden py-6 [--card:10.5rem] [--gap:1.5rem] [--info:15rem] [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)] focus-visible:outline-none',
  strip:
    'ml-[50%] flex w-max gap-[var(--gap)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] translate-x-[calc(var(--card)/-2-var(--info)/2-var(--at)*(var(--card)+var(--gap)))]',
  slot: 'group/slot relative flex scale-90 items-stretch opacity-70 transition-[scale,opacity] duration-500 data-[active=true]:z-10 data-[active=true]:scale-100 data-[active=true]:opacity-100',
  // Unfolds right of the active card, no edge of its own
  info: 'flex w-0 items-center overflow-hidden py-2 text-[var(--play-on-art)] opacity-0 transition-[width,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/slot:w-[var(--info)] group-data-[active=true]/slot:-ml-5 group-data-[active=true]/slot:opacity-100',
  // Tucked under the card like the title boxes, same border and hard shadow
  infoBox:
    'flex w-[var(--info)] shrink-0 flex-col items-start gap-3 rounded-r-3xl border-[0.2rem] border-l-0 border-[var(--game)] bg-[color-mix(in_srgb,var(--play-panel-strong)_93%,var(--game))] py-4 pr-4 pl-9 shadow-[inset_0_-0.35rem_0_color-mix(in_srgb,var(--game)_14%,transparent),0_0.3rem_0_var(--game)]',
  infoText: 'text-sm leading-snug font-semibold text-[var(--play-on-art)]/90',
  infoPlay:
    'w-fit rounded-xl bg-[var(--game)] px-4 py-1.5 text-sm font-extrabold text-[var(--play-night)] shadow-[0_0.3rem_0_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-ink)]',
  // Side card: a click brings it to the middle
  slotPick: 'absolute inset-0 z-20 cursor-pointer rounded-3xl',
  arrow:
    'grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--play-on-art)] text-[var(--play-night)] shadow-[0_0.3rem_0_rgb(0_0_0/0.35)] transition-[transform,box-shadow,opacity] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_0.1rem_0_rgb(0_0_0/0.35)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-ink)] disabled:pointer-events-none disabled:opacity-30',
  arrowIcon: 'size-6',
  live: 'min-h-0 shrink',
  online: 'min-h-0 shrink-0',
} as const

/**
 * Dock at the bottom of Memora Play
 * @type {Record<string, string>}
 */

export const PLAY_DOCK = {
  wrap: 'fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none max-md:hidden',
  bar: `${BUBBLE} pointer-events-auto relative flex items-center gap-2 rounded-full px-3 py-2 sm:gap-4 sm:px-5`,
  button:
    'group relative grid size-11 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  // Open key: the glyph grows, the box and its neighbours stay put
  buttonOn: 'bg-transparent! text-[var(--play-ink)] [&_svg]:scale-[1.4]',
  // Page title above a hovered key
  tip: 'play-glass pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-extrabold whitespace-nowrap text-[var(--play-ink)] opacity-0 transition-opacity group-hover:opacity-100 group-aria-expanded:hidden',
  // Game or invitation waiting, the glyph turns gold
  buttonCall: 'text-[var(--play-gold-ink)]',
  icon: 'size-5 transition-transform duration-200',
  avatarButton:
    'group relative mx-1 -my-6 rounded-full transition-transform hover:-translate-y-0.5',
  avatarRing: 'rounded-full ring-4 ring-[var(--play-panel-strong)]',
  level:
    'absolute -right-1 -bottom-1 grid min-w-7 place-items-center rounded-full bg-[var(--play-gold)] px-1.5 py-0.5 text-xs font-extrabold tabular-nums text-[var(--play-night)] ring-2 ring-[var(--play-panel-strong)]',
  split: 'h-6 w-px bg-[var(--play-line)]',
  // Bubble pointing at its button
  bubble: `${BUBBLE} play-rise pointer-events-auto absolute bottom-full mb-20 flex w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col p-4 text-[var(--play-ink)]`,
  // Shrinking bubbles pointing at the key
  trail: 'play-glass play-pop pointer-events-none absolute rounded-full',
  head: 'play-rise-item flex items-center justify-between gap-3 pb-3',
  content: 'play-rise-item',
  title: 'text-sm font-extrabold tracking-wide uppercase',
  open: 'grid size-8 place-items-center rounded-full text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  openIcon: 'size-4',
  rows: 'flex max-h-96 flex-col divide-y divide-[var(--play-line)] overflow-y-auto',
  row: 'flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0',
  // Own game, a row of the sessions list
  resume: 'flex items-center gap-3 py-3 first:pt-0 last:pb-0',
  resumeLogo: 'size-12 shrink-0',
  resumeText: 'min-w-0 flex-1 text-sm font-extrabold text-[var(--play-ink)]',
  rowHead: 'flex items-center justify-between gap-2 text-sm font-extrabold',
  rowName: 'flex min-w-0 items-center gap-2 truncate',
  rowLogo: 'size-7',
  rowValue: 'text-sm font-extrabold tabular-nums text-[var(--play-accent)]',
  rowNote: NOTE,
  rowActions: 'flex items-center gap-2 pt-1 pb-1.5',
  empty: 'py-2 text-sm italic text-[var(--play-ink-faint)]',
  // Nothing in the feed, glyph over the line
  void: 'flex flex-col items-center gap-2 py-4 text-center text-sm font-bold text-[var(--play-ink-soft)]',
  voidIcon: 'size-9 text-[var(--play-ink-faint)]',
} as const

/**
 * Lobby page: logo, the players in the middle, the chat on the right
 * @type {Record<string, string>}
 */

export const PLAY_ROOM = {
  // Lobby: header row, then the box centred in what is left
  main: 'flex min-w-0 flex-col gap-4 lg:min-h-[calc(100dvh-17rem)]',
  head: 'flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between md:gap-4',
  center: 'my-auto',
  logo: 'size-28 sm:size-32 md:ml-12 xl:ml-8',
  game: NOTE,
  watch: 'flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--play-chip)] px-4 py-2',
  watchLabel: 'text-xs font-extrabold tracking-wider text-[var(--play-ink)] uppercase',
  watchFaces: 'flex items-center gap-1.5',
  watchAway: 'opacity-40 grayscale',
  lost: 'fixed top-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--play-panel-strong)] px-4 py-1.5 text-xs font-bold text-[var(--play-ink-soft)] shadow-lg',
  back: 'inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold tracking-wider text-[var(--play-ink-soft)] uppercase hover:text-[var(--play-ink)]',
  // Players and gestures, centred
  middle: 'mx-auto flex w-full max-w-2xl flex-col items-center gap-6',
  // Title block: label, waiting line, one sentence
  lobbyHead: 'flex flex-col items-center gap-2 text-center',
  eyebrow:
    'rounded-full bg-[var(--play-ink)] px-4 py-1.5 text-[0.65rem] font-extrabold tracking-[0.25em] text-[var(--play-panel-strong)] uppercase',
  lobbyTitle:
    'text-3xl font-extrabold tracking-tight text-balance text-[var(--play-ink)] sm:text-4xl',
  lobbySub: 'text-sm font-semibold text-balance text-[var(--play-ink-soft)] sm:text-base',
  // Line under the title: access and rules
  summary:
    'flex w-full items-center justify-between gap-2 text-sm font-bold text-[var(--play-ink-soft)]',
  summaryLink:
    'rounded-xl bg-[var(--play-chip)] px-3 py-1.5 font-extrabold text-[var(--play-ink)] transition-colors hover:bg-[var(--play-panel-strong)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)] disabled:cursor-default disabled:hover:bg-[var(--play-chip)]',
  summaryEnd: 'ml-auto',
  // The table: one card per seat, two across on a phone
  table:
    'grid w-full grid-cols-2 justify-center gap-3 py-1 sm:grid-cols-[repeat(var(--cols),9rem)] md:gap-4',
  seat: `play-seat ${PANEL} relative flex min-w-0 flex-col items-center gap-1.5 px-2 pt-6 pb-4 text-center transition-[opacity,box-shadow] duration-300 rounded-3xl`,
  seatReady: 'shadow-[var(--shadow-md)]',
  seatIdle: 'opacity-75',
  seatMine: 'ring-2 ring-[var(--play-key)]',
  seatOff: 'opacity-40',
  seatAvatar: 'relative',
  seatCrown: 'absolute -top-4 left-1/2 size-5 -translate-x-1/2 text-[var(--play-gold)]',
  seatBadge:
    'play-badge-pop absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-[var(--play-golf-glow)] text-black/70',
  seatBadgeIcon: 'size-3',
  seatName: 'w-full truncate text-sm font-extrabold',
  seatRole: 'text-[0.6rem] font-extrabold tracking-wider text-[var(--play-gold-ink)] uppercase',
  seatState:
    'play-rise-item inline-flex items-center gap-1 text-xs font-extrabold tracking-wider text-[var(--play-ink)] uppercase',
  seatStateIdle: 'text-[var(--play-ink-faint)]',
  seatYou:
    'absolute top-2 left-2 rounded-full bg-[var(--play-key)] px-2 py-0.5 text-[0.6rem] font-extrabold tracking-wider text-[var(--play-key-ink)] uppercase',
  seatKick:
    'absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full text-[var(--play-ink-faint)] transition-colors hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  seatKickIcon: 'size-3.5',
  seatAction: 'mt-1.5 w-full',
  // Empty seat, one tap opens the picker
  slot: 'flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--play-line)] text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  slotIcon: 'grid size-12 place-items-center rounded-full bg-[var(--play-chip)]',
  slotIconSvg: 'size-5',
  slotLabel: 'text-xs font-extrabold tracking-wider uppercase',
  // Share row of a public game, always in reach
  link: 'flex w-full max-w-sm items-center gap-3 rounded-2xl bg-[var(--play-chip)] px-4 py-3 text-left text-sm font-bold text-[var(--play-ink-soft)] hover:text-[var(--play-ink)]',
  linkMain: 'mr-auto truncate',
  linkCode: 'text-lg font-extrabold tracking-[0.5em] text-[var(--play-ink)]',
  linkCopy: 'shrink-0 text-xs font-extrabold text-[var(--play-ink)]',
  // Share card of a private game, at the centre of the room
  share: `${PANEL} ${LIFT} flex w-full flex-col items-center gap-4 rounded-3xl p-5 text-center sm:flex-row sm:text-left`,
  shareText: 'flex min-w-0 flex-1 flex-col items-center gap-1 sm:items-start',
  shareLabel:
    'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  shareCode: 'text-3xl font-extrabold tracking-[0.35em] text-[var(--play-ink)] sm:text-4xl',
  box: `${PANEL} ${LIFT} flex w-full flex-col items-center gap-5 rounded-[2rem] p-5 sm:p-8`,
  // Plain column, flows under the players
  actions: 'flex w-full max-w-sm flex-col gap-3',
  // Quiet way out, under the main key
  exit: 'mx-auto text-sm font-bold text-[var(--play-ink-soft)] underline-offset-4 transition-colors hover:text-[var(--play-ink)] hover:underline disabled:opacity-50',
  note: 'text-center text-sm text-[var(--play-ink-soft)]',
} as const

/**
 * Discord-like chat of a game, plain text
 * @type {Record<string, string>}
 */

export const PLAY_CHAT_UI = {
  headActions: 'flex items-center gap-1',
  panel: `${PANEL} ${LIFT} flex h-full flex-col overflow-hidden lg:rounded-r-none`,
  // Inside the session side column: takes the room left under the players
  panelSide: `${PANEL} ${LIFT} flex min-h-0 flex-1 flex-col overflow-hidden max-lg:h-[28rem] lg:rounded-r-none`,
  head: 'flex items-center justify-between gap-3 border-b border-[var(--play-line)] px-4 py-3',
  title: 'text-sm font-extrabold tracking-wide uppercase',
  // Feed, Chat, Tout as one segmented key
  tabs: 'flex flex-1 items-center gap-1 rounded-xl bg-[var(--play-chip)] p-1',
  tab: 'flex-1 rounded-lg px-2 py-1.5 text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase transition-colors hover:text-[var(--play-ink)]',
  tabOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)] shadow-[var(--shadow-sm)]',
  // Who is there, one compact row
  people: 'flex items-center gap-3 border-b border-[var(--play-line)] px-4 py-2.5',
  peopleGroup: 'flex min-w-0 items-center gap-2',
  peopleLabel:
    'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  peopleStack: 'flex min-w-0 items-center -space-x-2',
  peopleFace: 'rounded-full ring-2 ring-[var(--play-ring)]',
  peopleAway: 'opacity-40 grayscale',
  peopleSplit: 'h-5 w-px shrink-0 bg-[var(--play-line)]',
  list: 'flex flex-1 flex-col overflow-y-auto px-2 py-3',
  empty: 'm-auto px-6 text-center text-sm italic text-[var(--play-ink-faint)]',
  message: 'flex gap-3 rounded-lg px-2 pt-2 pb-0.5 hover:bg-[var(--play-chip)]',
  event: 'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[var(--play-ink-soft)]',
  eventName: 'font-extrabold text-[var(--play-ink)]',
  eventVerb: 'font-bold',
  follow: 'rounded-lg py-0.5 pr-2 pl-[2.75rem] hover:bg-[var(--play-chip)]',
  body: 'flex min-w-0 flex-col',
  meta: 'flex items-baseline gap-2',
  author: 'truncate text-sm font-extrabold',
  time: 'text-[0.7rem] font-semibold tabular-nums text-[var(--play-ink-faint)]',
  text: 'text-sm break-words whitespace-pre-wrap text-[var(--play-ink)]',
  composer: 'relative flex items-end gap-2 border-t border-[var(--play-line)] p-3',
  invite:
    'grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--play-chip)] text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-key)] hover:text-[var(--play-key-ink)]',
  inviteOn: 'bg-[var(--play-key)] text-[var(--play-key-ink)]',
  inviteIcon: 'size-5',
  input:
    'block max-h-32 min-h-11 w-full resize-none rounded-xl bg-[var(--play-chip)] px-3 py-2.5 text-sm text-[var(--play-ink)] placeholder:text-[var(--play-ink-faint)] focus:outline-none',
} as const

/**
 * Invitation picker, everyone or chosen people
 * @type {Record<string, string>}
 */

export const PLAY_INVITE = {
  anchor: 'relative',
  panel: `${SOLID} absolute top-full left-0 z-30 mt-3 flex w-96 flex-col gap-3 p-3 text-[var(--play-ink)] max-md:fixed max-md:inset-auto max-md:top-1/2 max-md:left-1/2 max-md:z-[80] max-md:mt-0 max-md:w-[calc(100vw-2rem)] max-md:max-w-md max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:max-h-[85dvh] max-md:overflow-y-auto`,
  // Phone: a centred modal, so side anchors do nothing
  panelEnd: 'right-0 left-auto',
  panelCentered: 'left-1/2 right-auto -translate-x-1/2',
  // Dim page behind the phone modal
  scrim: 'fixed inset-0 z-[79] bg-[var(--color-scrim)]/40 md:hidden',
  // Over the composer, as wide as it so the chat never clips it
  panelDock: `${SOLID} absolute inset-x-3 bottom-full z-30 mb-2 flex flex-col gap-3 p-3 text-[var(--play-ink)]`,
  // Opens in the seats grid, never clipped
  anchorInline: 'contents',
  // Full screen sheet on a phone
  panelInline: `${SOLID} relative col-span-full mx-auto mt-2 flex w-full max-w-md flex-col gap-3 p-3 text-[var(--play-ink)] max-md:fixed max-md:inset-auto max-md:top-1/2 max-md:left-1/2 max-md:z-[80] max-md:mt-0 max-md:w-[calc(100vw-2rem)] max-md:max-w-md max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:max-h-[85dvh] max-md:overflow-y-auto`,
  // Tip aimed at the trigger above
  arrow:
    'absolute -top-1.5 left-[var(--arrow-x,50%)] size-3 max-md:hidden -translate-x-1/2 rotate-45 bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)] [clip-path:polygon(0_0,100%_0,0_100%)]',
  // Quiet row under the list, label left and state right
  choice:
    'flex w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-1.5 text-left text-xs font-extrabold md:py-2 md:text-sm text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)] disabled:opacity-50',
  choiceIcon: 'size-5 shrink-0',
  choiceText: 'mr-auto whitespace-nowrap',
  level:
    'rounded-lg bg-[var(--play-chip)] px-2.5 py-1 text-xs font-extrabold text-[var(--play-ink)] hover:bg-[var(--play-line)] disabled:opacity-50',
  foot: 'flex flex-col gap-1',
  footGroup: 'flex flex-col border-t border-[var(--play-line)] pt-1',
  footPaused: 'pointer-events-none opacity-50',
  pausedNote: 'px-3 pb-1 text-xs font-bold text-[var(--play-ink-faint)]',
  search:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-3 py-2 text-sm font-semibold md:py-2.5 placeholder:text-[var(--play-ink-faint)] focus:outline-none',
  head: 'flex items-center gap-2',
  close:
    'grid size-8 place-items-center rounded-lg text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  // Only a phone sheet needs a way out, elsewhere a tap outside closes
  closeMobile: 'md:hidden',
  closeIcon: 'size-4',
  section: 'flex flex-col',
  sectionTitle:
    'px-2 pt-2 pb-1 text-[0.65rem] font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  people: 'flex max-h-60 flex-col overflow-y-auto max-md:max-h-none max-md:flex-1',
  // Faces side by side, name under each
  faces: 'grid grid-cols-5 gap-x-1.5 gap-y-2 px-1 pb-1.5 md:gap-x-2 md:gap-y-3 md:pb-2',
  face: 'flex min-w-0 flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-[var(--play-chip)]',
  faceSent: 'cursor-default opacity-70 hover:bg-transparent',
  faceAvatar: 'relative',
  faceBadge:
    'absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-[var(--play-ink)] text-[var(--play-panel-strong)] ring-2 ring-[var(--play-panel-strong)]',
  faceName: 'w-full truncate text-center text-[0.65rem] font-bold md:text-xs',
  stateIcon: 'size-2.5',
  check: 'ml-auto size-4 text-[var(--play-ink)]',
  empty: 'px-2 py-2 text-sm italic text-[var(--play-ink-faint)]',
  codeInline: 'text-base font-extrabold tracking-[0.3em] text-[var(--play-ink)]',
  // Join with a code from the hub
  entry: 'flex w-full flex-col gap-2',
  entryInput:
    'w-full rounded-xl bg-[var(--play-chip)] px-3 py-3 text-center text-base font-extrabold tracking-[0.3em] text-[var(--play-ink)] uppercase placeholder:text-[var(--play-ink-faint)] placeholder:tracking-normal placeholder:normal-case focus:outline-none',
} as const

/**
 * Verb colour of a chat event, by kind
 * @type {Record<string, string>}
 */

export const PLAY_CHAT_VERBS: Record<string, string> = {
  JOINED: 'text-[var(--play-golf-glow)]',
  LEFT: 'text-[var(--play-bomb-glow)]',
  KICKED: 'text-[var(--play-heart)]',
  REQUESTED: 'text-[var(--play-golf-glow)]',
}

/**
 * Verb colour of a game feed line, by kind
 * @type {Record<string, string>}
 */

export const PLAY_FEED_VERBS: Record<string, string> = {
  WORD: 'text-[var(--play-blue-ink)]',
  BLAST: 'text-[var(--play-heart)]',
  LIFE: 'text-[var(--play-gold-ink)]',
  finished: 'text-[var(--play-blue-ink)]',
  stopped: 'text-[var(--play-heart)]',
  HOLED: 'text-[var(--play-golf-glow)]',
  ACE: 'text-[var(--play-gold-ink)]',
  POWER: 'text-[var(--play-blue-ink)]',
  FALL: 'text-[var(--play-heart)]',
  CAPTURE: 'text-[var(--play-heart)]',
  EXIT: 'text-[var(--play-blue-ink)]',
  HOME: 'text-[var(--play-gold-ink)]',
  SKIP: 'text-[var(--play-blue-ink)]',
  PENALTY: 'text-[var(--play-heart)]',
  FINISH: 'text-[var(--play-gold-ink)]',
}
