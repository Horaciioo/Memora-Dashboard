import type { SuggestionSource } from '@/core/lib/modview/suggest'
import type { ChatMessage } from '@/types/modview'

/**
 * Chat lines around a message, the message itself marked
 * @param {ChatMessage[]} messages - Chat of the live, oldest first
 * @param {SuggestionSource} source - Message pointed at
 * @param {number} before - Lines kept before it
 * @param {number} after - Lines kept after it
 * @return {{ lines: ChatMessage[], hasOlder: boolean, hasNewer: boolean }}
 */

export const threadAround = (
  messages: ChatMessage[],
  source: SuggestionSource,
  before: number,
  after: number
) => {
  const found = messages.findIndex((message) => message.id === source.id)
  const moment = new Date(source.at).getTime()

  // A held line is not in the chat
  const anchor =
    found >= 0
      ? found
      : messages.findIndex((message) => new Date(message.sentAt).getTime() > moment)
  const at = anchor === -1 ? messages.length : anchor
  const from = Math.max(0, at - before)
  const to = Math.min(messages.length, (found >= 0 ? at + 1 : at) + after)

  return { lines: messages.slice(from, to), hasOlder: from > 0, hasNewer: to < messages.length }
}
