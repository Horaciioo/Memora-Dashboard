import { RESPONSIVE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Named breakpoints, in pixels
 * @type {Record<'sm' | 'md' | 'lg' | 'xl', number>}
 */

export const BREAKPOINTS = RESPONSIVE_SETTINGS.breakpoints

export type BreakpointName = keyof typeof BREAKPOINTS

/**
 * matchMedia query per breakpoint, true from that width up
 * @type {Record<BreakpointName, string>}
 */

export const MEDIA: Record<BreakpointName, string> = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
}

/**
 * True while the mobile shell (top bar, nav pill) is the one on screen
 * @type {string}
 */

export const MOBILE_SHELL_QUERY = `(width < ${BREAKPOINTS[RESPONSIVE_SETTINGS.mobileUntil]}px)`

/**
 * Fixed chrome dimensions of the shell, in pixels
 * @type {{ topBar: number, bottomNav: number, sidebar: number, sidebarCollapsed: number, rail: number, gutter: number }}
 */

export const SHELL_DIMENSIONS = {
  topBar: RESPONSIVE_SETTINGS.topBarHeight,
  bottomNav: RESPONSIVE_SETTINGS.bottomNavHeight,
  sidebar: RESPONSIVE_SETTINGS.sidebarWidth,
  sidebarCollapsed: RESPONSIVE_SETTINGS.sidebarCollapsedWidth,
  rail: RESPONSIVE_SETTINGS.railWidth,
  gutter: RESPONSIVE_SETTINGS.gutter,
} as const

/**
 * Primary destinations
 * @type {number}
 */

export const BOTTOM_NAV_MAX_PRIMARY = RESPONSIVE_SETTINGS.maxPrimarySlots

/**
 * Toasts kept on screen at once
 * @type {{ mobile: number, desktop: number }}
 */

export const TOAST_VISIBLE = {
  mobile: RESPONSIVE_SETTINGS.toastVisibleMobile,
  desktop: RESPONSIVE_SETTINGS.toastVisibleDesktop,
} as const
