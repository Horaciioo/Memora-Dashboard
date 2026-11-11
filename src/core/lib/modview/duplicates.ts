import { holdsWord, plain } from '@/core/lib/modview/detection'
import { MODVIEW_PERSONAL, REPEAT_OFFENSE } from '@/declarations/modview/personal'
import type { ChatMessage } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'

/**
 * Chain a line belongs to: same viewer, same words
 * @param {ChatMessage} message - Line
 * @return {string} - Key
 */

export const repeatKey = (message: ChatMessage): string =>
  `${message.author.id}|${plain(message.text).replace(/\s+/g, ' ')}`

/**
 * Times each line was said, for the lines said again that hold a watched word
 * @param {ChatMessage[]} messages - Lines, oldest first
 * @param {string[]} words - Watched words
 * @return {Map<string, number>} - Count by message, absent when said once
 */

export const repeatCounts = (messages: ChatMessage[], words: string[]): Map<string, number> => {
  const counts = new Map<string, number>()
  if (words.length === 0) return counts
  const moments = new Map<string, number[]>()

  for (const message of messages) {
    if (message.deletedBy) continue
    const flat = plain(message.text)
    if (!words.some((word) => holdsWord(word, flat))) continue

    const key = repeatKey(message)
    const at = Date.parse(message.sentAt)
    const recent = (moments.get(key) ?? []).filter(
      (moment) => at - moment <= MODVIEW_PERSONAL.repeatWindowMs
    )
    recent.push(at)
    moments.set(key, recent)
    if (recent.length >= MODVIEW_PERSONAL.minRepeats) counts.set(message.id, recent.length)
  }

  return counts
}

/**
 * Offence of a repeated phrase: the panel's own when it names one, else a plain warning
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @return {SanctionOffenseCard} - Offence
 */

export const repeatOffense = (panel: SanctionPanelView | null): SanctionOffenseCard =>
  panel?.offenses.find((offense) => plain(offense.name) === plain(REPEAT_OFFENSE.name)) ??
  REPEAT_OFFENSE
