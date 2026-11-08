import responsive from '@/configurations/system/responsive.json'
import {
  readChoice,
  readInteger,
  readNode,
  readNumber as readBoundedNumber,
} from '@/declarations/configurations/readers'

// Breakpoint keys
const BREAKPOINT_NAMES = ['sm', 'md', 'lg', 'xl'] as const

const smBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).sm, {
  path: 'system/responsive.breakpoints.sm',
  fallback: 640,
  min: 320,
})

const mdBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).md, {
  path: 'system/responsive.breakpoints.md',
  fallback: 768,
  min: smBreakpoint,
})

const lgBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).lg, {
  path: 'system/responsive.breakpoints.lg',
  fallback: 1024,
  min: mdBreakpoint,
})

const xlBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).xl, {
  path: 'system/responsive.breakpoints.xl',
  fallback: 1280,
  min: lgBreakpoint,
})

const xxlBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>)['2xl'], {
  path: 'system/responsive.breakpoints.2xl',
  fallback: 1536,
  min: xlBreakpoint,
})

const responsiveShell = readNode(responsive.shell, 'system/responsive.shell')

const responsiveToast = readNode(responsive.toast, 'system/responsive.toast')

const responsiveDrawer = readNode(responsive.drawer, 'system/responsive.drawer')

const responsiveToastVisible = readNode(
  responsiveToast.maxVisible,
  'system/responsive.toast.maxVisible'
)

/**
 * Breakpoint and shell chrome bounds
 * @type {{ breakpoints: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', number>, mobileUntil: 'sm' | 'md' | 'lg' | 'xl', topBarHeight: number, dockHeight: number, sidebarWidth: number, sidebarCompactWidth: number, bannerHeight: number, bannerHeightMobile: number, breadcrumbFullChars: number, toastVisibleMobile: number, toastVisibleDesktop: number, touchTargetMin: number, longPressMs: number, drawerWidth: number, drawerHeightShare: number, drawerMinHeight: number, drawerGap: number }}
 */

export const RESPONSIVE_SETTINGS = {
  breakpoints: {
    sm: smBreakpoint,
    md: mdBreakpoint,
    lg: lgBreakpoint,
    xl: xlBreakpoint,
    '2xl': xxlBreakpoint,
  },
  mobileUntil: readChoice(responsive.mobileUntil, {
    path: 'system/responsive.mobileUntil',
    fallback: 'md',
    allowed: BREAKPOINT_NAMES,
  }),
  topBarHeight: readInteger(responsiveShell.topBarHeight, {
    path: 'system/responsive.shell.topBarHeight',
    fallback: 52,
    min: 32,
  }),
  dockHeight: readInteger(responsiveShell.dockHeight, {
    path: 'system/responsive.shell.dockHeight',
    fallback: 64,
    min: 48,
  }),
  sidebarWidth: readInteger(responsiveShell.sidebarWidth, {
    path: 'system/responsive.shell.sidebarWidth',
    fallback: 264,
    min: 160,
  }),
  sidebarCompactWidth: readInteger(responsiveShell.sidebarCompactWidth, {
    path: 'system/responsive.shell.sidebarCompactWidth',
    fallback: 80,
    min: 64,
  }),
  bannerHeight: readInteger(responsiveShell.bannerHeight, {
    path: 'system/responsive.shell.bannerHeight',
    fallback: 184,
    min: 96,
  }),
  bannerHeightMobile: readInteger(responsiveShell.bannerHeightMobile, {
    path: 'system/responsive.shell.bannerHeightMobile',
    fallback: 144,
    min: 96,
  }),
  breadcrumbFullChars: readInteger(responsive.breadcrumbFullChars, {
    path: 'system/responsive.breadcrumbFullChars',
    fallback: 24,
    min: 8,
  }),
  toastVisibleMobile: readInteger(responsiveToastVisible.mobile, {
    path: 'system/responsive.toast.maxVisible.mobile',
    fallback: 1,
    min: 1,
  }),
  toastVisibleDesktop: readInteger(responsiveToastVisible.desktop, {
    path: 'system/responsive.toast.maxVisible.desktop',
    fallback: 3,
    min: 1,
  }),
  touchTargetMin: readInteger(responsive.touchTargetMin, {
    path: 'system/responsive.touchTargetMin',
    fallback: 44,
    min: 24,
    max: 64,
  }),
  longPressMs: readInteger(responsive.longPressMs, {
    path: 'system/responsive.longPressMs',
    fallback: 450,
    min: 200,
    max: 1000,
  }),
  drawerWidth: readInteger(responsiveDrawer.width, {
    path: 'system/responsive.drawer.width',
    fallback: 600,
    min: 320,
    max: 960,
  }),
  drawerHeightShare: readBoundedNumber(responsiveDrawer.heightShare, {
    path: 'system/responsive.drawer.heightShare',
    fallback: 0.8,
    min: 0.3,
    max: 1,
  }),
  drawerMinHeight: readInteger(responsiveDrawer.minHeight, {
    path: 'system/responsive.drawer.minHeight',
    fallback: 600,
    min: 280,
  }),
  drawerGap: readInteger(responsiveDrawer.gap, {
    path: 'system/responsive.drawer.gap',
    fallback: 0,
    min: 0,
    max: 64,
  }),
} as const
