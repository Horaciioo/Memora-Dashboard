// Styles a mirror copies so its text wraps like the field
const MIRRORED_STYLES = [
  'direction',
  'boxSizing',
  'width',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontWeight',
  'fontSize',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'textIndent',
  'tabSize',
  'wordSpacing',
] as const

/**
 * Spot of a character on screen
 * @typedef {Object} CaretSpot
 * @property {number} left - Viewport x of the character
 * @property {number} top - Viewport y of its line top
 * @property {number} height - Line height
 */

export interface CaretSpot {
  left: number
  top: number
  height: number
}

/**
 * Where a character of a text field sits in the viewport
 * @param {HTMLTextAreaElement} field - Text field
 * @param {number} index - Character index in the field value
 * @return {CaretSpot} - Viewport spot
 */

export const caretSpot = (field: HTMLTextAreaElement, index: number): CaretSpot => {
  const style = getComputedStyle(field)
  const mirror = document.createElement('div')
  const marker = document.createElement('span')

  for (const name of MIRRORED_STYLES) mirror.style[name] = style[name]
  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.overflowWrap = 'break-word'
  mirror.textContent = field.value.slice(0, index)
  marker.textContent = '​'
  mirror.append(marker)
  document.body.append(mirror)

  const box = field.getBoundingClientRect()
  const height = Number.parseFloat(style.lineHeight) || marker.offsetHeight
  const spot = {
    left: box.left + marker.offsetLeft - field.scrollLeft,
    top: box.top + marker.offsetTop - field.scrollTop,
    height,
  }

  mirror.remove()

  return spot
}
