import { CHAT_DEFAULT_COLOURS } from '@/declarations/modview/registries'
import type { Chatter } from '@/types/modview'
import { readableOnDark } from '@/utils/format/colour'

/**
 * Colour of a chatter's name: the one they picked, else the one Twitch gives from the login
 * @param {Chatter} chatter - Chatter
 * @return {string} - Readable CSS colour
 */

export const chatColour = (chatter: Chatter): string => {
  if (chatter.colour) return readableOnDark(chatter.colour)

  // Same login, same colour, as on Twitch
  const sum = [...chatter.login].reduce((total, letter) => total + letter.charCodeAt(0), 0)

  return readableOnDark(CHAT_DEFAULT_COLOURS[sum % CHAT_DEFAULT_COLOURS.length] ?? '#ffffff')
}
