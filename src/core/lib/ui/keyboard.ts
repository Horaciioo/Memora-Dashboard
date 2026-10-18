// Fields the on-screen keyboard opens for
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]'

/**
 * Whether a resize or scroll is only the on-screen keyboard moving the page
 * @param {Event} event - Resize or scroll
 * @param {number} width - Window width when the overlay opened
 * @return {boolean} - Keyboard
 */

export const isKeyboardShift = (event: Event, width: number): boolean =>
  event.type === 'resize'
    ? window.innerWidth === width
    : Boolean(document.activeElement?.matches(TEXT_FIELD))
