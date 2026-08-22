import type { AcademyPeriodName } from '@/utils/constants/hierarchy'

/**
 * Training status of one junior
 * @typedef {Object} JuniorTraining
 * @property {string} id - Training identifier
 * @property {string} name - Training name
 * @property {AcademyPeriodName | null} period - Academy period
 * @property {boolean} mandatory - Required to progress
 * @property {string | null} completedAt - ISO completion date
 * @property {string | null} validatorName - Who validated it
 */

export interface JuniorTraining {
  id: string
  name: string
  period: AcademyPeriodName | null
  mandatory: boolean
  completedAt: string | null
  validatorName: string | null
}

/**
 * Junior followed by the academy
 * @typedef {Object} JuniorView
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait
 * @property {AcademyPeriodName | null} period - Academy period
 * @property {string | null} youtuberName - Assigned YouTuber
 * @property {string | null} functionName - Main function
 * @property {string} joinedAt - ISO arrival date
 * @property {JuniorTraining[]} trainings - Training progression
 * @property {number} completedCount - Trainings validated
 * @property {number} mandatoryPending - Mandatory trainings still open
 */

export interface JuniorView {
  id: string
  displayName: string
  avatarUrl: string | null
  period: AcademyPeriodName | null
  youtuberName: string | null
  functionName: string | null
  joinedAt: string
  trainings: JuniorTraining[]
  completedCount: number
  mandatoryPending: number
}
