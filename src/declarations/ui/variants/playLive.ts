import type { VoteLook } from '@/declarations/ui/variants/golf'

// Glass of the Play boxes
const GLASS = 'play-glass rounded-3xl'

/**
 * Tables being played, in the hubs
 * @type {Record<string, string>}
 */

export const PLAY_LIVE = {
  box: `${GLASS} flex min-h-0 flex-col gap-4 p-5`,
  head: 'flex items-center gap-2 px-1',
  pulse: 'play-live-dot size-2.5 shrink-0 rounded-full bg-[var(--play-live)]',
  title: 'text-sm font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  list: 'flex min-h-0 flex-col gap-2 overflow-y-auto',
  empty: 'px-1 py-6 text-center text-sm italic text-[var(--play-ink-faint)]',
  card: 'flex flex-col gap-3.5 rounded-2xl bg-[var(--play-chip)] p-4 ring-1 ring-[var(--play-line)]',
  cardMine: 'ring-2 ring-[var(--play-key)]',
  top: 'flex items-center gap-3',
  logo: 'size-11 shrink-0',
  text: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  stage: 'text-xs font-bold text-[var(--play-ink-soft)]',
  stageLive: 'text-[var(--play-live)]',
  bottom: 'flex flex-col gap-3',
  faces: 'flex items-center -space-x-2',
  face: 'ring-2 ring-[var(--play-panel-strong)]',
  more: 'grid size-7 place-items-center rounded-full bg-[var(--play-chip)] text-[0.65rem] font-extrabold text-[var(--play-ink)] ring-2 ring-[var(--play-panel-strong)]',
  count: 'ml-3 whitespace-nowrap text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  actions: 'flex w-full items-center gap-2',
  action: 'h-11 w-full min-w-0 flex-1',
} as const

/**
 * Launch vote of the games without a 3D course: soft tiles, round keys, tinted by the game key
 * @type {VoteLook}
 */

export const PLAY_VOTE: VoteLook = {
  // Opaque full screen, the lobby never shows through
  root: 'fixed inset-0 z-[80] overflow-y-auto bg-[var(--play-night)] bg-[radial-gradient(60rem_40rem_at_50%_-10%,color-mix(in_srgb,var(--play-key)_45%,transparent),transparent_70%)] text-white select-none',
  stage:
    'relative z-10 flex min-h-dvh flex-col items-center justify-center gap-10 px-4 pt-4 pb-8 sm:gap-14',
  head: 'flex flex-col items-center gap-3',
  title: 'golf-vote-title text-center text-4xl font-black tracking-tight text-white sm:text-5xl',
  lead: 'golf-vote-title text-center text-base font-bold text-white/70 sm:text-lg',
  deck: 'relative flex w-full flex-col items-center py-2 [--vote-card:clamp(6rem,12vw,11rem)] [--vote-gap:clamp(1rem,3vw,3rem)]',
  band: 'hidden',
  row: 'relative flex flex-wrap items-start justify-center gap-x-[var(--vote-gap)] gap-y-6 px-4',
  card: 'golf-vote-card group/card relative flex w-[var(--vote-card)] flex-col items-center gap-3 outline-none',
  face: 'relative grid aspect-square w-full place-items-center overflow-hidden rounded-[2rem] bg-[color-mix(in_srgb,var(--play-key)_40%,var(--play-night))] shadow-[0_0.5rem_0_rgb(0_0_0/0.28)] transition-[filter,translate] duration-150 group-hover/card:-translate-y-1 group-hover/card:brightness-110 group-focus-visible/card:ring-4 group-focus-visible/card:ring-white group-data-[picked=true]/card:bg-[var(--play-key)]',
  faceOn: 'ring-4 ring-white',
  faceFramed: 'ring-4 ring-white',
  shot: 'size-full object-cover',
  glyph: 'size-[58%] text-white drop-shadow-[0_3px_0_rgb(0_0_0/0.25)]',
  number:
    'text-[calc(var(--vote-card)*0.52)] leading-none font-black text-white [text-shadow:0_4px_0_rgb(0_0_0/0.25)]',
  unit: 'absolute inset-x-0 bottom-[8%] text-center text-xs font-extrabold tracking-widest text-white/80 uppercase',
  label: 'text-center text-lg font-extrabold text-white sm:text-2xl',
  strip: 'w-full px-2 py-1 text-center text-sm font-extrabold text-white sm:text-base',
  avatarBox:
    'pointer-events-none absolute inset-x-0 bottom-full mb-2 flex flex-wrap items-end justify-center -space-x-1.5',
  avatarRing: 'shadow-[0_0.25rem_0_rgb(0_0_0/0.3)]',
  avatarName: 'absolute top-full mt-1 text-xs font-extrabold text-white/80',
  timer:
    'grid min-w-16 place-items-center rounded-full bg-white/12 px-5 py-2 text-3xl leading-none font-black tabular-nums text-white ring-1 ring-white/20',
  timerLow: 'animate-pulse',
  hint: 'golf-vote-title max-w-xl px-6 py-2 text-center text-base font-bold text-white/80',
  actions: 'flex flex-wrap items-center justify-center gap-3',
  button:
    'min-h-12 rounded-full bg-white/12 px-8 text-base font-extrabold text-white shadow-[0_0.25rem_0_rgb(0_0_0/0.3)] ring-1 ring-white/20 transition-[filter,translate] hover:-translate-y-0.5 hover:brightness-125 disabled:pointer-events-none disabled:opacity-50',
  buttonMain: 'bg-[var(--play-key)]!',
}

/**
 * Concept window of a game hub: its steps, the golf powers
 * @type {Record<string, string>}
 */

export const PLAY_CONCEPT_UI = {
  root: 'flex flex-col gap-4',
  list: 'flex flex-col gap-2',
  step: 'flex gap-3 rounded-2xl bg-[var(--play-panel-strong)] p-4 ring-1 ring-[var(--play-line)]',
  stepNumber:
    'grid size-8 shrink-0 place-items-center rounded-full bg-[var(--play-key)] text-sm font-extrabold text-[var(--play-key-ink)] tabular-nums',
  stepBody: 'flex min-w-0 flex-col gap-1',
  stepTitle: 'text-base font-extrabold tracking-tight text-[var(--play-ink)]',
  stepText: 'text-sm text-[var(--play-ink-soft)]',
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
