import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import type { AcademySessionStatusName } from '@/utils/constants/hierarchy'
import { FINISHED_RECRUITMENT_STATUSES } from '@/utils/constants/recruitment'
import type { RecruitmentStatusName } from '@/utils/constants/recruitment'

// States a promotion may still be launched from
const LAUNCHABLE_STATUSES: AcademySessionStatusName[] = [
  AcademySessionStatuses.Draft,
  AcademySessionStatuses.Open,
]

/**
 * Whether a promotion still waits for its recruitment to end
 * @param {AcademySessionStatusName} status - Promotion status
 * @param {RecruitmentStatusName | null} recruitmentStatus - Status of the campaign feeding it
 * @return {boolean} - Waiting on the campaign
 */

export const isAwaitingRecruitment = (
  status: AcademySessionStatusName,
  recruitmentStatus: RecruitmentStatusName | null
): boolean =>
  LAUNCHABLE_STATUSES.includes(status) &&
  recruitmentStatus !== null &&
  !FINISHED_RECRUITMENT_STATUSES.includes(recruitmentStatus)
