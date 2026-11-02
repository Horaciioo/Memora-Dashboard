import { REALTIME_SETTINGS } from '@/declarations/system/realtime'
import { PRESENCE_STYLES } from '@/declarations/ui/variants'

/**
 * Scroll to an element and mark it briefly
 * @param {HTMLElement | null} element - Target
 * @return {boolean} - Found
 */

export const revealElement = (element: HTMLElement | null): boolean => {
  if (!element) return false
  const flash = PRESENCE_STYLES.flash.split(' ')
  const isCalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  element.scrollIntoView({ block: 'center', behavior: isCalm ? 'auto' : 'smooth' })
  element.classList.add(...flash)
  window.setTimeout(() => element.classList.remove(...flash), REALTIME_SETTINGS.presenceFlashMs)

  return true
}
