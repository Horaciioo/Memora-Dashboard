/**
 * Discord replica
 * @type {Record<string, string>}
 */

export const DISCORD_REPLICA = {
  root: 'relative grid h-[34rem] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--discord-background)] text-[0.9375rem] leading-[1.375rem] text-[var(--discord-text)] shadow-[var(--shadow-scene)] md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_14rem]',
  // Channel sidebar
  sidebar: 'hidden min-h-0 flex-col bg-[var(--discord-sidebar)] md:flex',
  server:
    'flex h-12 shrink-0 items-center justify-between border-b border-[var(--discord-rail)] px-4 font-semibold text-[var(--discord-heading)]',
  serverIcon: 'h-4 w-4 text-[var(--discord-heading)]',
  channelList: 'flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-2 py-3',
  category:
    'mt-3 flex items-center gap-0.5 px-0.5 text-xs font-semibold tracking-wide text-[var(--discord-channel)] uppercase first:mt-0',
  categoryIcon: 'h-3 w-3',
  channel:
    'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--discord-channel)]',
  channelActive: 'bg-[var(--discord-channel-active)] text-[var(--discord-heading)]',
  // The channel the scene is about
  channelLit:
    'replica-lit bg-[color-mix(in_oklab,var(--color-brand-500)_28%,transparent)] font-semibold text-white ring-1 ring-[var(--color-brand-400)]',
  channelIn: 'replica-channel-in',
  channelIcon: 'h-5 w-5 shrink-0 opacity-80',
  channelName: 'truncate',
  channelSkeleton:
    'mx-2 my-2 h-3 rounded-full bg-[var(--discord-skeleton)] skeleton-shimmer replica-shimmer',
  // Middle column
  main: 'flex min-h-0 min-w-0 flex-col',
  header:
    'flex h-12 shrink-0 items-center gap-2 border-b border-[var(--discord-rail)] px-4 shadow-[0_1px_0_rgb(0_0_0/0.2)]',
  headerHash: 'h-6 w-6 shrink-0 text-[var(--discord-channel)]',
  headerName: 'truncate font-semibold text-[var(--discord-heading)]',
  headerTools: 'ml-auto flex items-center gap-4 text-[var(--discord-muted)]',
  headerTool: 'hidden h-6 w-6 lg:block',
  headerSearch:
    'hidden h-6 w-36 items-center justify-between rounded-[var(--radius-sm)] bg-[var(--discord-rail)] px-2 text-sm text-[var(--discord-muted)] lg:flex',
  headerSearchIcon: 'h-4 w-4',
  scroller: 'flex min-h-0 flex-1 flex-col justify-end overflow-hidden pb-2',
  scrollerIn: 'replica-scroll-in',
  // Message
  message:
    'replica-message-in relative flex gap-4 px-4 pt-3 pb-0.5 hover:bg-[var(--discord-hover)]',
  avatar:
    'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--discord-blurple)] text-base font-semibold text-white',
  avatarGlyph: 'h-7 w-7',
  body: 'flex min-w-0 flex-1 flex-col',
  head: 'flex flex-wrap items-center gap-x-1.5',
  author: 'font-medium text-[var(--discord-heading)]',
  appBadge:
    'rounded-[3px] bg-[var(--discord-blurple)] px-1 text-[0.625rem] leading-4 font-semibold text-white',
  time: 'text-xs text-[var(--discord-muted)]',
  content: 'break-words whitespace-pre-wrap',
  strong: 'font-bold text-[var(--discord-heading)]',
  mention:
    'rounded-[3px] bg-[var(--discord-mention)] px-0.5 font-medium text-[var(--discord-mention-text)]',
  // Quoted message above a reply
  reply: 'mb-0.5 ml-[3.75rem] flex items-center gap-1 text-sm text-[var(--discord-muted)]',
  replyArm:
    'mt-2 -mr-1 h-2.5 w-8 shrink-0 rounded-tl-md border-t-2 border-l-2 border-[var(--discord-quote)]',
  replyAvatar: 'h-4 w-4 shrink-0 rounded-full bg-[var(--discord-blurple)]',
  replyName: 'font-medium text-[var(--discord-heading)]',
  replyText: 'truncate',
  // Embed
  embed:
    'mt-1 grid max-w-[32rem] grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-[var(--radius-sm)] border-l-4 bg-[var(--discord-embed)] px-4 py-3',
  embedBanner:
    'col-span-2 h-28 w-full rounded-[var(--radius-sm)] bg-[var(--discord-skeleton)] skeleton-shimmer replica-shimmer',
  embedText: 'flex min-w-0 flex-col gap-1',
  embedTitle: 'font-semibold text-[var(--discord-heading)]',
  embedDescription: 'text-sm break-words whitespace-pre-wrap',
  embedThumb: 'h-16 w-16 shrink-0',
  embedFooter: 'col-span-2 text-xs text-[var(--discord-muted)]',
  buttons: 'mt-2 flex flex-wrap gap-2',
  button:
    'inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-4 text-sm font-medium text-white',
  buttonIcon: 'h-4 w-4',
  buttonStyle: {
    danger: 'bg-[var(--discord-button-danger)]',
    primary: 'bg-[var(--discord-blurple)]',
    secondary: 'bg-[var(--discord-button-secondary)]',
    success: 'bg-[var(--discord-button-success)]',
  },
  // Typing line and composer
  typing: 'flex h-6 items-center gap-1.5 px-4 text-xs text-[var(--discord-heading)]',
  typingDots: 'flex items-center gap-0.5',
  typingDot: 'replica-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--discord-heading)]',
  typingName: 'font-bold',
  composer: 'px-4 pb-5',
  composerBox:
    'flex min-h-11 items-center gap-4 rounded-[var(--radius-md)] bg-[var(--discord-input)] px-4 text-[var(--discord-muted)]',
  composerIcon: 'h-6 w-6 shrink-0',
  composerText: 'min-w-0 flex-1 truncate text-[var(--discord-text)]',
  composerPlaceholder: 'min-w-0 flex-1 truncate',
  composerCaret: 'replica-caret ml-px inline-block h-5 w-px translate-y-1 bg-[var(--discord-text)]',
  composerTools: 'hidden items-center gap-3 sm:flex',
  // Member list
  members:
    'hidden min-h-0 flex-col gap-1 overflow-hidden bg-[var(--discord-sidebar)] px-2 py-4 xl:flex',
  memberRole:
    'mt-4 px-2 text-xs font-semibold tracking-wide text-[var(--discord-channel)] uppercase first:mt-0',
  member: 'flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1',
  memberAvatar:
    'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--discord-blurple)] text-sm font-semibold text-white',
  memberStatus:
    'absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-[var(--discord-sidebar)] bg-[var(--discord-online)]',
  memberName: 'truncate font-medium',
  memberSkeleton: 'flex items-center gap-3 px-2 py-1.5',
  memberSkeletonAvatar:
    'h-8 w-8 shrink-0 rounded-full bg-[var(--discord-skeleton)] skeleton-shimmer replica-shimmer',
  memberSkeletonName:
    'h-3 flex-1 rounded-full bg-[var(--discord-skeleton)] skeleton-shimmer replica-shimmer',
} as const

