/**
 * Game setup sheet, a lobby in the colour of the game
 * @type {Record<string, string>}
 */

export const PLAY_SETUP = {
  panel: 'play-setup',
  // Scene of the game fading into the sheet
  hero: 'relative flex shrink-0 flex-col justify-end overflow-hidden px-6 pt-14 pb-5',
  art: 'play-art play-setup-art pointer-events-none absolute inset-0 size-full',
  head: 'relative flex items-end gap-4',
  logo: 'size-20 shrink-0 drop-shadow-[0_0.5rem_0.7rem_rgb(0_0_0/0.5)]',
  titles: 'flex min-w-0 max-w-[72%] flex-col gap-0.5 pb-1',
  eyebrow: 'text-micro font-bold tracking-widest text-[var(--play-key)] uppercase',
  title: 'truncate text-2xl leading-tight font-extrabold text-white',
  note: 'line-clamp-2 text-sm font-medium text-balance text-[var(--color-ink-subtle)]',
  close: 'absolute top-3 right-3 z-10 bg-black/40! text-white! hover:bg-black/60!',
  // Rule cards, one per setting
  card: 'flex min-w-0 flex-col gap-3 rounded-2xl bg-white/[0.045] p-4 ring-1 ring-white/10',
  footer: 'grid auto-cols-fr grid-flow-col items-center gap-2 sm:flex',
  footerGap: 'hidden sm:block sm:flex-1',
  cancel: 'shrink-0',
  main: 'min-w-0 justify-center whitespace-nowrap sm:flex-1',
} as const
