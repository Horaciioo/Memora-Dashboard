import type { FormValues } from '@/types/forms'
import type { WorkPerson, WorkTag } from '@/types/work'

/**
 * Team with everyone inside it
 * @typedef {Object} TeamView
 * @property {string} id - Team identifier
 * @property {string} name - Team name
 * @property {string | null} summary - Team description
 * @property {WorkPerson | null} lead - Responsable
 * @property {WorkTag | null} youtuber - YouTuber the team covers
 * @property {WorkPerson[]} members - Members
 * @property {boolean} archived - Kept for history, out of the way
 * @property {FormValues} values - Values feeding the edit form
 */

export interface TeamView {
  id: string
  name: string
  summary: string | null
  lead: WorkPerson | null
  youtuber: WorkTag | null
  members: WorkPerson[]
  archived: boolean
  values: FormValues
}

/**
 * Everything the team board needs
 * @typedef {Object} TeamBoardData
 * @property {TeamView[]} teams - Declared teams
 * @property {WorkPerson[]} unassigned - Members without a team
 */

export interface TeamBoardData {
  teams: TeamView[]
  unassigned: WorkPerson[]
}
