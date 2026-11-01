import { ROUTES } from '@/declarations/navigation'

/**
 * Page fixed in the middle of the dock
 * @type {string}
 */

export const DOCK_HOME_PATH = ROUTES.dashboard

/**
 * Pages beside Home until the member picks their own, left to right
 * @type {readonly string[]}
 */

export const DOCK_DEFAULTS: readonly string[] = [ROUTES.lives, ROUTES.tasks, ROUTES.calendar]

/**
 * Pages taking a slot the member cannot open, first allowed one wins
 * @type {readonly string[]}
 */

export const DOCK_FALLBACKS: readonly string[] = [
  ROUTES.calendar,
  ROUTES.absences,
  ROUTES.meetings,
  ROUTES.projects,
  ROUTES.members,
  ROUTES.changelog,
]
