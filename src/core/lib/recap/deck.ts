import { isWaiting } from '@/core/lib/recap/absences'
import { chaptersOf } from '@/core/lib/recap/compose'
import { RECAP_CHAPTER_PAGES } from '@/declarations/recap/chapters'
import type { RecapChapterName } from '@/declarations/recap/chapters'
import { RECAP_TIER_ORDER } from '@/declarations/recap/tiers'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import { ROUTES } from '@/declarations/navigation'
import type { Recap, RecapThread } from '@/types/recap'

/**
 * One card of the deck
 * @typedef {Object} DeckCard
 * @property {string} key - Thread key
 * @property {RecapChapterName} chapter - Chapter it belongs to
 * @property {RecapThread} thread - What moved
 * @property {boolean} isAbsences - The absences waiting for the member's word
 */

export interface DeckCard {
  key: string
  chapter: RecapChapterName
  thread: RecapThread
  isAbsences: boolean
}

/**
 * Cards still to handle, what asks for the member first, what was skipped last
 * @param {Recap | null} recap - Recap on screen
 * @param {string[]} done - Threads handled
 * @param {string[]} skipped - Threads put at the bottom
 * @return {DeckCard[]} - Cards in reading order
 */

export const cardsOf = (recap: Recap | null, done: string[], skipped: string[]): DeckCard[] => {
  if (!recap) return []

  const all = chaptersOf(recap.threads, Infinity).flatMap(({ chapter, groups }) =>
    groups.flatMap((group) =>
      group.threads.map((thread) => ({
        key: thread.key,
        chapter,
        thread,
        isAbsences: isWaiting(thread),
      }))
    )
  )

  // One card holds every absence waiting
  const kept = all.filter(
    (card, index) => !card.isAbsences || all.findIndex((other) => other.isAbsences) === index
  )
  const rank = (card: DeckCard) => RECAP_TIER_ORDER.indexOf(card.thread.tier)
  const open = kept.filter((card) => !done.includes(card.key))
  const ordered = [...open].sort((a, b) => rank(a) - rank(b))
  const isSkipped = (card: DeckCard) => skipped.includes(card.key)

  return [
    ...ordered.filter((card) => !isSkipped(card)),
    ...skipped.flatMap((key) => ordered.filter((card) => card.key === key)),
  ]
}

/**
 * Where the guide takes the member for a card, and which record it lights
 * @param {DeckCard} card - Card
 * @return {{ href: string, record: string | null }} - Page and record route
 */

export const guideOf = (card: DeckCard): { href: string; record: string | null } => {
  const { thread, chapter } = card
  const target = thread.target ? NOTIFICATION_TARGETS.get(thread.target) : null

  return {
    href: thread.target === 'calendar' ? ROUTES.calendar : RECAP_CHAPTER_PAGES[chapter],
    record: target?.route(thread.targetId) || null,
  }
}
