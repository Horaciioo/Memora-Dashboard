import dispositifs from '@/declarations/reference/data/dispositifs.json'
import eventTemplates from '@/declarations/reference/data/eventTemplates.json'
import networks from '@/declarations/reference/data/networks.json'
import pimSteps from '@/declarations/reference/data/pimSteps.json'
import skills from '@/declarations/reference/data/skills.json'
import states from '@/declarations/reference/data/states.json'
import type { AcademyStageName, StepAnchorName, StepOwnerName } from '@/utils/constants/hierarchy'
import type {
  CalendarKindName,
  EventVisibilityName,
  WorkflowPhaseName,
} from '@/utils/constants/workflow'

/**
 * Status a project, a task or a meeting moves through
 * @typedef {Object} LibraryState
 * @property {string} scope - Record it applies to
 * @property {string} name - Display name
 * @property {string | null} accent - Colour
 * @property {WorkflowPhaseName} phase - Phase it stands for
 * @property {boolean} isDefault - Given to a new record
 */

export interface LibraryState {
  scope: 'PROJECT' | 'TASK' | 'MEETING'
  name: string
  accent: string | null
  phase: WorkflowPhaseName
  isDefault: boolean
}

/**
 * Social network a member can link
 * @typedef {Object} LibraryNetwork
 * @property {string} name - Display name
 * @property {string} urlPrefix - Start of every profile link
 * @property {string | null} accent - Colour
 * @property {boolean} required - Every member must give one
 */

export interface LibraryNetwork {
  name: string
  urlPrefix: string
  accent: string | null
  required: boolean
}

/**
 * Calendar template an entry can start from
 * @typedef {Object} LibraryEventTemplate
 * @property {string} name - Display name
 * @property {CalendarKindName} kind - Shape it draws as
 * @property {string | null} summary - Supporting line
 * @property {string | null} accent - Colour
 * @property {EventVisibilityName} visibility - Who sees it
 * @property {number | null} defaultMinutes - Usual length
 * @property {boolean} allDay - Spans whole days
 */

export interface LibraryEventTemplate {
  name: string
  kind: CalendarKindName
  summary: string | null
  accent: string | null
  visibility: EventVisibilityName
  defaultMinutes: number | null
  allDay: boolean
}

/**
 * Track a junior can be placed on
 * @typedef {Object} LibraryDispositif
 * @property {string} name - Display name
 * @property {string | null} summary - Supporting line
 * @property {string | null} accent - Colour
 */

export interface LibraryDispositif {
  name: string
  summary: string | null
  accent: string | null
}

/**
 * Skill of a junior, held by its family
 * @typedef {Object} LibrarySkill
 * @property {string} name - Display name
 * @property {string | null} function - Function it belongs to, none for every one
 * @property {string | null} dispositif - Track it belongs to, none for every one
 */

export interface LibrarySkill {
  name: string
  function: string | null
  dispositif: string | null
}

/**
 * Family of skills
 * @typedef {Object} LibrarySkillCategory
 * @property {string} name - Display name
 * @property {string | null} accent - Colour
 * @property {LibrarySkill[]} skills - Skills of the family
 */

export interface LibrarySkillCategory {
  name: string
  accent: string | null
  skills: LibrarySkill[]
}

/**
 * Step of the PIM timeline
 * @typedef {Object} LibraryPimStep
 * @property {string} title - Display title
 * @property {AcademyStageName} stage - Stage it opens
 * @property {StepAnchorName} anchor - What its offset counts from
 * @property {number} offset - Days from the anchor
 * @property {StepOwnerName} owner - Who carries it out
 * @property {boolean} required - Blocks the next stage
 * @property {string | null} function - Function it belongs to, none for every one
 * @property {string | null} dispositif - Track it belongs to, none for every one
 * @property {string | null} icon - Glyph key
 * @property {string | null} guide - Walkthrough
 * @property {string | null} destination - Where to act
 */

export interface LibraryPimStep {
  title: string
  stage: AcademyStageName
  anchor: StepAnchorName
  offset: number
  owner: StepOwnerName
  required: boolean
  function: string | null
  dispositif: string | null
  icon: string | null
  guide: string | null
  destination: string | null
}

/**
 * Statuses, changed in code only
 * @type {readonly LibraryState[]}
 */

export const LIBRARY_STATES = states as readonly LibraryState[]

/**
 * Social networks, changed in code only
 * @type {readonly LibraryNetwork[]}
 */

export const LIBRARY_NETWORKS = networks as readonly LibraryNetwork[]

/**
 * Calendar templates, changed in code only
 * @type {readonly LibraryEventTemplate[]}
 */

export const LIBRARY_EVENT_TEMPLATES = eventTemplates as readonly LibraryEventTemplate[]

/**
 * Tracks, changed in code only
 * @type {readonly LibraryDispositif[]}
 */

export const LIBRARY_DISPOSITIFS = dispositifs as readonly LibraryDispositif[]

/**
 * Skill families, changed in code only
 * @type {readonly LibrarySkillCategory[]}
 */

export const LIBRARY_SKILL_CATEGORIES = skills as readonly LibrarySkillCategory[]

/**
 * PIM timeline, changed in code only
 * @type {readonly LibraryPimStep[]}
 */

export const LIBRARY_PIM_STEPS = pimSteps as readonly LibraryPimStep[]
