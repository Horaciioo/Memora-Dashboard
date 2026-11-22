/**
 * Launcher home: hero, shelf, library, detail
 * @type {Record<string, string>}
 */

export const PLAY_LAUNCH = {
  root: 'mx-auto flex w-full max-w-[84rem] flex-col gap-6 md:gap-10',
  // Hero, one game at a time over the full frame
  hero: 'group/hero relative isolate h-[min(28rem,58dvh)] overflow-hidden rounded-3xl bg-play-shade shadow-[0_1.5rem_3rem_var(--play-drop)] md:h-[27rem] 2xl:h-[31rem]',
  slide:
    'absolute inset-0 flex items-end transition-opacity duration-700 motion-reduce:transition-none',
  slideOff: 'pointer-events-none opacity-0',
  art: 'play-hero-drift -z-20 h-full w-full',
  shadeSide:
    'absolute inset-0 -z-10 bg-linear-to-r from-[var(--play-night)] from-5% via-[var(--play-night)]/60 via-40% to-transparent',
  shadeBottom:
    'absolute inset-0 -z-10 bg-linear-to-t from-[var(--play-night)] from-10% via-[var(--play-night)]/40 via-55% to-transparent md:from-[var(--play-night)]/90 md:from-0% md:via-transparent md:via-45%',
  body: 'relative flex w-full flex-col items-start gap-3 px-5 pb-6 text-[var(--play-on-art)] md:max-w-[34rem] md:gap-4 md:px-0 md:pb-12 md:pl-12',
  brand: 'flex items-center gap-3',
  logo: 'size-11 shrink-0 md:size-14',
  kicker: 'text-xs font-extrabold tracking-wide text-[var(--game)] uppercase',
  // Featured mark above the game, the boost as a solid key
  vedette: 'flex items-center gap-2.5',
  vedetteTag:
    'inline-flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-[var(--play-on-art)] uppercase',
  vedetteIcon: 'size-4 text-[var(--game)]',
  vedetteBoost:
    'rounded-lg bg-[var(--game)] px-2.5 py-1 text-xs font-extrabold text-[var(--play-night)] tabular-nums',
  name: 'text-4xl leading-none font-extrabold tracking-tight uppercase md:text-6xl 2xl:text-7xl',
  tagline:
    'line-clamp-2 max-w-[28rem] text-sm leading-snug font-semibold text-[var(--play-on-art)]/85 md:line-clamp-none md:text-lg',
  actions: 'mt-1 grid w-full grid-cols-2 gap-3 md:flex md:w-auto md:items-center md:gap-4',
  play: 'inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--game)] px-4 py-3.5 text-base font-extrabold text-[var(--play-night)] shadow-[0_0.3rem_0_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)] md:px-9 md:py-4 md:text-lg',
  playIcon: 'size-5',
  ghost:
    'inline-flex items-center justify-center rounded-2xl bg-white/15 px-4 py-3.5 text-base font-bold text-[var(--play-on-art)] backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)] md:px-6 md:py-4',
  waiting: 'col-span-2 flex items-center gap-3 text-sm font-bold text-[var(--play-on-art)]/85',
  poster:
    'play-hero-poster absolute top-[12%] right-24 hidden aspect-[3/4] w-60 overflow-hidden rounded-3xl ring-[0.3rem] ring-white/70 shadow-[0_2rem_4rem_rgb(0_0_0/0.55)] md:block 2xl:w-72',
  // Strip of the featured games, the open one fills its bar
  strip:
    'z-10 -mt-3 flex justify-center gap-2 md:absolute md:top-1/2 md:right-6 md:mt-0 md:-translate-y-1/2 md:flex-col',
  thumb:
    'group/thumb relative size-9 shrink-0 overflow-hidden rounded-lg opacity-60 ring-2 ring-transparent transition hover:opacity-90 focus-visible:outline-3 focus-visible:outline-[var(--play-key)] md:size-10',
  thumbOn: 'opacity-100 ring-white/80',
  thumbArt: 'absolute inset-0',
  bar: 'absolute inset-x-0 bottom-0 h-1 bg-white/10',
  barFill: 'play-hero-bar h-full origin-left bg-[var(--game)]',
  // Message of the admins above the games
  announce:
    'mx-auto w-full max-w-[84rem] rounded-2xl bg-play-nest px-4 py-3 text-sm font-bold text-[var(--play-ink)] md:px-5',
  // Shelf and library
  section: 'flex flex-col gap-3 md:gap-4',
  head: 'flex flex-wrap items-center justify-between gap-3',
  title: 'text-lg font-extrabold tracking-tight text-[var(--play-ink)] md:text-xl',
  resume: 'flex flex-wrap gap-3',
  resumeCard:
    'group/resume flex min-w-56 items-center gap-3 rounded-2xl bg-play-shade p-2.5 pr-5 text-left ring-1 ring-[var(--play-line)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-play-nest focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  resumeLogo: 'size-11 shrink-0',
  resumeName: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  resumeNote: 'truncate text-xs text-[var(--play-ink-faint)]',
  tools: 'flex flex-wrap items-center gap-3',
  field:
    'h-11 w-60 rounded-xl bg-play-nest px-4 text-sm text-[var(--play-ink)] placeholder:text-[var(--play-ink-faint)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  chips: 'flex items-center gap-1 rounded-xl bg-play-nest p-1',
  chip: 'h-9 rounded-lg px-4 text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  chipOn: 'bg-play-lift text-[var(--play-ink)]',
  tiles: 'grid grid-cols-2 gap-3 md:gap-5 @3xl:grid-cols-3 @6xl:grid-cols-4',
  stage: '@container flex min-w-0 flex-col gap-6 md:gap-10',
  empty: 'rounded-2xl bg-play-shade px-6 py-12 text-center text-sm text-[var(--play-ink-faint)]',
  // Tile, tall enough to show the poster
  tile: 'group relative isolate aspect-[16/10] min-w-0 overflow-hidden rounded-2xl bg-play-shade ring-1 ring-[var(--play-line)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_1.4rem_2.6rem_var(--play-drop)] [perspective:60rem]',
  tileArt: '-z-10 transition-transform duration-700 ease-out group-hover:scale-110',
  tileShade:
    'absolute inset-0 -z-10 bg-linear-to-t from-[var(--color-media-shade)]/90 via-[var(--color-media-shade)]/20 via-55% to-transparent',
  tileGlow:
    'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,var(--game),transparent_60%)] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-70',
  tileText: 'absolute inset-x-0 bottom-0 flex min-w-0 flex-col px-3 pb-2.5 md:px-4 md:pb-3.5',
  tileName:
    'truncate text-base leading-tight font-extrabold tracking-tight text-[var(--play-on-art)] md:text-xl',
  tileNote: 'truncate text-xs text-[var(--play-on-art)]/70',
  tileTags: 'absolute top-2 left-2 flex flex-col items-start gap-1.5 md:top-3 md:left-3',
  tileTag:
    'rounded-md bg-[var(--game)] px-2 py-1 text-micro font-extrabold tracking-wide text-[var(--play-night)] uppercase',
  tileVedette:
    'inline-flex items-center gap-1 rounded-md bg-[var(--play-night)]/70 px-2 py-1 text-micro font-extrabold tracking-wide text-[var(--play-on-art)] uppercase backdrop-blur-sm',
  tileVedetteIcon: 'size-3 text-[var(--game)]',
  tileFaces:
    'absolute right-3 bottom-3.5 hidden items-center -space-x-2 transition-opacity group-hover:opacity-0 md:flex',
  tileOpen:
    'absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
  tileStar:
    'absolute top-1.5 right-1.5 z-20 grid size-9 place-items-center rounded-full bg-[var(--play-night)]/50 text-[var(--play-on-art)] backdrop-blur-sm transition-[opacity,color] hover:text-[var(--play-gold)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--play-key)] md:top-2.5 md:right-2.5 md:opacity-0 md:group-hover:opacity-100',
  tileStarOn: 'text-[var(--play-gold)] md:opacity-100',
  tileStarIcon: 'size-5',
  tilePlay:
    'absolute right-3 bottom-3 z-20 hidden translate-y-2 items-center gap-1.5 rounded-xl bg-[var(--game)] px-4 py-2 text-sm font-extrabold text-[var(--play-night)] opacity-0 shadow-[0_0.5rem_1.2rem_var(--play-drop)] transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--play-key)] md:inline-flex',
  tilePlayIcon: 'size-4',
  // Detail panel flush to the right edge
  veil: 'fixed inset-0 z-50 bg-play-veil backdrop-blur-[2px]',
  panel:
    'play-launch-sheet md:play-launch-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-3xl bg-[var(--play-night)] pb-[env(safe-area-inset-bottom)] text-[var(--play-ink)] shadow-[0_-1.5rem_3rem_var(--play-drop)] md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[30rem] md:max-w-full md:rounded-none md:rounded-l-3xl md:pb-0 md:shadow-[-1.5rem_0_3rem_var(--play-drop)]',
  panelArt: 'relative aspect-[16/9] shrink-0 overflow-hidden',
  panelShade:
    'absolute inset-0 bg-linear-to-t from-[var(--play-night)] via-transparent to-transparent',
  panelClose:
    'absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-[var(--play-night)]/55 text-[var(--play-on-art)] backdrop-blur-sm transition-colors hover:bg-[var(--play-night)]/80 focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  panelCloseIcon: 'size-5',
  panelBody: 'flex flex-1 flex-col gap-5 px-5 pb-5 md:gap-6 md:px-7 md:pb-7',
  panelHead: 'relative -mt-10 flex items-end gap-4',
  panelLogo: 'size-16 shrink-0 md:size-20',
  panelName: 'text-2xl leading-none font-extrabold tracking-tight md:text-3xl',
  panelSeats: 'mt-1.5 text-sm font-bold tabular-nums text-[var(--game)]',
  panelText: 'text-base leading-snug text-[var(--play-ink-soft)]',
  panelSection: 'flex flex-col gap-3',
  panelTitle: 'text-micro font-extrabold tracking-wide text-[var(--play-ink-faint)] uppercase',
  panelSteps: 'flex flex-col gap-2',
  panelStep:
    'rounded-xl bg-play-nest px-4 py-3 text-sm leading-snug text-[var(--play-ink-soft)] [&>strong]:block [&>strong]:text-[var(--play-ink)]',
  panelTables: 'flex flex-col gap-2',
  panelTable: 'flex items-center gap-3 rounded-xl bg-play-nest px-4 py-3',
  panelTableText: 'flex min-w-0 flex-1 flex-col',
  panelTableHost: 'truncate text-sm font-bold',
  panelTableNote: 'text-xs text-[var(--play-ink-faint)]',
  panelFaces: 'flex items-center -space-x-2',
  panelEmpty: 'text-sm text-[var(--play-ink-faint)] italic',
  panelFoot:
    'sticky bottom-0 -mx-5 mt-auto flex flex-col gap-2 bg-[var(--play-night)] px-5 pt-3 md:static md:mx-0 md:flex-row md:items-center md:gap-3 md:bg-transparent md:px-0 md:pt-0',
  panelPlay:
    'inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--game)] text-lg font-extrabold text-[var(--play-night)] shadow-[0_0.3rem_0_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)] md:w-auto md:flex-1',
  panelStar:
    'flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-play-nest text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:bg-play-lift hover:text-[var(--play-gold)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)] md:size-14 md:w-auto',
  panelStarOn: 'text-[var(--play-gold)]',
  // Word beside the star on a phone, the desktop key stays square
  panelStarLabel: 'md:sr-only',
} as const
