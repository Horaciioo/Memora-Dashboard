/**
 * Keys of a shortcut
 * @typedef {Object} Shortcut
 * @property {boolean} mod - Command on Mac, Control elsewhere
 * @property {boolean} shift - Shift held
 * @property {boolean} alt - Alt held
 * @property {string} key - Letter, lower case
 */

export interface Shortcut {
  mod: boolean
  shift: boolean
  alt: boolean
  key: string
}

/**
 * Keyboard event as the match sees it
 * @typedef {Object} KeyInput
 */

export interface KeyInput {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  isComposing?: boolean
}

/**
 * Read a shortcut such as Mod+Shift+M
 * @param {string} text - Written shortcut
 * @return {Shortcut | null} - Keys or null
 */

export const parseShortcut = (text: string): Shortcut | null => {
  const parts = text.split('+').map((part) => part.trim().toLowerCase())
  const key = parts.at(-1)
  if (!key || key.length !== 1) return null

  const modifiers = parts.slice(0, -1)

  return {
    mod: modifiers.includes('mod'),
    shift: modifiers.includes('shift'),
    alt: modifiers.includes('alt'),
    key,
  }
}

/**
 * Check an event against a shortcut
 * @param {KeyInput} event - Key event
 * @param {Shortcut} shortcut - Wanted keys
 * @param {boolean} isMac - Command is the main key
 * @return {boolean} - Event is the shortcut
 */

export const matchesShortcut = (event: KeyInput, shortcut: Shortcut, isMac: boolean): boolean => {
  // Composition belongs to the input method
  if (event.isComposing) return false

  const main = isMac ? event.metaKey : event.ctrlKey
  const other = isMac ? event.ctrlKey : event.metaKey

  return (
    event.key.toLowerCase() === shortcut.key &&
    main === shortcut.mod &&
    !other &&
    event.shiftKey === shortcut.shift &&
    event.altKey === shortcut.alt
  )
}
