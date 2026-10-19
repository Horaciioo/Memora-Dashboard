/**
 * Piece of a text, a link when it carries an address
 * @typedef {Object} LinkPiece
 * @property {string} text - Words as typed
 * @property {string} [href] - Address opened, only http and https
 */

export interface LinkPiece {
  text: string
  href?: string
}

// Endings that make a bare word an address
const TLDS = 'com|fr|tv|gg|net|org|io|be|ch|ca|co|me|ly|app|dev|xyz|gl|live|eu|de|uk|us|info|link'

// Scheme, www or a bare domain with a known ending
const ADDRESS = new RegExp(
  `(?:https?:\\/\\/[^\\s<>"']+|www\\.[^\\s<>"']+|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${TLDS})\\b(?:\\/[^\\s<>"']*)?)`,
  'gi'
)

// Punctuation that closes a sentence, never an address
const TRAILING = /[.,;:!?)\]}»”’]+$/

/**
 * Address a typed link opens
 * @param {string} raw - Link as typed
 * @return {string | null} - Absolute address, none when it is unsafe
 */

const hrefOf = (raw: string): string | null => {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)

    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Cut a text on its links
 * @param {string} text - Message text
 * @return {LinkPiece[]} - Pieces in order
 */

export const splitLinks = (text: string): LinkPiece[] => {
  const pieces: LinkPiece[] = []
  let cursor = 0

  for (const match of text.matchAll(ADDRESS)) {
    const start = match.index ?? 0
    // An address glued to an at sign is an e-mail or a mention
    if (start > 0 && text[start - 1] === '@') continue

    const typed = match[0].replace(TRAILING, '')
    const href = hrefOf(typed)
    if (!href) continue

    if (start > cursor) pieces.push({ text: text.slice(cursor, start) })
    pieces.push({ text: typed, href })
    cursor = start + typed.length
  }

  if (cursor < text.length) pieces.push({ text: text.slice(cursor) })

  return pieces.length > 0 ? pieces : [{ text }]
}
