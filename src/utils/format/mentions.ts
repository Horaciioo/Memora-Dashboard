// Handle as the composer writes it: bracketed whole name, or a one word name
const HANDLE_PATTERN = /@(?:\[([^\]\n]+)\]|([\p{L}\p{N}._-]+(?:\s+[\p{L}\p{N}._-]+)?))/gu

// Name made of a single word
const SINGLE_WORD_PATTERN = /^[\p{L}\p{N}._-]+$/u

// Member tag as Discord stores it
const MEMBER_TAG_PATTERN = /<@!?(\d+)>/g

/**
 * Who a written text names
 * @typedef {Object} Mentions
 * @property {string[]} handles - Candidate display names
 * @property {string[]} discordIds - Discord identifiers
 */

export interface Mentions {
  handles: string[]
  discordIds: string[]
}

// Handle as it is lit up when read
const LIT_PATTERN = /(@\[[^\]\n]+\]|@[\p{L}\p{N}._-]+)/gu

/**
 * Write a member the way the readers find them back
 * @param {string} name - Display name
 * @return {string} - Handle, bracketed when the name holds several words
 */

export const formatMention = (name: string): string =>
  SINGLE_WORD_PATTERN.test(name) ? `@${name}` : `@[${name}]`

/**
 * Piece of a text, lit when it names someone
 * @typedef {Object} MentionPiece
 * @property {string} text - Words of the piece
 * @property {boolean} isMention - Names a member
 */

export interface MentionPiece {
  text: string
  isMention: boolean
}

/**
 * Cut a text so every handle stands alone
 * @param {string} body - Written text
 * @return {MentionPiece[]} - Pieces in reading order
 */

export const splitMentions = (body: string): MentionPiece[] =>
  body
    .split(LIT_PATTERN)
    .filter((text) => text.length > 0)
    .map((text) => {
      const isMention = text.startsWith('@') && text.length > 1

      // Brackets only delimit the name
      return { text: isMention ? text.replace(/^@\[(.*)\]$/, '@$1') : text, isMention }
    })

/**
 * Letters a text shows once its handles are lit
 * @param {string} body - Written text
 * @return {number} - Visible length
 */

export const mentionLength = (body: string): number =>
  splitMentions(body).reduce((total, piece) => total + piece.text.length, 0)

/**
 * First letters of a text, a handle cut midway stays whole
 * @param {string} body - Written text
 * @param {number} length - Visible letters kept
 * @return {string} - Text a reader sees growing
 */

export const mentionPrefix = (body: string, length: number): string => {
  let left = length

  return splitMentions(body)
    .map((piece) => {
      const cut = piece.text.slice(0, Math.max(left, 0))
      left -= cut.length

      return piece.isMention && cut.length > 1 ? formatMention(cut.slice(1)) : cut
    })
    .join('')
}

/**
 * Collect the members a text names
 * @param {string} body - Written text
 * @param {number} limit - Most entries kept in each list
 * @return {Mentions} - Handles and Discord identifiers
 */

export const readMentions = (body: string, limit: number): Mentions => {
  const discordIds = new Set<string>()

  // A tag holds digits that must not be read as a handle
  const plain = body.replace(MEMBER_TAG_PATTERN, (_, id: string) => {
    discordIds.add(id)

    return ' '
  })

  const handles = new Set<string>()

  for (const [, whole, loose] of plain.matchAll(HANDLE_PATTERN)) {
    // A bracketed name is exact
    if (whole) {
      handles.add(whole.trim())
      continue
    }

    handles.add(loose!)

    // A two word handle also stands for the first word alone
    const [first] = loose!.split(/\s+/)
    if (first && first !== loose) handles.add(first)
  }

  return { handles: [...handles].slice(0, limit), discordIds: [...discordIds].slice(0, limit) }
}
