import { ROUTES } from '@/declarations/navigation'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'

// Dev wears a black and white logo, told apart from the real app
const ICONS_DIR = APP_ENVIRONMENT === 'dev' ? '/icons/dev' : '/icons'

/**
 * Address Next serves app/manifest.ts on
 * @type {string}
 */

export const MANIFEST_PATH = '/manifest.webmanifest'

/**
 * Pictures of the installed application
 * @type {Record<string, string>}
 */

export const PWA_ICONS = {
  small: `${ICONS_DIR}/icon-192.png`,
  large: `${ICONS_DIR}/icon-512.png`,
  // White glyph, tinted by the system
  badge: '/icons/badge-96.png',
} as const

/**
 * Pixel sizes of the pictures above
 * @type {{ small: number, large: number }}
 */

export const PWA_ICON_SIZES = { small: 192, large: 512 } as const

/**
 * Pages offered on a long press of the home screen icon
 * @type {readonly string[]}
 */

export const PWA_SHORTCUTS: readonly string[] = [
  ROUTES.notifications,
  ROUTES.tasks,
  ROUTES.absences,
]
