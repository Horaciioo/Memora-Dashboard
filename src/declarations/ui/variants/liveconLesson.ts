import type { OrgRole } from '@/declarations/academy/curriculum/types'
import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'
import { COURSE_PANEL } from '@/declarations/ui/variants/course'

// A Livecon level laid over the edge of a box, floating
const LEVEL_BADGE =
  'flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] font-bold tracking-tight shadow-[var(--shadow-float)]'

/**
 * Chart of who decides the Livecon, with the words said at each step
 * @type {Record<string, string>}
 */

export const COURSE_ORG = {
  root: 'mx-auto flex w-full max-w-5xl flex-col items-center gap-5',
  canvas: 'relative aspect-[8/5] w-full',
  // Panel of its own, when the chart is not inside the box of a subject
  canvasBox: `overflow-hidden ${COURSE_PANEL}`,
  lines: 'pointer-events-none absolute inset-0 size-full text-[var(--color-ink-subtle)]',
  // Colour of a part, taken by its bubble too, a touch deeper toward the bottom right
  fill: 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--org-color)_85%,var(--color-media-shade)),color-mix(in_srgb,var(--org-color)_62%,var(--color-media-shade)))] text-[var(--color-on-media)]',
  node: 'absolute flex items-center justify-center rounded-[var(--radius-lg)] px-2 text-center text-sm leading-tight font-bold shadow-[var(--shadow-sm)] transition-shadow duration-[var(--motion-duration-slow)]',
  nodeLit: 'shadow-[0_0_0_3px_var(--color-surface),0_0_0_5px_var(--org-color),var(--shadow-md)]',
  bubble:
    'absolute w-[30%] -translate-y-1/2 rounded-[var(--radius-lg)] p-3 text-sm leading-snug font-semibold shadow-[var(--shadow-md)] transition-[opacity,translate] duration-[var(--motion-duration-slow)] after:absolute after:top-1/2 after:-right-1.5 after:size-3 after:-translate-y-1/2 after:rotate-45 after:rounded-[2px] after:bg-[color-mix(in_srgb,var(--org-color)_62%,var(--color-media-shade))] after:content-[""]',
  bubbleHidden: 'pointer-events-none translate-x-3 opacity-0',
  controls: 'flex justify-center',
} as const

/**
 * Colour of a part of the chart by its level of authority
 * @type {Record<string, string>}
 */

export const COURSE_ORG_ROLES: Record<OrgRole, string> = {
  owner: '[--org-color:var(--color-apple-red)]',
  admin: '[--org-color:var(--color-apple-orange)]',
  lead: '[--org-color:var(--color-apple-green)]',
  moderation: '[--org-color:var(--color-neutral)]',
  outside: '[--org-color:var(--color-mauve-600)]',
}

/**
 * Table of what the moderation does at each level
 * @type {Record<string, string>}
 */

export const COURSE_RULES = {
  rows: 'flex flex-col pt-4',
  row: 'relative',
  // The level laid over the top edge of its box
  badge: `absolute top-0 left-6 z-10 -translate-y-1/2 ${LEVEL_BADGE} py-2 pr-5 pl-3 text-lg`,
  badgeIcon: 'size-8 shrink-0',
  // A role label, tinted, over the top edge
  roleBadge:
    'absolute top-0 left-6 z-10 -translate-y-1/2 rounded-full border border-[var(--color-border)] px-5 py-2 text-lg font-bold tracking-tight shadow-[var(--shadow-float)]',
  card: `${COURSE_PANEL} px-6 pt-9 pb-6`,
  text: 'text-lg leading-relaxed',
  // One box, shown once scrolled to
  item: 'flex flex-col max-md:not-first:mt-16',
  box: 'relative w-full transition-[opacity,translate] duration-[var(--motion-duration-slow)] md:w-[55%]',
  boxHidden: 'translate-y-6 opacity-0',
  left: 'items-start',
  center: 'items-center',
  right: 'items-end',
  // Dashed curve from the box above to this one, ending in an arrow clear of both
  link: 'relative hidden h-44 w-full text-[var(--color-ink-subtle)] transition-opacity duration-[var(--motion-duration-slow)] md:block',
  linkPath: 'fill-none stroke-current stroke-2 [stroke-dasharray:3_9] [stroke-linecap:round]',
  linkArrow: 'absolute top-[80%] size-4 -translate-x-1/2 fill-none stroke-current stroke-2',
  linkHidden: 'opacity-0',
} as const

/**
 * One offence handled harder at each level
 * @type {Record<string, string>}
 */

