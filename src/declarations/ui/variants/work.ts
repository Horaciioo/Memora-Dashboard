/**
 * Bubble beside a rail entry holding a late item
 * @type {Record<string, string>}
 */

export const DEADLINE_BUBBLE = {
  // Pill beside the entry, one shadow over pill and tip
  root: 'rail-reset nudge-enter fixed z-[60] -translate-y-1/2 cursor-pointer rounded-full bg-[var(--color-surface-raised)] px-4 py-1 text-left text-caption font-semibold whitespace-nowrap text-[var(--color-ink)] [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.3))_drop-shadow(0_0.5rem_1rem_rgb(0_0_0/0.14))] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  tail: 'pointer-events-none absolute top-1/2 -left-[0.5625rem] h-[1.125rem] w-3 -translate-y-1/2 text-[var(--color-surface-raised)]',
} as const
