import { RESPONSIVE_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import type { Environment } from '@/types/infrastructure'

/**
 * Named breakpoints
 * @type {Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', number>}
 */

export const BREAKPOINTS = RESPONSIVE_SETTINGS.breakpoints

export type BreakpointName = keyof typeof BREAKPOINTS

/**
 * matchMedia query per breakpoint
 * @type {Record<BreakpointName, string>}
 */

export const MEDIA: Record<BreakpointName, string> = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
}

/**
 * True while the mobile shell (top bar, nav pill) is the one on screen
 * @type {string}
 */

export const MOBILE_SHELL_QUERY = `(width < ${BREAKPOINTS[RESPONSIVE_SETTINGS.mobileUntil]}px)`

/**
 * Fixed chrome dimensions of the shell
 * @type {{ topBar: number, sidebar: number, sidebarCompact: number, banner: number, bannerMobile: number }}
 */

export const SHELL_DIMENSIONS = {
  topBar: RESPONSIVE_SETTINGS.topBarHeight,
  sidebar: RESPONSIVE_SETTINGS.sidebarWidth,
  sidebarCompact: RESPONSIVE_SETTINGS.sidebarCompactWidth,
  banner: RESPONSIVE_SETTINGS.bannerHeight,
  bannerMobile: RESPONSIVE_SETTINGS.bannerHeightMobile,
} as const

/**
 * Page drawer footprint
 * @type {{ width: number, heightShare: number, minHeight: number, gap: number }}
 */

export const DRAWER_DIMENSIONS = {
  width: RESPONSIVE_SETTINGS.drawerWidth,
  heightShare: RESPONSIVE_SETTINGS.drawerHeightShare,
  minHeight: RESPONSIVE_SETTINGS.drawerMinHeight,
  gap: RESPONSIVE_SETTINGS.drawerGap,
} as const

/**
 * Toasts kept on screen at once
 * @type {{ mobile: number, desktop: number }}
 */

export const TOAST_VISIBLE = {
  mobile: RESPONSIVE_SETTINGS.toastVisibleMobile,
  desktop: RESPONSIVE_SETTINGS.toastVisibleDesktop,
} as const

/**
 * Areas held back while a screen is too small for them, shown as in development
 * @typedef {Object} HeldRoutes
 * @property {readonly string[]} phone - Held below md
 * @property {readonly string[]} laptop - Held below 2xl
 */

export interface HeldRoutes {
  phone: readonly string[]
  laptop: readonly string[]
}

/**
 * Areas held back per screen class
 * @param {Environment} environment - Running environment
 * @return {HeldRoutes} - Routes held back
 */

export const heldRoutes = (environment: Environment): HeldRoutes =>
  // Only the dev branch exposes the trainings on a phone, and recruitments and the academy on a laptop
  environment === 'dev'
    ? { phone: [ROUTES.lives], laptop: [] }
    : {
        phone: [ROUTES.trainings, ROUTES.lives],
        laptop: [ROUTES.academy, ROUTES.recruitments],
      }

/**
 * Hold that stands for a right click on a touch screen
 * @type {{ delay: number, slop: number }}
 */

export const LONG_PRESS = {
  delay: RESPONSIVE_SETTINGS.longPressMs,
  // Travel in pixels that turns a hold into a scroll
  slop: 10,
} as const

/**
 * True while a finger, not a mouse, drives the page
 * @type {string}
 */

export const COARSE_POINTER_QUERY = '(pointer: coarse)'
