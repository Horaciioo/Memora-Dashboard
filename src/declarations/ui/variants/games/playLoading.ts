/**
 * Game loading screen: logo, caption and progress bar centred
 * @type {Record<string, string>}
 */

export const PLAY_LOADING_STYLES = {
  screen: 'play-loading-screen fixed inset-0 z-50 text-white',
  fill: 'absolute! z-10',
  // The chat column on the right stays reachable
  beside: 'lg:right-[var(--play-side-open)]',
  // Squares: they are the ground of the screen
  curtain:
    'play-curtain absolute inset-0 grid auto-rows-fr [&>span]:bg-[color-mix(in_srgb,var(--play-loading-square)_60%,white)] [&>span[data-salve="1"]]:bg-[var(--play-loading-square)]',
  squareIn: 'play-square-in',
  squareOn: '',
  squareOut: 'play-square-out',
  content:
    'play-loading-content relative flex h-full flex-col items-center justify-between overflow-hidden px-6 pt-10 pb-24 md:py-10',
  contentOut: 'play-loading-content-out',
  glow: 'play-loading-glow pointer-events-none absolute -top-1/4 left-1/2 size-[70vmax] -translate-x-1/2 rounded-full opacity-40 blur-3xl',
  brand: 'relative flex items-center gap-2 self-start text-sm font-extrabold tracking-wide',
  brandLogo: 'size-7 object-contain',
  stage:
    'relative flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-5 text-center',
  logo: 'play-loading-logo size-32 text-5xl sm:size-40',
  mystery: 'play-busy-logo size-28 object-contain sm:size-36',
  name: 'text-4xl font-black tracking-tight sm:text-5xl',
  footer: 'relative flex w-full max-w-md flex-col items-center gap-4',
  memora: 'play-busy-logo size-10 object-contain',
  meter: 'flex w-full items-center gap-3',
  track: 'h-3 flex-1 overflow-hidden rounded-full bg-white/20',
  bar: 'h-full rounded-full bg-white transition-[width] duration-200 ease-out',
  percent: 'w-12 text-right text-sm font-extrabold tabular-nums',
  tip: 'play-loading-step min-h-10 max-w-sm text-center text-sm font-bold text-balance text-white/80',
} as const
