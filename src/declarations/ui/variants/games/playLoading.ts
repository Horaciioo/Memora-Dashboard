/**
 * Game loading screen: logo, caption and progress bar centred
 * @type {Record<string, string>}
 */

export const PLAY_LOADING_STYLES = {
  screen: 'grid min-h-[60dvh] w-full place-items-center px-6 text-[var(--play-ink)]',
  fill: 'absolute inset-0 min-h-0',
  cover: 'fixed inset-0 z-50 min-h-0 bg-[var(--play-panel-strong)]',
  box: 'flex w-full max-w-xs flex-col items-center gap-4 text-center',
  logo: 'size-20 animate-pulse object-contain',
  title: 'text-base font-extrabold tracking-wide',
  hint: 'text-xs font-bold text-[var(--play-ink-soft)]',
  track: 'h-2.5 w-full overflow-hidden rounded-full bg-[var(--play-chip)]',
  bar: 'h-full rounded-full bg-[var(--play-key)] transition-[width] duration-200 ease-out',
} as const

// Server busy card, bottom centre above the dock
export const PLAY_BUSY_STYLES = {
  card: 'play-busy-in pointer-events-none fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[var(--play-panel-strong)] py-2.5 pr-4 pl-3 text-[var(--play-ink)] shadow-lg',
  logo: 'play-busy-logo size-8 object-contain',
  label: 'text-sm font-extrabold',
  dots: 'inline-flex gap-0.5',
  dot: 'play-busy-dot',
} as const
