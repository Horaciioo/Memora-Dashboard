// Prefix of one game's topic
const SESSION_PREFIX = 'play:partie:'

/**
 * Topics of the Play bus
 * @type {{ lobbies: string, notices: string, groups: string, session: (id: string) => string, sessionIdOf: (topic: string) => string | null }}
 */

export const PLAY_TOPICS = {
  // Lobbies opening and filling
  lobbies: 'play:lobbies',
  // Invitations and followed games
  notices: 'play:notices',
  // Groups moving: members, invitations, proposals
  groups: 'play:groups',
  session: (id: string) => `${SESSION_PREFIX}${id}`,
  sessionIdOf: (topic: string): string | null =>
    topic.startsWith(SESSION_PREFIX) ? topic.slice(SESSION_PREFIX.length) || null : null,
}

/**
 * Event names written on the socket
 * @type {Record<string, string>}
 */

export const PLAY_STREAM_EVENTS = {
  // Seats or stage moved, read the page again
  changed: 'changed',
  // Only the board moved, pushed to each reader
  moved: 'moved',
  // Board of the reader, ready to draw
  board: 'board',
  // One chat line
  chat: 'chat',
} as const
