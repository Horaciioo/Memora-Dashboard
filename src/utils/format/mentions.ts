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
