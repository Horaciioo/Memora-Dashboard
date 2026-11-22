// Card surface shared by both popups
const CARD = 'play-invite play-invite-pop flex items-center rounded-3xl'

/**
 * Invitation bubble over the notifications bell
 * @type {Record<string, string>}
 */

export const PLAY_INVITE_CALL = {
  anchor: 'fixed z-75 w-[22rem] max-w-[calc(100vw-1.5rem)]',
  card: `${CARD} relative flex-col items-stretch overflow-hidden`,
  // Scene of the game behind the head
  art: 'play-art play-invite-art pointer-events-none relative h-20 w-full shrink-0',
  content: 'relative -mt-9 flex flex-col gap-3 px-4 pb-4',
  head: 'flex items-end gap-3',
  tailBelow: 'play-invite-tail -bottom-2',
  tailAbove: 'play-invite-tail -top-2',
  logo: 'play-invite-logo size-[4.5rem] shrink-0 drop-shadow-[0_0.4rem_0.6rem_rgb(0_0_0/0.45)]',
  body: 'flex min-w-0 flex-1 flex-col pb-1',
  eyebrow: 'text-micro font-bold tracking-widest text-[var(--play-key)] uppercase',
  text: 'text-base leading-snug font-semibold text-[var(--play-ink-soft)]',
  name: 'font-bold text-[var(--play-ink)]',
  actions: 'flex items-center gap-2 [&>*:first-child]:flex-1',
  // The rail notice takes over from tablets
  phoneOnly: 'md:hidden',
} as const

/**
 * Invitation box of the home page, one line like the latest note
 * @type {Record<string, string>}
 */

export const HOME_PLAY_INVITE = {
  // The rail notice takes over from tablets
  box: 'play-invite flex md:hidden items-center gap-4 rounded-[var(--radius-lg)] px-4 py-3',
  logo: 'play-invite-logo size-10 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col',
  eyebrow: 'text-micro font-bold tracking-widest text-[var(--play-ink-soft)] uppercase',
  text: 'truncate text-base leading-tight font-semibold text-[var(--play-ink-soft)]',
  name: 'font-bold text-[var(--play-ink)]',
  decline:
    'shrink-0 text-xs font-bold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] disabled:opacity-50',
  join: 'flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--play-key)] text-[var(--play-on-art)] transition-transform hover:scale-105 disabled:opacity-50',
  joinIcon: 'size-5',
} as const

/**
 * Rail card of an invitation, dressed like the release note
 * @type {Record<string, string>}
 */

export const PLAY_INVITE_NOTICE = {
  link: 'w-full text-left disabled:opacity-60',
  name: 'font-bold',
} as const
