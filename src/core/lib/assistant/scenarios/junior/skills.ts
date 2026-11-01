import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { readSkills } from '@/core/lib/assistant/scenarios/junior/data'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type { JuniorSkillView } from '@/types/academy'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

const asChoice = (skill: JuniorSkillView): ScenarioChoice => ({
  value: skill.skillId,
  label: skill.name,
  hint: `${skill.percent} %`,
})

/**
 * Ask the competency, by category first when the list is long
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Categories, or competencies
 */

export const skillStart: ScenarioStep = async (context) => {
  const skills = await readSkills(context.data.juniorId)
  if (skills.length === 0) {
    return { say: [fillTemplate(COPY.skillNone, { name: context.data.name })], next: 'hubAgain' }
  }

  if (skills.length <= ASSISTANT_SETTINGS.maxChoices) {
    return {
      say: [COPY.skillWhich],
      ask: { kind: 'choices', choices: skills.map(asChoice) },
      next: 'skillPick',
    }
  }

  const categories = new Map<string, { name: string; total: number; count: number }>()
  for (const skill of skills) {
    const known = categories.get(skill.categoryId)
    categories.set(skill.categoryId, {
      name: skill.categoryName,
      total: (known?.total ?? 0) + skill.percent,
      count: (known?.count ?? 0) + 1,
    })
  }

  return {
    say: [COPY.skillCategory],
    ask: {
      kind: 'choices',
      choices: [...categories].map(([id, entry]) => ({
        value: id,
        label: entry.name,
        hint: `${Math.round(entry.total / entry.count)} %`,
      })),
    },
    next: 'skillCategory',
  }
}

export const skillCategory: ScenarioStep = async (context, answer) => {
  const skills = (await readSkills(context.data.juniorId))
    .filter((skill) => skill.categoryId === answer?.value)
    .slice(0, ASSISTANT_SETTINGS.maxChoices)

  return {
    say: [COPY.skillWhich],
    ask: { kind: 'choices', choices: skills.map(asChoice) },
    next: 'skillPick',
  }
}

/**
 * The slider starts from the percentage the junior has now
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Competency
 * @return {Promise<ScenarioMove>} - Slider
 */

export const skillPick: ScenarioStep = async (context, answer) => {
  const skill = (await readSkills(context.data.juniorId)).find(
    (entry) => entry.skillId === answer?.value
  )
  if (!skill) return { say: [], next: 'skillStart' }

  return {
    say: [fillTemplate(COPY.skillAsk, { name: skill.name, current: String(skill.percent) })],
    ask: { kind: 'percent', value: skill.percent, max: ACADEMY_SETTINGS.skillMaxPercent },
    next: 'skillSave',
    data: { skillId: skill.skillId, skillName: skill.name, current: String(skill.percent) },
  }
}

/**
 * Write the percentage, then ask if another one follows
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Percentage
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const skillSave: ScenarioStep = async (context, answer): Promise<ScenarioMove> => {
  const { skillId, skillName, current } = context.data
  const percent = answer?.value ?? current

  const more: Pick<ScenarioMove, 'ask' | 'next'> = {
    ask: {
      kind: 'choices',
      choices: [
        { value: 'yes', label: COPY.yes },
        { value: 'no', label: COPY.no },
      ],
    },
    next: 'skillAgain',
  }

  if (percent === current) {
    return {
      say: [fillTemplate(COPY.skillSame, { name: skillName, percent }), COPY.skillMore],
      ...more,
    }
  }

  try {
    await apiPatch(API_ROUTES.juniorSkills(context.data.juniorId), {
      skillId,
      percent: Number(percent),
    })
  } catch (error) {
    return { ...failure(error), next: 'hubAgain' }
  }

  return {
    say: [fillTemplate(COPY.skillDone, { name: skillName, percent }), COPY.skillMore],
    ...more,
  }
}

export const skillAgain: ScenarioStep = async (context, answer) => ({
  say: [],
  next: answer?.value === 'yes' ? 'skillStart' : 'hubAgain',
})
