import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  juniorLine,
  readDossier,
  readFollow,
  stepSentence,
} from '@/core/lib/assistant/scenarios/junior/data'
import type { JuniorFollow } from '@/core/services/academy/FollowUpService'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// One referent found by the search
interface Found {
  id: string
  name: string
  juniorCount: number
}

const searchAsk = (): ScenarioMove['ask'] => ({ kind: 'search', placeholder: COPY.followWhoHint })

/**
 * Ask which referent is meant
 * @return {Promise<ScenarioMove>} - Search field
 */

export const askReferent: ScenarioStep = async () => ({
  say: [COPY.followWho],
  ask: searchAsk(),
  next: 'referentAnswer',
})

const chosen = (referent: { id: string; name: string }): ScenarioMove => ({
  say: [],
  next: 'referentReport',
  data: { referentId: referent.id, referentName: referent.name, onlyJunior: '' },
})

/**
 * Search the words, one hit goes straight on
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Next move
 */

export const referentAnswer: ScenarioStep = async (context, answer) => {
  const text = answer?.value ?? ''
  const hits = await apiGet<Found[]>(`${API_ROUTES.academyReferents}?q=${encodeURIComponent(text)}`)

  if (hits.length === 0) {
    return {
      say: [fillTemplate(COPY.followNone, { text })],
      ask: searchAsk(),
      next: 'referentAnswer',
    }
  }
  if (hits.length === 1) return chosen(hits[0])

  const choices: ScenarioChoice[] = hits.slice(0, ASSISTANT_SETTINGS.maxChoices).map((hit) => ({
    value: hit.id,
    label: hit.name,
    hint: String(hit.juniorCount),
  }))

  return { say: [COPY.followMany], ask: { kind: 'choices', choices }, next: 'referentPick' }
}

export const referentPick: ScenarioStep = async (context, answer) =>
  chosen({ id: answer?.value ?? '', name: answer?.label ?? '' })

/**
 * From a Junior's file, the referent who follows them
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Report on that referent and that Junior
 */

export const referentOfJunior: ScenarioStep = async (context) => {
  const { junior } = await readDossier(context.data.juniorId)
  if (!junior.referent) return { say: [COPY.followNoReferent], next: 'hubAgain' }

  return {
    say: [],
    next: 'referentReport',
    data: {
      referentId: junior.referent.id,
      referentName: junior.referent.name,
      onlyJunior: context.data.juniorId,
    },
  }
}

/**
 * A line on one junior of the referent
 * @param {JuniorFollow} follow - Where they stand
 * @return {string} - Sentence
 */

const summary = (follow: JuniorFollow): string => {
  const late = follow.todo.filter((step) => step.state === 'late').length

  return fillTemplate(COPY.followLine, {
    junior: follow.name,
    current: follow.current || COPY.followNothing,
    done: String(follow.referentDone),
    total: String(follow.referentTotal),
    todo: String(follow.todo.length),
    late: late > 0 ? fillTemplate(COPY.followLate, { late: String(late) }) : '',
    lives: String(follow.liveCount),
    reviews: String(follow.reviewCount),
  })
}

/**
 * Where the referent stands with their Juniors, or with one of them
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Report, then back to the hub when it came from a file
 */

export const referentReport: ScenarioStep = async (context) => {
  const { referentId, referentName, onlyJunior } = context.data
  const { juniors } = await readFollow(referentId, onlyJunior || undefined)
  const back = onlyJunior ? 'hubAgain' : undefined

  if (juniors.length === 0) {
    return { say: [fillTemplate(COPY.followEmpty, { referent: referentName })], next: back }
  }

  const lines = juniors.slice(0, ASSISTANT_SETTINGS.maxChoices).flatMap((junior) => [
    juniorLine(summary(junior), junior.name, junior.sessionId, junior.juniorId),
    // On one Junior the steps themselves are told
    ...(onlyJunior ? junior.todo.slice(0, ASSISTANT_SETTINGS.maxChoices).map(stepSentence) : []),
  ])

  return { say: [fillTemplate(COPY.followIntro, { referent: referentName }), ...lines], next: back }
}
