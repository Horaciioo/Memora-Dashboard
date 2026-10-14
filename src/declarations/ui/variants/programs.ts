import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Bare rows of the academy and the recruitments
 * @type {Record<string, string>}
 */

export const ROW_LIST = {
  root: 'flex flex-col gap-10',
  group: 'flex flex-col',
  // Colour only says the state
  groupTitle: `accent-text px-2 pb-2 ${PROPERTY_LABEL}`,
  row: 'group flex min-h-14 w-full cursor-pointer items-center gap-3 border-b border-[var(--color-border)] px-2 py-2 text-left transition-colors first:border-t hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  muted: 'opacity-60',
  glyph: 'size-6 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col',
  title: 'truncate font-semibold',
  // Second line on a phone, the right edge beyond
  meta: 'truncate text-sm text-[var(--color-ink-subtle)]',
  trail: 'flex shrink-0 items-center gap-3 text-sm text-[var(--color-ink-subtle)]',
  arrow:
    'hidden size-4 shrink-0 -translate-x-1 text-[var(--color-ink-subtle)] opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100 md:block',
} as const
