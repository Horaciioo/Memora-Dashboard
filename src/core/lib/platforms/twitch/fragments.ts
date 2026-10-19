import type { ChatFragment } from '@/types/modview'

// Loose payload
type Payload = Record<string, unknown>

/**
 * Read a string field
 * @param {unknown} value - Raw value
 * @return {string} - String
 */

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/**
 * Cut a message the way Twitch did
 * @param {unknown} raw - Fragments of the payload
 * @param {string} fallback - Whole text, used when Twitch sent no cut
 * @return {ChatFragment[]} - Pieces in order
 */

export const fragmentsOf = (raw: unknown, fallback: string): ChatFragment[] => {
  if (!Array.isArray(raw) || raw.length === 0) return [{ type: 'text', text: fallback }]

  return raw.map((entry) => {
    const fragment = entry as Payload
    const piece = text(fragment.text)
    const emote = fragment.emote as Payload | null | undefined

    if (fragment.type === 'emote' && emote && text(emote.id)) {
      const formats = Array.isArray(emote.format) ? emote.format : []

      return {
        type: 'emote',
        text: piece,
        emoteId: text(emote.id),
        animated: formats.includes('animated'),
      }
    }

    return { type: fragment.type === 'mention' ? 'mention' : 'text', text: piece }
  })
}
