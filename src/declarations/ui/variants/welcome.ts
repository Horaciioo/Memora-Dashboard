/**
 * What the public welcome adds to the tour's chat: the identity embed and the seal
 * @type {Record<string, string>}
 */

export const WELCOME_STYLES = {
  // An embed in the thread, like the ones asking a field
  identity:
    'flex w-full items-center gap-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-sm)] sm:w-auto sm:min-w-72',
  identityName: 'text-body font-bold',
  identityHandle: 'font-[family-name:var(--font-mono)] text-caption text-[var(--color-ink-subtle)]',
  // The confirmation takes the whole window
  seal: 'flex h-full flex-col items-center justify-center gap-6 px-6 text-center',
  sealRing:
    'seal-ring flex size-28 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-[var(--color-on-brand)] shadow-[var(--shadow-md)]',
  sealCheck: 'size-14',
  sealText: 'seal-text flex flex-col gap-1',
  sealTitle: 'text-page font-bold tracking-tight',
  sealSub: 'text-body text-[var(--color-ink-subtle)]',
} as const
