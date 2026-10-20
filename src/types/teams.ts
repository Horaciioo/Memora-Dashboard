import type { FormValues } from '@/types/forms'
import type { WorkPerson, WorkTag } from '@/types/work'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Team with everyone inside it
 * @typedef {Object} TeamView
 * @property {string} id - Team identifier
 * @property {string} name - Team name
 * @property {string | null} summary - Team description
 * @property {WorkPerson[]} leads - Responsables and admins
 * @property {WorkTag | null} youtuber - YouTuber the team covers
 * @property {WorkPerson[]} members - Members
 * @property {boolean} archived - Kept for history
 * @property {FormValues} values - Values feeding the edit form
 */

export interface TeamView {
  id: string
  name: string
  summary: string | null
  leads: WorkPerson[]
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

/**
 * Function a creator may turn into a team
 * @typedef {Object} CreatorTeamFunction
 * @property {string} id - Function identifier
 * @property {string} name - Function name
 * @property {string | null} icon - Glyph key
 * @property {string | null} accent - Colour
 * @property {boolean} isPrimary - Principal function
 * @property {boolean} isEnabled - Team switched on
 */

export interface CreatorTeamFunction {
  id: string
  name: string
  icon: string | null
  accent: string | null
  isPrimary: boolean
  isEnabled: boolean
}

/**
 * Member of a creator with the teams they sit in
 * @typedef {Object} CreatorTeamMember
 * @property {WorkPerson} person - Who it is
 * @property {MemberRoleName} role - Hierarchy level
 * @property {string[]} functionIds - Functions of the teams joined
 */

export interface CreatorTeamMember {
  person: WorkPerson
  role: MemberRoleName
  functionIds: string[]
}

/**
 * Everything the creator page reads about teams
 * @typedef {Object} CreatorTeamData
 * @property {CreatorTeamFunction[]} functions - Functions offered
 * @property {CreatorTeamMember[]} members - Moderators of the creator
 */

export interface CreatorTeamData {
  functions: CreatorTeamFunction[]
  members: CreatorTeamMember[]
}
