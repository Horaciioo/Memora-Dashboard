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
