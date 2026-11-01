import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlanOption } from '@/core/services/calendar/academyForm'
import type { JuniorFollow } from '@/core/services/academy/FollowUpService'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import type { MilestoneView } from '@/core/lib/academy/parkourTimeline'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type {
  JuniorNoteView,
  JuniorObjectiveView,
  JuniorSkillView,
  JuniorView,
} from '@/types/academy'
import type { ScenarioLine } from '@/types/scenario'
import { ROUTES } from '@/declarations/navigation'
import { fillTemplate } from '@/utils/format/strings'

/**
 * A junior with what the member may do on them
 * @typedef {Object} JuniorDossier
 */

export interface JuniorDossier {
  junior: JuniorView
  can: {
    edit: boolean
    plan: boolean
    note: boolean
    skill: boolean
    objective: boolean
    follow: boolean
  }
  fields: FieldDefinition[]
  noteFields: FieldDefinition[]
  objectiveFields: FieldDefinition[]
  // Objectives open with the second period
  isObjectivesOpen: boolean
  steps: MilestoneView[]
  agenda: PlanOption[]
}

// Where a trainer stands, the follow-up of one trainer
export interface Follow {
  canFollow: boolean
  juniors: JuniorFollow[]
}

/**
 * Fresh dossier of a junior
 * @param {string} id - Junior identifier
 * @return {Promise<JuniorDossier>} - Dossier
 */

export const readDossier = (id: string): Promise<JuniorDossier> =>
  apiGet<JuniorDossier>(API_ROUTES.juniorFile(id))

/**
 * Where a trainer stands with their juniors
 * @param {string} [trainerId] - Trainer, the signed-in member by default
 * @param {string} [juniorId] - Keep one junior
 * @return {Promise<Follow>} - Follow-up
 */

export const readFollow = (trainerId?: string, juniorId?: string): Promise<Follow> => {
  const query = new URLSearchParams()
  if (trainerId) query.set('formateur', trainerId)
  if (juniorId) query.set('junior', juniorId)

  return apiGet<Follow>(`${API_ROUTES.academyFollow}?${query.toString()}`)
}

/**
 * Options of one field of the junior form
 * @param {JuniorDossier} dossier - Dossier
 * @param {string} key - Field name
 * @return {FieldOption[]} - Options one may pick
 */

export const optionsOf = (dossier: JuniorDossier, key: string): FieldOption[] =>
  (dossier.fields.find((field) => field.name === key)?.options ?? []).filter(
    (option) => !option.disabled
  )

/**
 * Line about a junior, pointing at their file
 * @param {string} text - Line before the link
 * @param {string} name - Junior name
 * @param {string} sessionId - Promotion identifier
 * @param {string} juniorId - Junior identifier
 * @return {ScenarioLine} - Line with its link
 */

export const juniorLine = (
  text: string,
  name: string,
  sessionId: string,
  juniorId: string
): ScenarioLine => ({ text, link: { label: name, href: ROUTES.junior(sessionId, juniorId) } })

/**
 * Moment of the journey in a sentence
 * @param {MilestoneView} step - Moment
 * @return {string} - Sentence
 */

export const stepSentence = (step: MilestoneView): string =>
  fillTemplate(COPY.stepsLine, {
    state:
      step.state === 'late'
        ? COPY.stepsLate
        : step.state === 'current'
          ? COPY.stepsCurrent
          : COPY.stepsNext,
    label: step.label,
    lead: step.lead,
  })

/**
 * Competency grades of a junior
 * @param {string} id - Junior identifier
 * @return {Promise<JuniorSkillView[]>} - Skills with their percentage
 */

export const readSkills = (id: string): Promise<JuniorSkillView[]> =>
  apiGet<JuniorSkillView[]>(API_ROUTES.juniorSkills(id))

/**
 * Notes kept on a junior
 * @param {string} id - Junior identifier
 * @return {Promise<JuniorNoteView[]>} - Notes, newest first
 */

export const readNotes = (id: string): Promise<JuniorNoteView[]> =>
  apiGet<JuniorNoteView[]>(API_ROUTES.juniorNotes(id))

/**
 * Personal objectives of a junior
 * @param {string} id - Junior identifier
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const readObjectives = (id: string): Promise<JuniorObjectiveView[]> =>
  apiGet<JuniorObjectiveView[]>(API_ROUTES.juniorObjectives(id))

/**
 * A text cut to a short hint
 * @param {string} text - Long text
 * @return {string} - First words
 */

export const excerpt = (text: string): string =>
  text.length > 40 ? `${text.slice(0, 40).trimEnd()}…` : text
