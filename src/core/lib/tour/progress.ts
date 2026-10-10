import { NAVIGATION, ROUTES } from '@/declarations/navigation'
import type { NavigationGroup } from '@/declarations/navigation'
import { TOUR_PAGES } from '@/declarations/tour/pages'

/**
 * Routes a member can open, the settings page always among them
 * @param {NavigationGroup[]} groups - Groups the member sees
 * @return {string[]} - Routes
 */

export const openRoutes = (groups: NavigationGroup[]): string[] => [
  ...groups.flatMap((group) => group.items.map((item) => item.href)),
  ROUTES.preferences,
]

/**
 * Pages of the tour the member can open and holds the function for, in tour order
 * @param {string[]} open - Routes the member can open
 * @param {string[]} functions - Names of the functions the member holds
 * @return {string[]} - Routes to walk through
 */

export const tourRoutes = (open: string[], functions: string[]): string[] =>
  TOUR_PAGES.filter(
    (page) =>
      open.includes(page.route) &&
      (!page.functions || page.functions.some((name) => functions.includes(name)))
  ).map((page) => page.route)

/**
 * First page still to explain
 * @param {string[]} routes - Routes to walk through
 * @param {string[]} seen - Routes already explained
 * @return {string | null} - Route or null when done
 */

export const nextRoute = (routes: string[], seen: string[]): string | null =>
  routes.find((route) => !seen.includes(route)) ?? null

/**
 * Routes the rail shows while the tour runs
 * @param {string[]} routes - Routes to walk through
 * @param {string[]} seen - Routes already explained
 * @return {string[]} - Explained pages plus the next one
 */

export const unlockedRoutes = (routes: string[], seen: string[]): string[] => {
  const next = nextRoute(routes, seen)

  return next ? [...routes.filter((route) => seen.includes(route)), next] : routes
}

/**
 * Whether an account is new enough to be welcomed
 * @param {Date} joinedAt - When the account opened
 * @param {Date} now - Current time
 * @param {number} days - Days a member stays a newcomer
 * @return {boolean} - Newcomer
 */

export const isNewcomer = (joinedAt: Date, now: Date, days: number): boolean =>
  now.getTime() - joinedAt.getTime() <= days * 86_400_000

/**
 * Name of a page as the rail writes it
 * @param {string} route - Page route
 * @return {string} - Label
 */

export const routeLabel = (route: string): string =>
  NAVIGATION.flatMap((group) => group.items).find((item) => item.href === route)?.label ??
  TOUR_PAGES.find((page) => page.route === route)?.label ??
  route
