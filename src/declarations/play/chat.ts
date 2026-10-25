/**
 * Limits of a game chat
 * @type {{ history: number, maxLength: number }}
 */

export const PLAY_CHAT = {
  // Lines kept on screen
  history: 100,
  maxLength: 500,
} as const

/**
 * Table events written in the chat, the verb is coloured
 * @type {Record<string, { verb: string, rest: string }>}
 */

export const PLAY_CHAT_EVENTS = {
  JOINED: { verb: 'a rejoint', rest: 'la partie.' },
  LEFT: { verb: 'a quitté', rest: 'la partie.' },
  KICKED: { verb: 'a été exclu', rest: 'de la partie.' },
} as const
