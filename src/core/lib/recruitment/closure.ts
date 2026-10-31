import { FINISHED_RECRUITMENT_STATUSES, RecruitmentStatuses } from '@/utils/constants/recruitment'
import type { RecruitmentStatusName } from '@/utils/constants/recruitment'

/**
 * Whether accepted candidates may be admitted
 * @param {string} status - Session status
 * @param {boolean} isClosing - Closure running now
 * @return {boolean} - Closed or closing
 */

export const isAdmissionOpen = (status: string, isClosing: boolean): boolean =>
  isClosing || FINISHED_RECRUITMENT_STATUSES.includes(status as RecruitmentStatusName)

/**
 * Whether an edit tries to close without the closure
 * @param {string | undefined} next - Wanted status
 * @param {string} current - Status held
 * @return {boolean} - Closing by hand
 */

export const isHandClosure = (next: string | undefined, current: string): boolean =>
  next === RecruitmentStatuses.Closed && current !== RecruitmentStatuses.Closed
