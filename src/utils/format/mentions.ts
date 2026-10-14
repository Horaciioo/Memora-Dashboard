// Handle written as an at sign followed by one or two words of a display name
const HANDLE_PATTERN = /@([\p{L}\p{N}._-]+(?:\s+[\p{L}\p{N}._-]+)?)/gu

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

// Handle as it is lit up when read, the first word of the name
const LIT_PATTERN = /(@[\p{L}\p{N}._-]+)/gu

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
    .map((text) => ({ text, isMention: text.startsWith('@') && text.length > 1 }))

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

  for (const [, handle] of plain.matchAll(HANDLE_PATTERN)) {
    handles.add(handle!)

    // A two word handle also stands for the first word alone
    const [first] = handle!.split(/\s+/)
    if (first && first !== handle) handles.add(first)
  }

  return { handles: [...handles].slice(0, limit), discordIds: [...discordIds].slice(0, limit) }
}
