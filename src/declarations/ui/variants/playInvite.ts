// Card surface shared by both popups
const CARD = 'play-invite play-invite-pop flex items-center rounded-[1.25rem]'

/**
 * Invitation bubble over the notifications bell
 * @type {Record<string, string>}
 */

export const PLAY_INVITE_CALL = {
  anchor: 'fixed z-[75] w-[22rem] max-w-[calc(100vw-1.5rem)]',
  card: `${CARD} gap-3.5 p-3.5`,
  tailBelow: 'play-invite-tail -bottom-2',
  tailAbove: 'play-invite-tail -top-2',
  logo: 'play-invite-logo size-14 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col gap-2.5',
  eyebrow: 'text-[0.7rem] font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  text: 'text-sm leading-snug font-semibold text-[var(--play-ink-soft)]',
  name: 'font-extrabold text-[var(--play-ink)]',
  actions: 'flex items-center gap-2',
} as const

/**
 * Invitation box of the home page, one line like the latest note
 * @type {Record<string, string>}
 */

export const HOME_PLAY_INVITE = {
  box: 'play-invite flex items-center gap-4 rounded-[var(--radius-lg)] px-4 py-3',
  logo: 'play-invite-logo size-10 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col',
  eyebrow: 'text-micro font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  text: 'truncate text-base leading-tight font-semibold text-[var(--play-ink-soft)]',
  name: 'font-extrabold text-[var(--play-ink)]',
  decline:
    'shrink-0 text-xs font-bold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] disabled:opacity-50',
  join: 'flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--play-key)] text-white transition-transform hover:scale-105 disabled:opacity-50',
  joinIcon: 'size-5',
} as const
