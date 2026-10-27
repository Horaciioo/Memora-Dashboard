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
 * Invitation popup of the home page, the game logo beside the sentence
 * @type {Record<string, string>}
 */

export const HOME_PLAY_INVITE = {
  anchor: 'fixed top-5 left-1/2 z-[75] w-[34rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2',
  card: `${CARD} gap-5 p-5`,
  logo: 'play-invite-logo size-24 shrink-0 max-sm:size-16',
  body: 'flex min-w-0 flex-1 flex-col gap-3',
  eyebrow: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  text: 'text-lg leading-snug font-semibold text-[var(--play-ink-soft)]',
  name: 'font-extrabold text-[var(--play-ink)]',
  inviter: 'mr-2 inline-flex items-center align-middle',
  actions: 'flex flex-wrap items-center gap-2',
} as const
