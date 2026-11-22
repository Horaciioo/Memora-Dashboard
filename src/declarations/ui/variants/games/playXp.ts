const BLOCK = 'play-hud-block'

/**
 * End of game XP screen: skinned panel, two ladders, boxes of XP earned
 * @type {Record<string, string>}
 */

export const PLAY_XP = {
  ladder: 'flex w-full flex-col gap-1.5',
  caption:
    'text-[0.7rem] leading-none font-black tracking-widest text-[var(--play-ink-faint)] uppercase',
  row: 'flex w-full items-center gap-2.5',
  badge:
    'grid size-8 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-sm leading-none font-black text-[var(--play-ink)] tabular-nums',
  badgeUp: 'play-xp-level text-[var(--play-accent)]',
  track: 'relative h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--play-chip)]',
  fill: 'absolute inset-y-0 left-0 rounded-full bg-[var(--play-accent)] ease-out motion-reduce:transition-none',
  fillFire: 'play-xp-fire',
  boost: 'play-xp-boost text-xs leading-none font-black tabular-nums',
  ticks:
    'pointer-events-none absolute inset-0 [background:repeating-linear-gradient(90deg,transparent_0,transparent_calc(10%-2px),var(--play-panel-strong)_calc(10%-2px),var(--play-panel-strong)_10%)]',
  foot: 'flex w-full items-baseline justify-between gap-3',
  gain: 'text-base leading-none font-black text-[var(--play-ink)] tabular-nums',
  progress: 'text-xs leading-none font-semibold text-[var(--play-ink-faint)] tabular-nums',
  boxLabel:
    'text-[0.6rem] leading-tight font-black tracking-widest text-[var(--play-ink-faint)] uppercase',
  boxValue: 'text-lg leading-none font-black text-[var(--play-ink-soft)] tabular-nums',
  boxCut: 'text-[var(--play-ink-faint)]',
} as const

/**
 * End of game page: result beside a column of cards in the game skin
 * @type {Record<string, string>}
 */

