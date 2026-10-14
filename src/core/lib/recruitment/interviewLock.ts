import type { RecruitmentRights } from '@/types/recruitment'

/**
 * Whether a finished interview is closed to the viewer
 * @param {boolean} attended - Interview was taken
 * @param {string | null} recruiterId - Recruiter who led it
 * @param {Pick<RecruitmentRights, 'manage' | 'viewerId'>} viewer - Who looks
 * @return {boolean} - True when only a manager or the recruiter may change it
 */

export const isInterviewLocked = (
  attended: boolean,
  recruiterId: string | null,
  viewer: Pick<RecruitmentRights, 'manage' | 'viewerId'>
): boolean => attended && !viewer.manage && recruiterId !== viewer.viewerId
