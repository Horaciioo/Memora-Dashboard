import type { RecruitmentRights } from '@/types/recruitment'

/**
 * Whether a finished interview is closed to the viewer
 * @param {boolean} isFinished - Verdict was given
 * @param {string[]} recruiterIds - Recruiters who led it
 * @param {Pick<RecruitmentRights, 'manage' | 'viewerId'>} viewer - Who looks
 * @return {boolean} - True when only a manager or one of the recruiters may change it
 */

export const isInterviewLocked = (
  isFinished: boolean,
  recruiterIds: string[],
  viewer: Pick<RecruitmentRights, 'manage' | 'viewerId'>
): boolean => isFinished && !viewer.manage && !recruiterIds.includes(viewer.viewerId)
