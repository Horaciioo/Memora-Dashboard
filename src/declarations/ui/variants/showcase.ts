// Soft reveal
const REVEAL = 'transition-all duration-500 ease-out motion-reduce:transition-none'

// Chat bubble
const BUBBLE = 'rounded-[var(--radius-lg)] px-3.5 py-2 text-sm'

/**
 * Release showcase classes
 * @type {Record<string, string>}
 */

export const SHOWCASE = {
  frame:
    'flex flex-col gap-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5',
  head: 'flex items-center justify-between gap-3',
  title: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  replay:
    'cursor-pointer rounded-full px-3 py-1 text-xs font-bold text-[var(--color-ink-accent)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  stage:
    'relative flex h-60 flex-col justify-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] p-4',
  caption: 'min-h-5 text-center text-sm font-semibold',
  dots: 'flex justify-center gap-1.5',
  dot: 'size-1.5 rounded-full bg-[var(--color-border-strong)] transition-colors',
  dotOn: 'bg-[var(--color-brand-600)]',
  reveal: REVEAL,
  hidden: 'translate-y-2 opacity-0',
  shown: 'translate-y-0 opacity-100',
  // Assistant scene
  userBubble: `${BUBBLE} self-end bg-[var(--color-brand-600)] text-[var(--color-on-brand)]`,
  memoraRow: 'flex items-start gap-2',
  brain: 'mt-1 size-6 shrink-0',
  memoraBubble: `${BUBBLE} flex flex-col gap-2 bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]`,
  chips: 'flex gap-2',
  chip: 'rounded-full border border-[var(--color-border-strong)] px-3 py-0.5 text-xs font-bold transition-colors duration-500',
  chipOn: 'border-transparent bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  card: 'flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm font-semibold shadow-[var(--shadow-sm)]',
  cardGlyph: 'size-5 shrink-0 text-[var(--color-ink-accent)]',
  cardTag: 'ml-auto flex items-center gap-1 text-xs font-bold text-[var(--color-success)]',
  tagGlyph: 'size-4',
  // Pages scene
  switchTrack:
    'relative grid w-44 grid-cols-2 self-center rounded-full bg-[var(--color-surface-raised)] p-1 text-xs font-bold shadow-[var(--shadow-sm)]',
  switchPill:
    'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[var(--color-brand-600)] transition-transform duration-500 ease-out motion-reduce:transition-none',
  switchPillPrivate: 'translate-x-full',
  switchLabel: 'relative z-10 px-3 py-1 text-center transition-colors duration-500',
  switchLabelOn: 'text-[var(--color-on-brand)]',
  page: 'flex flex-col gap-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-sm)]',
  pageHead: 'flex items-center gap-2 text-sm font-bold',
  pageGlyph: 'size-4 text-[var(--color-ink-subtle)]',
  lock: 'ml-auto size-4 text-[var(--color-ink-subtle)]',
  line: 'h-2 rounded-full bg-[var(--color-border)] transition-[width] duration-500 ease-out motion-reduce:transition-none',
  // Invite row
  people: 'relative flex items-center gap-3',
  invite:
    'rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs font-bold text-[var(--color-surface-raised)]',
  avatars: 'relative flex -space-x-2',
  avatar:
    'flex size-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-raised)] text-xs font-bold text-[var(--color-surface-raised)] transition-transform duration-300 ease-out motion-reduce:transition-none',
  avatarHidden: 'scale-0',
  avatarShown: 'scale-100',
  avatarTones: [
    'bg-[var(--color-brand-600)]',
    'bg-[var(--color-success)]',
    'bg-[var(--color-caution)]',
  ],
  invited: 'text-xs font-bold text-[var(--color-success)]',
  burst: 'pointer-events-none absolute top-1/2 left-14 size-0',
  spark: 'showcase-burst absolute -top-1 -left-1 size-2 rounded-full',
  sparkTones: [
    'bg-[var(--color-brand-600)]',
    'bg-[var(--color-success)]',
    'bg-[var(--color-caution)]',
  ],
} as const
