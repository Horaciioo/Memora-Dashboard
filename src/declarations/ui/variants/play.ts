import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Play blocks of a moderator file
 * @type {Record<string, string>}
 */

export const PLAY_MEMBER = {
  stack: 'flex flex-col gap-6',
  // One line per game
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:grid-cols-[1fr_7rem_7rem_9rem]',
  game: 'font-semibold text-[var(--color-ink)]',
  global: `px-4 pt-4 pb-1 ${PROPERTY_LABEL}`,
  figure: 'tabular-nums text-[var(--color-ink)]',
  muted: 'tabular-nums text-xs text-[var(--color-ink-subtle)] sm:text-sm',
  empty: 'px-4 py-3 text-sm italic text-[var(--color-ink-subtle)]',
} as const
