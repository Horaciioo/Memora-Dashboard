import recruitment from '@/configurations/system/recruitment.json'
import { readInteger } from '@/declarations/configurations/readers'

/**
 * Recruitment settings
 * @type {Record<string, number>}
 */

export const RECRUITMENT_SETTINGS = {
  questionnaireLeadMinutes: readInteger(recruitment.questionnaireLeadMinutes, {
    path: 'system/recruitment.questionnaireLeadMinutes',
    fallback: 10,
    min: 0,
  }),
  reviewMinCharacters: readInteger(recruitment.reviewMinCharacters, {
    path: 'system/recruitment.reviewMinCharacters',
    fallback: 5,
    min: 1,
  }),
  interviewMinutes: readInteger(recruitment.interviewMinutes, {
    path: 'system/recruitment.interviewMinutes',
    fallback: 30,
    min: 5,
  }),
  upcomingInterviews: readInteger(recruitment.upcomingInterviews, {
    path: 'system/recruitment.upcomingInterviews',
    fallback: 5,
    min: 1,
  }),
  planningMaxDays: readInteger(recruitment.planningMaxDays, {
    path: 'system/recruitment.planningMaxDays',
    fallback: 14,
    min: 1,
  }),
  historyPageSize: readInteger(recruitment.historyPageSize, {
    path: 'system/recruitment.historyPageSize',
    fallback: 25,
    min: 1,
  }),
} as const
