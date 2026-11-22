/**
 * Quest box of a group: progress, each member's feats, the choice of the next one
 * @type {Record<string, string>}
 */

export const PLAY_GROUP_QUEST = {
  card: 'flex flex-col gap-3 rounded-2xl bg-play-lift p-3',
  name: 'text-base font-extrabold text-[var(--play-ink)]',
  hint: 'text-sm text-[var(--play-ink-soft)]',
  barRow: 'flex items-center gap-3',
  bar: 'h-2 flex-1 overflow-hidden rounded-full bg-play-nest',
  barFill: 'h-full rounded-full bg-[var(--play-key)] transition-[width] duration-500',
  count: 'text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  reward: 'text-xs font-extrabold text-[var(--play-gold-ink)]',
  feats: 'flex flex-col gap-1.5',
  feat: 'flex items-center gap-2 text-sm font-bold text-[var(--play-ink)]',
  featName: 'min-w-0 flex-1 truncate',
  featCount: 'text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  note: 'px-1 text-xs italic text-[var(--play-ink-faint)]',
  pick: 'flex flex-col divide-y divide-[var(--play-line)]',
  option: 'flex items-center gap-3 px-2 py-2.5',
  optionText: 'flex min-w-0 flex-1 flex-col',
  optionName: 'text-sm font-extrabold text-[var(--play-ink)]',
  optionXp: 'text-xs font-bold text-[var(--play-gold-ink)]',
} as const

/**
 * System card in the group chat once a quest is done
 * @type {Record<string, string>}
 */

export const PLAY_GROUP_CHEER = {
  card: 'quest-cheer mx-auto my-3 flex w-full max-w-md flex-col gap-1 rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,#ff9100_30%,var(--play-panel-strong)),var(--play-panel-strong)_80%)] px-4 py-3 text-center shadow-[var(--shadow-sm)]',
  from: 'text-micro font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  title: 'text-base font-black text-[var(--play-ink)]',
  body: 'text-sm font-bold text-[var(--play-ink-soft)]',
} as const
