import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { spanDays } from '@/core/lib/assistant/period'
import { RECRUITMENT_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/recruitment'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import { absenceRange } from '@/utils/format/absences'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Options of one field of the session form
 * @param {string} name - Field name
 * @return {Promise<FieldOption[]>} - Options, none when the field is missing
 */

const optionsOf = async (name: string): Promise<FieldOption[]> =>
  (await apiGet<FieldDefinition[]>(API_ROUTES.recruitmentFields)).find(
    (field) => field.name === name
  )?.options ?? []

const asChoice = (option: FieldOption): ScenarioChoice => ({
  value: option.value,
  label: option.label,
})

/**
 * Pick of a list: one option is taken for granted
 * @param {FieldOption[]} options - Options offered
 * @param {string} line - Question
 * @param {string} next - Step reading the answer
 * @param {string} keep - Data key of the value
 * @param {string} skip - Step run straight on when there is a single option
 * @return {ScenarioMove} - Question, or straight on
 */

const pickOf = (
  options: FieldOption[],
  line: string,
  next: string,
  keep: string,
  skip: string
): ScenarioMove =>
  options.length === 1
    ? {
        say: [],
        next: skip,
        data: { [keep]: options[0].value, [`${keep}Label`]: options[0].label },
      }
    : { say: [line], ask: { kind: 'choices', choices: options.map(asChoice) }, next }

/**
 * Ask the creator
 * @return {Promise<ScenarioMove>} - Question, or why not
 */

export const askCreator: ScenarioStep = async () => {
  const creators = await optionsOf('youtuberId')
  if (creators.length === 0) return { say: [COPY.creatorNone] }

  return pickOf(creators, COPY.creatorAsk, 'creatorAnswer', 'youtuberId', 'askJob')
}

/**
 * Keep the creator picked
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Creator
 * @return {Promise<ScenarioMove>} - Next move
 */

export const creatorAnswer: ScenarioStep = async (context, answer) => ({
  say: [],
  next: 'askJob',
  data: { youtuberId: answer?.value ?? '', youtuberIdLabel: answer?.label ?? '' },
})

/**
 * Ask the post, among those the creator holds
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Question, or why not
 */

export const askJob: ScenarioStep = async (context) => {
  const jobs = (await optionsOf('functionId')).filter((option) =>
    (option.owners ?? []).includes(context.data.youtuberId)
  )
  if (jobs.length === 0) {
    return { say: [fillTemplate(COPY.jobNone, { creator: context.data.youtuberIdLabel })] }
  }

  return pickOf(jobs, COPY.jobAsk, 'jobAnswer', 'functionId', 'askPeriod')
}

/**
 * Keep the post picked
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Post
 * @return {Promise<ScenarioMove>} - Next move
 */

export const jobAnswer: ScenarioStep = async (context, answer) => ({
  say: [],
  next: 'askPeriod',
  data: { functionId: answer?.value ?? '', functionIdLabel: answer?.label ?? '' },
})

/**
 * Ask the days of the campaign
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Calendar
 */

export const askPeriod: ScenarioStep = async (context) => ({
  say: [COPY.periodAsk],
  ask: { kind: 'period', booked: [], focus: context.today },
  next: 'periodAnswer',
})

/**
 * Check the days, then recap
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - "start/end"
 * @return {Promise<ScenarioMove>} - Recap, or another try
 */

export const periodAnswer: ScenarioStep = async (context, answer) => {
  const [start, end] = (answer?.value ?? '').split('/')
  if (start < context.today) return { say: [COPY.periodPast], next: 'askPeriod' }

  const range = absenceRange(start, end)
  const { data } = context

  return {
    say: [
      fillTemplate(COPY.periodNoted, { range: `${range}, ${spanDays(start, end)} jours` }),
      fillTemplate(COPY.recap, {
        job: data.functionIdLabel,
        creator: data.youtuberIdLabel,
        range,
      }),
      COPY.recapAsk,
    ],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'go', label: COPY.launch },
        { value: 'redo', label: COPY.redo },
      ],
    },
    next: 'recapAnswer',
    data: { start, end },
  }
}