export const COURSE_COMPARE = {
  root: 'flex w-full flex-col gap-4',
  rootBox: `mx-auto max-w-5xl ${COURSE_PANEL} p-5 sm:p-7`,
  offense: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  columns: 'grid gap-4 md:grid-cols-3',
  column:
    'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-sm)]',
  head: 'flex items-center gap-3',
  icon: 'size-8 shrink-0',
  name: 'text-lg font-bold tracking-tight',
  tiers: 'flex flex-col',
  tier: 'flex flex-col gap-2 border-t border-[var(--color-border)] py-3',
  tierLabel: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  measures: 'flex flex-wrap gap-2',
} as const

/**
 * The sanctions box of the panel, its table hardening as the Livecon falls
 * @type {Record<string, string>}
 */

export const COURSE_SANCTIONBOX = {
  root: 'flex w-full flex-col gap-6',
  // Box of its own, when it is not inside the box of a subject
  rootBox: `mx-auto max-w-5xl ${COURSE_PANEL} p-5 sm:p-7`,
  title: 'flex min-w-0 flex-col gap-3',
  label: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  offense: 'text-xl font-bold tracking-tight text-balance',
  example: 'w-fit max-w-full overflow-hidden rounded-[var(--radius-md)]',
  // The table, with the Livecon laid over its top edge
  stage: 'relative pt-9',
  table:
    'flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 pt-14 pb-2 shadow-[var(--shadow-sm)] sm:px-6',
  tableHead:
    'grid gap-x-6 border-b border-[var(--color-border)] pb-3 sm:grid-cols-[10rem_minmax(0,1fr)]',
  // Every level stacked in one place, the one in force shown
  badges:
    'absolute top-0 right-5 grid cursor-pointer rounded-full text-left focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] sm:right-6',
  badge: `col-start-1 row-start-1 ${LEVEL_BADGE} py-2.5 pr-6 pl-3.5 text-xl transition-[opacity,scale] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-spring)]`,
  badgeHidden: 'pointer-events-none scale-75 opacity-0',
  badgeIcon: 'size-10 shrink-0',
  // Every level's rows stacked in one place: the table keeps the height of the longest
  rows: 'grid',
  rowsHidden: 'invisible',
  row: 'course-rung-in grid gap-x-6 gap-y-2 border-t border-[var(--color-border)] py-4 first:border-t-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center',
  column: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  measures: 'flex flex-wrap gap-2',
} as const

/**
 * A sanction as a chip, from cold to hot: a removal is blue, a ban is red
 * @type {Record<string, string>}
 */

export const COURSE_HEAT = {
  chip: 'rounded-[var(--radius-md)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--heat)_88%,var(--color-media-shade)),color-mix(in_srgb,var(--heat)_70%,var(--color-media-shade)))] px-3 py-1.5 text-base font-bold text-[var(--color-on-media)]',
  // Cold to hot
  steps: [
    '[--heat:var(--color-sky-600)]',
    '[--heat:var(--color-apple-green)]',
    '[--heat:var(--color-caution)]',
    '[--heat:var(--color-apple-orange)]',
    '[--heat:color-mix(in_srgb,var(--color-apple-orange)_45%,var(--color-apple-red))]',
    '[--heat:var(--color-apple-red)]',
  ],
  // A note that is not a sanction
  none: '[--heat:var(--color-neutral)]',
} as const

/**
 * Handover told as a conversation
 * @type {Record<string, string>}
 */

export const COURSE_CONVERSATION = {
  layout: 'grid gap-8 lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)]',
  side: 'flex min-w-0 flex-col gap-5',
  // Column as tall as the Mod View, older bubbles melt away at the top
  column: 'relative h-[28rem] min-h-0 lg:h-auto lg:flex-1',
  scroll: 'absolute inset-0 overflow-y-auto overscroll-contain px-1 py-2 [scrollbar-width:none]',
  // Older bubbles melt away once scrolled off the top
  columnFaded: '[mask-image:linear-gradient(to_bottom,transparent,black_30%)]',
  list: 'flex flex-col gap-6',
  line: 'flex max-w-[92%] flex-col items-start',
  // Box of who speaks to whom, laid over the bubble, names tinted
  label:
    'relative z-10 -mb-3.5 ml-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-1 text-sm font-bold tracking-tight text-[var(--color-ink)] shadow-[var(--shadow-float)]',
  // Plain bubble, its tail cut as a triangle
  bubble:
    'relative rounded-[1.5rem] bg-[var(--color-surface-raised)] px-5 pt-7 pb-4 text-base leading-relaxed shadow-[var(--shadow-md)] before:absolute before:bottom-0 before:-left-2 before:h-4 before:w-4 before:bg-inherit before:[clip-path:polygon(100%_0,100%_100%,0_100%)] before:content-[""]',
  stage: 'min-w-0',
} as const
