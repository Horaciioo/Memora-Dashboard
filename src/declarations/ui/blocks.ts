/**
 * Floating hint layer and bubble classes
 * @type {Record<string, string>}
 */

export const FLOATING_HINT = {
  layer: 'pointer-events-none fixed inset-0 z-50',
  bubble:
    'floating-hint-bubble pointer-events-none absolute flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs shadow-lg',
  icon: 'h-3.5 w-3.5',
} as const
