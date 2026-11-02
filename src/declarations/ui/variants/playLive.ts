// Glass of the Play boxes
const GLASS = 'play-glass rounded-3xl'

/**
 * Tables being played, in the hubs
 * @type {Record<string, string>}
 */

export const PLAY_LIVE = {
  box: `${GLASS} flex min-h-0 flex-col gap-3 p-4`,
  head: 'flex items-center gap-2 px-1',
  pulse: 'play-live-dot size-2.5 shrink-0 rounded-full bg-[var(--play-live)]',
  title: 'text-sm font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  list: 'flex min-h-0 flex-col gap-2 overflow-y-auto',
  empty: 'px-1 py-6 text-center text-sm italic text-[var(--play-ink-faint)]',
  card: 'flex flex-col gap-3 rounded-2xl bg-[var(--play-panel)] p-3 ring-1 ring-[var(--play-line)]',
  cardMine: 'ring-2 ring-[var(--play-key)]',
  top: 'flex items-center gap-3',
  logo: 'size-11 shrink-0',
  text: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  stage: 'text-xs font-bold text-[var(--play-ink-soft)]',
  stageLive: 'text-[var(--play-live)]',
  bottom: 'flex items-center justify-between gap-3',
  faces: 'flex items-center -space-x-2',
  face: 'ring-2 ring-[var(--play-panel-strong)]',
  more: 'grid size-7 place-items-center rounded-full bg-[var(--play-chip)] text-[0.65rem] font-extrabold text-[var(--play-ink)] ring-2 ring-[var(--play-panel-strong)]',
  count: 'ml-3 text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  actions: 'flex shrink-0 items-center gap-2',
} as const

/**
 * Launch vote of the games without a 3D course, tinted by the game key
 * @type {Record<string, string>}
 */

export const PLAY_VOTE = {
  root: 'bg-[radial-gradient(60rem_40rem_at_50%_-10%,color-mix(in_srgb,var(--play-key)_45%,transparent),transparent_70%),var(--play-night)]',
  title: 'text-white!',
  glyph: 'text-white!',
  main: 'bg-[var(--play-key)]!',
} as const

/**
 * Concept window of a game hub: a clip player, its steps, the golf powers
 * @type {Record<string, string>}
 */

export const PLAY_CONCEPT_UI = {
  root: 'flex flex-col gap-4',
  player:
    'flex flex-col overflow-hidden rounded-2xl bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)]',
  // Clip in the game colour, a 16:9 screen
  screen:
    'concept-screen relative aspect-video w-full overflow-hidden bg-[linear-gradient(135deg,var(--play-key),color-mix(in_srgb,var(--play-key)_55%,black))]',
  bar: 'flex items-center gap-3 bg-[rgb(0_0_0/0.75)] px-3 py-2',
  barPlay: 'size-3 shrink-0 bg-white [clip-path:polygon(0_0,100%_50%,0_100%)]',
  track: 'h-1.5 flex-1 overflow-hidden rounded-full bg-white/25',
  progress: 'concept-progress block h-full rounded-full bg-[var(--play-key)]',
  caption: 'flex flex-col gap-1 p-4',
  stepTitle: 'text-lg font-extrabold tracking-tight text-[var(--play-ink)]',
  stepText: 'text-sm text-[var(--play-ink-soft)]',
  steps: 'grid gap-2 sm:grid-cols-3',
  stepKey:
    'flex items-center gap-2 rounded-xl bg-[var(--play-chip)] px-3 py-2.5 text-left text-sm font-extrabold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)]',
  stepKeyOn: 'bg-[var(--play-key)] text-[var(--play-key-ink)] hover:text-[var(--play-key-ink)]',
  stepNumber:
    'grid size-6 shrink-0 place-items-center rounded-full bg-black/15 text-xs tabular-nums',
  powers: 'flex flex-col gap-3 pt-2',
  powersTitle: 'text-sm font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  powerGrid: 'grid gap-2 sm:grid-cols-2',
  power: 'flex gap-3 rounded-xl bg-[var(--play-panel-strong)] p-3 ring-1 ring-[var(--play-line)]',
  powerIcon: 'grid size-10 shrink-0 place-items-center rounded-xl text-white',
  bonus: 'bg-[var(--play-golf)]',
  malus: 'bg-[var(--play-bomb)]',
  glyph: 'size-5',
  powerText: 'flex min-w-0 flex-col gap-0.5',
  powerHead: 'flex items-baseline gap-2',
  powerName: 'text-sm font-extrabold text-[var(--play-ink)]',
  kindBonus: 'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-golf)] uppercase',
  kindMalus: 'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-bomb)] uppercase',
  powerEffect: 'text-xs leading-snug text-[var(--play-ink-soft)]',
} as const
