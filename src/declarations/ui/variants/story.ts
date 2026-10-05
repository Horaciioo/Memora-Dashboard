/**
 * Story deck styles: full-screen cards over the gradient
 * @type {Record<string, string>}
 */

export const STORY_DECK = {
  root: 'overlay-enter fixed inset-0 z-[55] flex flex-col items-center bg-[image:var(--gradient-frame)] px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]',
  // One segment per card, filled up to the open one
  progress: 'flex w-full max-w-md gap-1.5',
  segment: 'h-1 flex-1 rounded-full',
  segmentIdle: 'bg-[var(--color-ink)]/15',
  segmentDone: 'bg-[var(--color-ink)]',
  top: 'mt-3 flex w-full max-w-md justify-end',
  stage: 'relative flex min-h-0 w-full max-w-md flex-1 flex-col justify-center py-4',
  // Tap zones on the left and right thirds
  zone: 'absolute inset-y-0 z-10 w-1/3',
  zoneBack: 'left-0',
  zoneNext: 'right-0',
  card: 'course-erase-in relative flex flex-col gap-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 shadow-[var(--shadow-md)] sm:p-8',
  actions: 'flex w-full max-w-md flex-wrap items-center justify-between gap-2',
} as const
