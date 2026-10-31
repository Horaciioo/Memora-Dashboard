import recruitment from '@/configurations/system/recrutement.json'
import { readInteger } from '@/declarations/configurations/readers'

/**
 * Recruitment settings
 * @type {Record<string, number>}
 */

export const RECRUITMENT_SETTINGS = {
  questionnaireLeadMinutes: readInteger(recruitment.questionnaireLeadMinutes, {
    path: 'system/recrutement.questionnaireLeadMinutes',
    fallback: 10,
    min: 0,
  }),
  reviewMinCharacters: readInteger(recruitment.reviewMinCharacters, {
    path: 'system/recrutement.reviewMinCharacters',
    fallback: 5,
    min: 1,
  }),
  interviewMinutes: readInteger(recruitment.interviewMinutes, {
    path: 'system/recrutement.interviewMinutes',
    fallback: 30,
    min: 5,
  }),
  upcomingInterviews: readInteger(recruitment.upcomingInterviews, {
    path: 'system/recrutement.upcomingInterviews',
    fallback: 5,
    min: 1,
  }),
  planningMaxDays: readInteger(recruitment.planningMaxDays, {
    path: 'system/recrutement.planningMaxDays',
    fallback: 14,
    min: 1,
  }),
  historyPageSize: readInteger(recruitment.historyPageSize, {
    path: 'system/recrutement.historyPageSize',
    fallback: 25,
    min: 1,
  }),
} as const
