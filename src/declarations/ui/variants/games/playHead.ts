import { PANEL } from '@/declarations/ui/variants/games/play/shared'

/**
 * Page frames of Play: two widths, always centred
 * @type {Record<string, string>}
 */

export const PLAY_PAGE = {
  // Data pages: stats, trophies, settings, profile, admin
  frame: 'mx-auto flex w-full max-w-6xl flex-col gap-8',
  // One column: ranking, feed, live, history, groups
  reading: 'mx-auto flex w-full max-w-3xl flex-col gap-6',
  // Panels side by side, stacked when narrow
  grid: 'grid items-stretch gap-6 lg:grid-cols-2',
  cell: 'min-w-0',
  cellWide: 'min-w-0 lg:col-span-2',
} as const

/**
 * Page title and showcase panels of Play
 * @type {Record<string, string>}
 */

export const PLAY_HEAD = {
  root: 'flex w-full flex-col gap-5',
  top: 'flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-1',
  text: 'flex min-w-0 flex-col gap-1',
  title: 'text-3xl font-bold tracking-tight text-[var(--play-ink)] sm:text-4xl',
  note: 'text-sm text-[var(--play-ink-soft)]',
  aside: 'flex shrink-0 items-center gap-6',
  // Figure of the title row, value over a small label
  fig: 'flex flex-col items-end leading-tight',
  figValue: 'text-2xl font-bold tabular-nums text-[var(--play-ink)]',
  figLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  body: 'flex flex-col gap-4',
  // Panel: a title, then groups on nested cards
  panel: `${PANEL} flex h-full w-full flex-col gap-1.5 p-1.5 shadow-[var(--shadow-sm)]`,
  panelBar: 'flex items-center justify-between gap-3 px-3.5 pt-2.5 pb-1',
  panelLink:
    'text-xs font-bold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  panelTitle: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  // Body made of groups already
  panelBody: 'flex flex-1 flex-col gap-1.5',
  // Free-form body, held in one group
  panelGroup: 'flex flex-1 flex-col gap-4 rounded-[var(--radius-lg)] bg-play-nest p-4 sm:p-5',
} as const

/**
 * Trophy showcase, rarity and platinum
 * @type {Record<string, string>}
 */

export const PLAY_SHOWCASE = {
  grid: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-1.5',
  card: 'group relative flex items-center gap-3 rounded-[var(--radius-lg)] bg-play-nest p-3 transition-colors hover:bg-play-lift',
  // Won: filled with the rarity colour, no outline
  cardOn:
    'bg-[color-mix(in_srgb,var(--rarity)_70%,transparent)]! hover:bg-[color-mix(in_srgb,var(--rarity)_80%,transparent)]!',
  // Won: rarity word turns white to stay readable on the fill
  tierOn: 'text-[var(--play-ink)]!',
  // Completed legendary: richer gold fill, sweep of light, glowing glyph
  cardLegend:
    'trophy-legend bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rarity)_75%,transparent),color-mix(in_srgb,var(--rarity)_45%,transparent))] shadow-[0_0_1.5rem_-0.4rem_var(--rarity)]',
  glyphLegend: 'drop-shadow-[0_0_0.4rem_var(--rarity)]',
  cardIdle: 'opacity-55',
  icon: 'relative grid size-14 shrink-0 place-items-center rounded-xl bg-play-lift text-[var(--play-ink-faint)]',
  // Won: dark box, glyph in the rarity colour
  iconOn: 'bg-[color-mix(in_srgb,var(--play-night)_55%,transparent)]! text-[var(--rarity)]',
  // Won: text turns white on the full rarity fill
  nameOn: 'text-white',
  goalOn: 'text-white/85',
  wonRowOn: 'border-white/30 text-white/85',
  glyph: 'size-7',
  // Check seal on a won glyph, lock on a hidden one
  seal: 'absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full bg-[var(--play-ink)] text-[var(--play-night)] ring-2 ring-[var(--play-nest)]',
  sealGlyph: 'size-3',
  tierLine:
    'flex flex-wrap items-center gap-x-1.5 text-[0.65rem] leading-none font-black tracking-widest text-[var(--rarity)] uppercase',
  wonLine: 'text-xs tabular-nums text-[var(--play-ink-soft)]',
  wonRow:
    'mt-1 border-t border-[var(--play-line)] pt-2 text-xs tabular-nums text-[var(--play-ink-soft)]',
  progress: 'flex items-center gap-2',
  progressValue:
    'shrink-0 text-[0.65rem] leading-none font-bold tabular-nums text-[var(--play-ink-faint)]',
  text: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'line-clamp-2 text-sm leading-snug font-bold text-[var(--play-ink)]',
  goal: 'line-clamp-2 text-xs leading-snug text-[var(--play-ink-soft)]',
  // Rarity line: tier then the share of players
  // Rarity sets --rarity for the section, card and pin
  common: '[--rarity:var(--play-rarity-common)]',
  rare: '[--rarity:var(--play-rarity-rare)]',
  legendary: '[--rarity:var(--play-rarity-legendary)]',
  sections: 'flex flex-col gap-4',
  boxes: 'flex flex-col gap-3',
  section:
    'flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--play-panel)] p-3 ring-1 ring-[var(--play-line)] sm:p-4',
  sectionHead: 'flex items-center gap-3 px-1',
  sectionIcon: 'size-7 shrink-0',
  sectionRule: 'h-px min-w-4 flex-1 bg-[var(--play-line)]',
  sectionName: 'text-sm font-black tracking-wide text-[var(--play-ink)] uppercase',
  sectionMeta: 'text-xs font-bold tabular-nums text-[var(--play-ink-faint)]',
  sectionMetaDone: 'text-[var(--play-gold)]',
  pinKey:
    'absolute top-2 right-2 grid size-7 place-items-center rounded-md text-[var(--play-ink-faint)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-play-lift hover:text-[var(--play-ink)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  pinKeyOn: 'opacity-100 text-[var(--play-gold)]',
  pinGlyph: 'size-4',
  // Platinum, wide card over the collection
  platinum:
    'relative flex items-center gap-5 overflow-hidden rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,color-mix(in_srgb,#e9edf3_22%,var(--play-panel)),var(--play-panel)_70%)] p-5 shadow-[var(--shadow-sm)] ring-1 ring-[#e9edf3]/30 sm:p-6',
  platinumOn:
    'bg-[linear-gradient(135deg,color-mix(in_srgb,#e9edf3_38%,var(--play-panel)),var(--play-panel)_75%)] ring-2 ring-[#e9edf3]/70',
  platinumIcon:
    'relative grid size-20 shrink-0 place-items-center rounded-full bg-play-lift text-[var(--play-ink-faint)] shadow-inner',
  platinumIconOn:
    'bg-[image:var(--play-platinum)] text-[var(--play-night)] shadow-[0_0_2rem_#e9edf3]/40',
  platinumGlyph: 'size-10',
  platinumText: 'flex min-w-0 flex-1 flex-col gap-1.5',
  platinumName: 'text-2xl font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  platinumGoal: 'text-sm text-[var(--play-ink-soft)]',
  // Pinned showcase on a profile
  pins: 'grid grid-cols-3 gap-3 sm:grid-cols-6',
  pin: 'flex flex-col items-center gap-2 text-center',
  pinName: 'line-clamp-2 text-xs font-bold text-[var(--play-ink-soft)]',
  pinSlot: 'grid size-16 place-items-center rounded-xl bg-play-lift',
  pinIcon: 'grid size-16 place-items-center rounded-xl bg-[var(--rarity)] text-[var(--play-night)]',
} as const
