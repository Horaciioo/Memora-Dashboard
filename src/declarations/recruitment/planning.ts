/**
 * Geometry of the planning picture
 * @type {Record<string, number>}
 */

export const PLANNING_LAYOUT = {
  width: 1400,
  gutter: 64,
  headerHeight: 76,
  hourHeight: 64,
  interviewMinutes: 30,
  padHours: 1,
  emptyFromHour: 18,
  emptyToHour: 23,
  titleSize: 22,
  dayNameSize: 14,
  dayNumberSize: 22,
  hourSize: 12,
  eventSize: 13,
  eventInset: 6,
  eventGap: 2,
  glyphWidth: 7,
  timeWidth: 42,
  exportScale: 2,
} as const

/**
 * Tokens the picture is painted with
 * @type {Record<string, string>}
 */

export const PLANNING_TOKENS = {
  page: '--color-page',
  surface: '--color-surface-raised',
  ink: '--color-ink',
  subtle: '--color-ink-subtle',
  accent: '--color-ink-accent',
  line: '--color-border',
} as const

export type PlanningPalette = Record<keyof typeof PLANNING_TOKENS, string>

// Face shared by screen and picture
export const PLANNING_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

// Tags of the picture
export const PLANNING_SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
