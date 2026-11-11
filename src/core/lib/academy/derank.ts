import { fillDeparture } from '@/core/lib/academy/parkour'
import { DERANK_FUNCTIONS, DERANK_PERIODS, DERANK_WORDS } from '@/declarations/academy/derank'
import type { DerankPeriodName } from '@/declarations/academy/derank'
import { DEPARTURE_TEMPLATES, DEPARTURE_VERBS } from '@/declarations/academy/parkour'
import { AcademyStages, DepartureKinds } from '@/utils/constants/hierarchy'
import type { AcademyStageName, DepartureKindName } from '@/utils/constants/hierarchy'

/**
 * One person leaving
 * @typedef {Object} DerankEntry
 * @property {string} username - Discord name
 * @property {string} discordId - Discord identifier
 * @property {string} trade - Main function held
 * @property {string} emoji - Function emoji
 * @property {DerankPeriodName | null} period - Period not validated, none outside the academy
 */

export interface DerankEntry {
  username: string
  discordId: string
  trade: string
  emoji: string
  period: DerankPeriodName | null
}

// Stages of the first period
const FIRST_PERIOD_STAGES: AcademyStageName[] = [
  AcademyStages.Preparation,
  AcademyStages.Discovery,
  AcademyStages.ReviewOne,
]

/**
 * Integration period a junior was in
 * @param {AcademyStageName} stage - Stage held
 * @return {DerankPeriodName} - First or second
 */

export const periodOfStage = (stage: AcademyStageName): DerankPeriodName =>
  FIRST_PERIOD_STAGES.includes(stage) ? 'first' : 'second'

// Each value once, in order met
const unique = <T>(values: T[]): T[] => [...new Set(values)]

// First letter in capital
const capitalised = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Announcement of one or several people losing their functions
 * @param {DerankEntry[]} entries - People leaving, at least one
 * @return {string} - Discord markdown
 */

export const composeDerank = (entries: DerankEntry[]): string => {
  const many = entries.length > 1
  const people = entries
    .map((entry) => `**${entry.username}** (\`${entry.discordId}\`)`)
    .join(DERANK_WORDS.joiner)

  // Periods not validated, or a plain dismissal
  const periods = unique(entries.map((entry) => entry.period))
  const failed = periods.every((period) => period !== null)
  const periodNames = periods.map((period) => DERANK_PERIODS[period ?? 'first'])
  const verb = failed
    ? (many ? DERANK_WORDS.failedMany : DERANK_WORDS.failedOne).replace(
        '{period}',
        periodNames.join(DERANK_WORDS.periodJoiner)
      )
    : many
      ? DERANK_WORDS.dismissedMany
      : DERANK_WORDS.dismissedOne

  const functions = unique(entries.map((entry) => DERANK_FUNCTIONS[entry.trade] ?? entry.trade))
  const emojis = unique(entries.map((entry) => entry.emoji).filter(Boolean))

  const heading = DERANK_WORDS.title.replace(
    '{names}',
    entries.map((entry) => capitalised(entry.username)).join(DERANK_WORDS.joiner)
  )
  const line = DERANK_WORDS.line
    .replace('{people}', people)
    .replace('{verb}', verb)
    .replace('{possessive}', many ? DERANK_WORDS.possessiveMany : DERANK_WORDS.possessiveOne)
    .replace('{fonction}', functions.join(DERANK_WORDS.functionJoiner))
    .replace('{emoji}', emojis.join(' '))
    .trim()
  const thanks = many ? DERANK_WORDS.thanksMany : DERANK_WORDS.thanksOne

  return `# ${heading}\n${line}\n\n${thanks}`
}

/**
 * Announcement of a dismissal: the plain one stays for a lone member outside the academy
 * @param {DerankEntry[]} entries - People dismissed, at least one
 * @return {string} - Discord markdown
 */

export const composeDismissal = (entries: DerankEntry[]): string => {
  const [only] = entries
  if (entries.length > 1 || only.period) return composeDerank(entries)

  return fillDeparture(DEPARTURE_TEMPLATES[DepartureKinds.Dismissal], DEPARTURE_VERBS, {
    username: only.username,
    discordId: only.discordId,
    functionName: only.trade,
    emoji: only.emoji,
    kind: DepartureKinds.Dismissal,
  })
}

/**
 * Announcement of one departure, whichever its kind
 * @param {DepartureKindName} kind - Dismissal or resignation
 * @param {DerankEntry} entry - Person leaving
 * @return {string} - Discord markdown
 */

export const composeDeparture = (kind: DepartureKindName, entry: DerankEntry): string =>
  kind === DepartureKinds.Dismissal
    ? composeDismissal([entry])
    : fillDeparture(DEPARTURE_TEMPLATES[kind], DEPARTURE_VERBS, {
        username: entry.username,
        discordId: entry.discordId,
        functionName: entry.trade,
        emoji: entry.emoji,
        kind,
      })