export const PLAY_END_PAGE = {
  root: 'relative flex min-h-0 flex-1 flex-col',
  backdrop: 'pointer-events-none absolute inset-0 z-0 overflow-hidden',
  rays: 'play-end-rays absolute top-[-60%] left-1/2 size-[220vmax] -translate-x-1/2',
  halo: 'play-end-halo absolute inset-0',
  vignette:
    'absolute inset-0 [background:radial-gradient(ellipse_at_50%_45%,transparent_45%,color-mix(in_srgb,var(--play-night)_45%,transparent)_100%)]',
  header:
    'play-end-in relative z-10 flex items-center justify-center gap-3 pt-[clamp(0.75rem,2.5dvh,1.5rem)] pb-1',
  logo: 'size-[clamp(2.5rem,6dvh,3.5rem)] shrink-0',
  headText: 'flex flex-col gap-1',
  headGame:
    'text-xs leading-none font-black tracking-[0.3em] text-[var(--end-tone)] uppercase brightness-125',
  title:
    'flex text-[clamp(1.5rem,5dvh,2.6rem)] leading-none font-black tracking-wide text-[var(--play-ink)] uppercase italic',
  letter: 'play-end-letter inline-block',
  body: 'relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 md:grid md:grid-cols-[minmax(0,min(20rem,22vw))_minmax(0,1fr)_minmax(0,min(20rem,22vw))] md:gap-4 md:overflow-hidden md:px-5',
  result: 'play-end-in flex min-h-0 min-w-0 flex-1 flex-col',
  me: `${BLOCK} play-end-slide flex flex-col gap-[clamp(0.5rem,1.6dvh,0.9rem)] px-4 py-[clamp(0.8rem,2.2dvh,1.25rem)] md:self-center`,
  rail: 'flex min-h-0 flex-col gap-3 md:self-start',
  facts: `${BLOCK} play-end-slide-right flex flex-col gap-3 px-4 py-3.5`,
  kicker:
    'text-[0.65rem] leading-none font-black tracking-widest text-[var(--play-ink-faint)] uppercase',
  placeRow: 'flex items-center gap-3',
  rankBadge:
    'grid size-14 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-2xl leading-none font-black text-[var(--play-ink)] tabular-nums',
  placeText: 'flex flex-col gap-1.5',
  place:
    'flex items-baseline gap-2 text-[clamp(1.75rem,5.5dvh,2.75rem)] leading-none font-black text-[var(--play-ink)] tabular-nums',
  placeOf: 'text-sm font-bold text-[var(--play-ink-faint)]',
  xpRow:
    'flex items-center gap-3 border-t border-[var(--play-line)] pt-[clamp(0.5rem,1.6dvh,0.9rem)]',
  xpHero: 'flex min-w-0 flex-col gap-1.5',
  xpProgress: 'text-xs leading-none font-semibold text-[var(--play-ink-faint)] tabular-nums',
  xpFigure:
    'play-end-beat inline-block origin-left text-[clamp(1.5rem,4dvh,2.25rem)] leading-none whitespace-nowrap font-black text-[var(--play-accent)] tabular-nums',
  levelUp:
    'play-end-rise w-fit rounded-full bg-[var(--play-accent)] px-3 py-1 text-xs leading-none font-black text-[var(--play-panel-strong)] uppercase',
  ring: 'relative grid size-[clamp(5.5rem,15dvh,7.5rem)] shrink-0 place-items-center',
  ringSvg: 'absolute inset-0 size-full -rotate-90',
  ringTrack: 'stroke-[var(--play-chip)]',
  ringFill: 'stroke-[var(--play-accent)] ease-out motion-reduce:transition-none',
  ringLevel:
    'relative text-[clamp(1.75rem,5dvh,2.5rem)] leading-none font-black text-[var(--play-ink)] tabular-nums',
  ringCaption:
    'absolute bottom-[14%] text-[0.5rem] leading-none font-black tracking-widest text-[var(--play-ink-faint)] uppercase',
  tickets: 'flex flex-wrap gap-2',
  ticket:
    'play-end-ticket flex min-w-[6.5rem] flex-1 flex-col gap-1 bg-[var(--play-chip)] px-3.5 py-2',
  career:
    'grid grid-cols-4 gap-1.5 border-t border-[var(--play-line)] pt-[clamp(0.5rem,1.6dvh,0.9rem)]',
  careerCell: 'play-end-rise flex flex-col items-center gap-1 text-center',
  careerValue: 'text-lg leading-none font-black text-[var(--play-ink)] tabular-nums',
  awards: 'flex flex-col gap-2',
  award:
    'play-end-pop play-end-shine relative flex items-center gap-3 overflow-hidden rounded-2xl bg-[var(--play-chip)] py-2 pr-3 pl-2.5',
  awardMine: 'bg-[color-mix(in_srgb,var(--play-accent)_32%,var(--play-chip))]',
  awardText: 'flex min-w-0 flex-1 flex-col gap-1',
  awardLabel:
    'truncate text-[0.6rem] leading-none font-black tracking-widest text-[var(--play-ink-faint)] uppercase',
  awardName: 'truncate text-sm leading-none font-extrabold text-[var(--play-ink)]',
  // Trophy unlocked as the game ended, lit in its rarity
  trophy:
    'play-end-pop play-end-shine relative flex items-center gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rarity)_38%,var(--play-chip)),var(--play-chip)_85%)] py-2 pr-3 pl-2.5 ring-2 ring-[var(--rarity)]/70',
  trophyIcon:
    'relative grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--rarity)] text-[var(--play-night)] shadow-[inset_0_-0.2rem_0_rgb(0_0_0/0.16)]',
  trophyGlyph: 'size-7',
  trophyLevels: 'text-sm leading-none font-black text-[var(--rarity)] tabular-nums',
  awardValue: 'text-2xl leading-none font-black text-[var(--play-accent)] tabular-nums',
  intro:
    'play-end-intro pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-[clamp(1rem,4dvh,2rem)] bg-[radial-gradient(ellipse_at_50%_50%,color-mix(in_srgb,var(--end-tone)_35%,color-mix(in_srgb,var(--play-night)_92%,transparent)),color-mix(in_srgb,var(--play-night)_97%,transparent))]',
  finale: 'play-finale pointer-events-none absolute inset-0 overflow-hidden',
  introTitle:
    'play-end-slam text-[clamp(2.5rem,11dvh,6rem)] leading-none font-black tracking-wide text-[var(--play-ink)] uppercase italic',
  introWinner: 'play-end-winner flex flex-col items-center gap-2',
  introName: 'text-[clamp(1.75rem,7dvh,3.5rem)] leading-none font-black text-[var(--play-ink)]',
  introSub:
    'text-sm leading-none font-black tracking-[0.35em] text-[var(--end-tone)] uppercase brightness-150',
  tiles: 'grid grid-cols-2 gap-2',
  tile: 'play-end-pop flex flex-col gap-1.5 rounded-2xl bg-[var(--play-chip)] px-3 py-2.5',
  tileValue:
    'text-[clamp(1.25rem,3.6dvh,1.9rem)] leading-none font-black text-[var(--play-ink)] tabular-nums',
  tileLabel:
    'text-[0.6rem] leading-tight font-black tracking-widest text-[var(--play-ink-faint)] uppercase',
} as const
