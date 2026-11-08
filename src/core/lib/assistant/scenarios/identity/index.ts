import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { IDENTITY_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/identity'
import type { IdentityEscalation, IdentityPreview } from '@/types/identity'
import type { Scenario, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// Answers of the confirmation
const YES = 'yes'
const NO = 'no'
const COPY_LINK = 'copy'
const DONE = 'done'

// Opens on what the Responsable is called for
const hello: ScenarioStep = async ({ name, data }) => {
  try {
    await apiGet<IdentityEscalation>(API_ROUTES.identityEscalation(data.checkId))
  } catch {
    return { say: [COPY.gone] }
  }

  return {
    say: [fillTemplate(COPY.hello, { name }), COPY.explain, COPY.ask],
    ask: { kind: 'text' },
    next: 'lookup',
  }
}

// The identifier typed, shown back with who it would be
const lookup: ScenarioStep = async ({ data }, answer) => {
  try {
    const preview = await apiPost<IdentityPreview>(API_ROUTES.identityPreview(data.checkId), {
      discordId: answer?.value ?? '',
    })

    return {
      say: [
        {
          text: COPY.checking,
          card: { name: preview.name, id: preview.discordId, avatarUrl: preview.avatarUrl },
        },
        COPY.confirm,
      ],
      ask: {
        kind: 'choices',
        choices: [
          { value: YES, label: COPY.yes, tone: 'success' },
          { value: NO, label: COPY.no, tone: 'danger' },
        ],
      },
      data: { discordId: preview.discordId },
      next: 'verdict',
    }
  } catch {
    return { say: [COPY.unreadable], ask: { kind: 'text' }, next: 'lookup' }
  }
}

// Him, or somebody else
const verdict: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value === NO) {
    return { say: [COPY.retry], ask: { kind: 'text' }, next: 'lookup' }
  }

  try {
    const escalation = await apiGet<IdentityEscalation>(API_ROUTES.identityEscalation(data.checkId))

    if (escalation.candidateId) {
      return { say: [], data: { candidateId: escalation.candidateId }, next: 'resolve' }
    }
    if (escalation.choices.length === 0) return { say: [COPY.none] }

    return {
      say: [COPY.which],
      ask: {
        kind: 'choices',
        choices: escalation.choices.map((choice) => ({
          value: choice.id,
          label: choice.name,
          hint: choice.sessionName,
        })),
      },
      next: 'pick',
    }
  } catch (error) {
    return failure(error)
  }
}

// The application he belongs to
const pick: ScenarioStep = async (_context, answer) => ({
  say: [],
  data: { candidateId: answer?.value ?? '' },
  next: 'resolve',
})

// The identifier lands, the single link comes back
const resolve: ScenarioStep = async ({ data }) => {
  try {
    const { path } = await apiPost<{ path: string }>(API_ROUTES.identityResolve(data.checkId), {
      discordId: data.discordId,
      candidateId: data.candidateId,
    })
    const url = `${window.location.origin}${path}`

    return {
      say: [COPY.adding, fillTemplate(COPY.link, { url }), COPY.warning],
      ask: {
        kind: 'choices',
        choices: [
          { value: COPY_LINK, label: COPY.copy },
          { value: DONE, label: COPY.done },
        ],
      },
      data: { url },
      next: 'copied',
    }
  } catch (error) {
    return failure(error)
  }
}

// The link handed over
const copied: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value !== COPY_LINK) return { say: [COPY.bye] }

  await navigator.clipboard.writeText(data.url).catch(() => undefined)

  return { say: [COPY.copied] }
}

/**
 * Memora helps a Responsable correct the identifier of a candidate
 * @type {Scenario}
 */

export const IDENTITY_SCENARIO: Scenario = {
  entries: { alert: 'hello' },
  steps: { hello, lookup, verdict, pick, resolve, copied },
}
