import {
  currentOf,
  ownAbsences,
  rangeOfAbsence,
  statusOf,
} from '@/core/lib/assistant/scenarios/absence/shared'
import { ABSENCE_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/absence'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ScenarioChoice, ScenarioStep } from '@/types/scenario'
import { capitalizeFirstLetter, fillTemplate } from '@/utils/format/strings'

// Next gestures, the ones that need an absence only when there is one
const menuOf = (hasAbsence: boolean): ScenarioChoice[] => [
  { value: 'create', label: COPY.menuCreate },
  ...(hasAbsence
    ? [
        { value: 'edit', label: COPY.menuEdit },
        { value: 'delete', label: COPY.menuDelete },
      ]
    : []),
  { value: 'nothing', label: COPY.menuNothing },
]

/**
 * Read out the absences to come
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Lines then the menu
 */

export const listAbsences: ScenarioStep = async (context) => {
  const current = currentOf(await ownAbsences(context.accountId), context.today)
  const shown = current.slice(0, ASSISTANT_SETTINGS.maxChoices)

  const lines = shown.map((absence) =>
    capitalizeFirstLetter(
      fillTemplate(COPY.listLine, {
        range: rangeOfAbsence(absence),
        days: String(absence.dayCount),
        status: statusOf(absence),
      })
    )
  )

  return {
    say: [
      current.length === 0 ? COPY.listNone : COPY.listIntro,
      ...lines,
      ...(current.length > shown.length
        ? [fillTemplate(COPY.listMore, { shown: String(shown.length) })]
        : []),
      COPY.listNext,
    ],
    ask: { kind: 'choices', choices: menuOf(current.length > 0) },
    next: 'menuAnswer',
  }
}

/**
 * Where the menu leads
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Menu entry
 * @return {Promise<ScenarioMove>} - Next move
 */

export const menuAnswer: ScenarioStep = async (context, answer) => {
  const next = { create: 'startCreate', edit: 'editPick', delete: 'deletePick' }[
    answer?.value ?? ''
  ]

  return next ? { say: [], next } : { say: [COPY.menuBye] }
}

/**
 * Oui to a creation offered after an empty edit
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Oui or non
 * @return {Promise<ScenarioMove>} - Next move
 */

export const noneOffer: ScenarioStep = async (context, answer) =>
  answer?.value === 'yes' ? { say: [], next: 'startCreate' } : { say: [COPY.menuBye] }
