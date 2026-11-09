import type { ChatMessage, Chatter, ModViewState } from '@/types/modview'
import { chatColour } from '@/utils/format/chatColour'

/**
 * Name colour of a chatter by id or login
 * @param {ChatMessage[]} messages - Chat on screen
 * @param {ModViewState['community']} community - Community groups
 * @return {(id: string | null | undefined, name: string | null) => string | undefined} - Lookup
 */

export const colourLookup = (messages: ChatMessage[], community: ModViewState['community']) => {
  const byKey = new Map<string, Chatter>()
  for (const group of Object.values(community)) {
    for (const chatter of group) byKey.set(chatter.id, chatter)
  }
  for (const message of messages) byKey.set(message.author.id, message.author)
  const byLogin = new Map([...byKey.values()].map((chatter) => [chatter.login, chatter]))

  return (id: string | null | undefined, name: string | null): string | undefined => {
    const found =
      (id ? byKey.get(id) : undefined) ?? (name ? byLogin.get(name.toLowerCase()) : undefined)

    return found ? chatColour(found) : undefined
  }
}
