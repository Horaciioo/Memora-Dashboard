import { COARSE_POINTER_QUERY } from '@/declarations/ui/responsive'

// Fields the on-screen keyboard opens for
const TEXT_ENTRY =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea, [contenteditable="true"]'

/**
 * Check a finger-driven screen, where focusing a field raises the keyboard
 * @return {boolean} - Coarse pointer
 */

export const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(COARSE_POINTER_QUERY).matches

/**
 * Check an element the keyboard opens for
 * @param {Element} element - Element about to take the focus
 * @return {boolean} - Text entry
 */

export const isTextEntry = (element: Element): boolean => element.matches(TEXT_ENTRY)
