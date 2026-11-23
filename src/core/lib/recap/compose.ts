import { RECAP_BEATS } from '@/declarations/recap/beats'
import { CHAPTER_OF_TARGET, SECTION_OF_TARGET } from '@/declarations/recap/chapters'
import type { RecapChapterName, RecapSectionName } from '@/declarations/recap/chapters'
import { RECAP_TIER_ORDER, tierOfKind } from '@/declarations/recap/tiers'
import type { RecapTierName } from '@/declarations/recap/tiers'
import type { RecapBeat, RecapDraft, RecapPerson, RecapThread } from '@/types/recap'
import { formatDayKey } from '@/utils/format/time/days'

/**
 * Bounds of a composed recap
 * @typedef {Object} ComposeLimits
 * @property {number} threads - Threads kept
 * @property {number} beats - Beats kept per thread
 * @property {number} people - Portraits kept per beat
 */

export interface ComposeLimits {
  threads: number
  beats: number
  people: number
}

const tierRank = (tier: RecapTierName): number => RECAP_TIER_ORDER.indexOf(tier)

// What a draft weighs, an alert by its notification kind
const tierOf = (draft: RecapDraft): RecapTierName =>
  draft.alert ? tierOfKind(draft.alert) : RECAP_BEATS[draft.beat].tier

// Records share a thread, a draft with no record stands alone
const threadKeyOf = (draft: RecapDraft): string => {
  if (!draft.target) return `${draft.beat}:${draft.alert ?? ''}`

  // A line that stands alone keeps a thread of its own
  const alone = RECAP_BEATS[draft.beat].alone ? `:${draft.beat}` : ''

  return `${draft.target}:${draft.targetId ?? ''}${alone}`
}

// An edit made by the very hand that just asked something says nothing more
const isEchoOfAsk = (draft: RecapDraft, thread: RecapDraft[]): boolean =>
  draft.beat === 'edited' &&
  thread.some(
    (other) =>
      other.beat === 'alert' &&
      tierOf(other) === 'act' &&
      other.actorIds.some((id) => draft.actorIds.includes(id))
  )

/**
 * Dress one draft with the portraits of who acted
 * @param {RecapDraft} draft - Draft
 * @param {Map<string, RecapPerson>} directory - Members by identifier
 * @param {number} shown - Portraits kept
 * @return {RecapBeat} - Beat
 */

const toBeat = (
  draft: RecapDraft,
  directory: Map<string, RecapPerson>,
  shown: number
): RecapBeat => {
  const known = draft.actorIds.flatMap((id) => directory.get(id) ?? [])

  return {
    id: `${draft.beat}:${draft.alert ?? ''}`,
    beat: draft.beat,
    alert: draft.alert ?? null,
    at: draft.at.toISOString(),
    people: known.slice(0, shown),
    others: Math.max(0, known.length - shown),
    count: draft.count,
    figures: draft.figures ?? [],
  }
}

/**
 * Fold drafts into threads, one per record, the ones that ask for something first
 * @param {RecapDraft[]} drafts - Movements from every source
 * @param {Map<string, RecapPerson>} directory - Members by identifier
 * @param {ComposeLimits} limits - What to keep
 * @return {RecapThread[]} - Threads, heaviest then newest first
 */

export const composeThreads = (
  drafts: RecapDraft[],
  directory: Map<string, RecapPerson>,
  limits: ComposeLimits
): RecapThread[] => {
  const threads = [...Map.groupBy(drafts, threadKeyOf)].map(([key, group]): RecapThread => {
    const kept = group
      .filter((draft) => !isEchoOfAsk(draft, group))
      .sort((a, b) => tierRank(tierOf(a)) - tierRank(tierOf(b)) || +b.at - +a.at)
    const beats = kept
      .slice(0, limits.beats)
      .map((draft) => toBeat(draft, directory, limits.people))
    const lead = kept[0]

    return {
      key,
      tier: tierOf(lead),
      target: lead.target,
      targetId: lead.targetId,
      subject: kept.find((draft) => draft.subject)?.subject ?? null,
      at: new Date(Math.max(...kept.map((draft) => +draft.at))).toISOString(),
      beats,
    }
  })

  return threads
    .sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || b.at.localeCompare(a.at))
    .slice(0, limits.threads)
}

/**
 * Chapter of Memora a thread is told in
 * @param {RecapThread} thread - Thread
 * @return {RecapChapterName} - Chapter
 */

const chapterOf = (thread: RecapThread): RecapChapterName =>
  thread.target ? CHAPTER_OF_TARGET[thread.target] : 'around'

/**
 * Lines of a chapter told under one small title
 * @typedef {Object} RecapGroup
 * @property {string | null} day - Day key when the chapter spans several days
 * @property {RecapSectionName | null} section - Part of the chapter, null for the plain lines
 * @property {RecapThread[]} threads - Lines
 */

export interface RecapGroup {
  day: string | null
  section: RecapSectionName | null
  threads: RecapThread[]
}

/**
 * One chapter of the recap
 * @typedef {Object} RecapChapter
 * @property {RecapChapterName} chapter - Place of Memora it speaks about
 * @property {RecapGroup[]} groups - Lines, by section
 * @property {number} hidden - Threads folded away
 */

export interface RecapChapter {
  chapter: RecapChapterName
  groups: RecapGroup[]
  hidden: number
}

// Part of its chapter a thread is told in, its first beat deciding before its record
const sectionOf = (thread: RecapThread): RecapSectionName | null =>
  RECAP_BEATS[thread.beats[0].beat].section ??
  (thread.target ? (SECTION_OF_TARGET[thread.target] ?? null) : null)

// Day a thread is told under, the one its line shows
const dayOf = (thread: RecapThread): string => formatDayKey(thread.beats[0].at)

/**
 * Threads told chapter by chapter, the chapter holding the heaviest and newest thread first
 * @param {RecapThread[]} threads - Threads, heaviest then newest first
 * @param {number} lines - Threads a chapter shows
 * @return {RecapChapter[]} - Chapters
 */

export const chaptersOf = (threads: RecapThread[], lines: number): RecapChapter[] =>
  [...Map.groupBy(threads, chapterOf)].map(([chapter, group]) => {
    const kept = group.slice(0, lines)
    const days = Map.groupBy(kept, dayOf)

    // Several days split the chapter by day, newest first, one day keeps its sections
    const groups: RecapGroup[] =
      days.size > 1
        ? [...days]
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([day, threads]) => ({ day, section: null, threads }))
        : [...Map.groupBy(kept, sectionOf)].map(([section, threads]) => ({
            day: null,
            section,
            threads,
          }))

    return { chapter, groups, hidden: Math.max(0, group.length - lines) }
  })
