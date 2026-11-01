import { ROUTES } from '@/declarations/navigation'
import type { NavigationItem } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'

/**
 * Page fixed in the middle of the dock
 * @type {string}
 */

export const DOCK_HOME_PATH = ROUTES.dashboard

/**
 * Pages beside Home until the member picks their own, left to right
 * @type {readonly string[]}
 */

export const DOCK_DEFAULTS: readonly string[] = [ROUTES.lives, ROUTES.tasks, ROUTES.notifications]

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

/**
 * Destinations the rail does not list
 * @type {NavigationItem[]}
 */

export const DOCK_EXTRAS: NavigationItem[] = [
  { href: ROUTES.notifications, label: NAV_COPY.notifications, icon: 'bell' },
]