/**
 * Support guide
 * @type {Record<string, string>}
 */

export const SUPPORT_GUIDE = {
  wrap: 'relative',
  notch:
    'absolute top-1/2 left-0 z-20 flex h-28 w-7 -translate-y-1/2 items-center justify-center rounded-r-[var(--radius-lg)] bg-[var(--color-brand-600)] text-white shadow-[var(--shadow-scene)] transition-[width] hover:w-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-600)]',
  notchIcon: 'h-4 w-4',
  panel:
    'guide-slide-in absolute inset-y-3 left-3 z-30 flex w-[min(20rem,calc(100%-1.5rem))] flex-col gap-4 overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-scene)]',
  panelHead: 'flex items-center justify-between gap-3',
  panelTitle: 'text-lg font-bold tracking-tight',
  close:
    'flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)]',
  closeIcon: 'h-4 w-4',
  steps: 'relative flex flex-col gap-5 pl-7',
  // Vertical rail
  rail: 'absolute top-2 bottom-2 left-[0.6875rem] w-0.5 rounded-full bg-[var(--color-border)]',
  railFill:
    'absolute top-2 left-[0.6875rem] w-0.5 rounded-full bg-[var(--color-apple-green)] transition-[height] duration-[var(--motion-duration-celebrate)] ease-out',
  step: 'relative flex flex-col gap-1 transition-opacity duration-[var(--motion-duration-slow)]',
  stepDim: 'opacity-45',
  dot: 'absolute top-1 -left-7 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-[var(--motion-duration-slow)]',
  dotTodo: 'border-[var(--color-border)] bg-[var(--color-surface)]',
  dotDone: 'border-[var(--color-apple-green)] bg-[var(--color-apple-green)] text-white',
  dotCurrent:
    'guide-dot-pulse border-[var(--color-apple-orange)] bg-[var(--color-surface)] text-[var(--color-apple-orange)]',
  stepTitle: 'font-bold',
  tips: 'flex flex-col gap-1 text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Comparison of several played runs
 * @type {Record<string, string>}
 */

export const COMPARE_RUNS = {
  stage: 'flex flex-col gap-3',
  stageHead: 'flex flex-wrap items-center justify-between gap-3',
  stageLabel: 'text-sm font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  strip: 'grid gap-4 sm:grid-cols-3',
  thumb:
    'group relative flex flex-col gap-2 rounded-[var(--radius-xl)] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-600)]',
  thumbFrame:
    'pointer-events-none relative block h-40 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] transition-transform group-hover:-translate-y-0.5',
  // The replica drawn small inside a thumbnail
  thumbScale: 'block w-[300%] origin-top-left scale-[0.3333]',
  thumbOpen: 'ring-2 ring-[var(--color-brand-600)]',
  thumbLabel: 'block text-center font-bold',
  enlarged: 'run-slide-in relative',
  replay:
    'absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 shadow-[var(--shadow-scene)]',
  picks: 'grid gap-3 sm:grid-cols-3',
  pick: 'justify-center',
  feedback:
    'course-erase-in rounded-[var(--radius-lg)] border-l-4 bg-[var(--color-surface)] px-4 py-3 text-sm',
  feedbackGood: 'border-[var(--color-apple-green)]',
  feedbackBad: 'border-[var(--color-apple-red)]',
} as const

/**
 * Choice game played in the replica
 * @type {Record<string, string>}
 */

export const BRANCHING = {
  stage: 'flex flex-col gap-4',
  prompt:
    'course-erase-in flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-scene)]',
  promptText: 'font-semibold',
  options: 'flex flex-wrap gap-3',
  path: 'flex flex-wrap gap-2 text-sm text-[var(--color-ink-subtle)]',
  pathStep: 'rounded-full border border-[var(--color-border)] px-3 py-1',
  ending:
    'course-erase-in flex flex-col gap-2 rounded-[var(--radius-xl)] border-l-4 bg-[var(--color-surface)] p-5 shadow-[var(--shadow-scene)]',
  endingGood: 'border-[var(--color-apple-green)]',
  endingBad: 'border-[var(--color-apple-red)]',
  endingTitle: 'text-lg font-bold',
} as const

/**
 * Example messages of a lesson
 * @type {Record<string, string>}
 */

export const DISCORD_EXAMPLE = {
  figure: 'flex flex-col gap-2',
  frame:
    'relative overflow-hidden rounded-[var(--radius-lg)] border-l-4 bg-[var(--discord-background)] py-1 text-[0.9375rem] leading-[1.375rem] text-[var(--discord-text)] shadow-[var(--shadow-sm)]',
  frameGood: 'border-[var(--color-apple-green)]',
  frameBad: 'border-[var(--color-apple-red)]',
  frameNeutral: 'border-[var(--discord-quote)]',
  caption: 'flex items-center gap-2 text-sm font-semibold',
  captionIcon: 'h-4 w-4',
} as const

/**
 * Folding block of a lesson
 * @type {Record<string, string>}
 */

export const DISCLOSURE = {
  root: 'group rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]',
  summary:
    'flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-bold text-[var(--color-apple-orange)] [&::-webkit-details-marker]:hidden',
  chevron: 'h-4 w-4 transition-transform duration-[var(--motion-duration-base)] group-open:rotate-90',
  body: 'course-erase-in flex flex-col gap-4 border-t border-[var(--color-border)] px-5 py-4',
} as const
