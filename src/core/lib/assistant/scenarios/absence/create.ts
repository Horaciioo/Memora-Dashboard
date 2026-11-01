import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { spanDays } from '@/core/lib/assistant/period'
import {
  absenceLine,
  bookedOf,
  dayOf,
  ownAbsences,
  rangeOfAbsence,
  takingDays,
  yesNo,
} from '@/core/lib/assistant/scenarios/absence/shared'
import { ABSENCE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/absence'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ABSENCE_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import type { ScenarioStep } from '@/types/scenario'
import type { MemberAbsence } from '@/types/members'
import { absenceRange } from '@/utils/format/absences'
import { fillTemplate } from '@/utils/format/strings'

// Why a span cannot be taken, and the absence in the way
interface Verdict {
  reason: string
  clash?: MemberAbsence
}

// Another way, or give up
const RETRY_CHOICES = [
  { value: 'again', label: COPY.periodOther },
  { value: 'stop', label: COPY.periodGiveUp },
]

/**
 * A new absence starts clean
 * @return {Promise<ScenarioMove>} - Move leading to the period
 */

export const startCreate: ScenarioStep = async () => ({
  say: [],
  next: 'askPeriod',
  data: { mode: 'create', editId: '' },
})

/**
 * Ask for the days, under a fresh write key
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Move asking the period
 */

export const askPeriod: ScenarioStep = async (context) => {
  const absences = await ownAbsences(context.accountId)
  const line = context.data.mode === 'edit' ? COPY.periodAgain : COPY.period

  return {
    say: [line],
    ask: {
      kind: 'period',
      booked: bookedOf(absences, context.data.editId),
      focus: context.today,
    },
    next: 'periodAnswer',
    data: { key: crypto.randomUUID() },
  }
}

/**
 * Judge a span against the rules of the absence form
 * @param {string} start - First ISO day
 * @param {string} end - Last ISO day
 * @param {string} today - ISO day
 * @param {MemberAbsence[]} others - Absences that still count
 * @return {Verdict | null} - Refusal, or nothing
 */

const judge = (
  start: string,
  end: string,
  today: string,
  others: MemberAbsence[]
): Verdict | null => {
  const days = spanDays(start, end)
  const { maxDays, thresholdDays } = ABSENCE_SETTINGS

  if (start < today) return { reason: COPY.periodPast }
  if (days > maxDays) {
    return {
      reason: fillTemplate(COPY.periodTooLong, { days: String(days), max: String(maxDays) }),
    }
  }
  if (days <= thresholdDays) {
    return {
      reason: fillTemplate(COPY.periodTooShort, {
        days: String(days),
        min: String(thresholdDays + 1),
      }),
    }
  }

  const clash = others.find(
    (other) => dayOf(other.startDate) <= end && dayOf(other.endDate) >= start
  )

  return clash
    ? { reason: fillTemplate(COPY.periodTaken, { range: rangeOfAbsence(clash) }), clash }
    : null
}

/**
 * The days come in, Memora checks them
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - "start/end"
 * @return {Promise<ScenarioMove>} - Next move
 */

export const periodAnswer: ScenarioStep = async (context, answer) => {
  const [start, end] = (answer?.value ?? '').split('/')
  const absences = await ownAbsences(context.accountId)
  const verdict = judge(start, end, context.today, takingDays(absences, context.data.editId))

  if (verdict) {
    // Moving the absence in the way only makes sense for a new one
    const { clash } = verdict
    const editThat =
      clash && context.data.mode !== 'edit'
        ? [{ value: `edit:${clash.id}`, label: COPY.periodEditThat }]
        : []
    const choices = [RETRY_CHOICES[0], ...editThat, RETRY_CHOICES[1]]

    return { say: [verdict.reason], ask: { kind: 'choices', choices }, next: 'retryAnswer' }
  }

  const kept = { start, end }
  const noted = fillTemplate(COPY.periodNoted, {
    days: String(spanDays(start, end)),
    range: absenceRange(start, end),
  })

  // An edit needs nothing more, a new one asks for a reason
  if (context.data.mode === 'edit') {
    return { say: [noted], next: 'saveEdit', thinking: true, data: kept }
  }

  return {
    say: [noted, COPY.reasonAsk],
    ask: { kind: 'choices', choices: yesNo() },
    next: 'reasonAnswer',
    data: kept,
  }
}

/**
 * Another try, the clashing absence, or a stop
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Choice
 * @return {Promise<ScenarioMove>} - Next move
 */

export const retryAnswer: ScenarioStep = async (context, answer) => {
  const value = answer?.value ?? 'stop'
  if (value === 'again') return { say: [], next: 'askPeriod' }
  if (value.startsWith('edit:')) {
    return { say: [], next: 'editWhat', data: { mode: 'edit', editId: value.slice(5) } }
  }

  return { say: [SCENARIO_COPY.cancelled] }
}

/**
 * The member says if there is a reason
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Oui or non
 * @return {Promise<ScenarioMove>} - Next move
 */

export const reasonAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes'
    ? {
        say: [COPY.reasonWhich, COPY.reasonHint],
        ask: { kind: 'text' },
        next: 'reasonText',
      }
    : { say: [], next: 'saveCreate', thinking: true, data: { reason: '' } }

/**
 * The reason is typed
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Text
 * @return {Promise<ScenarioMove>} - Next move
 */

export const reasonText: ScenarioStep = async (context, answer) => {
  const reason = (answer?.value ?? '').trim()
  const max = FORM_SETTINGS.shortTextMaxLength

  if (reason.length > max) {
    return {
      say: [fillTemplate(COPY.reasonTooLong, { max: String(max) })],
      ask: { kind: 'text' },
      next: 'reasonText',
    }
  }

  return { say: [], next: 'saveCreate', thinking: true, data: { reason } }
}

/**
 * Declare the absence
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const saveCreate: ScenarioStep = async (context) => {
  const { start, end, reason = '', key } = context.data

  try {
    await apiPost<MemberAbsence>(
      API_ROUTES.absences,
      { dates: [start, end], reason },
      { [IDEMPOTENCY_HEADER]: key }
    )
  } catch (error) {
    return failure(error)
  }

  context.refresh()

  return { say: [absenceLine(COPY.done, start, end), COPY.sentToTeam] }
}
