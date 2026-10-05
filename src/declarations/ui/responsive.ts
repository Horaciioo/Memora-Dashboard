import { RESPONSIVE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Named breakpoints
 * @type {Record<'sm' | 'md' | 'lg' | 'xl', number>}
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
}

/**
 * True while the mobile shell (top bar, nav pill) is the one on screen
 * @type {string}
 */

export const MOBILE_SHELL_QUERY = `(width < ${BREAKPOINTS[RESPONSIVE_SETTINGS.mobileUntil]}px)`

/**
 * Fixed chrome dimensions of the shell
 * @type {{ topBar: number, bottomNav: number, sidebar: number, banner: number, bannerMobile: number, notch: number, notchSlope: number }}
 */

export const SHELL_DIMENSIONS = {
  topBar: RESPONSIVE_SETTINGS.topBarHeight,
  bottomNav: RESPONSIVE_SETTINGS.bottomNavHeight,
  sidebar: RESPONSIVE_SETTINGS.sidebarWidth,
  banner: RESPONSIVE_SETTINGS.bannerHeight,
  bannerMobile: RESPONSIVE_SETTINGS.bannerHeightMobile,
  notch: RESPONSIVE_SETTINGS.notchHeight,
  notchSlope: RESPONSIVE_SETTINGS.notchSlope,
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
