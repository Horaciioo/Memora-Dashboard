/**
 * Topics of the Play bus
 * @type {{ lobbies: string, session: (id: string) => string }}
 */

export const PLAY_TOPICS = {
  // Lobbies opening and filling
  lobbies: 'play:lobbies',
  session: (id: string) => `play:${id}`,
}

/**
 * Event names written on the stream
 * @type {Record<string, string>}
 */

export const PLAY_STREAM_EVENTS = {
  // Something moved, read the game again
  changed: 'changed',
} as const
