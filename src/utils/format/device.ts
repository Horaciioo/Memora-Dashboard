import {
  BROWSER_TOKENS,
  DEVICE_ICONS,
  MOBILE_TOKENS,
  SYSTEM_TOKENS,
} from '@/declarations/preferences/devices'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Device read off a user agent
 * @typedef {Object} DeviceReading
 * @property {string | null} browser - Browser name
 * @property {string | null} system - Operating system
 * @property {boolean} isMobile - Handheld client
 * @property {IconName} icon - Glyph of its kind
 */

export interface DeviceReading {
  browser: string | null
  system: string | null
  isMobile: boolean
  icon: IconName
}

/**
 * Read a user agent
 * @param {string | null} userAgent - Raw header
 * @return {DeviceReading}
 */

export const readDevice = (userAgent: string | null): DeviceReading => {
  const agent = userAgent ?? ''
  const isMobile = MOBILE_TOKENS.some((token) => agent.includes(token))

  return {
    browser: BROWSER_TOKENS.find(([token]) => agent.includes(token))?.[1] ?? null,
    system: SYSTEM_TOKENS.find(([token]) => agent.includes(token))?.[1] ?? null,
    isMobile,
    icon: isMobile ? DEVICE_ICONS.mobile : DEVICE_ICONS.desktop,
  }
}
